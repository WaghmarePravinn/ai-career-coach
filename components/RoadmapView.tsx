import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Target, Map, CheckCircle2, Circle, Clock, Award, ChevronRight, Loader2, Sparkles } from 'lucide-react';

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

const RoadmapView: React.FC = () => {
  const [role, setRole] = useState('Senior DevOps Engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await geminiService.generateRoadmap(role);
      setRoadmap(data);
    } catch (err: any) {
      setError("Unable to generate roadmap. Ensure your resume is uploaded first.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
              placeholder="Target Role (e.g. Solutions Architect)"
              className="w-full bg-white border border-slate-200 px-5 py-4 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !role}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? "Analyzing Gaps..." : "Map Path"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-3xl flex items-center gap-4 text-red-700 animate-in shake">
          <Circle className="w-6 h-6 fill-red-500 text-white" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {!roadmap && !isLoading && !error && (
        <div className="bg-white border border-slate-200 border-dashed rounded-[3rem] p-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Target className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Define Your Destination</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Input your target role above. We'll cross-reference your RAG-indexed resume to build a custom upskilling plan.</p>
        </div>
      )}

      {roadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Missing Skills Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                Detected Skill Gaps
              </h4>
              <div className="flex flex-wrap gap-2">
                {roadmap.missing_skills.map((skill, idx) => (
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

          {/* Timeline View */}
          <div className="lg:col-span-2 space-y-12 relative">
            <div className="absolute left-[31px] top-6 bottom-6 w-px bg-slate-200"></div>

            {roadmap.steps.map((step, idx) => (
              <div key={idx} className="relative pl-16 group">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full border-4 border-white shadow-md transition-all duration-500 group-hover:scale-125 z-10 ${
                    idx === 0 ? 'bg-blue-600 ring-8 ring-blue-50' : 'bg-slate-300'
                  }`}></div>
                </div>

                {/* Step Card */}
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
                       {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>)}
                       <span className="text-[10px] font-bold text-slate-400 pl-4 self-center">12+ resources available</span>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:gap-2 transition-all">
                      Start Learning
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Final Goal Node */}
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
      )}
    </div>
  );
};

export default RoadmapView;
