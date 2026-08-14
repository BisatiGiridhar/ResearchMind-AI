'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Trash2, ArrowRight, FileText, Calendar, Filter } from 'lucide-react';
import { api } from '@/lib/api';

export default function HistoryPage() {
  const [researches, setResearches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/research');
      setResearches(res.data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this research report?')) return;

    try {
      await api.delete(`/research/${id}`);
      setResearches((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const filtered = researches.filter((r) =>
    r.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Research History</h1>
          <p className="text-xs text-gray-400">Access and manage all previous research outputs</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-gray-400 text-xs">Loading research history...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-2">
          <FileText className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">No research records found.</p>
          <Link href="/research/new" className="text-xs text-indigo-400 hover:underline">
            Start a new research prompt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/research/${item.id}`}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all flex flex-wrap items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 max-w-2xl">
                <h3 className="text-base font-semibold text-gray-100 group-hover:text-indigo-300 transition-colors">
                  {item.question}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <span>Depth: {item.depth}</span>
                  <span>Sources: {item.sources_count}</span>
                  <span>Claims: {item.claims_count}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                  title="Delete Research"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
