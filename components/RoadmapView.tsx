import React, { useState } from 'react';
import { geminiService, RoadmapResponse } from '../services/geminiService';
import { 
  Target, Map, CheckCircle2, Circle, Clock, Award, 
  ChevronRight, Loader2, Sparkles, AlertTriangle, 
  Lock, Database, RefreshCw, ServerOff 
} from 'lucide-react';

interface Props {
  resumeText: string;
}

interface RoadmapStep {
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
}

interface RoadmapResult {
  missing_skills: string[];
  steps: RoadmapStep[];
}

const RoadmapView: React.FC<Props> = ({ resumeText }) => {
  const [role, setRole] = useState('Senior DevOps Engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ type: string; message: string } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorInfo(null);
    try {
      const result = await geminiService.generateRoadmap(role, resumeText);
      setRoadmapData(result);
    } catch (err: any) {
      const msg = err.message || "";
      let type = "GENERIC";
      if (msg.includes("AUTH_ERROR")) type = "AUTH";
      else if (msg.includes("DATABASE_ERROR")) type = "DB";
      else if (msg.includes("NETWORK_ERROR")) type = "NETWORK";
      
      setErrorInfo({ type, message: msg.split(': ')[1] || msg });
      setRoadmapData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const roadmap = roadmapData?.data as RoadmapResult | null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Input */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
            <Map className="w-3 h-3" />
            Skill Gap Visualization
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Strategic Roadmap</h2>
          <p className="text-slate-500 font-medium italic">Mapping your trajectory to executive engineering roles.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:min-w-[300px]">
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Target Role (e.g. Staff Architect)"
              className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !role}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? "Analyzing Vector State..." : "Map Path"}
          </button>
        </div>
      </div>

      {/* Advanced Error Handling Display */}
      {errorInfo && (
        <div className="animate-in slide-in-from-top-4 duration-500">
          <div className={`p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center gap-8 ${
            errorInfo.type === 'AUTH' ? 'bg-red-50 border-red-200 text-red-900' : 
            errorInfo.type === 'DB' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${
              errorInfo.type === 'AUTH' ? 'bg-white text-red-600' : 
              errorInfo.type === 'DB' ? 'bg-white text-amber-600' : 'bg-white text-slate-600'
            }`}>
              {errorInfo.type === 'AUTH' && <Lock className="w-8 h-8" />}
              {errorInfo.type === 'DB' && <Database className="w-8 h-8" />}
              {errorInfo.type === 'NETWORK' && <ServerOff className="w-8 h-8" />}
              {errorInfo.type === 'GENERIC' && <AlertTriangle className="w-8 h-8" />}
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h4 className="text-xl font-black tracking-tight uppercase">
                {errorInfo.type === 'AUTH' ? 'Authentication Pipeline Failure' : 
                 errorInfo.type === 'DB' ? 'Vector Store Sync Error' : 'System Connection Fault'}
              </h4>
              <p className="text-sm font-medium opacity-70 leading-relaxed">
                {errorInfo.message}
              </p>
              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Handshake
                </button>
                {errorInfo.type === 'AUTH' && (
                  <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Update API Config
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!roadmap && !isLoading && !errorInfo && (
        <div className="bg-white border border-slate-200 border-dashed rounded-[3rem] p-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Target className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Define Your Destination</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Input your target role. We'll cross-reference your career data to build a custom upskilling plan.</p>
        </div>
      )}

      {roadmap && (
        <div className="space-y-8">
          {/* Provenance Badge */}
          <div className="flex items-center gap-3">
             <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest ${
               roadmapData.source === 'vector' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'
             }`}>
               {roadmapData.source === 'vector' ? <Database className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
               Origin: {roadmapData.source === 'vector' ? 'Vector RAG Index' : 'Cloud AI Fallback'}
             </div>
             {roadmapData.isFallback && (
               <div className="px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <AlertTriangle className="w-3 h-3" /> Hybrid Mode Active
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  Detected Skill Gaps
                </h4>
                <div className="flex flex-wrap gap-2">
                  {roadmap.missing_skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Architect Tip</h4>
                  <p className="text-sm font-medium leading-relaxed italic opacity-80">
                    "Focus on the 'Advanced' difficulty items first if you're targeting Senior/Staff positions. Architectural depth beats breadth in technical rounds."
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full"></div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-12 relative">
              <div className="absolute left-[31px] top-6 bottom-6 w-px bg-slate-200"></div>

              {roadmap.steps?.map((step: RoadmapStep, idx: number) => (
                <div key={idx} className="relative pl-16 group">
                  <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full border-4 border-white shadow-md transition-all duration-500 group-hover:scale-125 z-10 ${
                      idx === 0 ? 'bg-blue-600 ring-8 ring-blue-50' : 'bg-slate-300'
                    }`}></div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm group-hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Phase 0{idx + 1}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                            step.difficulty === 'Advanced' ? 'bg-red-50 text-red-600' :
                            step.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {step.difficulty}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{step.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{step.estimated_time}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {step.description}
                    </p>

                    <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>)}
                         <span className="text-[10px] font-bold text-slate-400 pl-4 self-center uppercase">12+ resources available</span>
                      </div>
                      <button className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:gap-2 transition-all">
                        Start Learning
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="relative pl-16 pt-4">
                 <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 animate-bounce">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="py-4">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Deployment Ready</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Goal: {role}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapView;