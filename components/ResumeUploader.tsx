"use client";

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';

/**
 * ResumeUploader Component
 * Handles PDF selection and POST request to the FastAPI RAG endpoint.
 */
const ResumeUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ status: string; chunks: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError("Please select a valid PDF document.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload_resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server failed to process resume.");
      }

      const data = await response.json();
      setResult({ status: 'success', chunks: data.chunks_processed });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 glass-panel rounded-[2.5rem] shadow-2xl transition-all duration-500">
      <div className="flex flex-col items-center gap-6">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 ${
          isUploading ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 
          result ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
        }`}>
          {isUploading ? <Loader2 className="w-10 h-10 animate-spin" /> : 
           result ? <CheckCircle className="w-10 h-10" /> : 
           <Upload className="w-10 h-10" />}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            {isUploading ? "Ingesting Data..." : result ? "Resume Indexed" : "Upload Resume PDF"}
          </h3>
          <p className="text-slate-400 text-sm max-w-[280px] mx-auto">
            {isUploading 
              ? "Vectorizing chunks for semantic search..." 
              : "Your data will be available for agentic analysis."}
          </p>
        </div>

        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl p-6 flex items-center gap-4 cursor-pointer transition-all duration-200 ${
            file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500'
          }`}
        >
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {file ? file.name : "Select Resume PDF"}
            </p>
            <p className="text-xs text-slate-500">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "Max file size: 10MB"}
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf" 
            className="hidden" 
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${
            !file || isUploading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/20'
          }`}
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Resume"}
        </button>

        {result && (
          <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-100">
              <p className="font-bold">Indexing Complete!</p>
              <p className="opacity-80">Generated <strong>{result.chunks}</strong> semantic chunks.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200 font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;