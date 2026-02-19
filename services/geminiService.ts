import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapData, AgentResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // 1. Personalized Career GPT (Now using Backend RAG Endpoint)
  async chatWithContext(message: string, resumeText: string, history: {role: 'user' | 'model', text: string}[]) {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      }
      throw new Error("Backend RAG unavailable");
    } catch (err) {
      console.warn("RAG backend failed, falling back to direct LLM call", err);
      const systemInstruction = `You are "CareerPath GPT", a world-class career coach. Context: ${resumeText}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `System instruction: ${systemInstruction}` }] },
          ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: message }] }
        ],
      });
      return response.text;
    }
  },

  // 2. Multi-Agent Resume Analysis
  async analyzeResume(resumeText: string): Promise<AgentResponse[]> {
    const prompt = `Act as RECRUITER and TECH LEAD personas evaluating this resume: ${resumeText}. Return JSON.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              persona: { type: Type.STRING },
              feedback: { type: Type.STRING },
              score: { type: Type.NUMBER },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  },

  // 3. Roadmap Generation (Now using Backend RAG Endpoint)
  async generateRoadmap(targetRole: string): Promise<any> {
    const response = await fetch('http://127.0.0.1:8000/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_role: targetRole })
    });

    if (!response.ok) {
      throw new Error("Failed to generate roadmap from RAG context.");
    }

    return await response.json();
  }
};
