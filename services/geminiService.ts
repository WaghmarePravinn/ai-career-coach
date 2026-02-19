
import { GoogleGenAI, Type } from "@google/genai";
import { AgentResponse, ChatMessage, Conversation, User } from "../types";
import { supabase } from "./supabaseClient";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const BACKEND_URL = 'http://127.0.0.1:8000';

export interface RoadmapResponse {
  data: any;
  source: 'vector' | 'cloud';
  isFallback: boolean;
}

export const geminiService = {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0]
    };
  },

  async signUp(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { id: data.user.id, email: data.user.email || '' };
  },

  async getHistory(userId: string): Promise<Conversation[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/history/${userId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((c: any) => ({
        id: c.id,
        title: c.title || 'Conversation',
        last_updated: new Date(c.created_at || Date.now())
      }));
    } catch (e) { return []; }
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/messages/${conversationId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.message,
        timestamp: new Date(m.created_at || Date.now())
      }));
    } catch (e) { return []; }
  },

  async uploadResume(file: File): Promise<{ status: 'vector' | 'local'; chunks?: number }> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${BACKEND_URL}/api/upload_resume`, {
        method: 'POST',
        headers: { 'user-id': userId || '' },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        return { status: 'vector', chunks: data.chunks_processed };
      }
    } catch (e) {}
    return { status: 'local' };
  },

  async generateRoadmap(targetRole: string, resumeText: string): Promise<RoadmapResponse> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user.id;

    try {
      const response = await fetch(`${BACKEND_URL}/api/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_role: targetRole, user_id: userId })
      });
      if (response.ok) return { data: await response.json(), source: 'vector', isFallback: false };
    } catch (e) {}

    // Cloud Fallback
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate roadmap to ${targetRole} for resume: ${resumeText}`,
      config: { responseMimeType: 'application/json' }
    });
    return { data: JSON.parse(response.text || '{}'), source: 'cloud', isFallback: true };
  },

  // Added analyzeResume method to fix Property 'analyzeResume' does not exist error.
  // This performs structured resume analysis using Gemini 3 Pro with a defined response schema.
  async analyzeResume(resumeText: string): Promise<AgentResponse[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Critically analyze this resume from two perspectives: a specialized Tech Recruiter and a technical Tech Lead. Provide detailed feedback, a score (0-100), and key points for each persona. Resume content: ${resumeText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              persona: { 
                type: Type.STRING,
                description: "The persona providing feedback (must be 'Recruiter' or 'Tech Lead')."
              },
              feedback: { 
                type: Type.STRING,
                description: "A comprehensive narrative analysis from this persona's point of view."
              },
              score: { 
                type: Type.NUMBER,
                description: "A professional rating score from 0 to 100."
              },
              keyPoints: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Bullet points highlighting specific strengths or weaknesses."
              },
            },
            required: ["persona", "feedback", "score", "keyPoints"],
          },
        },
      },
    });

    try {
      const jsonStr = response.text || '[]';
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to process agentic analysis response", e);
      return [];
    }
  }
};
