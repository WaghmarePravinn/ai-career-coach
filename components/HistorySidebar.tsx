import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Search, PlusCircle, Trash2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Conversation } from '../types';

interface Props {
  userId: string;
  onSelect: (id: string) => void;
  activeId?: string;
}

const HistorySidebar: React.FC<Props> = ({ userId, onSelect, activeId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    const history = await geminiService.getHistory(userId);
    // Mock data for demo if history is empty
    if (history.length === 0) {
      setConversations([
        { id: '1', title: 'Senior DevOps Transition', last_updated: new Date() },
        { id: '2', title: 'System Design Critique', last_updated: new Date(Date.now() - 86400000) },
        { id: '3', title: 'Salary Negotiation Script', last_updated: new Date(Date.now() - 172800000) }
      ]);
    } else {
      setConversations(history);
    }
  };

  const filteredHistory = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex items-center justify-between">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chat Contexts</h4>
        <button className="text-slate-500 hover:text-blue-400 transition-colors">
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search Memory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/30 border border-slate-800/50 rounded-lg py-2 pl-9 pr-3 text-[10px] font-bold text-slate-300 focus:ring-1 focus:ring-blue-500/30 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 scroll-smooth">
        {filteredHistory.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all group ${
              activeId === chat.id 
                ? 'bg-blue-600/10 border border-blue-500/20' 
                : 'hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <div className={`mt-0.5 shrink-0 ${activeId === chat.id ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className={`text-xs font-bold truncate ${activeId === chat.id ? 'text-white' : 'text-slate-400'}`}>
                {chat.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1 opacity-50">
                <Clock className="w-2.5 h-2.5" />
                <span className="text-[8px] font-bold uppercase tracking-tighter">
                  {new Date(chat.last_updated).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistorySidebar;