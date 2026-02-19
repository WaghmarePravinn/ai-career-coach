import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Target, Shield, Database, Cpu, Activity, Layout, Layers } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const LandingPageView: React.FC<Props> = ({ onStart }) => {
  const [activeStep, setActiveStep] = useState(0);

  const roadmapSteps = [
    { title: "Vector Embedding", desc: "Indexing career nodes..." },
    { title: "Skill Gap Analysis", desc: "Cross-referencing RAG datasets..." },
    { title: "Path Optimization", desc: "Refining career trajectory..." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % roadmapSteps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-y-auto relative selection:bg-blue-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-600/5 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[800px] h-[800px] bg-indigo-600/5 blur-[140px] rounded-full"></div>
      </div>

      {/* Architect Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none"></div>

      <nav className="relative z-50 flex items-center justify-between px-8 md:px-16 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl">
            <span className="text-slate-900 font-black text-xl">C</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white">CareerPath <span className="text-blue-500">AI</span></span>
        </div>
        <button 
          onClick={onStart}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Sign In
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Cpu className="w-3 h-3" />
              Advanced Multi-Agent RAG Engine
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-white">
              Your AI-Powered <span className="text-gradient">Engineering Mastery.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
              Deconstruct your career trajectory using high-dimensional vector search and persistent RAG pipelines. 
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                onClick={onStart}
                className="px-10 py-5 bg-white text-slate-900 font-black text-lg rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3 group shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
              >
                Sign Up to Start
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 bg-slate-900 border border-slate-800 text-white font-black text-lg rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                <Layers className="w-5 h-5" />
                Architecture
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-blue-500/10 blur-[120px] rounded-full opacity-50"></div>
            
            <div className="relative glass-panel rounded-[3rem] p-10 border-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inference Core</p>
                    <p className="text-sm font-black text-white">Live Roadmap Builder</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-6">
                {roadmapSteps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ 
                      opacity: activeStep === idx ? 1 : 0.3,
                      x: activeStep === idx ? 8 : 0,
                      borderColor: activeStep === idx ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 41, 59, 0.5)'
                    }}
                    className={`p-6 rounded-2xl border bg-slate-950/40 transition-all duration-500`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                        activeStep === idx ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-white uppercase tracking-tight">{step.title}</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                      {activeStep === idx && <Sparkles className="w-4 h-4 text-blue-400" />}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800/50 flex items-center justify-between opacity-50">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800"></div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[8px] font-black">+24</div>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">RAG Synchronization: Active</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full px-10 py-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 flex justify-between items-center z-50">
        <div className="flex gap-10 opacity-30">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Database className="w-3 h-3" /> Pinecone Vector</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Shield className="w-3 h-3" /> Supabase Auth</span>
        </div>
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Architect Build v8.0</span>
      </footer>
    </div>
  );
};

export default LandingPageView;
