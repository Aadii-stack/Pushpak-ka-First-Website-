'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, Truck, Building2, ArrowRight, Sparkles } from 'lucide-react';

interface AnimatedIntroProps {
  onComplete: () => void;
}

export default function AnimatedIntro({ onComplete }: AnimatedIntroProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage progression
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 2200);

    // Progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 100);

    const autoFinish = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(autoFinish);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-[#FFFBF6]/90 to-[#F5F0E8]/90 backdrop-blur-2xl shadow-[0_24px_64px_rgba(34,40,43,0.12)] p-6 sm:p-10 text-center space-y-8">
      {/* Ambient background glow rings */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent-trust/15 blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>India Food Rescue Network</span>
        </div>
        <button
          onClick={onComplete}
          className="text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-black/5 transition-all"
        >
          <span>Skip to Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Animated Center Brand Symbol */}
      <div className="relative flex justify-center py-2">
        <div className="relative">
          {/* Pulsing halo */}
          <div className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-tr from-accent-primary/30 to-accent-trust/30 blur-lg animate-pulse" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-accent-primary via-[#D46B28] to-accent-trust text-white flex items-center justify-center shadow-xl shadow-accent-primary/25 transform transition-all duration-700 hover:scale-105">
            <span className="text-4xl sm:text-5xl select-none" role="img" aria-label="Warm Meal">🍲</span>
          </div>
        </div>
      </div>

      {/* Title & Tagline with smooth entrance */}
      <div className="space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight transition-all duration-700">
          FoodBridge <span className="text-accent-primary">India</span>
        </h1>
        <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
          Bridging genuine commercial kitchen surplus with verified hunger relief NGOs through safe shelf-life tracking and OTP-verified transit.
        </p>
      </div>

      {/* 3 Verified Ecosystem Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 max-w-2xl mx-auto text-left">
        {/* Step 1 */}
        <div className={"p-4 rounded-2xl border transition-all duration-500 " + (step >= 0 ? "bg-white/80 border-accent-primary/30 shadow-xs translate-y-0 opacity-100" : "opacity-40 translate-y-2")}>
          <div className="w-8 h-8 rounded-xl bg-accent-primary-subtle text-accent-primary flex items-center justify-center mb-2.5">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-accent-primary uppercase tracking-wide">1. Kitchen Surplus</div>
          <div className="font-semibold text-xs text-ink mt-0.5">FSSAI Certified</div>
          <p className="text-[11px] text-ink-muted mt-1 leading-snug">Hygienic surplus posted with safe consumption countdowns.</p>
        </div>

        {/* Step 2 */}
        <div className={"p-4 rounded-2xl border transition-all duration-500 " + (step >= 1 ? "bg-white/80 border-amber-300 shadow-xs translate-y-0 opacity-100" : "opacity-40 translate-y-2")}>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2.5">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">2. Swift Transit</div>
          <div className="font-semibold text-xs text-ink mt-0.5">RTO Compliant</div>
          <p className="text-[11px] text-ink-muted mt-1 leading-snug">Licensed drivers with thermal carriers & live GPS route guidance.</p>
        </div>

        {/* Step 3 */}
        <div className={"p-4 rounded-2xl border transition-all duration-500 " + (step >= 2 ? "bg-white/80 border-accent-trust/30 shadow-xs translate-y-0 opacity-100" : "opacity-40 translate-y-2")}>
          <div className="w-8 h-8 rounded-xl bg-accent-trust-subtle text-accent-trust flex items-center justify-center mb-2.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-accent-trust uppercase tracking-wide">3. Relief Delivery</div>
          <div className="font-semibold text-xs text-ink mt-0.5">NITI Darpan NGOs</div>
          <p className="text-[11px] text-ink-muted mt-1 leading-snug">OTP handoff ensures 100% wholesome meals reach beneficiaries.</p>
        </div>
      </div>

      {/* Progress & Enter Action */}
      <div className="pt-4 border-t border-stone-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
        <div className="w-full sm:w-1/2 space-y-1 text-left">
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>Loading authentication portal...</span>
            <span className="font-mono font-semibold">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-primary to-accent-trust transition-all duration-150 ease-out"
              style={{ width: progress + "%" }}
            />
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-2xl bg-ink hover:bg-black text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 group"
        >
          <span>Continue to Login / Register</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
