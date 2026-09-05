'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { SurplusListing, TransportRecord, NGOProfile } from '@/lib/types';
import LiveMap from '@/components/Map/LiveMap';
import GlassPanel from '@/components/GlassPanel';
import { ArrowLeft, Navigation } from 'lucide-react';

export default function AdminLiveCityMap() {
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [transports, setTransports] = useState<TransportRecord[]>([]);
  const [ngos, setNgos] = useState<NGOProfile[]>([]);
  const [isSimulatingAll, setIsSimulatingAll] = useState(false);

  const loadData = () => {
    setListings(FoodBridgeStore.getListings().filter((l) => l.status === 'available'));
    setTransports(FoodBridgeStore.getTransports());
    setNgos(FoodBridgeStore.getNGOs());
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  // Multi-driver GPS movement simulation
  useEffect(() => {
    if (!isSimulatingAll) return;
    const timer = setInterval(() => {
      transports.forEach((t) => {
        if (t.status === 'in_transit' || t.status === 'en_route') {
          FoodBridgeStore.simulateDriverMovement(t.id);
        }
      });
      loadData();
    }, 2500);

    return () => clearInterval(timer);
  }, [isSimulatingAll, transports]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
            aria-label="Back to operations overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">City logistics command map</h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Live coordinates of active food listings, NGO distribution centers, and vehicles in transit
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSimulatingAll(!isSimulatingAll)}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 border transition-all self-start sm:self-auto ${
            isSimulatingAll
              ? 'bg-accent-trust text-white border-accent-trust shadow-sm animate-pulse'
              : 'glass-subtle hover:bg-white text-ink border-white/80'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isSimulatingAll ? 'text-white' : 'text-accent-trust'}`} />
          <span>{isSimulatingAll ? 'Broadcasting city fleet GPS...' : 'Simulate all city vehicles'}</span>
        </button>
      </div>

      {/* Map Legend */}
      <GlassPanel variant="subtle" className="flex flex-wrap items-center gap-5 p-4 text-xs font-semibold text-ink border border-white/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
          <span>Surplus food listings ({listings.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-trust" />
          <span>NGO distribution centers ({ngos.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>Active vehicles in transit ({transports.length})</span>
        </div>
      </GlassPanel>

      {/* Full City Map */}
      <GlassPanel variant="prominent" className="h-[620px] p-4 border border-white/90">
        <div className="h-full rounded-2xl overflow-hidden border border-white/80 shadow-inner">
          <LiveMap
            listings={listings}
            transports={transports}
            ngos={ngos}
            center={[12.9716, 77.5946]}
            zoom={12}
            className="h-full"
          />
        </div>
      </GlassPanel>
    </div>
  );
}
