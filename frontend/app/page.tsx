"use client";

import React from 'react';
import ResumeUploader from '../components/ResumeUploader';
import CareerChat from '../components/CareerChat';

/**
 * CareerPath AI Landing Page
 * Next.js App Router root page
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 py-12 md:py-20 flex flex-col items-center space-y-16">
        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Status: Vector-Ready
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            CareerPath <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Architecting the future of career transitions through <span className="text-white font-bold">Multi-Agent RAG</span> pipelines and real-time inference.
          </p>
        </header>

        {/* Core Interaction Component Grid */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-black text-white tracking-tight">Step 1: Data Ingestion</h2>
            </div>
            <ResumeUploader />
            <div className="p-6 bg-slate-900/30 rounded-3xl border border-slate-800/50">
               <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                 "Our ingestion engine deconstructs your PDF into semantic chunks, mapping your skills to 768-dimensional vector space for high-fidelity retrieval."
               </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-black text-white tracking-tight">Step 2: Interactive Coaching</h2>
            </div>
            <CareerChat />
          </div>
        </section>

        {/* Footer / Meta Info */}
        <footer className="pt-20 text-center space-y-6 w-full max-w-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-white">768d</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Index Dimension</span>
            </div>
            <div className="h-10 w-px bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-white">GEMINI</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Inference Core</span>
            </div>
            <div className="h-10 w-px bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-white">V1.0</span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Architect Build</span>
            </div>
          </div>
          
          <div className="pt-8 space-y-2">
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">
              Final Year Project &bull; Career Acceleration Lab &bull; 2024
            </p>
            <div className="flex justify-center gap-4 text-[9px] font-black text-slate-800 uppercase tracking-widest">
              <span>Dockerized</span>
              <span>&bull;</span>
              <span>RAG-Enabled</span>
              <span>&bull;</span>
              <span>Vectorized</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}