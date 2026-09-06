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
  Truck,
  PlusCircle,
  Inbox,
  BarChart3,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LogIn,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    FoodBridgeStore.init();
    setCurrentUser(FoodBridgeStore.getAuthUser());

    const handleUpdate = () => {
      setCurrentUser(FoodBridgeStore.getAuthUser());
    };
    window.addEventListener('foodbridge_state_change', handleUpdate);
    return () => window.removeEventListener('foodbridge_state_change', handleUpdate);
  }, []);

  const handleLogout = () => {
    FoodBridgeStore.logout();
    window.location.href = '/login';
  };

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

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {currentUser ? (
              <>
                <NotificationCenter />
                <RoleSwitcher />

                {/* Profile Link */}
                <Link
                  href="/profile"
                  className={`min-h-[44px] flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/80 backdrop-blur-md shadow-xs transition-all text-xs font-semibold ${
                    pathname === '/profile'
                      ? 'bg-ink text-white shadow-md'
                      : 'bg-white/70 hover:bg-white text-ink hover:shadow-sm'
                  }`}
                  title="My Profile & Compliance Info"
                >
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-accent-primary-subtle text-accent-primary flex items-center justify-center font-bold text-[11px]">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden md:inline max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="hidden xl:inline text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                    Profile
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-stone-500 hover:text-accent-alert hover:bg-white/70 transition-colors hidden sm:flex items-center justify-center"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-md shadow-accent-primary/20 flex items-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Join</span>
              </Link>
            )}

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
          <div className="text-xs font-semibold text-ink-light px-3 py-1 flex items-center justify-between">
            <span>Active view: {role}</span>
            {currentUser && (
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-accent-primary font-bold hover:underline"
              >
                View Profile →
              </Link>
            )}
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

          <div className="pt-2 border-t border-stone-200/60 mt-2 space-y-1">
            {currentUser ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-ink hover:bg-white/70"
                >
                  <UserIcon className="w-4 h-4 text-accent-primary" />
                  <span>My Profile & Indian Compliance Info</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="min-h-[44px] w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-accent-alert hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-accent-primary text-white text-center shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
