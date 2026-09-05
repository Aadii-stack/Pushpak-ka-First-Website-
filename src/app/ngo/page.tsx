'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { NGOProfile, SurplusListing, TieUpRequest, TransportRecord } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import ExpiryCountdown from '@/components/ExpiryCountdown';
import {
  Building2,
  Search,
  PlusCircle,
  Truck,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Utensils,
} from 'lucide-react';

export default function NGODashboard() {
  const [ngo, setNgo] = useState<NGOProfile | null>(null);
  const [nearbyListings, setNearbyListings] = useState<SurplusListing[]>([]);
  const [activeRequests, setActiveRequests] = useState<TieUpRequest[]>([]);
  const [activeTransports, setActiveTransports] = useState<TransportRecord[]>([]);

  const loadData = () => {
    const user = FoodBridgeStore.getCurrentUser();
    const currentNgo = FoodBridgeStore.getNGOByUserId(user.id) || FoodBridgeStore.getNGOs()[0];
    setNgo(currentNgo);

    if (currentNgo) {
      const available = FoodBridgeStore.getListings().filter((l) => l.status === 'available');
      setNearbyListings(available.slice(0, 4));

      const requests = FoodBridgeStore.getTieUps().filter((t) => t.ngo_id === currentNgo.id);
      setActiveRequests(requests);

      const transports = FoodBridgeStore.getTransports().filter(
        (t) => t.ngo_id === currentNgo.id && (t.status === 'confirmed' || t.status === 'en_route' || t.status === 'in_transit' || t.status === 'picked_up')
      );
      setActiveTransports(transports);
    }
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  const totalMeals = ngo?.total_meals_received || 9400;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
      {/* Top NGO Hero Overview */}
      <GlassPanel variant="prominent" className="p-7 sm:p-10 space-y-8 border border-white/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
                NGO coordinator overview
              </span>
              <span className="flex items-center gap-1 text-xs text-accent-trust font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified relief organization
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {ngo?.org_name || 'Annam Relief Foundation'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-ink-light flex-shrink-0" />
              <span>{ngo?.service_area}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ngo/discover"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(47,110,82,0.25)] transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Find surplus food map</span>
            </Link>
            <Link
              href="/ngo/standing-needs"
              className="min-h-[44px] px-4 py-2.5 rounded-2xl glass-subtle hover:bg-white text-ink font-semibold text-xs sm:text-sm transition-colors border border-white/80 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-accent-trust" />
              <span>Post recurring food need</span>
            </Link>
          </div>
        </div>

        {/* Hero Impact Metric with breathing room */}
        <div className="pt-6 border-t border-stone-200/50 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-1">
            <span className="text-xs font-semibold text-ink-muted block">
              Meals received and distributed
            </span>
            <div className="font-serif font-bold text-5xl sm:text-6xl text-ink tracking-tight tabular-nums">
              {totalMeals.toLocaleString()}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Serving shelter residents, daily wage workers, and local children daily.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <GlassPanel variant="subtle" className="p-4 rounded-2xl border border-white/80 space-y-1">
              <span className="text-xs text-ink-muted block">People fed</span>
              <div className="font-serif font-bold text-xl text-ink tabular-nums">
                {(ngo?.people_served || 7800).toLocaleString()}
              </div>
              <span className="text-[11px] text-ink-light block">Community members</span>
            </GlassPanel>

            <GlassPanel variant="subtle" className="p-4 rounded-2xl border border-white/80 space-y-1">
              <span className="text-xs text-ink-muted block">Partner kitchens</span>
              <div className="font-serif font-bold text-xl text-accent-trust tabular-nums">
                {ngo?.partner_restaurants_count || 14}
              </div>
              <span className="text-[11px] text-ink-light block">Direct restaurant partners</span>
            </GlassPanel>

            <GlassPanel variant="subtle" className="p-4 rounded-2xl border border-white/80 space-y-1">
              <span className="text-xs text-ink-muted block">Daily capacity</span>
              <div className="font-serif font-bold text-xl text-ink tabular-nums">
                {ngo?.capacity_per_day || 800}
              </div>
              <span className="text-[11px] text-ink-light block">Meals per day</span>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>

      {/* Active Food Deliveries In Transit */}
      {activeTransports.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-trust-subtle text-accent-trust flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink">
                  Food in transit to you ({activeTransports.length})
                </h2>
                <p className="text-xs text-ink-muted">
                  Driver is en route. Prepare storage containers and receipt verification code.
                </p>
              </div>
            </div>
            <Link
              href="/ngo/transports"
              className="text-xs font-semibold text-accent-trust hover:underline"
            >
              View delivery map
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTransports.map((t) => (
              <GlassPanel
                key={t.id}
                variant="standard"
                className="p-5 border border-accent-trust/30 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust capitalize">
                      {t.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold text-ink">
                      ETA: ~{t.estimated_arrival_minutes || 8} mins
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-ink mt-2">{t.listing_title}</h3>
                  <div className="text-xs text-ink-muted mt-1">
                    From: <strong className="text-ink">{t.restaurant_name}</strong> • Quantity: <strong className="text-ink">{t.quantity} {t.unit}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between">
                  <div className="text-xs text-ink-muted">
                    Driver: <strong className="text-ink">{t.driver_name}</strong>
                  </div>
                  <Link
                    href={`/ngo/transport/${t.id}`}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-xs flex items-center justify-center transition-colors"
                  >
                    Track and confirm receipt
                  </Link>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      )}

      {/* Fresh Nearby Surplus Food */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-ink">Surplus food available nearby</h2>
            <p className="text-xs text-ink-muted">Active consumption windows within your service area</p>
          </div>
          <Link
            href="/ngo/discover"
            className="text-xs font-semibold text-accent-trust hover:underline"
          >
            Open interactive map
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {nearbyListings.map((listing) => (
            <GlassPanel
              key={listing.id}
              variant="standard"
              hoverLift
              className="overflow-hidden flex flex-col justify-between border border-white/80"
            >
              <div className="relative aspect-video w-full bg-stone-100">
                <img
                  src={listing.photo_urls[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <ExpiryCountdown expiryAt={listing.expiry_at} compact />
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xs text-ink line-clamp-1">{listing.title}</h3>
                  <p className="text-[11px] text-ink-muted">{listing.restaurant_name}</p>
                  <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">{listing.description}</p>
                </div>

                <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink tabular-nums">
                    {listing.remaining_quantity} {listing.unit}
                  </span>
                  <Link
                    href={`/ngo/discover?selected=${listing.id}`}
                    className="px-3 py-1.5 rounded-xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-xs"
                  >
                    Request
                  </Link>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    </div>
  );
}
