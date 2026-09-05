'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { SurplusListing, ListingStatus, RestaurantProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import ExpiryCountdown from '@/components/ExpiryCountdown';
import { PlusCircle, Utensils, ArrowLeft } from 'lucide-react';

export default function RestaurantListingsPage() {
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [activeTab, setActiveTab] = useState<ListingStatus | 'all'>('all');
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);

  const loadListings = () => {
    const user = FoodBridgeStore.getCurrentUser();
    const rest = FoodBridgeStore.getRestaurantByUserId(user.id) || FoodBridgeStore.getRestaurants()[0];
    setRestaurant(rest);
    if (rest) {
      setListings(FoodBridgeStore.getListings().filter((l) => l.restaurant_id === rest.id));
    }
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadListings();
    window.addEventListener('foodbridge_state_change', loadListings);
    return () => window.removeEventListener('foodbridge_state_change', loadListings);
  }, []);

  const filtered = activeTab === 'all' ? listings : listings.filter((l) => l.status === activeTab);

  const handleUpdateStatus = (id: string, status: ListingStatus) => {
    FoodBridgeStore.updateListing(id, { status });
    loadListings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/restaurant"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
            aria-label="Back to overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">My surplus listings</h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Review active listings, update remaining portions, and inspect safe windows
            </p>
          </div>
        </div>

        <Link
          href="/restaurant/new-listing"
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-xs shadow-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share new surplus</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['all', 'available', 'reserved', 'picked_up', 'expired'] as const).map((tab) => {
          const count = tab === 'all' ? listings.length : listings.filter((l) => l.status === tab).length;
          const labels: Record<string, string> = {
            all: 'All listings',
            available: 'Available',
            reserved: 'Reserved',
            picked_up: 'Picked up',
            expired: 'Expired',
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-[40px] px-4 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeTab === tab
                  ? 'bg-ink text-white border-ink shadow-xs'
                  : 'bg-white/60 text-ink-muted border-white/80 hover:bg-white hover:text-ink'
              }`}
            >
              {labels[tab]} ({count})
            </button>
          );
        })}
      </div>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <GlassPanel variant="standard" className="p-12 text-center space-y-3 border border-white/80">
          <Utensils className="w-10 h-10 text-ink-light mx-auto" />
          <h3 className="font-serif font-bold text-ink text-base">No listings in this view</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
            When you have extra portions from kitchen prep or catered events, list them here to notify local shelters.
          </p>
          <Link
            href="/restaurant/new-listing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-primary text-white font-semibold text-xs shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List food now</span>
          </Link>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <GlassPanel
              key={item.id}
              variant="standard"
              hoverLift
              className="overflow-hidden flex flex-col justify-between border border-white/80"
            >
              <div className="relative aspect-video w-full bg-stone-100">
                <img
                  src={item.photo_urls[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-ink/75 text-white backdrop-blur-md capitalize">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <ExpiryCountdown expiryAt={item.expiry_at} compact />
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        item.status === 'available'
                          ? 'bg-accent-trust-subtle text-accent-trust'
                          : item.status === 'reserved'
                          ? 'bg-accent-primary-subtle text-accent-primary-hover'
                          : 'bg-stone-100 text-ink-muted'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-ink-light">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-ink leading-snug">{item.title}</h3>
                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-200/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted">Remaining:</span>
                    <span className="font-bold text-ink tabular-nums">
                      {item.remaining_quantity} of {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {item.status === 'available' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'reserved')}
                        className="min-h-[40px] flex-1 py-1.5 rounded-xl border border-stone-200 hover:bg-white text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
                      >
                        Mark as reserved
                      </button>
                    )}
                    {item.status === 'reserved' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'available')}
                        className="min-h-[40px] flex-1 py-1.5 rounded-xl bg-accent-trust-subtle hover:bg-accent-trust-subtle/80 text-xs font-semibold text-accent-trust border border-accent-trust/20 transition-colors"
                      >
                        Re-open as available
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}
