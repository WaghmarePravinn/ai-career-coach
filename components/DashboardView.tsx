import React, { useState, useEffect } from 'react';
import { AppSection } from '../types';
import ResumeUploader from './ResumeUploader';
import { geminiService } from '../services/geminiService';
import { Shield, Cloud, Server, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  setActiveSection: (s: AppSection) => void;
  resumeText: string;
  setResumeText: (t: string) => void;
}

const DashboardView: React.FC<Props> = ({ setActiveSection, resumeText, setResumeText }) => {
  const [chunks, setChunks] = useState<number | null>(null);
  const [backendStatus, setBackendStatus] = useState<'online' | 'hybrid' | 'checking'>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      const isOnline = await geminiService.checkBackendHealth();
      setBackendStatus(isOnline ? 'online' : 'hybrid');
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dynamic Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Architecting your path to Senior Engineer roles.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className={`px-4 py-2 rounded-2xl flex items-center gap-3 border transition-all ${
            backendStatus === 'online' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : 'bg-amber-50 border-amber-100 text-amber-700'
          }`}>
            {backendStatus === 'online' ? <Server className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {backendStatus === 'online' ? 'Engine: RAG-Node Active' : 'Engine: Cloud-AI Only'}
            </span>
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
          </div>
        </div>
      </div>

      {backendStatus === 'hybrid' && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 text-amber-800 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">
            <span className="uppercase">Note:</span> Local RAG service is unreachable. Features will fallback to direct Gemini Cloud inference. Start the FastAPI server to enable Pinecone memory.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-16 h-16 text-blue-600" />
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
            <div className={`w-2 h-2 rounded-full ${chunks ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <p className="text-xs font-bold text-slate-500">{chunks ? 'RAG context ready' : 'No context indexed'}</p>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400 italic">Target Index: careerpath-ai</p>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl border border-slate-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none"></div>
           <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">Microservices</span>
           <div className="space-y-3">
             <div className="flex items-center justify-between">
               <span className="text-xs text-slate-400 font-mono">NEXT_UI</span>
               <span className="text-[10px] font-black text-blue-400 uppercase">3000:Healthy</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-slate-400 font-mono">FAST_API</span>
               <span className={`text-[10px] font-black uppercase ${backendStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'}`}>
                 8000:{backendStatus === 'online' ? 'Stable' : 'Hybrid-Mode'}
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-xs text-slate-400 font-mono">PINECONE</span>
               <span className="text-[10px] font-black text-blue-400 uppercase">GCP:Connected</span>
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
            <ResumeUploader onUploadSuccess={(n) => setChunks(n)} />
          </div>

          <div className="w-full lg:w-96 bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
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
              className="flex-1 min-h-[120px] w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-xs font-mono text-slate-700 bg-white mb-6 shadow-inner"
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