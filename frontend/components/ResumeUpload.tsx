
import React, { useState } from 'react';

interface ResumeUploadProps {
  onUploadSuccess: (chunks: number) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload_resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Upload failed');
      }

      const result = await response.json();
      setIsSuccess(true);
      onUploadSuccess(result.chunks_processed);
    } catch (err: any) {
      setError(err.message || 'Error connecting to AI backend.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className={`relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 ${
        isUploading ? 'border-blue-400 bg-blue-50/30' : 
        isSuccess ? 'border-emerald-400 bg-emerald-50/30' : 
        'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-white'
      }`}>
        <input 
          type="file" 
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isSuccess ? 'bg-emerald-100 text-emerald-600' : 
            isUploading ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {isUploading ? (
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isSuccess ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900">
              {isUploading ? 'Ingesting Career Data...' : isSuccess ? 'Resume Indexed Successfully' : 'Upload Resume PDF'}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {isUploading ? 'Vectorizing chunks for Pinecone DB' : isSuccess ? 'Your data is now available for Career GPT' : 'Drag & drop or click to browse'}
            </p>
          </div>

          {error && (
            <div className="mt-4 px-4 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 animate-bounce">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
