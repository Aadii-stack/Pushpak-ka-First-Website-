'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FoodBridgeStore } from '@/lib/store';
import { User, RestaurantProfile, NGOProfile, DriverProfile } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import {
  Utensils,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit3,
  LogOut,
  Sparkles,
  Copy,
  Check,
  Heart,
  ArrowRight,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [ngo, setNgo] = useState<NGOProfile | null>(null);
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editExtra1, setEditExtra1] = useState('');
  const [editExtra2, setEditExtra2] = useState('');

  const loadData = () => {
    FoodBridgeStore.init();
    const currentUser = FoodBridgeStore.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      if (currentUser.role === 'restaurant') {
        const rest = FoodBridgeStore.getRestaurantByUserId(currentUser.id) || FoodBridgeStore.getRestaurants()[0];
        setRestaurant(rest || null);
        if (rest) {
          setEditName(currentUser.name);
          setEditPhone(currentUser.phone || rest.phone);
          setEditRegNo(rest.fssai_license);
          setEditAddress(rest.address);
          setEditCity(rest.city || 'Bengaluru');
          setEditPincode(rest.pincode || '560001');
          setEditExtra1(rest.gstin || '');
          setEditExtra2(rest.fostac_supervisor_name || '');
        }
      } else if (currentUser.role === 'ngo') {
        const ngoData = FoodBridgeStore.getNGOByUserId(currentUser.id) || FoodBridgeStore.getNGOs()[0];
        setNgo(ngoData || null);
        if (ngoData) {
          setEditName(currentUser.name);
          setEditPhone(currentUser.phone || ngoData.phone);
          setEditRegNo(ngoData.darpan_id || ngoData.registration_no);
          setEditAddress(ngoData.address);
          setEditCity(ngoData.city || 'Bengaluru');
          setEditPincode(ngoData.pincode || '560025');
          setEditExtra1(ngoData.section_12a_80g || '');
          setEditExtra2(ngoData.storage_capacity || '');
        }
      } else if (currentUser.role === 'driver') {
        const driverData = FoodBridgeStore.getDriverByUserId(currentUser.id) || FoodBridgeStore.getDrivers()[0];
        setDriver(driverData || null);
        if (driverData) {
          setEditName(driverData.full_legal_name || currentUser.name);
          setEditPhone(driverData.phone || currentUser.phone);
          setEditRegNo(driverData.dl_number);
          setEditAddress(driverData.vehicle_number);
          setEditCity(driverData.service_city || 'Bengaluru');
          setEditPincode(driverData.puc_number || '');
          setEditExtra1(driverData.vehicle_type || '');
          setEditExtra2(driverData.insurance_policy_no || '');
        }
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    FoodBridgeStore.logout();
    router.push('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (user.role === 'restaurant' && restaurant) {
        FoodBridgeStore.updateCurrentUser(
          { name: editName, phone: editPhone },
          {
            fssai_license: editRegNo,
            address: editAddress,
            city: editCity,
            pincode: editPincode,
            gstin: editExtra1,
            fostac_supervisor_name: editExtra2,
          }
        );
      } else if (user.role === 'ngo' && ngo) {
        FoodBridgeStore.updateCurrentUser(
          { name: editName, phone: editPhone },
          {
            darpan_id: editRegNo,
            address: editAddress,
            city: editCity,
            pincode: editPincode,
            section_12a_80g: editExtra1,
            storage_capacity: editExtra2,
          }
        );
      } else if (user.role === 'driver' && driver) {
        FoodBridgeStore.updateCurrentUser(
          { name: editName, phone: editPhone },
          {
            full_legal_name: editName,
            phone: editPhone,
            dl_number: editRegNo,
            vehicle_number: editAddress,
            service_city: editCity,
            puc_number: editPincode,
            vehicle_type: editExtra1,
            insurance_policy_no: editExtra2,
          }
        );
      }

      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        setIsEditModalOpen(false);
      }, 700);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin mx-auto" />
        <p className="text-xs text-ink-muted">Loading verified partner profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-ink">No active session found</h2>
        <p className="text-xs text-ink-muted">Please sign in to view your verified profile.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const isRestaurant = user.role === 'restaurant';
  const isNGO = user.role === 'ngo';
  const isDriver = user.role === 'driver';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Link href="/" className="hover:text-ink">FoodBridge</Link>
            <span>/</span>
            <span className="text-ink font-medium">Partner Profile & Compliance</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
            Official Partner Profile
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 shadow-xs text-xs font-semibold text-ink flex items-center gap-2 transition-all"
          >
            <Edit3 className="w-4 h-4 text-accent-primary" />
            <span>Edit Information</span>
          </button>

          <button
            onClick={handleLogout}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100/70 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Overview Card */}
      <GlassPanel variant="prominent" className="p-6 sm:p-8 border border-white/90 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Core Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-accent-primary text-white font-serif font-bold text-2xl flex items-center justify-center shadow-md">
                  {user.name.charAt(0)}
                </div>
              )}
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
                title="Verified Account"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-ink">{user.name}</h2>
                
                {/* Government Compliance Badge */}
                {isRestaurant && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent-primary-subtle text-accent-primary border border-accent-primary/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified Kitchen
                  </span>
                )}
                {isNGO && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent-trust-subtle text-accent-trust border border-accent-trust/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> NITI Darpan NGO
                  </span>
                )}
                {isDriver && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> RTO Compliant Driver
                  </span>
                )}
              </div>

              <p className="text-xs text-ink-muted">
                {isRestaurant && (restaurant?.business_name || 'Commercial Kitchen Partner')}
                {isNGO && (ngo?.org_name || 'Registered Hunger Relief Foundation')}
                {isDriver && (driver?.vehicle_type || 'Field Transit Partner')}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  {user.phone || '+91 98765 43210'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                  {user.auth_provider === 'google' ? 'Google Authenticated' : 'Email Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick CTA to Role Workspace */}
          <div>
            {isRestaurant && (
              <Link
                href="/restaurant"
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-semibold shadow-md shadow-accent-primary/20 transition-all flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Go to Kitchen Overview →</span>
              </Link>
            )}
            {isNGO && (
              <Link
                href="/ngo/discover"
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-accent-trust hover:bg-accent-trust-hover text-white text-xs font-semibold shadow-md shadow-accent-trust/20 transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Go to Surplus Food Map →</span>
              </Link>
            )}
            {isDriver && (
              <Link
                href="/driver"
                className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-md shadow-amber-800/20 transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Open Driver Cockpit →</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-stone-200/50">
          <div className="space-y-0.5">
            <span className="text-[11px] text-ink-muted">Verification Status</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent-trust">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Genuine Partner</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-ink-muted">Jurisdiction & City</span>
            <div className="text-xs font-bold text-ink flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent-primary" />
              <span>{restaurant?.city || ngo?.city || driver?.service_city || 'Bengaluru'}, India</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-ink-muted">Regulatory Standard</span>
            <div className="text-xs font-bold text-ink">
              {isRestaurant && 'FSSAI Act 2006'}
              {isNGO && 'NITI Aayog & 80G'}
              {isDriver && 'Motor Vehicles Act'}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-ink-muted">Impact Footprint</span>
            <div className="text-xs font-bold text-accent-trust">
              {isRestaurant && `${(restaurant?.total_meals_donated || 3450).toLocaleString()} meals donated`}
              {isNGO && `${(ngo?.total_meals_received || 9400).toLocaleString()} meals distributed`}
              {isDriver && `${driver?.total_pickups_completed || 142} safe pickups completed`}
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* INDIAN REGULATORY COMPLIANCE DETAILS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
              <FileCheck2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink">
                {isRestaurant && 'Indian Food Safety & Commercial Kitchen Records'}
                {isNGO && 'Indian Voluntary Sector & NITI Aayog Verification Details'}
                {isDriver && 'Indian Motor Vehicles & Transport Verification Details'}
              </h3>
              <p className="text-xs text-ink-muted">
                Official regulatory records captured during onboarding and verified under Indian statutory requirements.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> Verified Valid Record
          </span>
        </div>

        {/* RESTAURANT PROFILE DETAILS */}
        {isRestaurant && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FSSAI Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-primary uppercase tracking-wide">
                  FSSAI Food License
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Active & Verified
                </span>
              </div>

              <div>
                <div className="text-[11px] text-ink-muted">14-Digit License Number</div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-mono font-bold text-base text-ink tracking-wider">
                    {restaurant?.fssai_license || '11223344556677'}
                  </span>
                  <button
                    onClick={() => handleCopy(restaurant?.fssai_license || '11223344556677', 'fssai')}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-ink text-xs transition-colors flex items-center gap-1"
                    title="Copy License"
                  >
                    {copiedField === 'fssai' ? <Check className="w-3.5 h-3.5 text-accent-trust" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedField === 'fssai' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-ink-muted">
                <span>Valid Until: <strong className="text-ink">{restaurant?.fssai_expiry || '31 Dec 2028'}</strong></span>
                <span>Section 31 FSS Act 2006</span>
              </div>
            </GlassPanel>

            {/* Tax & Entity Identity Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Tax & Commercial Identity
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  GST Compliant
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-ink-muted">GSTIN (15 characters)</div>
                  <div className="font-mono font-bold text-xs text-ink mt-0.5">
                    {restaurant?.gstin || '29AAACG1234F1Z5'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-ink-muted">Business PAN</div>
                  <div className="font-mono font-bold text-xs text-ink mt-0.5">
                    {restaurant?.pan_number || 'AAACG1234F'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-ink-muted">
                <span>Health Trade License: <strong className="text-ink">{restaurant?.trade_license_no || 'BBMP/HL/2023/8891'}</strong></span>
              </div>
            </GlassPanel>

            {/* Kitchen Operations Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block">
                Kitchen Operations & Safety Supervisor
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Establishment Type:</span>
                  <strong className="text-ink">{restaurant?.establishment_type || 'Dine-in Restaurant & Banquets'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Cuisine Classification:</span>
                  <strong className="text-ink">{restaurant?.cuisine_type || 'North & South Indian, Multi-Cuisine'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">FoSTaC Food Supervisor:</span>
                  <strong className="text-accent-primary">{restaurant?.fostac_supervisor_name || 'Rajesh Sharma (Cert #FST-KA-88902)'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Logistics Capability:</span>
                  <strong className="text-ink capitalize">{(restaurant?.logistics_capability || 'staff_handoff_cold_storage').replace(/_/g, ' ')}</strong>
                </div>
              </div>
            </GlassPanel>

            {/* Physical Premises & Declaration Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block">
                Commercial Kitchen Premises
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="text-ink-muted">Registered Address:</div>
                <div className="font-semibold text-ink leading-relaxed">
                  {restaurant?.address || '42 Brigade Road, Ashok Nagar, Bengaluru 560025, Karnataka'}
                </div>
                <div className="text-[11px] text-ink-muted">
                  Postal Pincode: <strong className="text-ink">{restaurant?.pincode || '560025'}</strong> • City: <strong className="text-ink">{restaurant?.city || 'Bengaluru'}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] leading-tight font-medium">
                  Compliant with Food Safety & Standards (Recovery & Distribution of Surplus Food) Regulations, 2019.
                </span>
              </div>
            </GlassPanel>
          </div>
        )}

        {/* NGO PROFILE DETAILS */}
        {isNGO && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NGO Darpan Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-trust uppercase tracking-wide">
                  NITI Aayog NGO Darpan
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Government Registered
                </span>
              </div>

              <div>
                <div className="text-[11px] text-ink-muted">Unique Darpan Identification Number</div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-mono font-bold text-base text-ink tracking-wider">
                    {ngo?.darpan_id || 'KA/2021/0089234'}
                  </span>
                  <button
                    onClick={() => handleCopy(ngo?.darpan_id || 'KA/2021/0089234', 'darpan')}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-ink text-xs transition-colors flex items-center gap-1"
                    title="Copy Darpan ID"
                  >
                    {copiedField === 'darpan' ? <Check className="w-3.5 h-3.5 text-accent-trust" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedField === 'darpan' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-ink-muted">
                <span>Registration No: <strong className="text-ink">{ngo?.registration_no || 'IV-1082/2018'}</strong></span>
                <span>{ngo?.registration_type || 'Public Charitable Trust'}</span>
              </div>
            </GlassPanel>

            {/* 12A & 80G Tax Exemption Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Income Tax Exemption & PAN
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  80G Certified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-ink-muted">12A & 80G Order Number</div>
                  <div className="font-mono font-bold text-xs text-ink mt-0.5 truncate">
                    {ngo?.section_12a_80g || '12A/80G/CIT(E)/BLR/2018-19/T-44'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-ink-muted">Organization PAN</div>
                  <div className="font-mono font-bold text-xs text-ink mt-0.5">
                    {ngo?.pan_number || 'AABTA1234F'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-ink-muted">
                <span>FCRA Status: <strong className="text-ink">{ngo?.fcra_status || 'Domestic Relief Only'}</strong></span>
                <span>Managing Trustee: <strong className="text-ink">{ngo?.authorized_signatory || user.name}</strong></span>
              </div>
            </GlassPanel>

            {/* Relief Capacity & Cold Storage */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block">
                Relief Capacity & Cold Storage
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Daily Beneficiary Capacity:</span>
                  <strong className="text-accent-trust font-bold">{ngo?.capacity_per_day || 800} wholesome meals / day</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Storage & Chillers:</span>
                  <strong className="text-ink">{ngo?.storage_capacity || '2 walk-in chillers, 4 insulated containers'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Own Transport Fleet:</span>
                  <strong className="text-ink">{ngo?.has_own_transport ? 'Yes (2 Electric Vans)' : 'Relies on Platform Drivers'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Partner Restaurants:</span>
                  <strong className="text-ink">{ngo?.partner_restaurants_count || 14} local kitchens connected</strong>
                </div>
              </div>
            </GlassPanel>

            {/* Center Location & Hygiene Pledge */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block">
                Relief Distribution Center
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="text-ink-muted">Operational Center Address:</div>
                <div className="font-semibold text-ink leading-relaxed">
                  {ngo?.address || '14 Richmond Road, Shanthala Nagar, Bengaluru 560025, Karnataka'}
                </div>
                <div className="text-[11px] text-ink-muted">
                  Service Area: {ngo?.service_area || 'Central & East Bengaluru Shelters'}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] leading-tight font-medium">
                  Signed undertaking to inspect and distribute meals directly to end beneficiaries without resale.
                </span>
              </div>
            </GlassPanel>
          </div>
        )}

        {/* DRIVER PROFILE DETAILS */}
        {isDriver && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Driving Licence Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Indian Driving Licence (DL)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  RTO Validated
                </span>
              </div>

              <div>
                <div className="text-[11px] text-ink-muted">Driving Licence Number (Motor Vehicles Act)</div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-mono font-bold text-base text-ink tracking-wider">
                    {driver?.dl_number || 'KA01 20210087654'}
                  </span>
                  <button
                    onClick={() => handleCopy(driver?.dl_number || 'KA01 20210087654', 'dl')}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-ink text-xs transition-colors flex items-center gap-1"
                    title="Copy DL Number"
                  >
                    {copiedField === 'dl' ? <Check className="w-3.5 h-3.5 text-accent-trust" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedField === 'dl' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-ink-muted">
                <span>DL Expiry: <strong className="text-ink">{driver?.dl_expiry || '14 Aug 2035'}</strong></span>
                <span>Legal Name: <strong className="text-ink">{driver?.full_legal_name || user.name}</strong></span>
              </div>
            </GlassPanel>

            {/* Vehicle RC & Insurance Card */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Vehicle Registration (RC) & Insurance
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  Commercial/Private RC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-ink-muted">Registration No. (RC)</div>
                  <div className="font-mono font-bold text-xs text-ink mt-0.5">
                    {driver?.vehicle_number || 'KA-05-MB-4421'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-ink-muted">Vehicle Category</div>
                  <div className="font-semibold text-xs text-ink mt-0.5 truncate">
                    {driver?.vehicle_type || 'Cargo Van (Maruti Eeco Cargo)'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs text-ink-muted">
                <span>Insurance: <strong className="text-ink">{driver?.insurance_policy_no || 'NIC-MOTOR-2024-883719'}</strong></span>
                <span>PUC: <strong className="text-ink">{driver?.puc_number || 'PUC/KA05/2024/9912'}</strong></span>
              </div>
            </GlassPanel>

            {/* Safe Food Transit & Carrier Box */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block">
                Food Safety Carrier & Emergency Contact
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Insulated Food Carrier Box:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-accent-trust">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 65L Thermal Food Grade
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Emergency Contact Person:</span>
                  <strong className="text-ink">{driver?.emergency_contact_name || 'Suman Singh'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Emergency Phone Number:</span>
                  <strong className="text-ink">{driver?.emergency_contact_phone || '+91 97777 11223'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Aadhaar (Masked):</span>
                  <strong className="font-mono text-ink">{driver?.aadhaar_last4 || 'XXXX-XXXX-9128'}</strong>
                </div>
              </div>
            </GlassPanel>

            {/* Service Coverage & OTP Transit Pledge */}
            <GlassPanel variant="standard" className="p-5 space-y-3 border border-white/80">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block">
                Transit Coverage & Security Pledge
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="text-ink-muted">Operational Service City:</div>
                <div className="font-semibold text-ink">
                  {driver?.service_city || 'Bengaluru Metro Area'}
                </div>
                <div className="text-[11px] text-ink-muted">
                  Service Pincodes: {Array.isArray(driver?.service_pincodes) ? driver.service_pincodes.join(', ') : '560001, 560025, 560027, 560034, 560095'}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/50 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] leading-tight font-medium">
                  Pledged to exchange 4-digit security OTP handoffs at restaurant pickup and delivery locations.
                </span>
              </div>
            </GlassPanel>
          </div>
        )}
      </section>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left animate-in zoom-in-95 duration-150">
            <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">Edit Compliance Information</h3>
                <p className="text-xs text-ink-muted">Updates are immediately persisted to local records</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {editSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile details updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">
                    {isRestaurant && 'FSSAI License No.'}
                    {isNGO && 'NITI Darpan ID'}
                    {isDriver && 'Driving Licence (DL)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editRegNo}
                    onChange={(e) => setEditRegNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-mono text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">
                    {isRestaurant && 'GSTIN Number'}
                    {isNGO && '12A/80G Certificate No.'}
                    {isDriver && 'Vehicle Type'}
                  </label>
                  <input
                    type="text"
                    value={editExtra1}
                    onChange={(e) => setEditExtra1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">
                    {isDriver ? 'PUC Certificate No.' : 'Pincode'}
                  </label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-ink-muted block mb-1">
                    {isDriver ? 'Vehicle RC Number' : 'Registered Street Address'}
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-ink-muted block mb-1">
                    {isRestaurant && 'FoSTaC Supervisor Name'}
                    {isNGO && 'Storage / Cold Chain Capacity'}
                    {isDriver && 'Insurance Policy Number'}
                  </label>
                  <input
                    type="text"
                    value={editExtra2}
                    onChange={(e) => setEditExtra2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-ink hover:bg-black text-white text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
