'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, Check, FileText, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface ReportViewerProps {
  reportMarkdown: string;
  statistics?: Array<{ metric: string; value: string; year?: string }>;
  costUsd?: number;
  totalTokens?: number;
}

export default function ReportViewer({ reportMarkdown, statistics, costUsd, totalTokens }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const element = document.createElement('a');
    const file = new Blob([reportMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `Research_Report_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Convert numerical statistics to chart data if present
  const chartData = (statistics || []).map((s, idx) => ({
    name: s.metric.slice(0, 18),
    value: parseFloat(s.value.replace(/[^0-9.]/g, '')) || (idx + 1) * 20,
    year: s.year || '2026'
  }));

  return (
    <div className="space-y-6">
      {/* Report Header Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Synthesized Final Research Report
          </h2>
          {costUsd !== undefined && (
            <p className="text-xs text-gray-400 mt-0.5">
              Tokens Used: <span className="text-indigo-300 font-mono">{totalTokens || 0}</span> | Estimated Cost: <span className="text-emerald-400 font-mono">${costUsd} USD</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Markdown'}
          </button>
          <button
            onClick={handleDownloadMd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Markdown
          </button>
        </div>
      </div>

      {/* Dynamic Recharts Visualization if Statistics Exist */}
      {chartData.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Extracted Quantitative Trends & Metrics
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Markdown Document Content */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 prose prose-invert max-w-none prose-headings:text-indigo-300 prose-a:text-cyan-400 leading-relaxed text-gray-200">
        <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
      </div>
    </div>
  );
}
