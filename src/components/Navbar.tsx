'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FoodBridgeStore } from '@/lib/store';
import { User } from '@/lib/types';
import RoleSwitcher from './RoleSwitcher';
import NotificationCenter from './NotificationCenter';
import {
  Utensils,
  Search,
  Building2,
  Shield,
  Truck,
  PlusCircle,
  Inbox,
  MapPin,
  BarChart3,
  Menu,
  X,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    FoodBridgeStore.init();
    setCurrentUser(FoodBridgeStore.getCurrentUser());

    const handleUpdate = () => {
      setCurrentUser(FoodBridgeStore.getCurrentUser());
    };
    window.addEventListener('foodbridge_state_change', handleUpdate);
    return () => window.removeEventListener('foodbridge_state_change', handleUpdate);
  }, []);

  const role = currentUser?.role || 'restaurant';

  const getNavLinks = () => {
    switch (role) {
      case 'restaurant':
        return [
          { href: '/restaurant', label: 'Overview', icon: Utensils },
          { href: '/restaurant/new-listing', label: 'Share surplus food', icon: PlusCircle, highlight: true },
          { href: '/restaurant/listings', label: 'My listings', icon: Inbox },
          { href: '/restaurant/requests', label: 'Pickup requests', icon: Building2 },
          { href: '/restaurant/transports', label: 'Active pickups', icon: Truck },
          { href: '/impact', label: 'Impact', icon: BarChart3 },
        ];
      case 'ngo':
        return [
          { href: '/ngo/discover', label: 'Find surplus food', icon: Search, highlight: true },
          { href: '/ngo/standing-needs', label: 'Share food need', icon: PlusCircle },
          { href: '/ngo/requests', label: 'My requests', icon: Inbox },
          { href: '/ngo/transports', label: 'Deliveries in transit', icon: Truck },
          { href: '/impact', label: 'Impact', icon: BarChart3 },
        ];
      case 'admin':
        return [
          { href: '/admin', label: 'Operations center', icon: Shield },
          { href: '/admin/live-map', label: 'City overview map', icon: MapPin, highlight: true },
          { href: '/admin/verifications', label: 'Partner checks', icon: FileCheck2 },
          { href: '/admin/issues', label: 'Flagged reports', icon: AlertCircle },
          { href: '/impact', label: 'Impact numbers', icon: BarChart3 },
        ];
      case 'driver':
        return [
          { href: '/driver', label: 'Driver cockpit', icon: Truck, highlight: true },
          { href: '/impact', label: 'Community impact', icon: BarChart3 },
        ];
      default:
        return [
          { href: '/ngo/discover', label: 'Find food', icon: Search },
          { href: '/impact', label: 'Impact', icon: BarChart3 },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-[20px] backdrop-saturate-[140%] border-b border-white/80 shadow-[0_4px_24px_rgba(34,40,43,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-primary-hover text-white flex items-center justify-center shadow-md shadow-accent-primary/20 transition-transform group-hover:scale-105">
                <span className="text-xl" role="img" aria-label="Bowl of food">🍲</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xl tracking-tight text-ink">FoodBridge</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-trust/10 text-accent-trust border border-accent-trust/20">
                    Live
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted leading-tight">Fresh surplus to verified NGOs</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5" aria-label="Primary Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-ink text-white shadow-sm'
                        : link.highlight
                        ? 'bg-accent-primary text-white hover:bg-accent-primary-hover shadow-sm'
                        : 'text-ink-muted hover:text-ink hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Controls: Notification + Role Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <NotificationCenter />
            <RoleSwitcher />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-ink-muted hover:text-ink hover:bg-white/60 lg:hidden"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/70 bg-white/90 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1.5 shadow-xl animate-in fade-in duration-150">
          <div className="text-xs font-semibold text-ink-light px-3 py-1">
            Active view: {role}
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-ink text-white'
                    : link.highlight
                    ? 'bg-accent-primary text-white font-semibold shadow-sm'
                    : 'text-ink hover:bg-white/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
