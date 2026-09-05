'use client';

import React, { useState } from 'react';
import { FoodBridgeStore } from '@/lib/store';
import { TransportRecord } from '@/lib/types';
import { Camera, CheckCircle2, KeyRound, X } from 'lucide-react';
import GlassPanel from './GlassPanel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transport: TransportRecord;
  step: 'pickup' | 'delivery';
  onSuccess: () => void;
}

export default function ProofModal({ isOpen, onClose, transport, step, onSuccess }: Props) {
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const expectedOtp = step === 'pickup' ? transport.pickup_otp : transport.delivery_otp;
  const isPickup = step === 'pickup';

  const handleSimulatePhoto = () => {
    const sampleProof = isPickup
      ? 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80';
    setPhotoPreview(sampleProof);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (enteredOtp.trim() !== expectedOtp) {
      setErrorMsg(`Verification code does not match. (Hint for demo: OTP is ${expectedOtp})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const nextStatus = isPickup ? 'picked_up' : 'delivered';
      FoodBridgeStore.updateTransportStatus(transport.id, nextStatus, {
        proof_url: photoPreview || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md">
        <GlassPanel variant="prominent" className="w-full overflow-hidden border border-white/90 shadow-[0_20px_60px_rgba(34,40,43,0.18)]">
          {/* Header */}
          <div className="p-5 bg-ink text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-accent-primary">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-white">
                  {isPickup ? 'Verify pickup handoff' : 'Confirm safe delivery receipt'}
                </h3>
                <p className="text-xs text-white/75">
                  {isPickup ? `Handoff at ${transport.restaurant_name}` : `Delivery to ${transport.ngo_name}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleVerify} className="p-6 space-y-4">
            <div className="p-3.5 bg-accent-trust-subtle rounded-2xl border border-accent-trust/20 text-xs text-ink">
              <div className="font-semibold text-accent-trust mb-0.5">Verification code required</div>
              <div className="text-[11px] text-ink-muted">
                {isPickup
                  ? `Ask ${transport.restaurant_name} for their 4-digit pickup code.`
                  : `Ask ${transport.ngo_name} for their 4-digit receipt code.`}
              </div>
              <div className="mt-1.5 font-bold tabular-nums text-ink bg-white/80 px-2.5 py-0.5 rounded-lg inline-block text-xs border border-white">
                Demo code: {expectedOtp}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink">Enter 4-digit code</label>
              <input
                type="text"
                maxLength={4}
                required
                value={enteredOtp}
                onChange={(e) => {
                  setEnteredOtp(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="0000"
                className="w-full text-center text-2xl tracking-[0.35em] font-bold tabular-nums p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-trust focus:outline-none"
              />
              {errorMsg && <p className="text-xs text-accent-alert mt-1 font-medium">{errorMsg}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink">
                Visual inspection photo (optional)
              </label>
              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/80 aspect-video group">
                  <img src={photoPreview} alt="Proof" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-ink text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-trust" /> Photo attached
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl hover:border-accent-trust hover:bg-white/50 flex flex-col items-center justify-center text-ink-muted hover:text-ink transition-colors gap-1 min-h-[56px]"
                >
                  <Camera className="w-5 h-5 text-ink-light" />
                  <span className="text-xs font-semibold">Attach food quality inspection photo</span>
                  <span className="text-[11px] text-ink-light">Tap to simulate photo attachment</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium text-ink-muted hover:text-ink hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || enteredOtp.length !== 4}
                className="min-h-[44px] px-5 py-2 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isPickup ? 'Verify and begin trip' : 'Verify and complete delivery'}</span>
              </button>
            </div>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
