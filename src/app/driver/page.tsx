'use client';

import React, { useState, useEffect } from 'react';
import { FoodBridgeStore } from '@/lib/store';
import { TransportRecord, TransportStatus } from '@/lib/types';
import LiveMap from '@/components/Map/LiveMap';
import ProofModal from '@/components/ProofModal';
import IssueFlagModal from '@/components/IssueFlagModal';
import GlassPanel from '@/components/GlassPanel';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  KeyRound,
  AlertCircle,
  Building2,
  Utensils,
} from 'lucide-react';

export default function DriverCockpit() {
  const [transports, setTransports] = useState<TransportRecord[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<TransportRecord | null>(null);
  const [proofStep, setProofStep] = useState<'pickup' | 'delivery'>('pickup');
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);

  const loadData = () => {
    const list = FoodBridgeStore.getTransports();
    setTransports(list);
    if (list.length > 0) {
      const active = list.find((t) => t.status !== 'completed' && t.status !== 'delivered') || list[0];
      setSelectedTransport({ ...active });
    }
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  // GPS Movement Simulation
  useEffect(() => {
    if (!isSimulatingGps || !selectedTransport) return;
    const timer = setInterval(() => {
      const updated = FoodBridgeStore.simulateDriverMovement(selectedTransport.id);
      if (updated) {
        setSelectedTransport({ ...updated });
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [isSimulatingGps, selectedTransport]);

  const handleUpdateStatus = (status: TransportStatus) => {
    if (!selectedTransport) return;
    const updated = FoodBridgeStore.updateTransportStatus(selectedTransport.id, status);
    if (updated) setSelectedTransport({ ...updated });
  };

  const handleOpenProof = (step: 'pickup' | 'delivery') => {
    setProofStep(step);
    setIsProofModalOpen(true);
  };

  if (!selectedTransport) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Truck className="w-12 h-12 text-ink-light mx-auto" />
        <h2 className="font-serif font-bold text-xl text-ink">No active delivery assignments</h2>
        <p className="text-xs text-ink-muted">Confirmed food pickups will appear here for field coordination.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <GlassPanel variant="prominent" className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
                Volunteer driver cockpit
              </span>
              <span className="text-xs font-semibold text-ink-muted">Vehicle: {selectedTransport.vehicle_number}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              {selectedTransport.listing_title}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Quantity: <strong className="text-ink">{selectedTransport.quantity} {selectedTransport.unit}</strong> • Destination: <strong className="text-ink">{selectedTransport.ngo_name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulatingGps(!isSimulatingGps)}
              className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-semibold text-xs transition-all flex items-center gap-2 border ${
                isSimulatingGps
                  ? 'bg-accent-trust text-white border-accent-trust shadow-sm animate-pulse'
                  : 'bg-white hover:bg-white/90 text-ink border-white/80'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>{isSimulatingGps ? 'Broadcasting live GPS...' : 'Simulate route movement'}</span>
            </button>
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white hover:bg-white/90 text-accent-alert border border-accent-alert/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Flag an issue</span>
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Field Actions: Large Touch Stepper */}
      <GlassPanel variant="standard" className="p-6 space-y-4">
        <h3 className="font-serif font-bold text-sm text-ink">
          Field transit progression
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Step 1 */}
          <button
            onClick={() => handleUpdateStatus('en_route')}
            className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedTransport.status === 'en_route'
                ? 'bg-white border-accent-primary/60 ring-2 ring-accent-primary/40 shadow-xs'
                : 'bg-white/40 border-white/70 hover:bg-white/70'
            }`}
          >
            <span className="text-[11px] font-semibold text-ink-light">Step 1</span>
            <div className="font-semibold text-xs text-ink mt-1">Start trip to kitchen</div>
            <p className="text-[11px] text-ink-muted mt-0.5">Alerts restaurant staff to prepare handoff</p>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => handleOpenProof('pickup')}
            className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedTransport.status === 'picked_up'
                ? 'bg-white border-accent-trust/60 ring-2 ring-accent-trust/40 shadow-xs'
                : 'bg-white/40 border-white/70 hover:bg-white/70'
            }`}
          >
            <span className="text-[11px] font-semibold text-ink-light">Step 2</span>
            <div className="font-semibold text-xs text-ink mt-1">Verify pickup code</div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              {selectedTransport.pickup_otp_verified ? '✓ Handoff code verified' : 'Enter 4-digit code from chef'}
            </p>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => handleUpdateStatus('in_transit')}
            className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedTransport.status === 'in_transit'
                ? 'bg-white border-accent-trust/60 ring-2 ring-accent-trust/40 shadow-xs'
                : 'bg-white/40 border-white/70 hover:bg-white/70'
            }`}
          >
            <span className="text-[11px] font-semibold text-ink-light">Step 3</span>
            <div className="font-semibold text-xs text-ink mt-1">In transit to NGO</div>
            <p className="text-[11px] text-ink-muted mt-0.5">Broadcasting live coordinates to shelter</p>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => handleOpenProof('delivery')}
            className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedTransport.status === 'delivered' || selectedTransport.status === 'completed'
                ? 'bg-white border-accent-trust/60 ring-2 ring-accent-trust/40 shadow-xs'
                : 'bg-white/40 border-white/70 hover:bg-white/70'
            }`}
          >
            <span className="text-[11px] font-semibold text-ink-light">Step 4</span>
            <div className="font-semibold text-xs text-ink mt-1">Verify delivery code</div>
            <p className="text-[11px] text-ink-muted mt-0.5">
              {selectedTransport.delivery_otp_verified ? '✓ Delivered and verified' : 'Get receipt code from NGO'}
            </p>
          </button>
        </div>
      </GlassPanel>

      {/* Map & Location Stops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassPanel variant="prominent" className="p-4 h-[460px]">
            <LiveMap
              transports={[selectedTransport]}
              center={[selectedTransport.current_lat, selectedTransport.current_lng]}
              zoom={14}
              selectedId={selectedTransport.id}
              className="h-full"
            />
          </GlassPanel>
        </div>

        <div className="space-y-4">
          <GlassPanel variant="standard" className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <Utensils className="w-4 h-4 text-accent-primary" />
              <span>1. Pickup location</span>
            </div>
            <div className="font-semibold text-ink text-sm">{selectedTransport.restaurant_name}</div>
            <p className="text-xs text-ink-muted leading-relaxed">{selectedTransport.restaurant_address}</p>
            <div className="text-xs pt-2 border-t border-stone-200/50">
              Kitchen phone: <a href={`tel:${selectedTransport.restaurant_phone}`} className="text-accent-primary font-semibold">{selectedTransport.restaurant_phone}</a>
            </div>
          </GlassPanel>

          <GlassPanel variant="standard" className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <Building2 className="w-4 h-4 text-accent-trust" />
              <span>2. Delivery destination</span>
            </div>
            <div className="font-semibold text-ink text-sm">{selectedTransport.ngo_name}</div>
            <p className="text-xs text-ink-muted leading-relaxed">{selectedTransport.ngo_address}</p>
            <div className="text-xs pt-2 border-t border-stone-200/50">
              NGO phone: <a href={`tel:${selectedTransport.ngo_phone}`} className="text-accent-trust font-semibold">{selectedTransport.ngo_phone}</a>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Proof Modal */}
      <ProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        transport={selectedTransport}
        step={proofStep}
        onSuccess={loadData}
      />

      {/* Issue Modal */}
      <IssueFlagModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        transportId={selectedTransport.id}
        listingTitle={selectedTransport.listing_title}
        onSuccess={loadData}
      />
    </div>
  );
}
