'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { PlatformAnalytics, SurplusListing } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import ExpiryCountdown from '@/components/ExpiryCountdown';
import {
  Utensils,
  Building2,
  Shield,
  Truck,
  Heart,
  Leaf,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [activeListings, setActiveListings] = useState<SurplusListing[]>([]);
  const [counterMeals, setCounterMeals] = useState<number>(36400);

  useEffect(() => {
    FoodBridgeStore.init();
    const data = FoodBridgeStore.getAnalytics();
    setAnalytics(data);
    setActiveListings(FoodBridgeStore.getListings().filter((l) => l.status === 'available').slice(0, 3));

    // One deliberate single page-load count-up moment for the hero stat
    const target = data?.total_meals_donated || 36920;
    const start = Math.max(0, target - 520);
    setCounterMeals(start);

    let current = start;
    const step = Math.ceil((target - start) / 30);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCounterMeals(target);
        clearInterval(timer);
      } else {
        setCounterMeals(current);
      }
    }, 40);

    const handleUpdate = () => {
      setAnalytics(FoodBridgeStore.getAnalytics());
      setActiveListings(FoodBridgeStore.getListings().filter((l) => l.status === 'available').slice(0, 3));
    };
    window.addEventListener('foodbridge_state_change', handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('foodbridge_state_change', handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section: Human story over cold tech */}
      <section className="pt-10 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Human Story & Direct CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-subtle text-accent-trust text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-accent-trust" />
              <span>Tonight in your city</span>
            </div>

            <div className="space-y-3">
              <p className="text-accent-primary font-semibold text-sm sm:text-base tracking-normal">
                A restaurant's evening surplus becomes tonight's dinner for 40 people.
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif font-bold text-ink leading-[1.15]">
                Fresh food from busy kitchens, shared before time runs out.
              </h1>
            </div>

            <p className="text-ink-muted text-sm sm:text-base leading-relaxed max-w-xl">
              FoodBridge coordinates direct pickups between restaurants, hotels, and local hunger relief NGOs. Complete with safe consumption countdowns, proximity radius maps, and verified delivery handoffs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/ngo/discover"
                onClick={() => FoodBridgeStore.switchRole('ngo')}
                className="min-h-[48px] px-6 py-3 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-sm shadow-[0_8px_24px_rgba(232,134,58,0.28)] transition-all flex items-center gap-2.5"
              >
                <Building2 className="w-4 h-4" />
                <span>Find surplus food near you</span>
              </Link>

              <Link
                href="/restaurant/new-listing"
                onClick={() => FoodBridgeStore.switchRole('restaurant')}
                className="min-h-[48px] px-6 py-3 rounded-2xl glass-standard hover:bg-white text-ink font-semibold text-sm transition-all flex items-center gap-2 border border-white/90"
              >
                <Utensils className="w-4 h-4 text-accent-primary" />
                <span>Share kitchen surplus</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Live-Feeling Counter Card */}
          <div className="lg:col-span-5">
            <GlassPanel variant="prominent" className="p-7 sm:p-8 space-y-6 border border-white/90 shadow-[0_16px_48px_rgba(34,40,43,0.12)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Redistributed today</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-trust">
                  <span className="w-2 h-2 rounded-full bg-accent-trust animate-pulse" />
                  Live tally
                </span>
              </div>

              <div>
                <div className="font-serif font-bold text-4xl sm:text-5xl text-ink tracking-tight tabular-nums">
                  {counterMeals.toLocaleString()}
                </div>
                <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                  Wholesome meals served to shelter residents, senior care centers, and families across Bengaluru.
                </p>
              </div>

              <div className="pt-5 border-t border-stone-200/50 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs text-ink-muted block">Food rescued</span>
                  <span className="font-serif font-bold text-lg text-ink tabular-nums">
                    {(analytics?.total_food_saved_kg || 18450).toLocaleString()} kg
                  </span>
                  <span className="text-[11px] text-ink-light block">Cleanly packaged</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs text-ink-muted block">Average pickup</span>
                  <span className="font-serif font-bold text-lg text-accent-trust tabular-nums">
                    {analytics?.avg_pickup_minutes || 28} mins
                  </span>
                  <span className="text-[11px] text-ink-light block">Kitchen to transit</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-accent-trust-subtle/70 border border-accent-trust/20 text-xs text-ink flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-accent-trust flex-shrink-0" />
                <span>Zero food waste. 100% verified safety handoffs.</span>
              </div>
            </GlassPanel>
          </div>
        </div>
      </section>

      {/* 4 Role Viewpoints (Varied Card Hierarchy, no cookie cutter grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="font-serif font-bold text-2xl text-ink">
            Experience FoodBridge by viewpoint
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Test each end of the community food rescue lifecycle:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Restaurant Portal */}
          <GlassPanel
            as={Link}
            href="/restaurant"
            onClick={() => FoodBridgeStore.switchRole('restaurant')}
            variant="standard"
            hoverLift
            className="p-6 flex flex-col justify-between space-y-6 border border-white/80"
          >
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-accent-primary-subtle text-accent-primary flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-accent-primary">Restaurant staff</span>
                <h3 className="font-serif font-bold text-base text-ink mt-1">Kitchen overview</h3>
                <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                  List surplus dishes in under a minute with visual shelf-life countdowns, specify packing, and accept incoming requests.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-accent-primary pt-3 border-t border-stone-200/50">
              Open kitchen view
            </div>
          </GlassPanel>

          {/* NGO Portal */}
          <GlassPanel
            as={Link}
            href="/ngo/discover"
            onClick={() => FoodBridgeStore.switchRole('ngo')}
            variant="prominent"
            hoverLift
            className="p-6 flex flex-col justify-between space-y-6 border border-white/90 shadow-md"
          >
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-accent-trust-subtle text-accent-trust flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-accent-trust">NGO field worker</span>
                <h3 className="font-serif font-bold text-base text-ink mt-1">Surplus food map</h3>
                <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                  Interactive radius discovery, smart match scoring based on urgency and distance, and instant pickup tie-up requests.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-accent-trust pt-3 border-t border-stone-200/50">
              Open food discovery
            </div>
          </GlassPanel>

          {/* Driver Cockpit */}
          <GlassPanel
            as={Link}
            href="/driver"
            onClick={() => FoodBridgeStore.switchRole('driver')}
            variant="standard"
            hoverLift
            className="p-6 flex flex-col justify-between space-y-6 border border-white/80"
          >
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-800">Volunteer driver</span>
                <h3 className="font-serif font-bold text-base text-ink mt-1">Driver cockpit</h3>
                <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                  Live route guidance, 4-digit code handoffs for departure and delivery, inspection photos, and issue reporting.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-amber-800 pt-3 border-t border-stone-200/50">
              Open driver cockpit
            </div>
          </GlassPanel>

          {/* Operations Admin */}
          <GlassPanel
            as={Link}
            href="/admin"
            onClick={() => FoodBridgeStore.switchRole('admin')}
            variant="standard"
            hoverLift
            className="p-6 flex flex-col justify-between space-y-6 border border-white/80"
          >
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-stone-200 text-stone-800 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-700">Operations desk</span>
                <h3 className="font-serif font-bold text-base text-ink mt-1">Operations center</h3>
                <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                  Food safety verification, city-wide live route monitoring, dispute resolution, and audit logs.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-ink pt-3 border-t border-stone-200/50">
              Open operations desk
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* Live Available Food Stream */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-serif font-bold text-2xl text-ink">Food ready for pickup right now</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">Active safe consumption windows in Bengaluru</p>
          </div>
          <Link
            href="/ngo/discover"
            className="text-xs font-semibold text-accent-trust hover:underline"
          >
            View all on map
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeListings.map((listing) => (
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
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-ink/75 text-white backdrop-blur-md capitalize">
                    {listing.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <ExpiryCountdown expiryAt={listing.expiry_at} compact />
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink line-clamp-1">{listing.title}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">{listing.restaurant_name}</p>
                  <p className="text-xs text-ink-muted line-clamp-2 mt-2 leading-relaxed">{listing.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-ink-light block">Available</span>
                    <span className="text-sm font-bold text-ink tabular-nums">
                      {listing.remaining_quantity} {listing.unit}
                    </span>
                  </div>
                  <Link
                    href={`/ngo/discover?selected=${listing.id}`}
                    onClick={() => FoodBridgeStore.switchRole('ngo')}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center"
                  >
                    Request pickup
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
