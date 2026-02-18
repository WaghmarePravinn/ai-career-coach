
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { AgentResponse } from '../types';
import { ShieldCheck, Target, AlertCircle, FileText, ChevronRight } from 'lucide-react';

interface Props {
  resumeText: string;
}

const ResumeAgentView: React.FC<Props> = ({ resumeText }) => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const startAnalysis = async () => {
    if (!resumeText) return;
    setIsLoading(true);
    try {
      const results = await geminiService.analyzeResume(resumeText);
      setAgents(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Agentic Report</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Simultaneous critique from specialized career personas.</p>
        </div>
        <button
          onClick={startAnalysis}
          disabled={isLoading || !resumeText}
          className={`flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-[1.25rem] shadow-xl transition-all transform active:scale-95 disabled:opacity-50`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Agents Brainstorming...
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              Generate Conflict Report
            </>
          )}
        </button>
      </div>

      {!resumeText && !isLoading && (
        <div className="bg-amber-50 rounded-[2.5rem] border border-amber-200 p-16 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-amber-900">Missing Career Data</h3>
          <p className="text-amber-800/70 mt-2 font-medium">Head back to the Dashboard and upload your resume PDF or paste your career history to begin the agentic critique.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-[2.5rem] p-10 border border-slate-200 h-[32rem]">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-3 w-1/2">
                   <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                   <div className="h-8 bg-slate-100 rounded w-full"></div>
                </div>
                <div className="h-16 w-16 bg-slate-100 rounded-2xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-24 bg-slate-50 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {agents.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {agents.map((agent, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-48 h-48 opacity-[0.03] -mr-12 -mt-12 rounded-full ${agent.persona === 'Recruiter' ? 'bg-blue-600' : 'bg-emerald-600'}`}></div>
              
              <div className="flex items-start justify-between mb-10">
                <div className="space-y-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${agent.persona === 'Recruiter' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <ShieldCheck className="w-3 h-3" />
                    {agent.persona} Perspective
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Persona Audit</h3>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center min-w-[80px]">
                  <div className={`text-3xl font-black leading-none ${agent.score > 80 ? 'text-emerald-600' : 'text-blue-600'}`}>{agent.score}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">AI SCORE</div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Strategic Observations
                  </h4>
                  <ul className="space-y-3">
                    {agent.keyPoints.map((p, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-3 leading-relaxed font-medium">
                        <ChevronRight className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Narrative Summary
                  </h4>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 italic leading-loose font-medium">
                    "{agent.feedback}"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeAgentView;
