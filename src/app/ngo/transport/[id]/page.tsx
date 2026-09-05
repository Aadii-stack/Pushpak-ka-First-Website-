'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { TransportRecord, TransportStatus } from '@/lib/types';
import LiveMap from '@/components/Map/LiveMap';
import ProofModal from '@/components/ProofModal';
import IssueFlagModal from '@/components/IssueFlagModal';
import GlassPanel from '@/components/GlassPanel';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  KeyRound,
  MapPin,
  Phone,
  Utensils,
  Navigation,
  Camera,
} from 'lucide-react';

export default function NGOTransportTrackingDetail() {
  const params = useParams();
  const transportId = params?.id as string;

  const [transport, setTransport] = useState<TransportRecord | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadData = () => {
    if (!transportId) return;
    const t = FoodBridgeStore.getTransportById(transportId);
    setTransport(t ? { ...t } : null);
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, [transportId]);

  // Live GPS movement simulation
  useEffect(() => {
    if (!isSimulating || !transportId) return;
    const timer = setInterval(() => {
      const updated = FoodBridgeStore.simulateDriverMovement(transportId);
      if (updated) {
        setTransport({ ...updated });
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [isSimulating, transportId]);

  if (!transport) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif font-bold text-xl text-ink">Delivery record not found</h2>
        <Link href="/ngo/transports" className="text-sm font-semibold text-accent-trust hover:underline">
          Return to deliveries list
        </Link>
      </div>
    );
  }

  const steps: { key: TransportStatus; label: string; desc: string }[] = [
    { key: 'confirmed', label: 'Pickup scheduled', desc: 'Restaurant confirmed the request' },
    { key: 'en_route', label: 'Driver moving to kitchen', desc: 'Heading to restaurant for pickup' },
    { key: 'picked_up', label: 'Food loaded', desc: 'Portions verified and packed' },
    { key: 'in_transit', label: 'En route to you', desc: 'Live transit across city' },
    { key: 'delivered', label: 'Delivered safely', desc: 'Received and verified at shelter' },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === transport.status);
  const hasIssue = transport.status === 'issue' || Boolean(transport.issue_notes);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/ngo/transports"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white text-ink-muted hover:text-ink transition-colors"
            aria-label="Back to deliveries"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-light">Order #{transport.id}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
                {transport.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink mt-0.5">
              {transport.listing_title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* GPS Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              isSimulating
                ? 'bg-accent-trust text-white border-accent-trust shadow-sm'
                : 'glass-subtle hover:bg-white text-ink border-white/80'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isSimulating ? 'text-white' : 'text-accent-trust'}`} />
            <span>{isSimulating ? 'GPS broadcasting live' : 'Simulate driver route'}</span>
          </button>

          {/* Confirm Delivery Receipt */}
          {transport.status !== 'delivered' && transport.status !== 'completed' && (
            <button
              onClick={() => setIsProofModalOpen(true)}
              className="min-h-[44px] px-5 py-2 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm food receipt</span>
            </button>
          )}

          {/* Flag Issue Button: Honest, visible, not a blinking red siren */}
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/70 hover:bg-white text-accent-alert border border-accent-alert/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Flag an issue</span>
          </button>
        </div>
      </div>

      {/* Active Issue Status Banner if flagged */}
      {hasIssue && (
        <GlassPanel variant="prominent" className="p-4 sm:p-5 border-2 border-accent-alert/50 bg-accent-alert-subtle/80 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-accent-alert/15 text-accent-alert flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-semibold text-ink text-sm">Operational note shared</h4>
            <p className="text-ink-muted mt-0.5 leading-relaxed">
              {transport.issue_notes || 'An update was submitted regarding route transit. The operations team is monitoring and will coordinate if assistance is required.'}
            </p>
            <div className="mt-2 text-ink-light font-medium">
              Status is paused while this note is reviewed. Contact driver directly if you need urgent coordination.
            </div>
          </div>
        </GlassPanel>
      )}

      {/* Timeline Stepper */}
      <GlassPanel variant="standard" className="p-5 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const isDone = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            const isStepAlert = isCurrent && hasIssue;

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isStepAlert
                    ? 'border-accent-alert/60 bg-accent-alert-subtle/70 ring-2 ring-accent-alert/40 text-ink'
                    : isCurrent
                    ? 'border-accent-trust/50 bg-white ring-2 ring-accent-trust/40 text-ink shadow-xs'
                    : isDone
                    ? 'border-white/60 bg-white/40 text-ink'
                    : 'border-transparent bg-stone-100/40 text-ink-light'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isStepAlert
                        ? 'bg-accent-alert text-white'
                        : isDone
                        ? 'bg-accent-trust text-white'
                        : 'bg-stone-200 text-ink-muted'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs font-semibold truncate text-ink">{step.label}</span>
                </div>
                <p className="text-[11px] text-ink-muted leading-tight mt-1">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Main Grid: Live Map + Sidebar Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Route Map Column */}
        <div className="lg:col-span-2 space-y-3">
          <GlassPanel variant="prominent" className="p-4 space-y-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-trust animate-ping" />
                <h3 className="font-serif font-bold text-sm text-ink">Live driver coordinates</h3>
              </div>
              <div className="text-xs text-ink-muted">
                Estimated arrival: <span className="font-bold text-accent-trust tabular-nums">~{transport.estimated_arrival_minutes || 8} mins</span>
              </div>
            </div>

            <div className="h-[440px] rounded-2xl overflow-hidden border border-white/80 shadow-inner">
              <LiveMap
                transports={[transport]}
                center={[transport.current_lat, transport.current_lng]}
                zoom={14}
                selectedId={transport.id}
                className="h-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-ink-muted px-2">
              <span>Coordinates: {transport.current_lat.toFixed(4)}, {transport.current_lng.toFixed(4)}</span>
              <span>Portions: <strong className="text-ink font-semibold">{transport.quantity} {transport.unit}</strong></span>
            </div>
          </GlassPanel>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-4">
          {/* Receipt OTP Box */}
          <GlassPanel variant="prominent" className="p-6 bg-ink text-white space-y-3 border-none shadow-glass-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-accent-primary flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" /> Receipt verification code
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  transport.delivery_otp_verified ? 'bg-accent-trust/30 text-emerald-300' : 'bg-white/15 text-stone-300'
                }`}
              >
                {transport.delivery_otp_verified ? 'Verified' : 'Awaiting arrival'}
              </span>
            </div>

            <div>
              <div className="text-4xl font-bold tabular-nums tracking-[0.25em] text-accent-primary">
                {transport.delivery_otp}
              </div>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                Give this 4-digit code to the driver upon unloading to complete receipt and record impact stats.
              </p>
            </div>
          </GlassPanel>

          {/* Restaurant Origin */}
          <GlassPanel variant="standard" className="p-5 space-y-2.5">
            <h3 className="font-serif font-bold text-sm text-ink flex items-center gap-2">
              <Utensils className="w-4 h-4 text-accent-trust" /> Food source kitchen
            </h3>
            <div className="text-xs space-y-1">
              <div className="font-semibold text-ink text-sm">{transport.restaurant_name}</div>
              <div className="text-ink-muted leading-relaxed">{transport.restaurant_address}</div>
              <div className="pt-2 border-t border-stone-200/50 flex justify-between items-center">
                <span className="text-ink-muted">Direct kitchen phone:</span>
                <a href={`tel:${transport.restaurant_phone}`} className="text-accent-trust font-semibold hover:underline">
                  {transport.restaurant_phone}
                </a>
              </div>
            </div>
          </GlassPanel>

          {/* Assigned Driver */}
          <GlassPanel variant="standard" className="p-5 space-y-2.5">
            <h3 className="font-serif font-bold text-sm text-ink flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent-trust" /> Driver in transit
            </h3>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Driver name:</span>
                <span className="font-semibold text-ink">{transport.driver_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Vehicle:</span>
                <span className="font-semibold tabular-nums text-ink">{transport.vehicle_number}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200/50">
                <span className="text-ink-muted">Contact:</span>
                <a href={`tel:${transport.driver_phone}`} className="text-accent-trust font-semibold hover:underline">
                  {transport.driver_phone}
                </a>
              </div>
            </div>
          </GlassPanel>

          {/* Pickup Inspection Proof Photo if present */}
          {transport.proof_pickup_url && (
            <GlassPanel variant="standard" className="p-4 space-y-2">
              <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-accent-trust" />
                <span>Pickup inspection photo</span>
              </div>
              <div className="rounded-xl overflow-hidden aspect-video border border-white/80">
                <img src={transport.proof_pickup_url} alt="Proof" className="w-full h-full object-cover" />
              </div>
            </GlassPanel>
          )}
        </div>
      </div>

      {/* Proof Modal */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        transport={transport}
        step="delivery"
        onSuccess={loadData}
      />

      {/* Flag Issue Modal */}
      <IssueFlagModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        transportId={transport.id}
        listingTitle={transport.listing_title}
        onSuccess={loadData}
      />
    </div>
  );
}
