
import React, { useState } from 'react';
import { BACKEND_CODE_STUBS } from '../constants';

const DevOpsDocsView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<keyof typeof BACKEND_CODE_STUBS>('main_py');

  const fileLabels: Record<string, string> = {
    main_py: 'main.py (FastAPI)',
    rag_service_py: 'rag_service.py (LangChain)',
    docker_compose_yml: 'docker-compose.yml',
    dockerfile: 'Dockerfile'
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Architecture & DevOps</h2>
        <p className="text-slate-500 mt-2">Reference code for production deployment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          {Object.keys(BACKEND_CODE_STUBS).map((fileKey) => (
            <button
              key={fileKey}
              onClick={() => setActiveFile(fileKey as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeFile === fileKey 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {fileLabels[fileKey]}
            </button>
          ))}
          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 uppercase mb-2">Architect's Note</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              For your viva, explain that this monorepo uses Docker for environment consistency across local development and CI/CD pipelines.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-slate-800 px-6 py-3 flex items-center justify-between">
              <span className="text-slate-400 text-xs font-mono">{fileLabels[activeFile]}</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
            </div>
            <pre className="p-8 text-blue-100 text-sm font-mono overflow-x-auto h-[600px]">
              <code>{BACKEND_CODE_STUBS[activeFile].trim()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevOpsDocsView;
