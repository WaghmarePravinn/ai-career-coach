
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

export interface AgentResponse {
  persona: 'Recruiter' | 'Tech Lead';
  feedback: string;
  score: number;
  keyPoints: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export enum AppSection {
  Dashboard = 'dashboard',
  CareerGPT = 'career-gpt',
  ResumeAgent = 'resume-agent',
  Roadmap = 'roadmap',
  DevOpsDocs = 'devops-docs'
}
