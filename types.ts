export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Conversation {
  id: string;
  title: string;
  last_updated: Date;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  conversation_id?: string;
}

export interface AgentResponse {
  persona: 'Recruiter' | 'Tech Lead';
  feedback: string;
  score: number;
  keyPoints: string[];
}

export enum AppSection {
  Landing = 'landing',
  Auth = 'auth',
  Dashboard = 'dashboard',
  CareerGPT = 'career-gpt',
  ResumeAgent = 'resume-agent',
  Roadmap = 'roadmap',
  DevOpsDocs = 'devops-docs'
}

export interface RoadmapNode {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'next' | 'locked';
  description: string;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
}

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}