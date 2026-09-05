'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { RestaurantProfile, SurplusListing, TieUpRequest, TransportRecord, User } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import ExpiryCountdown from '@/components/ExpiryCountdown';
import {
  Utensils,
  PlusCircle,
  Clock,
  HeartHandshake,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export default function RestaurantDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [myListings, setMyListings] = useState<SurplusListing[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<TieUpRequest[]>([]);
  const [activeTransports, setActiveTransports] = useState<TransportRecord[]>([]);

  const loadData = () => {
    const user = FoodBridgeStore.getCurrentUser();
    setCurrentUser(user);

    const rest = FoodBridgeStore.getRestaurantByUserId(user.id) || FoodBridgeStore.getRestaurants()[0];
    setRestaurant(rest);

    if (rest) {
      const allListings = FoodBridgeStore.getListings().filter((l) => l.restaurant_id === rest.id);
      setMyListings(allListings);

      const allRequests = FoodBridgeStore.getTieUps().filter(
        (t) => t.restaurant_id === rest.id && t.status === 'pending'
      );
      setIncomingRequests(allRequests);

      const allTransports = FoodBridgeStore.getTransports().filter(
        (t) => t.restaurant_id === rest.id && (t.status === 'confirmed' || t.status === 'en_route' || t.status === 'in_transit' || t.status === 'picked_up')
      );
      setActiveTransports(allTransports);
    }
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  const handleRespond = (tieUpId: string, action: 'accept' | 'decline') => {
    FoodBridgeStore.respondToTieUp(tieUpId, action);
    loadData();
  };

  const activeCount = myListings.filter((l) => l.status === 'available').length;
  const totalMeals = restaurant?.total_meals_donated || 3450;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
      {/* Top Overview: Emotional Payoff Hero Stat with room to breathe */}
      <GlassPanel variant="prominent" className="p-7 sm:p-10 space-y-8 border border-white/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-primary-subtle text-accent-primary-hover border border-accent-primary/20">
                Kitchen overview
              </span>
              <span className="flex items-center gap-1 text-xs text-accent-trust font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Food safety certified partner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {restaurant?.business_name || 'Green Garden Bistro & Banquets'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-ink-light flex-shrink-0" />
              <span>{restaurant?.address}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/restaurant/new-listing"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(232,134,58,0.25)] transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share surplus food</span>
            </Link>
            <Link
              href="/restaurant/listings"
              className="min-h-[44px] px-4 py-2.5 rounded-2xl glass-subtle hover:bg-white text-ink font-semibold text-xs sm:text-sm transition-colors border border-white/80 flex items-center justify-center"
            >
              Manage active dishes ({activeCount})
            </Link>
          </div>
        </div>

        {/* Hero Metric: Emotional Payoff number with generous breathing room */}
        <div className="pt-6 border-t border-stone-200/50 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-1">
            <span className="text-xs font-semibold text-ink-muted block">
              Meals provided to the community
            </span>
            <div className="font-serif font-bold text-5xl sm:text-6xl text-ink tracking-tight tabular-nums">
              {totalMeals.toLocaleString()}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every surplus banquet and kitchen batch fed someone in need instead of going to waste.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <GlassPanel variant="subtle" className="p-4 rounded-2xl border border-white/80 space-y-1">
              <span className="text-xs text-ink-muted block">Carbon saved</span>
              <div className="font-serif font-bold text-xl text-ink tabular-nums">
                {(restaurant?.co2_saved_kg || 5175).toLocaleString()} kg
              </div>
              <span className="text-[11px] text-ink-light block">Emissions avoided</span>
            </GlassPanel>

            <GlassPanel variant="subtle" className="p-4 rounded-2xl border border-white/80 space-y-1">
              <span className="text-xs text-ink-muted block">Pickup requests</span>
              <div className="font-serif font-bold text-xl text-accent-primary tabular-nums">
                {incomingRequests.length}
              </div>
              <span className="text-[11px] text-ink-light block">Awaiting response</span>
            </GlassPanel>

            <GlassPanel variant="subtle" className="p-4 rounded-2xl border border-white/80 space-y-1">
              <span className="text-xs text-ink-muted block">Community rating</span>
              <div className="font-serif font-bold text-xl text-accent-trust tabular-nums">
                ★ {restaurant?.rating || 4.9}
              </div>
              <span className="text-[11px] text-ink-light block">Volunteer verified</span>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>

      {/* Incoming Requests Section */}
      {incomingRequests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-primary-subtle text-accent-primary flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ink">
                  Pickup requests awaiting confirmation ({incomingRequests.length})
                </h2>
                <p className="text-xs text-ink-muted">
                  NGOs ready to collect your surplus. Confirm to generate the pickup code.
                </p>
              </div>
            </div>
            <Link
              href="/restaurant/requests"
              className="text-xs font-semibold text-accent-primary hover:underline"
            >
              View all requests
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map((req) => (
              <GlassPanel
                key={req.id}
                variant="standard"
                className="p-5 border border-accent-primary/30 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
                      {req.ngo_name}
                    </span>
                    <span className="text-xs text-ink-light">
                      {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-ink mt-2">{req.listing_title}</h3>
                  <div className="text-xs text-ink-muted mt-2 space-y-1">
                    <div>
                      Portions requested: <strong className="text-ink font-semibold">{req.quantity_requested} {req.unit}</strong>
                    </div>
                    <div>
                      Pickup window: <strong className="text-ink font-semibold">{req.proposed_pickup_time}</strong>
                    </div>
                    {req.vehicle_type && (
                      <div>
                        Vehicle: <span className="text-ink">{req.vehicle_type}</span>
                      </div>
                    )}
                    {req.notes && (
                      <div className="p-2.5 rounded-xl bg-white/60 text-xs text-ink-muted italic mt-2 border border-white/80 leading-relaxed">
                        "{req.notes}"
                      </div>
                    )}
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
                    className="min-h-[44px] px-4 rounded-2xl border border-stone-200 hover:bg-white text-ink-muted hover:text-accent-alert text-xs font-medium transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      )}

      {/* Active Pickups in Progress */}
      {activeTransports.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent-trust" />
              <h2 className="font-serif font-bold text-lg text-ink">Active pickups in transit ({activeTransports.length})</h2>
            </div>
            <Link
              href="/restaurant/transports"
              className="text-xs font-semibold text-accent-trust hover:underline"
            >
              Track all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTransports.map((t) => (
              <GlassPanel
                key={t.id}
                variant="standard"
                className="p-5 space-y-3.5 border border-white/80"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20 capitalize">
                    {t.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xs text-ink-muted">
                    ETA: ~{t.estimated_arrival_minutes || 10} mins
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-sm text-ink">{t.listing_title}</h3>
                  <div className="text-xs text-ink-muted mt-1">
                    NGO: <strong className="text-ink">{t.ngo_name}</strong> • Quantity: <strong className="text-ink">{t.quantity} {t.unit}</strong>
                  </div>
                </div>

                {/* Pickup OTP Display for Kitchen staff */}
                <div className="p-4 bg-ink text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-stone-400 font-medium">
                      Pickup handoff code
                    </div>
                    <div className="text-xl font-bold tabular-nums text-accent-primary tracking-widest">{t.pickup_otp}</div>
                  </div>
                  <div className="text-xs text-stone-300 text-right">
                    Provide to driver <br />
                    <span className="font-semibold text-white">{t.driver_name}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-ink-muted">
                    Driver: <a href={`tel:${t.driver_phone}`} className="text-accent-primary font-semibold">{t.driver_phone}</a>
                  </span>
                  <Link
                    href={`/restaurant/transports/${t.id}`}
                    className="font-semibold text-accent-trust hover:underline"
                  >
                    Open live route
                  </Link>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      )}

      {/* Active Listings Stream */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-ink">Active surplus listings ({activeCount})</h2>
            <p className="text-xs text-ink-muted">Dishes visible to registered NGOs on the live map</p>
          </div>
          <Link
            href="/restaurant/new-listing"
            className="min-h-[40px] px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List another dish</span>
          </Link>
        </div>

        {myListings.length === 0 ? (
          <GlassPanel variant="standard" className="p-10 text-center space-y-3 border border-white/80">
            <Utensils className="w-10 h-10 text-ink-light mx-auto" />
            <h3 className="font-serif font-bold text-ink text-base">No active food listings right now</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
              When your kitchen finishes an evening service or banquet, share surplus portions here to feed local families tonight.
            </p>
            <Link
              href="/restaurant/new-listing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-primary text-white font-semibold text-xs shadow-xs hover:bg-accent-primary-hover transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share tonight's surplus</span>
            </Link>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {myListings.map((listing) => (
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
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-ink/75 text-white backdrop-blur-md capitalize">
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
                    <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">{listing.description}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-ink-light block">Remaining</span>
                      <span className="text-sm font-bold text-ink tabular-nums">
                        {listing.remaining_quantity} of {listing.quantity} {listing.unit}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        listing.status === 'available'
                          ? 'bg-accent-trust-subtle text-accent-trust'
                          : 'bg-stone-100 text-ink-muted'
                      }`}
                    >
                      {listing.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
