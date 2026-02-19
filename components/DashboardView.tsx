
import React, { useState, useEffect } from 'react';
import { AppSection, ChatMessage, Conversation } from '../types';
import { geminiService } from '../services/geminiService';
import { 
  Shield, Target, MessageSquare, Zap, ArrowUpRight, 
  FileText, Plus, Search, Layers, CheckCircle2, 
  TrendingUp, Calendar, ArrowRight, Layout, Clock
} from 'lucide-react';
import RoadmapVisualization from './RoadmapVisualization';
import { motion } from 'framer-motion';

interface Props {
  setActiveSection: (s: AppSection) => void;
  resumeText: string;
  setResumeText: (t: string) => void;
  userId?: string;
}

const DashboardView: React.FC<Props> = ({ setActiveSection, resumeText, userId }) => {
  const [history, setHistory] = useState<Conversation[]>([]);
  const [lastMessages, setLastMessages] = useState<ChatMessage[]>([]);
  const [skillMatch] = useState(87); // Mocked for design
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      setIsLoadingHistory(true);
      try {
        const userHistory = await geminiService.getHistory(userId);
        setHistory(userHistory);
        
        if (userHistory.length > 0) {
          const latestMessages = await geminiService.getMessages(userHistory[0].id);
          setLastMessages(latestMessages.slice(-2));
        }
      } catch (e) {
        console.error("Dashboard data fetch failed", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchDashboardData();
  }, [userId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with Welcome and Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
            <Layout className="w-3 h-3" />
            Core Environment / Dashboard
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Architect <span className="text-emerald-500">Workspace</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveSection(AppSection.Dashboard)}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Persistence Node: Online</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Summary & Actions (L:4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Skill Match Summary Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-24 h-24 text-emerald-500" />
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Skill Match Rating</h3>
              <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                FAANG Level
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-black text-white tracking-tighter">{skillMatch}</span>
              <span className="text-2xl font-black text-emerald-500">%</span>
            </div>
            
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${skillMatch}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
            
            <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
              "Your background in distributed systems shows high synergy with Lead Architect requirements."
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => setActiveSection(AppSection.Dashboard)}
              className="group w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-emerald-500/10"
            >
              <Plus className="w-6 h-6" />
              Upload New Resume
              <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
            <button 
              onClick={() => setActiveSection(AppSection.CareerGPT)}
              className="w-full py-6 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-black rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <MessageSquare className="w-6 h-6 text-emerald-500" />
              Ask AI Coach
            </button>
          </div>

          {/* Chat Preview Widget */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                {/* Fixed: Added Clock to lucide-react imports */}
                <Clock className="w-3 h-3 text-emerald-500" />
                Latest Intel
              </h3>
              <button onClick={() => setActiveSection(AppSection.CareerGPT)} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {isLoadingHistory ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-2xl animate-pulse"></div>)}
                </div>
              ) : lastMessages.length === 0 ? (
                <p className="text-xs text-slate-600 font-bold uppercase text-center py-8 tracking-widest">No Recent Transmissions</p>
              ) : (
                lastMessages.map((msg, i) => (
                  <div key={i} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex flex-col gap-1 hover:border-slate-700 transition-colors">
                    <span className={`text-[8px] font-black uppercase tracking-tighter ${msg.role === 'user' ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {msg.role === 'user' ? 'Transmission' : 'Coach Reply'}
                    </span>
                    <p className="text-xs text-slate-400 font-medium truncate italic leading-relaxed">
                      "{msg.content}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Roadmap Visualization (L:8) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">
                  <Target className="w-3 h-3" />
                  Transition Architecture
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight">Active Roadmap</h3>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs font-black text-white">4 Phases</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Strategic Path</p>
              </div>
            </div>

            <div className="flex-1">
              <RoadmapVisualization resumeText={resumeText} />
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800"></div>)}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchronized with Pinecone DB</span>
              </div>
              <button 
                onClick={() => setActiveSection(AppSection.Roadmap)}
                className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-emerald-400 transition-colors"
              >
                Full Expansion
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Refresh Icon
const RefreshCw = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default DashboardView;
