import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapData, AgentResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // 1. Personalized Career GPT (RAG-like simulation)
  async chatWithContext(message: string, resumeText: string, history: {role: 'user' | 'model', text: string}[]) {
    const systemInstruction = `You are "CareerPath GPT", a world-class executive career coach and technical architect.
    CONTEXT FROM USER'S RESUME:
    """
    ${resumeText}
    """
    INSTRUCTIONS:
    1. Use the provided resume context to ground your advice.
    2. Be direct, authoritative, yet encouraging.
    3. If asked about technical skills, provide architectural context (e.g., if they know Python, suggest FastAPI or high-scale system design).
    4. Keep responses structured and professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: `System instruction: ${systemInstruction}` }] },
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        temperature: 0.7,
      }
    });

    return response.text;
  },

  // 2. Multi-Agent Resume Analysis
  async analyzeResume(resumeText: string): Promise<AgentResponse[]> {
    const prompt = `Act as two distinct personas evaluating this resume:
    1. RECRUITER: Focus on ATS compatibility, keyword density, clarity of impact, and general narrative flow.
    2. TECH LEAD: Focus on technical depth, tooling proficiency, evidence of problem-solving, and architectural thinking.

    RESUME CONTENT:
    """
    ${resumeText}
    """

    OUTPUT REQUIREMENTS:
    - Provide deep, constructive criticism.
    - Rate out of 100.
    - List actionable key points.
    - Return as JSON.`;

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
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['persona', 'feedback', 'score', 'keyPoints']
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || '[]');
    } catch (e) {
      console.error("Failed to parse agent response", e);
      return [];
    }
  },

  // 3. Roadmap Generation
  async generateRoadmap(targetRole: string, currentSkills: string): Promise<RoadmapData> {
    const prompt = `Create a high-fidelity learning roadmap for a professional transitioning from [${currentSkills}] to [${targetRole}].
    
    STRUCTURE:
    - 5 to 8 sequential steps.
    - Each step must have a clear label and a brief professional description.
    - Status should be based on current skills (mark relevant early steps as 'completed' if they match current skills).
    
    Return as JSON graph data.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  status: { type: Type.STRING, description: "Must be 'completed', 'current', 'next', or 'locked'" },
                  description: { type: Type.STRING }
                },
                required: ['id', 'label', 'status', 'description']
              }
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  target: { type: Type.STRING }
                },
                required: ['id', 'source', 'target']
              }
            }
          },
          required: ['nodes', 'edges']
        }
      }
    });

    try {
      return JSON.parse(response.text || '{"nodes":[], "edges":[]}');
    } catch (e) {
      console.error("Failed to parse roadmap data", e);
      return { nodes: [], edges: [] };
    }
  }
};