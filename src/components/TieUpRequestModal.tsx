'use client';

import React, { useState } from 'react';
import { FoodBridgeStore } from '@/lib/store';
import { SurplusListing, NGOProfile } from '@/lib/types';
import { X, Truck, Users, Clock, CheckCircle2, ShieldCheck, HeartHandshake, Utensils } from 'lucide-react';
import ExpiryCountdown from './ExpiryCountdown';
import GlassPanel from './GlassPanel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listing: SurplusListing;
  currentNGO?: NGOProfile;
  onSuccess?: () => void;
}

export default function TieUpRequestModal({ isOpen, onClose, listing, currentNGO, onSuccess }: Props) {
  const [quantityRequested, setQuantityRequested] = useState<number>(listing.remaining_quantity);
  const [transportMode, setTransportMode] = useState<'ngo_pickup' | 'restaurant_delivers' | 'volunteer_driver'>('ngo_pickup');
  const [proposedPickupTime, setProposedPickupTime] = useState<string>('Within 30 minutes');
  const [vehicleType, setVehicleType] = useState('Insulated van or delivery vehicle');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNGO) {
      alert('Please switch to an NGO profile to send a pickup request');
      return;
    }

    setIsSubmitting(true);
    try {
      FoodBridgeStore.createTieUpRequest({
        listing_id: listing.id,
        ngo_id: currentNGO.id,
        quantity_requested: Number(quantityRequested),
        proposed_pickup_time: proposedPickupTime,
        transport_mode: transportMode,
        vehicle_type: vehicleType,
        people_count: 2,
        notes: notes.trim(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Error creating request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg">
        <GlassPanel variant="prominent" className="w-full overflow-hidden border border-white/90 shadow-[0_20px_60px_rgba(34,40,43,0.18)]">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-accent-trust to-accent-trust-hover text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base">Request food pickup</h3>
                <p className="text-xs text-white/80">Direct tie-up with {listing.restaurant_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Satisfying Confirmation Resolution State */}
          {submitted ? (
            <div className="p-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-accent-trust-subtle text-accent-trust flex items-center justify-center mx-auto ring-8 ring-accent-trust/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-ink text-xl">Pickup request dispatched</h4>
                <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1.5 leading-relaxed">
                  {listing.restaurant_name} has received your request for {quantityRequested} {listing.unit}. Once they confirm, live route tracking and handoff verification will begin.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              {/* Food Summary Glass Card */}
              <div className="p-4 rounded-2xl bg-white/60 border border-white/80 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-ink">{listing.title}</h4>
                    <p className="text-xs text-ink-muted mt-0.5">{listing.restaurant_address}</p>
                  </div>
                  <ExpiryCountdown expiryAt={listing.expiry_at} compact />
                </div>
                <div className="pt-2 border-t border-stone-200/50 flex flex-wrap gap-4 text-xs text-ink-muted">
                  <span>Available: <strong className="text-ink font-semibold">{listing.remaining_quantity} {listing.unit}</strong></span>
                  <span>Packaging: <strong className="text-ink capitalize font-semibold">{listing.packaging_status.replace(/_/g, ' ')}</strong></span>
                </div>
              </div>

              {/* Quantity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <label className="font-semibold text-ink">Portions you can collect ({listing.unit})</label>
                  <span className="font-bold tabular-nums text-sm text-accent-trust">
                    {quantityRequested} of {listing.remaining_quantity} {listing.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={listing.remaining_quantity}
                  value={quantityRequested}
                  onChange={(e) => setQuantityRequested(Number(e.target.value))}
                  className="w-full accent-accent-trust h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-ink-light">
                  <span>1 portion</span>
                  <span>Partial or full pickup allowed</span>
                  <span>Max: {listing.remaining_quantity}</span>
                </div>
              </div>

              {/* Logistics Mode Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink">How will this be transported?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'ngo_pickup', label: 'NGO vehicle', icon: Truck, desc: 'We bring our van' },
                    { id: 'restaurant_delivers', label: 'Kitchen drops off', icon: Utensils, desc: 'Restaurant delivers' },
                    { id: 'volunteer_driver', label: 'Volunteer driver', icon: Users, desc: 'Community driver' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSel = transportMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTransportMode(m.id as any)}
                        className={`min-h-[48px] p-3 rounded-2xl text-left border transition-all ${
                          isSel
                            ? 'bg-accent-trust-subtle border-accent-trust/50 text-ink ring-2 ring-accent-trust/50 shadow-xs'
                            : 'bg-white/50 border-white/80 hover:bg-white text-ink-muted hover:text-ink'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${isSel ? 'text-accent-trust' : 'text-ink-light'}`} />
                        <div className="text-xs font-semibold leading-tight text-ink">{m.label}</div>
                        <div className="text-[11px] text-ink-muted mt-0.5">{m.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pickup timing & handling notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-ink-light" />
                    <span>Estimated arrival</span>
                  </label>
                  <select
                    value={proposedPickupTime}
                    onChange={(e) => setProposedPickupTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/80 p-2.5 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none"
                  >
                    <option value="Within 20 minutes (Immediate)">Within 20 minutes</option>
                    <option value="Within 45 minutes">Within 45 minutes</option>
                    <option value="Within 1.5 hours">Within 1.5 hours</option>
                    <option value="At specified closing hour">At kitchen closing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-ink-light" />
                    <span>Vehicle details</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. Electric van, insulated crates"
                    className="w-full text-xs rounded-xl border border-white/80 p-2.5 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none placeholder:text-ink-light"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">
                  Note for the kitchen staff (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention arrival gate, number of insulated carriers, or specific recipient community..."
                  className="w-full text-xs rounded-xl border border-white/80 p-2.5 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none placeholder:text-ink-light resize-none leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <ShieldCheck className="w-4 h-4 text-accent-trust" />
                  <span>Direct phone shared on confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium text-ink-muted hover:text-ink hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || quantityRequested <= 0}
                    className="min-h-[44px] px-5 py-2 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-[0_4px_16px_rgba(47,110,82,0.25)] disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Confirm pickup request</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
