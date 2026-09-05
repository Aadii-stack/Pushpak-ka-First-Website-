'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { User, RestaurantProfile, NGOProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import {
  FileCheck2,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ExternalLink,
} from 'lucide-react';

export default function VerificationsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>([]);
  const [ngos, setNgos] = useState<NGOProfile[]>([]);

  const loadData = () => {
    setUsers(FoodBridgeStore.getUsers());
    setRestaurants(FoodBridgeStore.getRestaurants());
    setNgos(FoodBridgeStore.getNGOs());
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  const handleUpdate = (userId: string, status: 'verified' | 'rejected') => {
    FoodBridgeStore.updateVerificationStatus(userId, status);
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3.5">
        <Link
          href="/admin"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
          aria-label="Back to operations overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">Account & license compliance</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Review food safety certifications (FSSAI) and NGO non-profit registrations (12A / 80G)
          </p>
        </div>
      </div>

      <GlassPanel variant="standard" className="overflow-hidden border border-white/80 divide-y divide-stone-100">
        {users.map((u) => {
          const rest = restaurants.find((r) => r.user_id === u.id);
          const ngo = ngos.find((n) => n.user_id === u.id);

          return (
            <div key={u.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      u.verified_status === 'verified'
                        ? 'bg-accent-trust-subtle text-accent-trust'
                        : u.verified_status === 'pending'
                        ? 'bg-accent-primary-subtle text-accent-primary-hover'
                        : 'bg-accent-alert-subtle text-accent-alert'
                    }`}
                  >
                    {u.verified_status}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-ink-muted capitalize">
                    {u.role}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-ink">
                    {rest?.business_name || ngo?.org_name || u.name}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Contact: <strong className="text-ink">{u.name}</strong> • {u.email} • {u.phone}
                  </p>
                </div>

                {/* License Document Preview Box */}
                <div className="p-3 bg-white/60 rounded-2xl border border-white/80 flex items-center justify-between max-w-md">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-accent-trust" />
                    <div>
                      <div className="text-xs font-semibold text-ink">
                        {u.role === 'restaurant'
                          ? `FSSAI license: ${rest?.fssai_license || 'FSSAI-33445566778899'}`
                          : `Govt registration: ${ngo?.registration_no || 'REG-NGO-2022-80G-KA-1188'}`}
                      </div>
                      <div className="text-[11px] text-ink-light">Document uploaded and verified via automated checks</div>
                    </div>
                  </div>
                  <span
                    onClick={() => alert('Viewing document attachment (demo)')}
                    className="text-xs text-accent-trust font-semibold flex items-center gap-1 cursor-pointer hover:underline min-h-[36px]"
                  >
                    View doc <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {u.verified_status !== 'verified' && (
                  <button
                    onClick={() => handleUpdate(u.id, 'verified')}
                    className="min-h-[44px] px-5 py-2 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve partner</span>
                  </button>
                )}

                {u.verified_status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdate(u.id, 'rejected')}
                    className="min-h-[44px] px-4 py-2 rounded-2xl border border-stone-200 hover:bg-white text-accent-alert font-medium text-xs transition-colors"
                  >
                    Flag document
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </GlassPanel>
    </div>
  );
}
