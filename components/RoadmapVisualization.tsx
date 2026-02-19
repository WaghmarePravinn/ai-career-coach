import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/geminiService';
import { 
  CheckCircle2, Circle, Clock, ChevronRight, 
  ExternalLink, Sparkles, AlertCircle, Layers
} from 'lucide-react';

interface Props {
  resumeText: string;
}

interface RoadmapStep {
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  resources?: string[];
}

const RoadmapVisualization: React.FC<Props> = ({ resumeText }) => {
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!resumeText) return;
      setIsLoading(true);
      try {
        const result = await geminiService.generateRoadmap("Senior Computer Engineer", resumeText);
        setSteps(result.data.steps || []);
      } catch (e) {
        setError("Inference failed. Check engine status.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmap();
  }, [resumeText]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40 py-20">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Analyzing Trajectory</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Vector Handshake in Progress</p>
        </div>
      </div>
    );
  }

  if (steps.length === 0 && !isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-8 py-20 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-950/20">
        <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-600">
          <Layers className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-black text-xl">System Idle</p>
          <p className="text-xs text-slate-500 font-medium max-w-[240px] leading-relaxed">
            Upload career data to initialize the multi-agent trajectory analyzer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-12 pl-12 pr-4 custom-scrollbar overflow-y-auto max-h-[600px] py-4">
      {/* Visual Connector Line */}
      <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent"></div>

      {steps.map((step, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.15 }}
          className="relative group"
        >
          {/* Milestone Indicator */}
          <div className="absolute left-[-45px] top-1 w-11 h-11 flex items-center justify-center z-10">
            <div className={`w-11 h-11 rounded-2xl border-4 border-slate-950 flex items-center justify-center transition-all duration-500 shadow-xl ${
              idx === 0 
                ? 'bg-emerald-500 text-slate-950 scale-110 shadow-emerald-500/20' 
                : 'bg-slate-900 text-slate-500 group-hover:bg-slate-800 group-hover:text-emerald-400'
            }`}>
              {idx === 0 ? <Sparkles className="w-5 h-5" /> : <span className="text-xs font-black">{idx + 1}</span>}
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                    step.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    step.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {step.difficulty}
                  </span >
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{step.estimated_time}</span>
                  </div>
                </div>
                <h4 className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h4>
              </div>
            </div>

            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
              {step.description}
            </p>

            {step.resources && step.resources.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {step.resources.map((res, i) => (
                  <button key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white hover:border-slate-700 transition-all">
                    <ExternalLink className="w-3 h-3" />
                    {res}
                  </button>
                ))}
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                   {[1,2].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950"></div>)}
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">14 Architects Active</span>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:translate-x-1 transition-all">
                Access Module
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RoadmapVisualization;
