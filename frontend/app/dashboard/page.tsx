'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, CheckCircle2, Globe, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export interface DashboardStats {
  researches_completed: number;
  sources_analyzed: number;
  claims_verified: number;
  reports_generated: number;
  recent_researches: Array<{
    id: string;
    question: string;
    depth: string;
    status: string;
    sources_count: number;
    claims_count: number;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Research Workspace Dashboard</h1>
          <p className="text-xs text-gray-400">Real database metrics and research activity</p>
        </div>

        <Link
          href="/research/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 text-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Research
        </Link>
      </div>

      {/* Database Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Researches Completed</span>
            <Search className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.researches_completed || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sources Analyzed</span>
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.sources_analyzed || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Claims Verified</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.claims_verified || 0}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Reports Generated</span>
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.reports_generated || 0}</p>
        </div>
      </div>

      {/* Recent Researches Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Research Projects</h2>

        {!stats?.recent_researches || stats.recent_researches.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
            <p className="text-sm text-gray-400">No completed research history found in database.</p>
            <Link
              href="/research/new"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:underline"
            >
              Submit your first research question <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {stats.recent_researches.map((item) => (
              <Link
                key={item.id}
                href={`/research/${item.id}`}
                className="glass-panel p-4 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all flex flex-wrap items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-100 group-hover:text-indigo-300 transition-colors">
                    {item.question}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Depth: {item.depth}</span>
                    <span>Sources: {item.sources_count}</span>
                    <span>Claims: {item.claims_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
