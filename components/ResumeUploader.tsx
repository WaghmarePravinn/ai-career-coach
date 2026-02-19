import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Database } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface ResumeUploaderProps {
  onUploadSuccess?: (chunks: number | null, text?: string) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ status: 'vector' | 'local'; chunks?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError("Architectural constraint: Only PDF files are permitted.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const uploadResult = await geminiService.uploadResume(file);
      setResult(uploadResult);
      
      // In a real scenario, we'd extract text locally here too if status === 'local'
      // For this demo, we notify the parent of success
      if (onUploadSuccess) {
        onUploadSuccess(uploadResult.chunks || null, `Content from ${file.name}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl">
      <div className="flex flex-col items-center gap-8">
        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all ${
          isUploading ? 'bg-blue-500/10 text-blue-500 animate-pulse' : 
          result?.status === 'vector' ? 'bg-emerald-500/10 text-emerald-500' :
          result?.status === 'local' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-50 text-slate-400'
        }`}>
          {isUploading ? <Loader2 className="w-12 h-12 animate-spin" /> : 
           result ? <CheckCircle className="w-12 h-12" /> : 
           <Upload className="w-12 h-12" />}
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {isUploading ? "Processing Data" : result ? "Document Ready" : "Resume Ingestion"}
          </h3>
          <p className="text-slate-500 font-medium italic">
            {result?.status === 'vector' ? "Vector memory (Pinecone) synchronized." : 
             result?.status === 'local' ? "Cloud inference context active." : 
             "Prepare your profile for agentic analysis."}
          </p>
        </div>

        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-3xl p-8 flex items-center gap-6 cursor-pointer transition-all ${
            file ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-50 shadow-sm border border-slate-100">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-slate-900 truncate">
              {file ? file.name : "Select PDF"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Standard Document Format
            </p>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 ${
            !file || isUploading ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white'
          }`}
        >
          {isUploading ? "Vectorizing..." : "Initialize Analysis"}
        </button>

        {result && (
          <div className={`w-full p-5 border rounded-3xl flex items-start gap-4 animate-in fade-in ${
            result.status === 'vector' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'
          }`}>
            <Database className={`w-6 h-6 shrink-0 ${result.status === 'vector' ? 'text-emerald-500' : 'text-indigo-500'}`} />
            <div className="text-xs">
              <p className={`font-black uppercase tracking-tight ${result.status === 'vector' ? 'text-emerald-900' : 'text-indigo-900'}`}>
                {result.status === 'vector' ? 'Full RAG Mode' : 'Hybrid AI Mode'}
              </p>
              <p className={result.status === 'vector' ? 'text-emerald-700' : 'text-indigo-700'}>
                {result.status === 'vector' ? `Pipeline indexed ${result.chunks} chunks.` : 'Backend down - using Cloud context fallback.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;