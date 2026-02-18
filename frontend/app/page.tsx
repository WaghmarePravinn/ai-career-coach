
"use client"

import React, { useEffect, useState } from 'react';

/**
 * CareerPath AI Connectivity Dashboard
 * Used to verify communication between Next.js and FastAPI
 */
export default function Home() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/health');
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
          setError('Backend returned non-200 status.');
        }
      } catch (err) {
        setStatus('offline');
        setError('Network error: Is the FastAPI server running on port 8000?');
      }
    };

    checkConnectivity();
    // Poll every 10 seconds to keep UI fresh
    const interval = setInterval(checkConnectivity, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Branding */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            CareerPath <span className="text-blue-500 italic">AI</span>
          </h1>
          <p className="text-slate-400 font-medium">Infrastructure Validation Layer</p>
        </div>

        {/* Connectivity Card */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 ${
              status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 
              status === 'offline' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {status === 'loading' ? 'Syncing...' : 'System Status'}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-bold text-slate-500 uppercase">FastAPI Backend</p>
                <p className={`text-2xl font-black mt-1 ${
                  status === 'online' ? 'text-white' : 'text-slate-600'
                }`}>
                  {status === 'loading' ? 'Establishing...' : status === 'online' ? 'Online & Healthy' : 'Disconnected'}
                </p>
              </div>
              
              {status === 'online' && (
                <div className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </div>
              )}
            </div>

            {status === 'offline' && (
              <div className="mt-6 p-4 bg-red-950/20 border border-red-900/50 rounded-2xl text-left">
                <p className="text-xs text-red-400 leading-relaxed font-medium">
                  {error || "Check your Docker containers or run 'python main.py' in the backend directory."}
                </p>
              </div>
            )}

            <button 
              className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700 hover:border-slate-600"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Phase 2 Infrastructure Deployment &bull; 2024
        </p>
      </div>
    </main>
  );
}
