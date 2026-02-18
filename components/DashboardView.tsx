
import React, { useState, useEffect } from 'react';
import { AppSection } from '../types';
import ResumeUploader from './ResumeUploader';

interface Props {
  setActiveSection: (s: AppSection) => void;
  resumeText: string;
  setResumeText: (t: string) => void;
}

const DashboardView: React.FC<Props> = ({ setActiveSection, resumeText, setResumeText }) => {
  const [chunks, setChunks] = useState<number | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/health');
        if (res.ok) setBackendStatus('online');
        else setBackendStatus('offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Architecting your path to Senior Engineer roles.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className={`relative flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendStatus === 'online' ? 'bg-emerald-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${backendStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Backend: {backendStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Market Readiness</span>
          <div className="text-4xl font-black text-slate-900 mb-2">84<span className="text-blue-500 text-xl">%</span></div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: '84%' }}></div>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed italic">"Optimal alignment with FAANG-tier expectations."</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden group">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Vector Memory</span>
          <div className="text-4xl font-black text-slate-900 mb-2">{chunks || 0} <span className="text-emerald-500 text-xl">Nodes</span></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <p className="text-xs font-bold text-slate-500">{chunks ? 'RAG context ready' : 'No context indexed'}</p>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400 italic">Connected to Pinecone Index: careerpath-ai</p>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl border border-slate-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none"></div>
           <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">Infrastructure</span>
           <div className="space-y-3">
             <div className="flex items-center justify-between">
               <span className="text-xs text-slate-400 font-mono">NEXT_UI</span>
               <span className="text-xs font-black text-blue-400 uppercase">3000:Healthy</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-slate-400 font-mono">FAST_API</span>
               <span className={`text-xs font-black uppercase ${backendStatus === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                 8000:{backendStatus === 'online' ? 'Stable' : 'Offline'}
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-slate-400 font-mono">PG_SQL</span>
               <span className="text-xs font-black text-slate-500 uppercase">5432:Standby</span>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-widest">
              Primary Data Ingestion
            </div>
            <h3 className="text-3xl font-black text-slate-900 leading-tight">Feed the Agentic Pipeline</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Upload your resume PDF to trigger the **Multi-Agent RAG Service**. Our tech leads and recruiters will deconstruct your history into semantic embeddings for real-time analysis.
            </p>
            <ResumeUploader />
          </div>

          <div className="w-full lg:w-96 bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h4 className="font-bold text-slate-900">Agent Quick-Start</h4>
            </div>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
              Prefer direct text injection? Paste your raw career data below to bypass the RAG PDF parser for faster testing.
            </p>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste raw text here..."
              className="flex-1 min-h-[120px] w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-xs font-mono text-slate-700 bg-white mb-6"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveSection(AppSection.ResumeAgent)}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                Run Agents
              </button>
              <button 
                onClick={() => setActiveSection(AppSection.CareerGPT)}
                className="py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest"
              >
                Chat Coach
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
