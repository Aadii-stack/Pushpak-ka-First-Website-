'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { IssueFlag } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<IssueFlag[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState<{ [id: string]: string }>({});

  const loadIssues = () => {
    setIssues(FoodBridgeStore.getIssues());
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadIssues();
    window.addEventListener('foodbridge_state_change', loadIssues);
    return () => window.removeEventListener('foodbridge_state_change', loadIssues);
  }, []);

  const handleResolve = (issueId: string, status: 'resolved' | 'dismissed') => {
    const notes = resolutionNotes[issueId] || 'Reviewed and addressed by Operations Admin';
    FoodBridgeStore.resolveIssue(issueId, {
      status,
      admin_notes: notes,
      action_taken: `Action completed: ${notes}`,
    });
    loadIssues();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3.5">
        <Link
          href="/admin"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
          aria-label="Back to operations overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">Field reports and dispute desk</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Audit log of reported delivery delays, quality inquiries, and quantity differences
          </p>
        </div>
      </div>

      {issues.length === 0 ? (
        <GlassPanel variant="standard" className="p-12 text-center space-y-3 border border-white/80">
          <ShieldCheck className="w-12 h-12 text-accent-trust mx-auto" />
          <h3 className="font-serif font-bold text-ink text-base">No active field issues or disputes</h3>
          <p className="text-xs text-ink-muted leading-relaxed">All transport operations running smoothly across the city.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <GlassPanel
              key={issue.id}
              variant="standard"
              className={`p-6 border space-y-4 transition-all ${
                issue.status === 'open' ? 'border-accent-alert/40 ring-1 ring-accent-alert/20' : 'border-white/80 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      issue.status === 'open'
                        ? 'bg-accent-alert-subtle text-accent-alert'
                        : issue.status === 'resolved'
                        ? 'bg-accent-trust-subtle text-accent-trust'
                        : 'bg-stone-100 text-ink-muted'
                    }`}
                  >
                    {issue.status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      issue.severity === 'critical'
                        ? 'bg-accent-alert text-white'
                        : issue.severity === 'high'
                        ? 'bg-accent-primary text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {issue.severity} urgency
                  </span>
                </div>

                <span className="text-xs text-ink-light">
                  Reported on {new Date(issue.created_at).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-ink">
                  Report: {issue.issue_type.replace(/_/g, ' ')} on Transport #{issue.transport_id}
                </h3>
                <p className="text-xs text-ink-muted">
                  Dish: <strong className="text-ink">{issue.listing_title}</strong> • Kitchen: {issue.restaurant_name} • NGO: {issue.ngo_name}
                </p>
                <div className="p-3.5 bg-accent-alert-subtle/50 rounded-2xl border border-accent-alert/20 text-xs text-ink mt-2 leading-relaxed">
                  <strong>Statement by {issue.raised_by_name}:</strong> "{issue.description}"
                </div>
              </div>

              {issue.status === 'open' ? (
                <div className="space-y-3 pt-3 border-t border-stone-200/50">
                  <input
                    type="text"
                    placeholder="Enter resolution notes or actions taken..."
                    value={resolutionNotes[issue.id] || ''}
                    onChange={(e) => setResolutionNotes({ ...resolutionNotes, [issue.id]: e.target.value })}
                    className="w-full text-xs p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none placeholder:text-ink-light"
                  />

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => handleResolve(issue.id, 'dismissed')}
                      className="min-h-[44px] px-4 py-2 rounded-2xl border border-stone-200 text-xs font-medium text-ink-muted hover:text-ink hover:bg-white transition-colors"
                    >
                      Dismiss report
                    </button>
                    <button
                      onClick={() => handleResolve(issue.id, 'resolved')}
                      className="min-h-[44px] px-5 py-2 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark resolved & resume route</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-accent-trust-subtle rounded-2xl border border-accent-trust/20 text-xs text-ink flex items-center justify-between">
                  <div>
                    <strong>Resolved by {issue.resolved_by || 'Operations Admin'}:</strong> {issue.admin_notes || 'Resolved'}
                  </div>
                  <span className="text-xs text-ink-light">
                    {issue.resolved_at ? new Date(issue.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
