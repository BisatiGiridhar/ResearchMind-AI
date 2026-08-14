'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, Upload, Github, Sliders, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewResearchPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [depth, setDepth] = useState('Standard');
  const [sourcePreferences, setSourcePreferences] = useState<string[]>(['Web', 'Academic', 'News']);
  const [dateRange, setDateRange] = useState('Any time');
  const [githubUrl, setGithubUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleSource = (src: string) => {
    if (sourcePreferences.includes(src)) {
      setSourcePreferences(sourcePreferences.filter((s) => s !== src));
    } else {
      setSourcePreferences([...sourcePreferences, src]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/research', {
        question,
        depth,
        source_preferences: sourcePreferences,
        date_range: dateRange,
        github_url: githubUrl || null,
      });

      if (res.data && res.data.id) {
        router.push(`/research/${res.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start research task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Initialize Autonomous Multi-Agent Research
        </h1>
        <p className="text-xs text-gray-400">
          Enter a question to orchestrate 10 AI agents searching live web & academic repositories.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompt Input */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Research Prompt / Question
          </label>
          <textarea
            required
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is the impact of generative AI on software engineering jobs in India between 2026 and 2030?"
            className="w-full p-4 rounded-xl bg-gray-900/90 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Research Depth */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Research Depth & Scope
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Quick', 'Standard', 'Deep', 'Comprehensive'].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDepth(d)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all ${
                  depth === d
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-gray-900/60 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Source Preferences */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Target Sources
          </label>
          <div className="flex flex-wrap gap-2">
            {['Web', 'Academic', 'News', 'Government', 'Company Reports'].map((src) => {
              const active = sourcePreferences.includes(src);
              return (
                <button
                  type="button"
                  key={src}
                  onClick={() => toggleSource(src)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                      : 'bg-gray-900/40 border-white/5 text-gray-400'
                  }`}
                >
                  {src}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional GitHub Repo */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Github className="w-4 h-4 text-gray-400" />
            GitHub Repository Source (Optional)
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !question.trim()}
          className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 text-base transition-all flex items-center justify-center gap-2"
        >
          {submitting ? 'Initializing Multi-Agent Engine...' : 'Start Research Execution'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
