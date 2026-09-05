'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { NGONeedRequest, FoodCategory, FoodUnit, NGOProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import { PlusCircle, ArrowLeft, Clock, Building2, CheckCircle2 } from 'lucide-react';

export default function StandingNeedsPage() {
  const [needs, setNeeds] = useState<NGONeedRequest[]>([]);
  const [ngo, setNgo] = useState<NGOProfile | null>(null);

  // Form State
  const [quantityNeeded, setQuantityNeeded] = useState<number>(100);
  const [unit, setUnit] = useState<FoodUnit>('servings');
  const [categoryPreference, setCategoryPreference] = useState<FoodCategory | 'any'>('cooked_meals');
  const [neededHours, setNeededHours] = useState<number>(3);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = () => {
    const user = FoodBridgeStore.getCurrentUser();
    const currentNgo = FoodBridgeStore.getNGOByUserId(user.id) || FoodBridgeStore.getNGOs()[0];
    setNgo(currentNgo);
    setNeeds(FoodBridgeStore.getStandingNeeds());
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngo) return;

    setIsSubmitting(true);
    try {
      FoodBridgeStore.createStandingNeed({
        ngo_id: ngo.id,
        ngo_name: ngo.org_name,
        ngo_address: ngo.address,
        ngo_lat: ngo.lat,
        ngo_lng: ngo.lng,
        ngo_contact: ngo.phone,
        quantity_needed: Number(quantityNeeded),
        unit,
        category_preference: categoryPreference,
        needed_by: new Date(Date.now() + neededHours * 3600 * 1000).toISOString(),
        description: description.trim(),
      });

      setShowCreateModal(false);
      setDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating need request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/ngo"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
            aria-label="Back to overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">Food requirements & needs</h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Share hunger relief targets so local restaurants know what your shelter requires
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white font-semibold text-xs shadow-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post food requirement</span>
        </button>
      </div>

      {/* Needs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {needs.map((item) => (
          <GlassPanel
            key={item.id}
            variant="standard"
            hoverLift
            className="p-6 border border-white/80 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
                  {item.ngo_name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-ink-muted capitalize">
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-ink">
                  Requirement: {item.quantity_needed} {item.unit} ({item.category_preference.replace(/_/g, ' ')})
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">{item.ngo_address}</p>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed bg-white/60 p-3.5 rounded-2xl border border-white/80">
                "{item.description}"
              </p>

              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <Clock className="w-4 h-4 text-accent-primary" />
                <span>
                  Needed by:{' '}
                  <strong className="text-ink font-semibold">
                    {new Date(item.needed_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between text-xs text-ink-light">
              <span>Posted {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <Link
                href="/ngo/discover"
                className="font-semibold text-accent-trust hover:underline"
              >
                Match with surplus food
              </Link>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg">
            <GlassPanel variant="prominent" className="p-6 sm:p-7 space-y-4 border border-white/90 shadow-glass-lg">
              <h3 className="font-serif font-bold text-lg text-ink">Post community food requirement</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink">Quantity needed</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={quantityNeeded}
                      onChange={(e) => setQuantityNeeded(Number(e.target.value))}
                      className="w-full text-xs font-bold p-3 rounded-xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full text-xs font-semibold p-3 rounded-xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none"
                    >
                      <option value="servings">Portions / Servings</option>
                      <option value="boxes">Boxes</option>
                      <option value="kg">Kilograms (kg)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">Category preference</label>
                  <select
                    value={categoryPreference}
                    onChange={(e) => setCategoryPreference(e.target.value as any)}
                    className="w-full text-xs font-medium p-3 rounded-xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none"
                  >
                    <option value="any">Any fresh surplus food</option>
                    <option value="cooked_meals">Cooked meals or buffet</option>
                    <option value="packaged">Packaged meal boxes</option>
                    <option value="bakery">Bakery and bread</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-ink">
                    <span>Needed within:</span>
                    <span className="text-accent-trust font-bold">{neededHours} hours</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={neededHours}
                    onChange={(e) => setNeededHours(Number(e.target.value))}
                    className="w-full accent-accent-trust"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink">Recipient community details</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Night shelter food distribution for 100 people near Austin Town..."
                    className="w-full text-xs p-3 rounded-xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none resize-none placeholder:text-ink-light"
                  />
                </div>

                <div className="pt-3 border-t border-stone-200/50 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium text-ink-muted hover:text-ink hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className="min-h-[44px] px-5 py-2 rounded-2xl bg-accent-trust text-white text-xs font-semibold hover:bg-accent-trust-hover shadow-xs"
                  >
                    Share food requirement
                  </button>
                </div>
              </form>
            </GlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
