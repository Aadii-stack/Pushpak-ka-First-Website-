'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { TransportRecord, NGOProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import { Truck, ArrowLeft, KeyRound } from 'lucide-react';

export default function NGOTransportsPage() {
  const [transports, setTransports] = useState<TransportRecord[]>([]);
  const [ngo, setNgo] = useState<NGOProfile | null>(null);

  const loadTransports = () => {
    const user = FoodBridgeStore.getCurrentUser();
    const currentNgo = FoodBridgeStore.getNGOByUserId(user.id) || FoodBridgeStore.getNGOs()[0];
    setNgo(currentNgo);
    if (currentNgo) {
      setTransports(FoodBridgeStore.getTransports().filter((t) => t.ngo_id === currentNgo.id));
    }
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadTransports();
    window.addEventListener('foodbridge_state_change', loadTransports);
    return () => window.removeEventListener('foodbridge_state_change', loadTransports);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3.5">
        <Link
          href="/ngo"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
          aria-label="Back to overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">Food deliveries in transit</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Real-time tracking of food pickups, driver GPS locations, and receipt verification
          </p>
        </div>
      </div>

      {transports.length === 0 ? (
        <GlassPanel variant="standard" className="p-12 text-center space-y-3 border border-white/80">
          <Truck className="w-10 h-10 text-ink-light mx-auto" />
          <h3 className="font-serif font-bold text-ink text-base">No active or past deliveries</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
            When you request food and the kitchen confirms, the live delivery will appear here.
          </p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {transports.map((t) => (
            <GlassPanel
              key={t.id}
              variant="standard"
              hoverLift
              className="p-6 border border-white/80 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      t.status === 'delivered' || t.status === 'completed'
                        ? 'bg-accent-trust-subtle text-accent-trust'
                        : 'bg-accent-primary-subtle text-accent-primary-hover'
                    }`}
                  >
                    {t.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-ink-light">Order #{t.id}</span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-ink line-clamp-1">{t.listing_title}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">From: <strong className="text-ink">{t.restaurant_name}</strong></p>
                </div>

                <div className="p-4 bg-ink text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-stone-400 font-medium">
                      Receipt verification code
                    </div>
                    <div className="text-xl font-bold tabular-nums text-accent-primary tracking-widest">
                      {t.delivery_otp}
                    </div>
                  </div>
                  <div className="text-xs text-stone-300 text-right">
                    Driver: <span className="font-semibold text-white">{t.driver_name}</span>
                  </div>
                </div>

                <div className="text-xs text-ink-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Portions:</span>
                    <strong className="text-ink tabular-nums">{t.quantity} {t.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated arrival:</span>
                    <strong className="text-ink tabular-nums">~{t.estimated_arrival_minutes || 8} mins</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between">
                <span className="text-[11px] text-ink-light">
                  {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Link
                  href={`/ngo/transport/${t.id}`}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-accent-trust hover:bg-accent-trust-hover text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center"
                >
                  Track and confirm
                </Link>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
