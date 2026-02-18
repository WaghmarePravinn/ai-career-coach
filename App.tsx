
import React, { useState, useMemo } from 'react';
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
    { id: AppSection.Dashboard, label: 'Dashboard', icon: ICONS.Dashboard },
    { id: AppSection.CareerGPT, label: 'Career AI Chat', icon: ICONS.Chat },
    { id: AppSection.ResumeAgent, label: 'Resume Analysis', icon: ICONS.Analysis },
    { id: AppSection.Roadmap, label: 'Skill Roadmap', icon: ICONS.Roadmap },
    { id: AppSection.DevOpsDocs, label: 'DevOps Setup', icon: ICONS.DevOps },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CareerPath AI
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {item.icon(`w-5 h-5 ${activeSection === item.id ? 'text-blue-600' : 'text-slate-400'}`)}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <p className="text-xs text-slate-400 mb-1">PRO PLAN</p>
            <p className="text-sm font-semibold mb-3">Principal Architect</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2 rounded-lg transition-colors">
              VIEW FYP DOCS
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-900 font-medium capitalize">{activeSection.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">AI Service Live</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
              JD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
