import React, { useState, useEffect } from 'react';
import { AppSection, User } from './types';
import { ICONS } from './constants';
import DashboardView from './components/DashboardView';
import CareerGPTView from './components/CareerGPTView';
import ResumeAgentView from './components/ResumeAgentView';
import RoadmapView from './components/RoadmapView';
import DevOpsDocsView from './components/DevOpsDocsView';
import LandingPageView from './components/LandingPageView';
import AuthView from './components/AuthView';
import HistorySidebar from './components/HistorySidebar';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.Landing);
  const [user, setUser] = useState<User | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

  // Landing Page is default. If user exists, stay in Landing until they click Start,
  // but LandingPageView will show "Go to Dashboard".
  
  const handleLogout = () => {
    setUser(null);
    setActiveSection(AppSection.Landing);
  };

  const handleConversationSelect = (id: string) => {
    if (id === 'new') {
      setSelectedConversationId(undefined);
    } else {
      setSelectedConversationId(id);
    }
    setActiveSection(AppSection.CareerGPT);
  };

  const renderContent = () => {
    if (activeSection === AppSection.Landing) {
      return (
        <LandingPageView 
          isLoggedIn={!!user} 
          onStart={() => user ? setActiveSection(AppSection.Dashboard) : setActiveSection(AppSection.Auth)} 
        />
      );
    }
    
    if (activeSection === AppSection.Auth) {
      return <AuthView onLogin={(u) => { setUser(u); setActiveSection(AppSection.Dashboard); }} />;
    }

    switch (activeSection) {
      case AppSection.Dashboard:
        return <DashboardView setActiveSection={setActiveSection} resumeText={resumeText} setResumeText={setResumeText} />;
      case AppSection.CareerGPT:
        return <CareerGPTView resumeText={resumeText} user={user} conversationId={selectedConversationId} />;
      case AppSection.ResumeAgent:
        return <ResumeAgentView resumeText={resumeText} />;
      case AppSection.Roadmap:
        return <RoadmapView resumeText={resumeText} />;
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

  if (activeSection === AppSection.Landing || activeSection === AppSection.Auth) {
    return renderContent();
  }

  return (
    <div className="flex min-h-screen bg-[#020617] selection:bg-blue-500/30 text-slate-200">
      {/* Sidebar with History Integration */}
      <aside className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 hidden md:flex flex-col sticky top-0 h-screen shadow-2xl z-30">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter">
                CareerPath <span className="text-blue-400">AI</span>
              </h1>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Architect v9.0</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4 space-y-1 overflow-y-auto mb-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); if (item.id !== AppSection.CareerGPT) setSelectedConversationId(undefined); }}
              className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon(`w-5 h-5 transition-colors ${activeSection === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`)}
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Conversation History Component */}
        <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-800/50">
          <HistorySidebar 
            userId={user?.id || ''} 
            onSelect={handleConversationSelect} 
            activeId={selectedConversationId}
          />
        </div>

        <div className="p-6 border-t border-slate-800/50">
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold border border-slate-600 uppercase">
                 {user?.email?.[0]}
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-black text-white truncate">{user?.email}</p>
                 <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Architect Profile</p>
               </div>
             </div>
             <button 
               onClick={handleLogout}
               className="w-full py-2 bg-slate-900 border border-slate-700 hover:border-red-500/50 hover:text-red-400 text-slate-400 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest"
             >
               Terminate Session
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-10 z-20">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            <span>Root</span>
            <svg className="w-3 h-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            <span className="text-blue-400">{activeSection.replace('-', ' ')}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Persistence Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-950 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="max-w-6xl mx-auto p-12 relative z-10">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;