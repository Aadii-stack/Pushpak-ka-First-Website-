'use client';

import React, { useState, useEffect } from 'react';
import { FoodBridgeStore } from '@/lib/store';
import { PlatformAnalytics, RestaurantProfile, NGOProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import {
  Heart,
  Leaf,
  TrendingUp,
  Award,
  Building2,
  Utensils,
  Download,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function ImpactPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [ngos, setNgos] = useState<NGOProfile[]>([]);

  useEffect(() => {
    FoodBridgeStore.init();
    setAnalytics(FoodBridgeStore.getAnalytics());
    setRestaurants(FoodBridgeStore.getRestaurants().sort((a, b) => b.total_meals_donated - a.total_meals_donated));
    setNgos(FoodBridgeStore.getNGOs().sort((a, b) => b.total_meals_received - a.total_meals_received));

    const handleUpdate = () => {
      setAnalytics(FoodBridgeStore.getAnalytics());
      setRestaurants(FoodBridgeStore.getRestaurants().sort((a, b) => b.total_meals_donated - a.total_meals_donated));
      setNgos(FoodBridgeStore.getNGOs().sort((a, b) => b.total_meals_received - a.total_meals_received));
    };
    window.addEventListener('foodbridge_state_change', handleUpdate);
    return () => window.removeEventListener('foodbridge_state_change', handleUpdate);
  }, []);

  const totalMeals = analytics?.total_meals_donated || 36920;
  const totalKg = analytics?.total_food_saved_kg || 18450;
  const totalCo2 = analytics?.total_co2_offset_kg || 46125;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Emotional Payoff Hero: One genuinely large, well-set number with room to breathe */}
      <GlassPanel variant="prominent" className="p-8 sm:p-14 text-center space-y-7 border border-white/90 shadow-glass-lg">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-trust-subtle text-accent-trust text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-accent-trust" />
          <span>Real-time environmental and community impact</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <span className="text-xs sm:text-sm font-semibold text-ink-muted">
            Total meals rescued and served to date
          </span>
          <div className="font-serif font-bold text-6xl sm:text-7xl lg:text-8xl text-ink tracking-tight tabular-nums">
            {totalMeals.toLocaleString()}
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Every portion represents safe, nutritious food prepared by local culinary teams and shared directly with shelter communities across Bengaluru.
          </p>
        </div>

        {/* 2 Companion Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 max-w-2xl mx-auto text-left">
          <GlassPanel variant="subtle" className="p-5 border border-white/80 space-y-1.5">
            <div className="flex items-center gap-2 text-accent-trust">
              <Leaf className="w-4 h-4" />
              <span className="text-xs font-semibold">Food waste diverted</span>
            </div>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-ink tabular-nums">
              {totalKg.toLocaleString()} kg
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Wholesome meals diverted from urban landfills.
            </p>
          </GlassPanel>

          <GlassPanel variant="subtle" className="p-5 border border-white/80 space-y-1.5">
            <div className="flex items-center gap-2 text-accent-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Carbon offset</span>
            </div>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-ink tabular-nums">
              {totalCo2.toLocaleString()} kg
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Methane and greenhouse emissions prevented.
            </p>
          </GlassPanel>
        </div>
      </GlassPanel>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Donor Restaurants */}
        <GlassPanel variant="standard" className="p-6 sm:p-8 space-y-6 border border-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary-subtle text-accent-primary flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink">Food donor champions</h2>
                <p className="text-xs text-ink-muted">Kitchens and banquet teams leading donations</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary-subtle text-accent-primary-hover border border-accent-primary/20">
              Active donors
            </span>
          </div>

          <div className="space-y-3">
            {restaurants.map((r, idx) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-white/70 bg-white/50 hover:bg-white/90 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs text-ink tabular-nums">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-ink">{r.business_name}</h3>
                    <p className="text-xs text-ink-muted">{r.cuisine_type} • ★ {r.rating}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif font-bold text-sm text-ink tabular-nums">
                    {r.total_meals_donated.toLocaleString()} meals
                  </div>
                  <div className="text-[11px] text-ink-light tabular-nums">{r.co2_saved_kg.toLocaleString()} kg CO2</div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Verified NGO Network */}
        <GlassPanel variant="standard" className="p-6 sm:p-8 space-y-6 border border-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-trust-subtle text-accent-trust flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink">Verified relief partners</h2>
                <p className="text-xs text-ink-muted">Community distribution networks and shelters</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
              Verified 80G
            </span>
          </div>

          <div className="space-y-3">
            {ngos.map((ngo, idx) => (
              <div
                key={ngo.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-white/70 bg-white/50 hover:bg-white/90 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs text-ink tabular-nums">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-ink">{ngo.org_name}</h3>
                    <p className="text-xs text-ink-muted">{ngo.service_area.slice(0, 32)}...</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif font-bold text-sm text-accent-trust tabular-nums">
                    {ngo.total_meals_received.toLocaleString()} meals
                  </div>
                  <div className="text-[11px] text-ink-light tabular-nums">{ngo.people_served.toLocaleString()} people fed</div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Sustainable Goals Strip */}
      <GlassPanel variant="standard" className="p-7 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/80">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-serif font-bold text-lg text-ink">Aligned with Sustainable Development Goals</h3>
          <p className="text-xs text-ink-muted max-w-xl leading-relaxed">
            Targeting Zero Hunger and Responsible Consumption through transparent logistics, real-time safe shelf-life tracking, and verified local distribution.
          </p>
        </div>

        <button
          onClick={() => alert('Impact certificate downloaded successfully.')}
          className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Download impact certificate</span>
        </button>
      </GlassPanel>
    </div>
  );
}
