import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2, RefreshCcw } from 'lucide-react';
import { ChatMessage } from '../types';

/**
 * CareerChat Component
 * Handles conversational state and RAG backend integration.
 */
const CareerChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
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

    // Maintain turn limit for context efficiency
    const historyPayload = messages.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          history: historyPayload 
        }),
      });

      if (!response.ok) {
        throw new Error('Inference server returned an invalid state.');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'model',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "Consultation gateway is offline.");
      // Recovery logic: Put the input back if it failed
      setInput(currentInput);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-[650px] w-full max-w-2xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200">
      {/* Dynamic Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 shadow-lg shadow-slate-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 tracking-tight">CareerPath Coach</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stateful RAG Active</span>
            </div>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset Conversation"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400">
              <Bot className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <p className="text-slate-900 font-black text-lg">Knowledge Session Idle</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Upload your resume to begin analysis</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`group relative max-w-[80%] px-6 py-4 rounded-[2rem] text-sm leading-loose font-medium ${
              msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.content}
              <span className="absolute -bottom-6 left-2 text-[9px] font-black text-slate-300 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-slate-50 px-6 py-4 rounded-[2rem] rounded-tl-none flex gap-2 items-center">
              <span className="w-2 h-2 bg-blue-500/40 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-500/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-blue-500/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center pt-4">
            <div className="px-5 py-2.5 bg-red-50 border border-red-100 rounded-full text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Secure Input Controller */}
      <div className="p-8 bg-slate-50/50 border-t border-slate-100">
        <div className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your Career Architect..."
            disabled={isTyping}
            className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-[1.5rem] pl-6 pr-16 py-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-3 p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all active:scale-90 disabled:opacity-50 disabled:bg-slate-200 shadow-xl shadow-slate-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerChat;
