
import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapData, AgentResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // 1. Personalized Career GPT (RAG-like simulation)
  async chatWithContext(message: string, resumeText: string, history: {role: 'user' | 'model', text: string}[]) {
    const systemInstruction = `You are "CareerPath GPT", a world-class career coach. 
    Context from User's Resume:
    """
    ${resumeText}
    """
    Use this context to answer queries. If information isn't in the resume, use your general knowledge but emphasize the gap.
    Keep answers concise, professional, and actionable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: `System context: ${systemInstruction}` }] },
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
    const prompt = `Analyze this resume from two perspectives:
    1. Recruiter: Focus on keywords, formatting, ATS optimization, and general impact.
    2. Tech Lead: Focus on project depth, tech stack relevance, coding best practices, and architectural thinking.

    Resume Text:
    """
    ${resumeText}
    """

    Return the analysis as a JSON array with exactly two objects. 
    Each object must have: persona, feedback (markdown), score (0-100), keyPoints (string array).`;

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
    const prompt = `Generate a career roadmap to go from my current skills: [${currentSkills}] to my target role: [${targetRole}].
    Return a visualizable graph in JSON format.
    Nodes must have: id, label, status (completed, current, next, locked), description.
    Edges must connect them (id, source, target).
    Create 5-8 logical steps.`;

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
                  status: { type: Type.STRING },
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

    return JSON.parse(response.text || '{"nodes":[], "edges":[]}');
  }
};
