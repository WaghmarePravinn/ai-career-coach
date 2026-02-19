import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

/**
 * CareerChat Component
 * Connects to the FastAPI /api/chat RAG endpoint with full history support.
 */
const CareerChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Prepare history payload for the backend
    const historyPayload = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: historyPayload 
        }),
      });

      if (!response.ok) {
        throw new Error('Consultation service is currently unavailable.');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'model',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "Connection failed.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">CareerPath Coach</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Conversational RAG Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-950/20"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600">
              <Bot className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold">Awaiting Career Context</p>
              <p className="text-xs text-slate-500 max-w-[200px]">Ask about your skills, roadmap, or job market fit.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-blue-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`group relative max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
            }`}>
              {msg.content}
              <span className="absolute -bottom-5 left-0 text-[9px] font-bold text-slate-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-6 bg-slate-900/40 border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your Career Coach..."
            disabled={isTyping}
            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-2xl pl-4 pr-14 py-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-90 disabled:opacity-50 disabled:bg-slate-800"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerChat;
