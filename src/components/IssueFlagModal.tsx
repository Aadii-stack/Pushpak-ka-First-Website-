'use client';

import React, { useState } from 'react';
import { FoodBridgeStore } from '@/lib/store';
import { IssueType, IssueSeverity } from '@/lib/types';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';
import GlassPanel from './GlassPanel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transportId: string;
  listingTitle: string;
  onSuccess?: () => void;
}

const ISSUE_TYPES: { type: IssueType; label: string; description: string }[] = [
  { type: 'vehicle_delayed', label: 'Vehicle delayed in traffic', description: 'Driver or pickup vehicle is running behind schedule' },
  { type: 'food_not_ready', label: 'Food not ready at pickup', description: 'Kitchen is still preparing or packing the surplus food' },
  { type: 'quantity_mismatch', label: 'Quantity difference', description: 'Actual portion count differs from listing' },
  { type: 'quality_concern', label: 'Freshness or temperature check', description: 'Food temperature or packing requires inspection' },
  { type: 'unreachable_contact', label: 'Cannot reach contact by phone', description: 'Restaurant or NGO staff is not picking up' },
  { type: 'other', label: 'Other field circumstance', description: 'Any other logistical or access question' },
];

export default function IssueFlagModal({ isOpen, onClose, transportId, listingTitle, onSuccess }: Props) {
  const [selectedType, setSelectedType] = useState<IssueType>('vehicle_delayed');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      FoodBridgeStore.flagIssue({
        transport_id: transportId,
        issue_type: selectedType,
        severity,
        description: description.trim(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1600);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg">
        <GlassPanel variant="prominent" className="w-full overflow-hidden border border-white/90 shadow-[0_20px_60px_rgba(34,40,43,0.18)]">
          {/* Calm, honest header */}
          <div className="p-5 bg-accent-alert-subtle border-b border-accent-alert/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-alert/15 text-accent-alert flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink text-base">Flag an operational issue</h3>
                <p className="text-xs text-ink-muted">Informs operations team and the counterparty</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-ink-muted hover:text-ink hover:bg-white/50 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-accent-alert-subtle text-accent-alert flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-ink text-lg">Issue recorded</h4>
              <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                The operations desk and your counterparty have been updated so they can assist right away.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">What happened?</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as IssueType)}
                  className="w-full text-xs rounded-xl border border-white/80 p-3 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-alert focus:outline-none"
                >
                  {ISSUE_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">Urgency level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as IssueSeverity[]).map((lvl) => {
                    const isSel = severity === lvl;
                    const labels: Record<string, string> = {
                      low: 'Low',
                      medium: 'Moderate',
                      high: 'Urgent',
                      critical: 'Immediate',
                    };
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSeverity(lvl)}
                        className={`min-h-[40px] py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSel
                            ? 'bg-ink text-white border-ink shadow-xs'
                            : 'bg-white/50 text-ink-muted border-white/80 hover:bg-white'
                        }`}
                      >
                        {labels[lvl]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">
                  Details for the team
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain briefly what happened so we can assist (e.g. driver held up in bridge traffic, 10 minutes delay)..."
                  className="w-full text-xs rounded-xl border border-white/80 p-3 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-alert focus:outline-none resize-none leading-relaxed placeholder:text-ink-light"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium text-ink-muted hover:text-ink hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="min-h-[44px] px-5 py-2 rounded-2xl bg-accent-alert hover:bg-accent-alert-hover text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <span>Submit issue report</span>
                </button>
              </div>
            </form>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
