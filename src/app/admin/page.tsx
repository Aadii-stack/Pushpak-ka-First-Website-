'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { PlatformAnalytics, IssueFlag, User, TransportRecord } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import {
  Shield,
  MapPin,
  FileCheck2,
  AlertCircle,
  Truck,
  Building2,
  Utensils,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [openIssues, setOpenIssues] = useState<IssueFlag[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [activeTransports, setActiveTransports] = useState<TransportRecord[]>([]);

  const loadData = () => {
    setAnalytics(FoodBridgeStore.getAnalytics());
    setOpenIssues(FoodBridgeStore.getIssues().filter((i) => i.status === 'open' || i.status === 'under_review'));
    setPendingUsers(FoodBridgeStore.getUsers().filter((u) => u.verified_status === 'pending'));
    setActiveTransports(FoodBridgeStore.getTransports().filter((t) => t.status !== 'completed' && t.status !== 'delivered'));
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Operations Header */}
      <GlassPanel variant="prominent" className="p-7 sm:p-10 space-y-7 border border-white/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 text-stone-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Operations desk
              </span>
              <span className="text-xs text-accent-trust font-medium">All systems active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">FoodBridge operations command</h1>
            <p className="text-xs sm:text-sm text-ink-muted max-w-xl">
              City-wide food surplus coordination, partner safety verification, and operational dispute monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/live-map"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-ink hover:bg-black text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>City live map</span>
            </Link>
            <Link
              href="/admin/verifications"
              className="min-h-[44px] px-4 py-2.5 rounded-2xl glass-subtle hover:bg-white text-ink font-semibold text-xs transition-colors border border-white/80 flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4 text-accent-trust" />
              <span>Pending partner checks ({pendingUsers.length})</span>
            </Link>
          </div>
        </div>

        {/* Analytics Top Cards */}
        {analytics && (
          <div className="pt-6 border-t border-stone-200/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-ink-muted">Total food rescued</div>
              <div className="font-serif font-bold text-2xl text-ink mt-0.5 tabular-nums">
                {analytics.total_food_saved_kg.toLocaleString()} kg
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Total meals served</div>
              <div className="font-serif font-bold text-2xl text-ink mt-0.5 tabular-nums">
                {analytics.total_meals_donated.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Successful completions</div>
              <div className="font-serif font-bold text-2xl text-accent-trust mt-0.5 tabular-nums">
                {analytics.completion_rate_percent}%
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Active in transit</div>
              <div className="font-serif font-bold text-2xl text-accent-primary mt-0.5 tabular-nums">
                {activeTransports.length}
              </div>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Admin Quick Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Issues Banner */}
        <GlassPanel variant="standard" hoverLift className="p-6 space-y-3 flex flex-col justify-between border border-white/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-accent-alert-subtle text-accent-alert flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-alert-subtle text-accent-alert border border-accent-alert/20">
                {openIssues.length} open reports
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-ink">Field reports & flags</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Review reported traffic delays, food packing questions, and handoff inquiries.
            </p>
          </div>
          <Link
            href="/admin/issues"
            className="pt-3 border-t border-stone-200/50 flex items-center justify-between text-xs font-semibold text-accent-alert hover:underline"
          >
            <span>Open report center</span>
          </Link>
        </GlassPanel>

        {/* Verifications Banner */}
        <GlassPanel variant="standard" hoverLift className="p-6 space-y-3 flex flex-col justify-between border border-white/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-accent-trust-subtle text-accent-trust flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
                {pendingUsers.length} awaiting check
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-ink">Safety & registration compliance</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Check restaurant kitchen hygiene licenses and NGO registration documents.
            </p>
          </div>
          <Link
            href="/admin/verifications"
            className="pt-3 border-t border-stone-200/50 flex items-center justify-between text-xs font-semibold text-accent-trust hover:underline"
          >
            <span>Review registrations</span>
          </Link>
        </GlassPanel>

        {/* City Map Banner */}
        <GlassPanel variant="standard" hoverLift className="p-6 space-y-3 flex flex-col justify-between border border-white/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-stone-200 text-ink flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-ink border border-stone-200">
                Live geolocation
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-ink">City overview map</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Inspect active listings, moving vehicles, and shelter demand points in real-time.
            </p>
          </div>
          <Link
            href="/admin/live-map"
            className="pt-3 border-t border-stone-200/50 flex items-center justify-between text-xs font-semibold text-ink hover:underline"
          >
            <span>Launch city map</span>
          </Link>
        </GlassPanel>
      </div>

      {/* Active Transports Overview */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif font-bold text-lg text-ink">Active pickups and deliveries in city</h2>
          <Link href="/admin/live-map" className="text-xs font-semibold text-accent-trust hover:underline">
            View on city map
          </Link>
        </div>

        {activeTransports.length === 0 ? (
          <GlassPanel variant="standard" className="p-8 text-center text-xs text-ink-muted border border-white/80">
            No delivery vehicles currently moving across Bengaluru.
          </GlassPanel>
        ) : (
          <GlassPanel variant="standard" className="overflow-hidden border border-white/80 divide-y divide-stone-100">
            {activeTransports.map((t) => (
              <div key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust capitalize">
                      {t.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-ink-light">Order #{t.id}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-ink">{t.listing_title}</h4>
                  <div className="text-xs text-ink-muted flex flex-wrap items-center gap-3">
                    <span>From: <strong className="text-ink">{t.restaurant_name}</strong></span>
                    <span>To: <strong className="text-ink">{t.ngo_name}</strong></span>
                    <span>Quantity: <strong className="text-ink">{t.quantity} {t.unit}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-ink">Driver: {t.driver_name}</div>
                  <div className="text-[11px] text-ink-muted">{t.vehicle_number}</div>
                </div>
              </div>
            ))}
          </GlassPanel>
        )}
      </section>
    </div>
  );
}
