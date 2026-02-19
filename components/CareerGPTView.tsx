import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage, User } from '../types';
import { Sparkles, Bot, User as UserIcon, Send, Loader2 } from 'lucide-react';

interface Props {
  resumeText: string;
  user: User | null;
  conversationId?: string;
}

const CareerGPTView: React.FC<Props> = ({ resumeText, user, conversationId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history if conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadHistory();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadHistory = async () => {
    if (!conversationId) return;
    setIsLoading(true);
    const history = await geminiService.getMessages(conversationId);
    setMessages(history);
    setIsLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const response = await geminiService.chatWithContext(
        currentInput, 
        resumeText || "No resume provided.", 
        history,
        user?.id,
        conversationId
      );
      
      const aiMsg: ChatMessage = { 
        role: 'model', 
        content: response || "I'm sorry, I couldn't process that.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'model', content: "Connection failure. Check backend logs.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e293b_0%,transparent_50%)] opacity-30 pointer-events-none"></div>

      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-400 border border-slate-800">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-white tracking-tight">CareerPath Coach</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Supabase Persistence Active</span>
            </div>
          </div>
        </div>
        <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-widest ${
          resumeText ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
        }`}>
          Context: {resumeText ? 'Synchronized' : 'None'}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth relative z-10">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <div className="w-20 h-20 bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-500">
              <Bot className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-black text-lg">Knowledge Session Idle</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ask a specific career strategy question</p>
            </div>
          </div>
        )}
        
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
              m.role === 'user' ? 'bg-white text-slate-900 border-white' : 'bg-blue-600/10 text-blue-400 border-blue-500/20'
            }`}>
              {m.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] px-6 py-4 rounded-[2rem] text-sm leading-loose font-medium ${
              m.role === 'user' 
                ? 'bg-white text-slate-900 rounded-tr-none' 
                : 'bg-slate-800/50 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-slate-800/50 px-6 py-4 rounded-[2rem] border border-slate-700 rounded-tl-none flex gap-2 items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 bg-slate-900/50 border-t border-slate-800 relative z-10">
        <div className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query your personal Career Architect..."
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-bold rounded-[1.5rem] pl-6 pr-16 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-3.5 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl transition-all active:scale-90 disabled:opacity-20 shadow-xl shadow-white/5"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerGPTView;