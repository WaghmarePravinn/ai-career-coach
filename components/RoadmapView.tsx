
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { RoadmapData } from '../types';

const RoadmapView: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [role, setRole] = useState('Senior DevOps Engineer');
  const [skills, setSkills] = useState('React, Python, basic Docker');
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    setIsLoading(true);
    try {
      const data = await geminiService.generateRoadmap(role, skills);
      setRoadmap(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Interactive Skill Roadmap</h2>
        <p className="text-slate-500 mt-2">Visualizing your path to {role}</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Target Role</label>
          <input 
            type="text" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Current Skills</label>
          <input 
            type="text" 
            value={skills} 
            onChange={(e) => setSkills(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <button 
          onClick={generate}
          disabled={isLoading}
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Map Career'}
        </button>
      </div>

      {roadmap ? (
        <div className="bg-slate-50 rounded-3xl p-12 border border-slate-200 min-h-[500px] flex flex-col items-center">
          <div className="max-w-2xl w-full space-y-12 relative">
            {roadmap.nodes.map((node, idx) => (
              <div key={node.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-xl shadow-lg mb-4 transform transition-transform hover:scale-110 cursor-pointer
                  ${node.status === 'completed' ? 'bg-green-500 text-white' : 
                    node.status === 'current' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                    node.status === 'next' ? 'bg-white border-2 border-slate-200 text-slate-900' : 'bg-slate-100 text-slate-400'}
                `}>
                  {node.status === 'completed' ? '✓' : idx + 1}
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-slate-900">{node.label}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">{node.description}</p>
                </div>
                {idx < roadmap.nodes.length - 1 && (
                  <div className="absolute top-20 w-0.5 h-12 bg-slate-200 -z-10"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-24 text-center">
          <p className="text-slate-400">Generate a roadmap to see the visualization.</p>
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
