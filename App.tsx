
import React, { useState } from 'react';
import { AppSection } from './types';
import { ICONS } from './constants';
import DashboardView from './components/DashboardView';
import CareerGPTView from './components/CareerGPTView';
import ResumeAgentView from './components/ResumeAgentView';
import RoadmapView from './components/RoadmapView';
import DevOpsDocsView from './components/DevOpsDocsView';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.Dashboard);
  const [resumeText, setResumeText] = useState<string>('');

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.Dashboard:
        return <DashboardView setActiveSection={setActiveSection} resumeText={resumeText} setResumeText={setResumeText} />;
      case AppSection.CareerGPT:
        return <CareerGPTView resumeText={resumeText} />;
      case AppSection.ResumeAgent:
        return <ResumeAgentView resumeText={resumeText} />;
      case AppSection.Roadmap:
        return <RoadmapView />;
      case AppSection.DevOpsDocs:
        return <DevOpsDocsView />;
      default:
        return <DashboardView setActiveSection={setActiveSection} resumeText={resumeText} setResumeText={setResumeText} />;
    }
  };

  const navItems = [
    { id: AppSection.Dashboard, label: 'Command Center', icon: ICONS.Dashboard },
    { id: AppSection.CareerGPT, label: 'Career AI Chat', icon: ICONS.Chat },
    { id: AppSection.ResumeAgent, label: 'Agentic Audit', icon: ICONS.Analysis },
    { id: AppSection.Roadmap, label: 'Skill Growth', icon: ICONS.Roadmap },
    { id: AppSection.DevOpsDocs, label: 'Infra Blueprint', icon: ICONS.DevOps },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen shadow-[10px_0_40px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-[12px] flex items-center justify-center shadow-lg shadow-slate-200">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">
                CareerPath <span className="text-blue-600">AI</span>
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Architect Edition</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeSection === item.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon(`w-5 h-5 transition-colors ${activeSection === item.id ? 'text-blue-400' : 'text-slate-300 group-hover:text-slate-500'}`)}
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
             <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate ID</span>
               <span className="text-[10px] font-bold text-blue-600">FYP-2024</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
               <div className="flex-1">
                 <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse mb-1.5"></div>
                 <div className="h-2 w-1/2 bg-slate-100 rounded animate-pulse"></div>
               </div>
             </div>
             <button className="w-full mt-6 py-3 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 text-xs font-black rounded-xl transition-all uppercase tracking-widest">
               Update Profile
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation / Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 z-20">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 tracking-widest uppercase">
            <span>Root</span>
            <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            <span className="text-slate-900">{activeSection.replace('-', ' ')}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Services Online</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">James DevOps</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Lead Architect</p>
              </div>
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-100 border-2 border-white ring-1 ring-slate-100">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto p-12">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
