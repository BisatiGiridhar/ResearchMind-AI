'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, ShieldCheck, BookOpen, Search, Cpu, CheckCircle } from 'lucide-react';
import HeroScene from '@/components/3d/HeroScene';

export default function LandingPage() {
  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Bot className="w-4 h-4 text-cyan-400" />
            10 Specialized LangGraph AI Agents
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Research Smarter. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Discover Faster.
            </span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            An autonomous multi-agent research assistant that searches real web APIs, peer-reviewed academic literature (Semantic Scholar, arXiv, Crossref), verifies claims, grades source authority, and compiles structured research reports with verifiable citations.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/research/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              Start Research Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 border border-white/10 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* 3D Hero Scene Container */}
        <div className="relative">
          <HeroScene />
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engineered for Deep Academic & Web Intelligence
          </h2>
          <p className="text-gray-400 text-sm">
            Powered by multi-agent parallel execution, fact checking, and zero mock output.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all space-y-3">
            <div className="p-3 w-fit rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Autonomous Live Search</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Queries real search APIs (Tavily, Serper, Brave) to extract live web pages, metadata, and verified snippets.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all space-y-3">
            <div className="p-3 w-fit rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Academic Literature Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Directly connects to Semantic Scholar, arXiv XML API, and Crossref DOIs for scientific paper analysis.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-all space-y-3">
            <div className="p-3 w-fit rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Fact Checker & Hallucination Audit</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cross-references claims into Verified, Conflicting, or Unsupported statuses with citation verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
