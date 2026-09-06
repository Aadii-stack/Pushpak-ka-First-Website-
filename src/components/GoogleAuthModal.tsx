'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { Utensils, Building2, Truck, X, ArrowRight } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (googleUser: { name: string; email: string; avatar_url: string }, role: UserRole) => void;
  defaultRole?: UserRole;
}

const PRESET_ACCOUNTS = [
  {
    name: 'Pushpak Sharma',
    email: 'pushpak.dev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    subtitle: 'Google Account',
  },
  {
    name: 'Chef Rajesh Kumar',
    email: 'chef.rajesh@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
    subtitle: 'Green Garden Bistro & Suites',
  },
  {
    name: 'Anita Deshmukh',
    email: 'anita.relief@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    subtitle: 'Annam Relief Trust Bangalore',
  },
];

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = 'restaurant',
}: GoogleAuthModalProps) {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [chosenRole, setChosenRole] = useState<UserRole>(defaultRole);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = (account: typeof PRESET_ACCOUNTS[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      onSuccess(
        {
          name: account.name,
          email: account.email,
          avatar_url: account.avatar,
        },
        chosenRole
      );
      setIsLoading(false);
      onClose();
    }, 600);
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;
    setIsLoading(true);
    setTimeout(() => {
      onSuccess(
        {
          name: customName,
          email: customEmail,
          avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(customName),
        },
        chosenRole
      );
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left animate-in zoom-in-95 duration-200">
        {/* Top Google Branding Header */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Official Google 'G' SVG Logo */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-semibold text-sm text-stone-700">Sign in with Google</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-serif font-bold text-ink">Choose an account</h2>
            <p className="text-xs text-ink-muted mt-1">
              to continue to <strong className="text-ink">FoodBridge India</strong>
            </p>
          </div>

          {/* Account Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted block">Signing in as partner type:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChosenRole('restaurant')}
                className={"p-2.5 rounded-xl border text-center transition-all " + (
                  chosenRole === 'restaurant'
                    ? 'border-accent-primary bg-accent-primary-subtle text-accent-primary font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                )}
              >
                <Utensils className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block leading-tight">Restaurant</span>
              </button>

              <button
                type="button"
                onClick={() => setChosenRole('ngo')}
                className={"p-2.5 rounded-xl border text-center transition-all " + (
                  chosenRole === 'ngo'
                    ? 'border-accent-trust bg-accent-trust-subtle text-accent-trust font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                )}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block leading-tight">Relief NGO</span>
              </button>

              <button
                type="button"
                onClick={() => setChosenRole('driver')}
                className={"p-2.5 rounded-xl border text-center transition-all " + (
                  chosenRole === 'driver'
                    ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                )}
              >
                <Truck className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block leading-tight">Volunteer</span>
              </button>
            </div>
          </div>

          {/* Preset Accounts List */}
          {!isCustom ? (
            <div className="space-y-2">
              {PRESET_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  disabled={isLoading}
                  onClick={() => handleSignIn(acc)}
                  className="w-full p-3 rounded-2xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50/70 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-ink group-hover:text-accent-primary transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-ink-muted">{acc.email}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-ink transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className="w-full py-2.5 text-xs font-semibold text-accent-primary hover:underline text-center"
              >
                + Use another Google account
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSignIn} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Iyer"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted block mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.iyer@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50"
                >
                  Back to accounts
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 text-xs font-semibold bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl shadow-xs transition-colors"
                >
                  {isLoading ? 'Connecting...' : 'Sign In with Google'}
                </button>
              </div>
            </form>
          )}

          {/* Privacy Disclaimer */}
          <div className="pt-3 border-t border-stone-100 text-[11px] text-ink-light leading-relaxed">
            To continue, Google will securely share your name, email address, and profile picture with FoodBridge according to Indian data protection and platform terms.
          </div>
        </div>
      </div>
    </div>
  );
}
