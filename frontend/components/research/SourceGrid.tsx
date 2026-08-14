'use client';

import React from 'react';
import { ExternalLink, Star, Shield, BookOpen, Globe } from 'lucide-react';

export interface Source {
  id?: string;
  title: string;
  url: string;
  publisher?: string;
  publish_date?: string;
  source_type?: 'web' | 'academic' | 'document' | string;
  quality_score?: number;
  authority_rating?: number;
  quality_reasoning?: string;
  citation_index?: number;
}

export default function SourceGrid({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center text-gray-400 text-sm">
        No sources retrieved yet. Web & Academic research agents will append real source cards here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <Globe className="w-5 h-5 text-cyan-400" />
        Retrieved Real-World Sources ({sources.length})
      </h3>

      <div className="space-y-3">
        {sources.map((src, i) => {
          const score = src.quality_score || 80;
          const stars = src.authority_rating || 4;

          return (
            <div
              key={i}
              className="glass-panel p-4 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {src.citation_index && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                      {src.citation_index}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 uppercase tracking-wider">
                    {src.source_type || 'web'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-200 bg-gray-800 px-2 py-0.5 rounded border border-white/10">
                    Quality {score}/100
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-1">
                {src.title}
              </h4>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{src.publisher || 'Web Source'}</span>
                <span>{src.publish_date || 'Recent'}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3 h-3 ${
                        idx < stars ? 'text-amber-400 fill-amber-400' : 'text-gray-700'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-gray-400 ml-1">Authority</span>
                </div>

                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Visit Source
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
