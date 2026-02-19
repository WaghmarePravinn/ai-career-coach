import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, Search, PlusCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Conversation } from '../types';

interface Props {
  userId: string;
  onSelect: (id: string) => void;
  activeId?: string;
  onClose?: () => void;
}

const HistorySidebar: React.FC<Props> = ({ userId, onSelect, activeId, onClose }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const history = await geminiService.getHistory(userId);
      setConversations(history);
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-80 shadow-2xl z-40"
    >
      {/* Sidebar Header */}
      <div className="px-6 py-8 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest">Memory Index</h4>
        </div>
        <button 
          onClick={() => onSelect('new')}
          className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
          title="New Conversation"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-6 py-4">
        <div className="relative group">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Memory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-300 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Retrieving Nodes...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center space-y-4 opacity-30">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              No matching career <br /> nodes found
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredHistory.map((chat) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onSelect(chat.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl transition-all group ${
                  activeId === chat.id 
                    ? 'bg-blue-600/10 border border-blue-500/20' 
                    : 'hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${activeId === chat.id ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className={`text-xs font-bold truncate ${activeId === chat.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {chat.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 opacity-50">
                    <Clock className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {new Date(chat.last_updated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-slate-900 bg-slate-950/80">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-2xl border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Database Synchronized</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HistorySidebar;