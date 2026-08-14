'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`File '${file.filename || file.name}' uploaded and parsed successfully into ${res.data.chunk_count} chunks.`);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and parse document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Document RAG Management</h1>
        <p className="text-xs text-gray-400">Upload PDF, DOCX, TXT, or MD files to include as research context</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Drop Area */}
      <div className="glass-panel p-8 rounded-2xl border border-dashed border-indigo-500/30 text-center space-y-4">
        <div className="p-4 w-fit mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Upload Research Documents</p>
          <p className="text-xs text-gray-400 mt-1">Supports PDF, DOCX, TXT, Markdown (Max 25MB)</p>
        </div>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all">
          {uploading ? 'Parsing & Chunking...' : 'Select File'}
          <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt,.md" className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">Uploaded Context Documents</h2>
        {documents.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center text-xs text-gray-400">
            No document files uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800 text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{doc.filename}</h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Type: {doc.file_type.toUpperCase()} | Chunks: {doc.chunk_count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
