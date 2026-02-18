
"use client";

import React from 'react';
import ResumeUploader from '../components/ResumeUploader';

/**
 * CareerPath AI Landing Page
 * Next.js App Router root page
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center space-y-12">
        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Phase 4: Agentic Integration
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter">
            CareerPath <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Upload your resume to generate a <span className="text-white font-bold underline decoration-blue-500/50">personalized career roadmap</span> powered by agentic RAG analysis.
          </p>
        </header>

        {/* Core Interaction Component */}
        <section className="w-full">
          <ResumeUploader />
        </section>

        {/* Footer / Meta Info */}
        <footer className="pt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">RAG</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Pipeline</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">LLM</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Inference</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">FYP</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Capstone</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">
            Principal Architect &bull; DevOps Lead &bull; 2024
          </p>
        </footer>
      </div>
    </div>
  );
}
