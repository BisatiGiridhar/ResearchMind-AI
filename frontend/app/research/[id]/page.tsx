'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bot, StopCircle, RefreshCw } from 'lucide-react';
import { api, getApiBaseUrl } from '@/lib/api';
import AgentNetwork from '@/components/agents/AgentNetwork';
import ClaimVerification from '@/components/research/ClaimVerification';
import SourceGrid from '@/components/research/SourceGrid';
import ReportViewer from '@/components/report/ReportViewer';

export default function ResearchWorkspacePage() {
  const params = useParams();
  const researchId = params.id as string;

  const [currentAgent, setCurrentAgent] = useState('planner');
  const [progress, setProgress] = useState(10);
  const [logs, setLogs] = useState<Array<{ agent: string; message: string }>>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [status, setStatus] = useState<'pending' | 'running' | 'completed' | 'cancelled' | 'failed'>('running');
  const [question, setQuestion] = useState('');
  const [costUsd, setCostUsd] = useState(0);
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    if (researchId) {
      loadResearchDetail();
      startStream();
    }
  }, [researchId]);

  const loadResearchDetail = async () => {
    try {
      const res = await api.get(`/research/${researchId}`);
      setQuestion(res.data.question);
      if (res.data.report_markdown) {
        setReportMarkdown(res.data.report_markdown);
        setSources(res.data.sources || []);
        setClaims(res.data.claims || []);
        setStatus(res.data.status as any);
        setProgress(100);
      }
    } catch (err) {
      console.error('Failed to load initial detail', err);
    }
  };

  const startStream = () => {
    const streamUrl = `${getApiBaseUrl()}/research/${researchId}/stream`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.agent) setCurrentAgent(data.agent);
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.message) {
          setLogs((prev) => [...prev, { agent: data.agent, message: data.message }]);
        }

        if (data.state) {
          const st = data.state;
          if (st.source_scores) setSources(st.source_scores);
          if (st.claims) setClaims(st.claims);
          if (st.extracted_statistics) setStatistics(st.extracted_statistics);
          if (st.report_markdown) setReportMarkdown(st.report_markdown);
          if (st.estimated_cost_usd) setCostUsd(st.estimated_cost_usd);
          if (st.prompt_tokens) setTokens(st.prompt_tokens + (st.completion_tokens || 0));
        }

        if (data.event === 'completed') {
          setStatus('completed');
          setProgress(100);
          eventSource.close();
        } else if (data.event === 'cancelled') {
          setStatus('cancelled');
          eventSource.close();
        }
      } catch (err) {
        console.error('SSE parse error', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE stream closed or completed.');
      eventSource.close();
    };
  };

  const handleCancel = async () => {
    try {
      await api.post(`/research/${researchId}/cancel`);
      setStatus('cancelled');
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Bar */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold text-white leading-tight">{question || 'Researching Topic...'}</h1>
          </div>
          <p className="text-xs text-gray-400 font-mono">Job ID: {researchId}</p>
        </div>

        <div className="flex items-center gap-3">
          {status === 'running' && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-all"
            >
              <StopCircle className="w-4 h-4" />
              Cancel Job
            </button>
          )}

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : status === 'cancelled'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Multi-Agent Node Graph */}
      <AgentNetwork currentAgent={currentAgent} progress={progress} />

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Agent Log Stream */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live Agent Log Stream</h3>
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 text-xs font-mono">
              {logs.map((log, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-gray-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">{log.agent}</span>
                  <p className="text-gray-300 leading-snug">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Synthesized Report & Verification Panel */}
        <div className="lg:col-span-6 space-y-6">
          <ClaimVerification claims={claims} />
          {reportMarkdown ? (
            <ReportViewer
              reportMarkdown={reportMarkdown}
              statistics={statistics}
              costUsd={costUsd}
              totalTokens={tokens}
            />
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-gray-200">Agents are extracting real evidence & generating report...</p>
              <p className="text-xs text-gray-400">Live progress updates are streaming via SSE.</p>
            </div>
          )}
        </div>

        {/* Right Column: Source Cards Grid */}
        <div className="lg:col-span-3 space-y-4">
          <SourceGrid sources={sources} />
        </div>
      </div>
    </div>
  );
}
