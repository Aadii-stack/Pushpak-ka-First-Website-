'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { TieUpRequest, RestaurantProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import { CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';

export default function RestaurantRequestsPage() {
  const [requests, setRequests] = useState<TieUpRequest[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [counterNote, setCounterNote] = useState<{ [id: string]: string }>({});

  const loadRequests = () => {
    const user = FoodBridgeStore.getCurrentUser();
    const rest = FoodBridgeStore.getRestaurantByUserId(user.id) || FoodBridgeStore.getRestaurants()[0];
    setRestaurant(rest);
    if (rest) {
      setRequests(FoodBridgeStore.getTieUps().filter((t) => t.restaurant_id === rest.id));
    }
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadRequests();
    window.addEventListener('foodbridge_state_change', loadRequests);
    return () => window.removeEventListener('foodbridge_state_change', loadRequests);
  }, []);

  const handleRespond = (id: string, action: 'accept' | 'decline') => {
    const note = counterNote[id];
    FoodBridgeStore.respondToTieUp(id, action, note);
    loadRequests();
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const past = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <div className="flex items-center gap-3.5">
        <Link
          href="/restaurant"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
          aria-label="Back to overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">NGO pickup requests</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Review incoming requests from verified NGOs, accept tie-ups, or share handoff instructions
          </p>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-serif font-bold text-lg text-ink">Requests awaiting response</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-primary-subtle text-accent-primary-hover border border-accent-primary/20">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <GlassPanel variant="standard" className="p-10 text-center space-y-2 border border-white/80">
            <h3 className="font-serif font-bold text-ink text-base">No pending pickup requests</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
              When an NGO near your kitchen requests food from your active listings, their details will appear here immediately.
            </p>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pending.map((req) => (
              <GlassPanel
                key={req.id}
                variant="standard"
                className="p-6 border border-accent-primary/30 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {req.ngo_name}
                    </span>
                    <span className="text-xs text-ink-light">
                      {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-ink">{req.listing_title}</h3>
                    <p className="text-xs text-ink-muted mt-0.5">{req.ngo_address}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/60 space-y-1.5 text-xs border border-white/80">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Requested portions:</span>
                      <strong className="text-ink font-semibold tabular-nums">
                        {req.quantity_requested} {req.unit}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Proposed pickup window:</span>
                      <strong className="text-ink font-semibold">{req.proposed_pickup_time}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Transport arrangement:</span>
                      <span className="text-ink capitalize font-medium">{req.transport_mode.replace(/_/g, ' ')}</span>
                    </div>
                    {req.vehicle_type && (
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Vehicle info:</span>
                        <span className="text-ink">{req.vehicle_type}</span>
                      </div>
                    )}
                  </div>

                  {req.notes && (
                    <div className="p-3 rounded-2xl bg-accent-primary-subtle/50 text-xs text-ink-muted border border-accent-primary/20 italic leading-relaxed">
                      "{req.notes}"
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      placeholder="Add an entry gate note or preparation message (optional)..."
                      value={counterNote[req.id] || ''}
                      onChange={(e) => setCounterNote({ ...counterNote, [req.id]: e.target.value })}
                      className="w-full text-xs p-3 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none placeholder:text-ink-light"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/50 flex items-center gap-2">
                  <button
                    onClick={() => handleRespond(req.id, 'accept')}
                    className="min-h-[44px] flex-1 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept pickup request</span>
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, 'decline')}
                    className="min-h-[44px] px-4 rounded-2xl border border-stone-200 hover:bg-white text-ink-muted hover:text-accent-alert font-medium text-xs transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>

      {/* Past Requests History */}
      {past.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-stone-200/50">
          <h2 className="font-serif font-bold text-lg text-ink">Request history ({past.length})</h2>
          <GlassPanel variant="standard" className="overflow-hidden border border-white/80 divide-y divide-stone-100">
            {past.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        req.status === 'accepted' ? 'bg-accent-trust-subtle text-accent-trust' : 'bg-accent-alert-subtle text-accent-alert'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="font-semibold text-sm text-ink">{req.ngo_name}</span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {req.listing_title} • <strong className="text-ink">{req.quantity_requested} {req.unit}</strong>
                  </div>
                  {req.counter_proposal && (
                    <div className="text-xs text-ink-muted italic">Note: {req.counter_proposal}</div>
                  )}
                </div>

                <div className="text-right text-xs text-ink-light">
                  {req.responded_at ? new Date(req.responded_at).toLocaleDateString() : ''}
                </div>
              </div>
            ))}
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
