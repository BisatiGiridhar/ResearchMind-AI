'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Search, BookOpen, Database, CheckCircle2, ShieldCheck, Layers, FileText, Check, Cpu } from 'lucide-react';

export interface AgentNode {
  id: str;
  name: str;
  role: str;
  icon: React.ElementType;
}

const AGENTS: AgentNode[] = [
  { id: 'planner', name: 'Research Planner', role: 'Decomposes prompt into search vectors', icon: Bot },
  { id: 'web_researcher', name: 'Web Researcher', role: 'Queries Tavily/Serper live web APIs', icon: Search },
  { id: 'academic_researcher', name: 'Academic Researcher', role: 'Queries Semantic Scholar, arXiv & Crossref', icon: BookOpen },
  { id: 'data_analyzer', name: 'Data & Evidence Analyzer', role: 'Extracts metrics, trends & tabular data', icon: Database },
  { id: 'fact_checker', name: 'Fact Checker', role: 'Evaluates claim consensus & detects conflicts', icon: CheckCircle2 },
  { id: 'source_evaluator', name: 'Source Quality Evaluator', role: 'Scores 0-100 authority & evidence rigor', icon: ShieldCheck },
  { id: 'synthesizer', name: 'Research Synthesizer', role: 'Merges themes & separates facts from forecasts', icon: Layers },
  { id: 'report_generator', name: 'Report Generator', role: 'Compiles 12-section structured Markdown report', icon: FileText },
  { id: 'citation_validator', name: 'Citation Validator', role: 'Verifies report [1], [2] citations resolve to URLs', icon: Check },
  { id: 'hallucination_validator', name: 'Evidence & Safety Auditor', role: 'Audits evidence grounding & cost calculation', icon: Cpu },
];

export default function AgentNetwork({ currentAgent, progress }: { currentAgent: string; progress: number }) {
  const getAgentStatus = (agentId: string) => {
    const currentIndex = AGENTS.findIndex(a => a.id === currentAgent);
    const agentIndex = AGENTS.findIndex(a => a.id === agentId);

    if (agentIndex < currentIndex) return 'completed';
    if (agentIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          Autonomous Multi-Agent Network
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {progress}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {AGENTS.map((agent) => {
          const status = getAgentStatus(agent.id);
          const Icon = agent.icon;

          return (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 ${
                status === 'active'
                  ? 'glass-panel-glow border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : status === 'completed'
                  ? 'bg-gray-900/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-gray-950/40 border-white/5 text-gray-400'
              }`}
            >
              {status === 'active' && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                </span>
              )}

              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`p-2 rounded-lg ${
                    status === 'active'
                      ? 'bg-indigo-600 text-white'
                      : status === 'completed'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold tracking-wide truncate">{agent.name}</h4>
              </div>

              <p className="text-[11px] text-gray-400 leading-tight line-clamp-2">{agent.role}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
