
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { AgentResponse } from '../types';

interface Props {
  resumeText: string;
}

const ResumeAgentView: React.FC<Props> = ({ resumeText }) => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const startAnalysis = async () => {
    if (!resumeText) return alert("Please add resume text in Dashboard first.");
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Multi-Agent Analysis</h2>
          <p className="text-slate-500 mt-2">Agent A (Recruiter) vs Agent B (Tech Lead) Critique</p>
        </div>
        <button
          onClick={startAnalysis}
          disabled={isLoading || !resumeText}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Agents Analyzing...' : 'Run Agents'}
        </button>
      </div>

      {!resumeText && (
        <div className="p-12 text-center bg-amber-50 rounded-3xl border border-amber-200 text-amber-800">
          <p className="font-bold">No resume content found.</p>
          <p className="text-sm">Head to the Dashboard to paste your resume first.</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-3xl p-8 border border-slate-200 h-96">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-slate-100 rounded mb-8"></div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {agents.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {agents.map((agent, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-8 -mt-8 rounded-full ${agent.persona === 'Recruiter' ? 'bg-blue-600' : 'bg-emerald-600'}`}></div>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${agent.persona === 'Recruiter' ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {agent.persona} Persona
                  </h4>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">Deep Critique</h3>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-black ${agent.score > 80 ? 'text-green-600' : 'text-amber-600'}`}>{agent.score}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">SCORE</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-slate-300 rounded-full"></span>
                    Key Findings
                  </h5>
                  <ul className="space-y-2">
                    {agent.keyPoints.map((p, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-slate-300 mt-0.5">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="prose prose-sm text-slate-600 max-w-none bg-slate-50 p-4 rounded-2xl italic border border-slate-100">
                  {agent.feedback}
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
