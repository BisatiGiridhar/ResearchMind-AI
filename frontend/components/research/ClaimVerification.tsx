'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ExternalLink } from 'lucide-react';

export interface Claim {
  id?: string;
  claim_text: string;
  status: 'Verified' | 'Partially Verified' | 'Conflicting' | 'Unsupported' | string;
  confidence_score: number;
  evidence_summary?: string;
  source_urls: string[];
}

export default function ClaimVerification({ claims }: { claims: Claim[] }) {
  if (!claims || claims.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center text-gray-400 text-sm">
        No claims extracted yet. As agents complete fact-checking, verified claim cards will render here.
      </div>
    );
  }

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'Verified':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
          label: 'Verified Claim'
        };
      case 'Partially Verified':
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: HelpCircle,
          label: 'Partially Verified'
        };
      case 'Conflicting':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
          label: 'Conflicting Evidence'
        };
      case 'Unsupported':
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: XCircle,
          label: 'Unsupported Claim'
        };
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-white flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        Fact Checking & Verification Panel
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {claims.map((claim, i) => {
          const badge = getBadgeStyle(claim.status);
          const Icon = badge.icon;
          const confidencePct = Math.round((claim.confidence_score || 0.85) * 100);

          return (
            <div key={i} className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Confidence: {confidencePct}%
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-100 mb-2 leading-snug">
                "{claim.claim_text}"
              </p>

              {claim.evidence_summary && (
                <p className="text-xs text-gray-400 mb-3 bg-gray-950/40 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                  <strong className="text-gray-300">Evidence Audit:</strong> {claim.evidence_summary}
                </p>
              )}

              {claim.source_urls && claim.source_urls.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium">Traceable Sources:</span>
                  {claim.source_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"
                    >
                      Source #{idx + 1}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
