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
  /**
   * Auth: Real Supabase Auth Flow
   */
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Authentication failed");

    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0]
    };
  },

  async signUp(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Sign up failed");

    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.email?.split('@')[0]
    };
  },

  /**
   * Persistent History: Fetch User Conversations from Backend
   */
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
    } catch (e) {
      console.warn("History fetch failed");
      return [];
    }
  },

  /**
   * Fetch Messages for a specific session
   */
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
    } catch (e) {
      return [];
    }
  },

  async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); 
      const response = await fetch(`${BACKEND_URL}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  async uploadResume(file: File): Promise<{ status: 'vector' | 'local'; chunks?: number }> {
    const isBackendAlive = await this.checkBackendHealth();
    if (isBackendAlive) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${BACKEND_URL}/api/upload_resume`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          return { status: 'vector', chunks: data.chunks_processed };
        }
      } catch (e) {
        console.error("Upload failed", e);
      }
    }
    return { status: 'local' };
  },

  async chatWithContext(message: string, resumeText: string, history: {role: 'user' | 'model', content: string}[], userId?: string, conversationId?: string) {
    const isBackendAlive = await this.checkBackendHealth();

    if (isBackendAlive) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message, 
            history, 
            user_id: userId,
            conversation_id: conversationId 
          })
        });
        if (response.ok) {
          const data = await response.json();
          return data.response;
        }
      } catch (e) {
        console.error("Chat backend error", e);
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are "CareerPath Architect", an expert AI career coach. CONTEXT: ${resumeText || "Candidate hasn't uploaded a resume yet."}`,
      },
    });
    return response.text;
  },

  async analyzeResume(resumeText: string): Promise<AgentResponse[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Critique this resume as Recruiter and Tech Lead: ${resumeText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              persona: { type: Type.STRING, enum: ['Recruiter', 'Tech Lead'] },
              feedback: { type: Type.STRING },
              score: { type: Type.NUMBER },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["persona", "feedback", "score", "keyPoints"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  async generateRoadmap(targetRole: string, resumeText: string): Promise<RoadmapResponse> {
    const isBackendAlive = await this.checkBackendHealth();
    if (isBackendAlive) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_role: targetRole })
        });
        if (response.ok) return { data: await response.json(), source: 'vector', isFallback: false };
      } catch (e) {}
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate roadmap to ${targetRole} for this resume: ${resumeText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missing_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  estimated_time: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return { data: JSON.parse(response.text || '{}'), source: 'cloud', isFallback: true };
  }
};
