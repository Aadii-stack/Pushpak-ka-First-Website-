'use client';

import React, { useState, useEffect } from 'react';
import { FoodBridgeStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';
import { Utensils, Building2, Truck, ChevronDown, Check } from 'lucide-react';

interface RoleOption {
  role: UserRole;
  label: string;
  sublabel: string;
  name: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'restaurant',
    label: 'Restaurant view',
    sublabel: 'Green Garden Bistro',
    name: 'Chef Rajesh Sharma',
    icon: Utensils,
    badgeBg: 'bg-accent-primary-subtle',
    badgeText: 'text-accent-primary',
  },
  {
    role: 'ngo',
    label: 'NGO coordinator view',
    sublabel: 'Annam Relief Foundation',
    name: 'Anita Deshmukh',
    icon: Building2,
    badgeBg: 'bg-accent-trust-subtle',
    badgeText: 'text-accent-trust',
  },
  {
    role: 'driver',
    label: 'Volunteer driver view',
    sublabel: 'Field transport unit',
    name: 'Vikram Singh',
    icon: Truck,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
  },
];

export default function RoleSwitcher() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    FoodBridgeStore.init();
    setCurrentUser(FoodBridgeStore.getCurrentUser());

    const handleUpdate = () => {
      setCurrentUser(FoodBridgeStore.getCurrentUser());
    };
    window.addEventListener('foodbridge_state_change', handleUpdate);
    return () => window.removeEventListener('foodbridge_state_change', handleUpdate);
  }, []);

  const handleSelectRole = (role: UserRole) => {
    const user = FoodBridgeStore.switchRole(role);
    setCurrentUser(user);
    setIsOpen(false);

    // Navigate to role homepage
    if (role === 'restaurant') window.location.href = '/restaurant';
    else if (role === 'ngo') window.location.href = '/ngo/discover';
    else if (role === 'driver') window.location.href = '/driver';
  };

  const currentOption = ROLE_OPTIONS.find((r) => r.role === currentUser?.role) || ROLE_OPTIONS[0];
  const Icon = currentOption.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/80 bg-white/70 hover:bg-white/90 backdrop-blur-md shadow-[0_2px_12px_rgba(34,40,43,0.06)] transition-all text-xs font-medium text-ink"
        title="Switch demo viewpoint"
        aria-expanded={isOpen}
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentOption.badgeBg} ${currentOption.badgeText}`}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="text-left hidden sm:block">
          <div className="font-semibold text-ink leading-tight">{currentOption.label}</div>
          <div className="text-[11px] text-ink-muted leading-none">{currentUser?.name || currentOption.name}</div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(34,40,43,0.14)] border border-white p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 text-xs font-semibold text-ink-muted border-b border-stone-100 mb-1.5">
              Switch perspective
            </div>
            <div className="space-y-1">
              {ROLE_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = currentUser?.role === opt.role;
                return (
                  <button
                    key={opt.role}
                    onClick={() => handleSelectRole(opt.role)}
                    className={`min-h-[44px] w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected ? 'bg-white text-ink font-semibold shadow-sm border border-stone-200/70' : 'hover:bg-white/60 text-ink-muted hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${opt.badgeBg} ${opt.badgeText}`}>
                        <OptIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink">{opt.label}</div>
                        <div className="text-[11px] text-ink-muted">{opt.sublabel}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-accent-trust" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between px-2 text-xs">
              <span className="text-[11px] text-ink-muted">Quick preview switcher</span>
              <button
                onClick={() => {
                  FoodBridgeStore.resetToSeed();
                  window.location.reload();
                }}
                className="text-[11px] text-accent-alert hover:underline font-semibold"
              >
                Reset demo data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
