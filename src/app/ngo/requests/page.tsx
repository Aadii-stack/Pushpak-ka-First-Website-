'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { TieUpRequest, NGOProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import { HeartHandshake, ArrowLeft, Truck } from 'lucide-react';

export default function NGORequestsPage() {
  const [requests, setRequests] = useState<TieUpRequest[]>([]);
  const [ngo, setNgo] = useState<NGOProfile | null>(null);

  const loadRequests = () => {
    const user = FoodBridgeStore.getCurrentUser();
    const currentNgo = FoodBridgeStore.getNGOByUserId(user.id) || FoodBridgeStore.getNGOs()[0];
    setNgo(currentNgo);
    if (currentNgo) {
      setRequests(FoodBridgeStore.getTieUps().filter((t) => t.ngo_id === currentNgo.id));
    }
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadRequests();
    window.addEventListener('foodbridge_state_change', loadRequests);
    return () => window.removeEventListener('foodbridge_state_change', loadRequests);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3.5">
        <Link
          href="/ngo"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
          aria-label="Back to overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">Sent pickup requests</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">Track restaurant responses and pickup confirmations</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <GlassPanel variant="standard" className="p-12 text-center space-y-3 border border-white/80">
          <HeartHandshake className="w-10 h-10 text-ink-light mx-auto" />
          <h3 className="font-serif font-bold text-ink text-base">No requests sent yet</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
            Search surplus food on the discovery map to request a pickup from nearby kitchens.
          </p>
          <Link
            href="/ngo/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-trust text-white font-semibold text-xs shadow-xs hover:bg-accent-trust-hover transition-colors"
          >
            <span>Explore surplus food</span>
          </Link>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((req) => (
            <GlassPanel
              key={req.id}
              variant="standard"
              hoverLift
              className="p-6 border border-white/80 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      req.status === 'accepted'
                        ? 'bg-accent-trust-subtle text-accent-trust'
                        : req.status === 'pending'
                        ? 'bg-accent-primary-subtle text-accent-primary-hover'
                        : 'bg-accent-alert-subtle text-accent-alert'
                    }`}
                  >
                    {req.status}
                  </span>
                  <span className="text-xs text-ink-light">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-ink">{req.listing_title}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">Kitchen: <strong className="text-ink">{req.restaurant_name}</strong></p>
                </div>

                <div className="p-3.5 bg-white/60 rounded-2xl space-y-1.5 text-xs border border-white/80">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Requested portions:</span>
                    <strong className="text-ink font-semibold tabular-nums">{req.quantity_requested} {req.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Proposed pickup:</span>
                    <span className="text-ink font-medium">{req.proposed_pickup_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Transport:</span>
                    <span className="text-ink capitalize font-medium">{req.transport_mode.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {req.counter_proposal && (
                  <div className="p-3 bg-accent-primary-subtle/50 rounded-2xl text-xs text-ink-muted border border-accent-primary/20 leading-relaxed">
                    <strong className="text-ink">Kitchen note:</strong> {req.counter_proposal}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between">
                {req.status === 'accepted' ? (
                  <Link
                    href={`/ngo/transports`}
                    className="min-h-[40px] w-full py-2.5 rounded-xl bg-accent-trust hover:bg-accent-trust-hover text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>View delivery tracking</span>
                  </Link>
                ) : (
                  <div className="text-xs text-ink-muted">Awaiting restaurant confirmation...</div>
                )}
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
