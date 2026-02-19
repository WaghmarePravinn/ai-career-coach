import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Target, Shield, Database, Cpu, MessageSquare, ArrowRight } from 'lucide-react';

interface Props {
  onStart: () => void;
  isLoggedIn?: boolean;
}

const LandingPageView: React.FC<Props> = ({ onStart, isLoggedIn }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const features = [
    {
      title: "Vector-Powered Resume Analysis",
      desc: "Deconstruct your career history into high-dimensional embeddings for deep skill-gap discovery.",
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      title: "Dynamic AI Roadmaps",
      desc: "Architect a custom trajectory to Senior and Staff roles with real-time adaptive learning paths.",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      title: "Persistent Career Coaching",
      desc: "A dedicated AI architect that remembers your journey, context, and long-term career goals.",
      icon: MessageSquare,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-y-auto relative selection:bg-blue-500/30">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40">
        <motion.div 
          className="flex flex-col items-center text-center space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400"
          >
            <Cpu className="w-3 h-3" />
            Phase 9 Production Deployment
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] max-w-5xl"
          >
            Transform Your <br />
            <span className="text-gradient">Engineering Legacy.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl font-medium leading-relaxed"
          >
            The world's most advanced AI platform for high-stakes computer engineering transitions. 
            Leverage RAG-optimized coaching and multi-agent audits.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4">
            <button 
              onClick={onStart}
              className="px-12 py-6 bg-white text-slate-900 font-black text-xl rounded-[2rem] hover:bg-blue-50 transition-all flex items-center gap-4 group shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {features.map((feat, i) => (
            <div 
              key={i}
              className="group p-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center ${feat.color} mb-8 group-hover:scale-110 transition-transform`}>
                <feat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">{feat.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Architecture Status */}
        <motion.div 
          className="mt-40 pt-20 border-t border-slate-900 flex flex-wrap justify-center gap-16 md:gap-32 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Pinecone Index</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Supabase Auth</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Gemini 3.0 Core</span>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] border-t border-slate-900/50">
        Computer Engineering Career Lab &bull; 2024 Build
      </footer>
    </div>
  );
};

export default LandingPageView;