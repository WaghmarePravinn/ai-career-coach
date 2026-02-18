
import React from 'react';
import { AppSection } from '../types';
import ResumeUpload from './ResumeUpload';

interface Props {
  setActiveSection: (s: AppSection) => void;
  resumeText: string;
  setResumeText: (t: string) => void;
}

const DashboardView: React.FC<Props> = ({ setActiveSection, resumeText, setResumeText }) => {
  const [chunks, setChunks] = React.useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Project Overview</h2>
          <p className="text-slate-500 mt-2">Welcome to your FYP Command Center. Track your career growth and AI agents.</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Pulse: Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase">Profile Strength</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">84%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '84%' }}></div>
          </div>
          <p className="mt-4 text-sm text-slate-600 italic">"Highly competitive for Senior Software Engineer roles."</p>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200">
          <span className="text-sm font-semibold text-slate-500 uppercase block mb-4">Vector DB Chunks</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
              {chunks || 0}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Pinecone Status</p>
              <p className="text-xs text-slate-500">{chunks ? 'Active context found' : 'No context indexed'}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200">
          <span className="text-sm font-semibold text-slate-500 uppercase block mb-4">Docker Network</span>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Frontend (Next.js)</span>
              <span className="text-blue-600 font-bold">3000:UP</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Backend (FastAPI)</span>
              <span className="text-emerald-600 font-bold">8000:UP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Step 1: Ingest Your Resume (RAG Pipeline)</h3>
          <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-tighter">
            Production Ingestion
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Upload your PDF resume to trigger the <strong>Agentic RAG Pipeline</strong>. We will extract 
              your experiences, convert them into mathematical embeddings, and store them in 
              Pinecone for real-time career coaching.
            </p>
            <ResumeUpload onUploadSuccess={(c) => setChunks(c)} />
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legacy Text Entry</h4>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste text directly for quick testing..."
              className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 font-mono text-xs mb-4 bg-white"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveSection(AppSection.ResumeAgent)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Analyze Agents
              </button>
              <button 
                onClick={() => setActiveSection(AppSection.CareerGPT)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
              >
                Chat GPT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
