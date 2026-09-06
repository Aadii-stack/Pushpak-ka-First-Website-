'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { UserRole, RestaurantProfile, NGOProfile, DriverProfile } from '@/lib/types';
import AnimatedIntro from '@/components/AnimatedIntro';
import GoogleAuthModal from '@/components/GoogleAuthModal';
import GlassPanel from '@/components/GlassPanel';
import {
  Utensils,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  UserPlus,
  ArrowRight,
  Info,
  Sparkles,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('restaurant');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Restaurant Indian Details
  const [restBusinessName, setRestBusinessName] = useState('');
  const [restFssai, setRestFssai] = useState('');
  const [restFssaiExpiry, setRestFssaiExpiry] = useState('2028-12-31');
  const [restGstin, setRestGstin] = useState('');
  const [restPan, setRestPan] = useState('');
  const [restTradeLicense, setRestTradeLicense] = useState('');
  const [restFostacSupervisor, setRestFostacSupervisor] = useState('');
  const [restEstablishmentType, setRestEstablishmentType] = useState('Dine-in Restaurant');
  const [restCuisine, setRestCuisine] = useState('North & South Indian, Multi-Cuisine');
  const [restCity, setRestCity] = useState('Bengaluru');
  const [restPincode, setRestPincode] = useState('560001');
  const [restAddress, setRestAddress] = useState('');
  const [restFssaiPledge, setRestFssaiPledge] = useState(true);

  // NGO Indian Details
  const [ngoOrgName, setNgoOrgName] = useState('');
  const [ngoDarpanId, setNgoDarpanId] = useState('');
  const [ngoRegType, setNgoRegType] = useState('Public Charitable Trust (Indian Trusts Act 1882)');
  const [ngoRegNo, setNgoRegNo] = useState('');
  const [ngoPan, setNgoPan] = useState('');
  const [ngo12a80g, setNgo12a80g] = useState('');
  const [ngoFcraStatus, setNgoFcraStatus] = useState('Domestic Relief Only');
  const [ngoSignatory, setNgoSignatory] = useState('');
  const [ngoCapacity, setNgoCapacity] = useState('500');
  const [ngoStorage, setNgoStorage] = useState('Walk-in chiller and insulated thermal containers');
  const [ngoHasTransport, setNgoHasTransport] = useState(true);
  const [ngoCity, setNgoCity] = useState('Bengaluru');
  const [ngoPincode, setNgoPincode] = useState('560025');
  const [ngoAddress, setNgoAddress] = useState('');
  const [ngoHygienePledge, setNgoHygienePledge] = useState(true);

  // Driver Indian Details
  const [drvLegalName, setDrvLegalName] = useState('');
  const [drvDlNumber, setDrvDlNumber] = useState('');
  const [drvDlExpiry, setDrvDlExpiry] = useState('2035-10-15');
  const [drvAadhaar, setDrvAadhaar] = useState('');
  const [drvVehicleNo, setDrvVehicleNo] = useState('');
  const [drvVehicleType, setDrvVehicleType] = useState('Cargo Van (Maruti Eeco Cargo)');
  const [drvPucNo, setDrvPucNo] = useState('');
  const [drvInsuranceNo, setDrvInsuranceNo] = useState('');
  const [drvHasInsulatedBox, setDrvHasInsulatedBox] = useState(true);
  const [drvEmergencyName, setDrvEmergencyName] = useState('');
  const [drvEmergencyPhone, setDrvEmergencyPhone] = useState('');
  const [drvCity, setDrvCity] = useState('Bengaluru');
  const [drvPincodes, setDrvPincodes] = useState('560001, 560025, 560034');
  const [drvPledge, setDrvPledge] = useState(true);

  useEffect(() => {
    FoodBridgeStore.init();
    const seen = sessionStorage.getItem('foodbridge_intro_seen');
    if (seen === 'true') {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('foodbridge_intro_seen', 'true');
  };

  // Quick 1-Click Demo Login
  const handleQuickLogin = (role: UserRole) => {
    const user = FoodBridgeStore.switchRole(role);
    setSuccessMsg(`Logged in successfully as ${user.name} (${role.toUpperCase()})`);
    setTimeout(() => {
      router.push('/profile');
    }, 300);
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = (
    googleUser: { name: string; email: string; avatar_url: string },
    role: UserRole
  ) => {
    const user = FoodBridgeStore.loginWithGoogle(googleUser, role);
    setSuccessMsg(`Welcome, ${user.name}! Signed in via Google.`);
    setTimeout(() => {
      router.push('/profile');
    }, 300);
  };

  // Handle Standard Sign In
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = FoodBridgeStore.login(email, password, selectedRole);
      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name}! Redirecting to profile...`);
        setTimeout(() => {
          router.push('/profile');
        }, 400);
      } else {
        setErrorMsg('User not found. Try Quick Login or Register below.');
      }
      setIsSubmitting(false);
    }, 300);
  };

  // Handle Full Registration with Indian Legal Compliance
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone) {
      setErrorMsg('Please fill in all core personal and contact fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedRole === 'restaurant') {
        if (!restBusinessName || !restFssai) {
          setErrorMsg('FSSAI 14-digit License & Restaurant Business Name are legally required in India.');
          setIsSubmitting(false);
          return;
        }

        const registeredUser = FoodBridgeStore.registerUser({
          role: 'restaurant',
          name,
          email,
          phone,
          password,
          restaurantDetails: {
            business_name: restBusinessName,
            fssai_license: restFssai,
            fssai_expiry: restFssaiExpiry,
            gstin: restGstin || '29AAAAA0000A1Z5',
            pan_number: restPan || 'AAAAA0000A',
            trade_license_no: restTradeLicense || 'BBMP/HL/2024/0012',
            fostac_supervisor_name: restFostacSupervisor || name,
            establishment_type: restEstablishmentType,
            cuisine_type: restCuisine,
            city: restCity,
            pincode: restPincode,
            address: restAddress || `${restCity} Center, Karnataka`,
            fssai_surplus_declaration: restFssaiPledge,
          },
        });

        setSuccessMsg(`Registration successful! Verified FSSAI profile created for ${registeredUser.name}.`);
      } else if (selectedRole === 'ngo') {
        if (!ngoOrgName || !ngoDarpanId) {
          setErrorMsg('NGO Darpan ID and Registered Organization Name are mandatory under Indian verification norms.');
          setIsSubmitting(false);
          return;
        }

        const registeredUser = FoodBridgeStore.registerUser({
          role: 'ngo',
          name,
          email,
          phone,
          password,
          ngoDetails: {
            org_name: ngoOrgName,
            darpan_id: ngoDarpanId,
            registration_type: ngoRegType,
            registration_no: ngoRegNo || 'REG-NGO-2024-KA-1100',
            pan_number: ngoPan || 'AABTP0001K',
            section_12a_80g: ngo12a80g || '12A/80G/CIT(E)/BLR/2024-25/001',
            fcra_status: ngoFcraStatus,
            authorized_signatory: ngoSignatory || name,
            capacity_per_day: parseInt(ngoCapacity, 10) || 500,
            storage_capacity: ngoStorage,
            has_own_transport: ngoHasTransport,
            city: ngoCity,
            pincode: ngoPincode,
            address: ngoAddress || `${ngoCity} Relief Center, Karnataka`,
            hygiene_undertaking: ngoHygienePledge,
          },
        });

        setSuccessMsg(`Registration successful! Verified Darpan NGO profile created for ${registeredUser.name}.`);
      } else if (selectedRole === 'driver') {
        if (!drvLegalName || !drvDlNumber || !drvVehicleNo) {
          setErrorMsg('Driving Licence Number, Legal Name, and Vehicle Registration (RC) are mandatory under Motor Vehicles Act.');
          setIsSubmitting(false);
          return;
        }

        const registeredUser = FoodBridgeStore.registerUser({
          role: 'driver',
          name,
          email,
          phone,
          password,
          driverDetails: {
            full_legal_name: drvLegalName,
            dl_number: drvDlNumber,
            dl_expiry: drvDlExpiry,
            aadhaar_last4: drvAadhaar || 'XXXX-XXXX-1234',
            vehicle_number: drvVehicleNo,
            vehicle_type: drvVehicleType,
            puc_number: drvPucNo || 'PUC/KA01/2024/0091',
            insurance_policy_no: drvInsuranceNo || 'POL-MOTOR-2024-9988',
            has_insulated_carrier: drvHasInsulatedBox,
            emergency_contact_name: drvEmergencyName || 'Next of Kin',
            emergency_contact_phone: drvEmergencyPhone || phone,
            service_city: drvCity,
            service_pincodes: drvPincodes.split(',').map((p) => p.trim()),
            volunteer_pledge: drvPledge,
          },
        });

        setSuccessMsg(`Registration successful! Verified Driver profile created for ${registeredUser.name}.`);
      }

      setTimeout(() => {
        router.push('/profile');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Animated Intro at Start */}
      {showIntro ? (
        <AnimatedIntro onComplete={handleIntroComplete} />
      ) : (
        <div className="space-y-6">
          {/* Top Info Bar with Replay Intro trigger */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-trust animate-pulse" />
              <span className="text-xs font-semibold text-ink-muted">FoodBridge Authentication Portal</span>
            </div>
            <button
              onClick={() => setShowIntro(true)}
              className="text-xs font-semibold text-accent-primary hover:underline flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Replay Animated Intro</span>
            </button>
          </div>

          {/* Quick 1-Click Demo Logins Banner */}
          <GlassPanel variant="standard" className="p-5 border border-white/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
                  Instant Demo Access (1-Click Login)
                </span>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Quickly test any verified perspective or register your own genuine account below:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('restaurant')}
                className="p-3 rounded-2xl bg-accent-primary-subtle/70 hover:bg-accent-primary-subtle border border-accent-primary/20 text-left flex items-center gap-3 transition-all hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-accent-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink group-hover:text-accent-primary transition-colors">
                    Chef Rajesh Sharma
                  </div>
                  <div className="text-[11px] text-ink-muted leading-tight">Restaurant • FSSAI Valid</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ngo')}
                className="p-3 rounded-2xl bg-accent-trust-subtle/70 hover:bg-accent-trust-subtle border border-accent-trust/20 text-left flex items-center gap-3 transition-all hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-accent-trust text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink group-hover:text-accent-trust transition-colors">
                    Anita Deshmukh
                  </div>
                  <div className="text-[11px] text-ink-muted leading-tight">NGO • NITI Darpan Certified</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('driver')}
                className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/70 border border-amber-300 text-left flex items-center gap-3 transition-all hover:shadow-xs group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-ink group-hover:text-amber-900 transition-colors">
                    Vikram Singh
                  </div>
                  <div className="text-[11px] text-ink-muted leading-tight">Driver • RTO DL Verified</div>
                </div>
              </button>
            </div>
          </GlassPanel>

          {/* Main Auth Container */}
          <GlassPanel variant="prominent" className="p-6 sm:p-10 border border-white/90 shadow-xl space-y-7">
            {/* Google Authentication Button */}
            <div className="space-y-3 text-center">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full sm:w-auto min-w-[280px] min-h-[48px] px-6 py-3 rounded-2xl bg-white hover:bg-stone-50 text-ink font-semibold text-xs sm:text-sm border border-stone-300 shadow-sm transition-all inline-flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>
              <p className="text-[11px] text-ink-light">Instant single sign-on with Google Identity</p>
            </div>

            {/* Separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200/70" />
              <span className="flex-shrink mx-4 text-xs uppercase font-semibold text-stone-400">or with email</span>
              <div className="flex-grow border-t border-stone-200/70" />
            </div>

            {/* Mode Switcher: Sign In vs Register */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-stone-100 rounded-2xl max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                  authMode === 'signin' ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                  authMode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'
                }`}
              >
                Create Account (Register)
              </button>
            </div>

            {/* Notification Messages */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Content */}
            {authMode === 'signin' ? (
              /* SIGN IN FORM */
              <form onSubmit={handleSignIn} className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh@greengarden.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-ink-muted">Password</label>
                    <span className="text-[11px] text-accent-primary hover:underline cursor-pointer">Forgot?</span>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-muted block mb-1">Role Preference</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                  >
                    <option value="restaurant">Restaurant / Commercial Kitchen</option>
                    <option value="ngo">NGO / Hunger Relief Organization</option>
                    <option value="driver">Volunteer Driver / Transport Partner</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[46px] rounded-2xl bg-ink hover:bg-black text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In to FoodBridge'}</span>
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM WITH INDIAN REGULATORY FIELDS */
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Step 1: Role Chooser */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    1. Select Verified Partner Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('restaurant')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedRole === 'restaurant'
                          ? 'border-accent-primary bg-accent-primary-subtle/70 shadow-sm ring-2 ring-accent-primary/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white/60'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-accent-primary text-white flex items-center justify-center mb-2">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-ink">Restaurant / Kitchen</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">FSSAI licensed food provider</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('ngo')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedRole === 'ngo'
                          ? 'border-accent-trust bg-accent-trust-subtle/70 shadow-sm ring-2 ring-accent-trust/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white/60'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-accent-trust text-white flex items-center justify-center mb-2">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-ink">Relief NGO</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">NITI Darpan & 80G registered</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('driver')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        selectedRole === 'driver'
                          ? 'border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-400/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white/60'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center mb-2">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-ink">Volunteer Driver</div>
                      <div className="text-[11px] text-ink-muted mt-0.5">RTO licence & RC compliant</div>
                    </button>
                  </div>
                </div>

                {/* Step 2: Personal & Contact Details */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    2. Primary Contact & Account Credentials
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-ink-muted block mb-1">
                        Full Name / Authorized Signatory *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chef Vikas Oberoi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink-muted block mb-1">Official Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. contact@kitchen.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink-muted block mb-1">
                        Mobile Phone (+91 Indian Format) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink-muted block mb-1">Account Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Specific Indian Regulatory Verification Fields */}
                <div className="space-y-4 pt-3 border-t border-stone-200/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                      3. Indian Legal & Genuine Verification Details
                    </label>
                    <span className="text-[11px] font-semibold text-accent-trust flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Government Compliant
                    </span>
                  </div>

                  {/* RESTAURANT INDIAN FIELDS */}
                  {selectedRole === 'restaurant' && (
                    <div className="space-y-4 bg-accent-primary-subtle/20 p-5 rounded-2xl border border-accent-primary/20">
                      <div className="text-xs text-ink-muted leading-relaxed">
                        Under the <strong className="text-ink">Food Safety and Standards Act, 2006</strong> and FSSAI Surplus Food Regulations 2019, commercial donors must maintain valid certification and hygiene standards.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            FSSAI 14-Digit License Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 11223344556677"
                            maxLength={14}
                            value={restFssai}
                            onChange={(e) => setRestFssai(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-hidden focus:border-ink"
                          />
                          <span className="text-[10px] text-ink-light mt-0.5 block">14-digit state/central FSSAI license</span>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Registered Restaurant Business Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Spice Symphony Grand Suites"
                            value={restBusinessName}
                            onChange={(e) => setRestBusinessName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            GSTIN (15-character Indian GST)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 29AAACG1234F1Z5"
                            maxLength={15}
                            value={restGstin}
                            onChange={(e) => setRestGstin(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono uppercase focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Entity PAN Number (10 characters)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. AAACG1234F"
                            maxLength={10}
                            value={restPan}
                            onChange={(e) => setRestPan(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono uppercase focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Municipal Health Trade License No.
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. BBMP/HL/2024/8812"
                            value={restTradeLicense}
                            onChange={(e) => setRestTradeLicense(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            FoSTaC Food Safety Supervisor Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Rajesh Sharma (FoSTaC Cert #FST-88902)"
                            value={restFostacSupervisor}
                            onChange={(e) => setRestFostacSupervisor(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">Establishment Type</label>
                          <select
                            value={restEstablishmentType}
                            onChange={(e) => setRestEstablishmentType(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          >
                            <option value="Dine-in Restaurant">Dine-in Restaurant</option>
                            <option value="Hotel & Banquet Facility">Hotel & Banquet Facility</option>
                            <option value="Cloud Kitchen / Delivery Kitchen">Cloud Kitchen / Delivery Kitchen</option>
                            <option value="Bakery & Sweet Shop">Bakery & Sweet Shop</option>
                            <option value="Commercial Caterer">Commercial Caterer</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">City & Pincode *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="City (e.g. Bengaluru)"
                              value={restCity}
                              onChange={(e) => setRestCity(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                            />
                            <input
                              type="text"
                              required
                              placeholder="Pincode (e.g. 560001)"
                              maxLength={6}
                              value={restPincode}
                              onChange={(e) => setRestPincode(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-hidden focus:border-ink"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Registered Kitchen Street Address
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 42 Brigade Road, Ashok Nagar, Central Zone"
                            value={restAddress}
                            onChange={(e) => setRestAddress(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-2.5 pt-2 text-xs text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restFssaiPledge}
                          onChange={(e) => setRestFssaiPledge(e.target.checked)}
                          className="mt-0.5 rounded border-stone-300 text-accent-primary focus:ring-accent-primary"
                        />
                        <span>
                          <strong>FSSAI Food Recovery Pledge:</strong> We pledge that all surplus food donated is prepared in sanitary premises, packaged in food-grade material, and strictly labeled with safe consumption shelf life.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* NGO INDIAN FIELDS */}
                  {selectedRole === 'ngo' && (
                    <div className="space-y-4 bg-accent-trust-subtle/20 p-5 rounded-2xl border border-accent-trust/20">
                      <div className="text-xs text-ink-muted leading-relaxed">
                        Under Indian voluntary sector guidelines, hunger relief organizations must maintain <strong className="text-ink">NITI Aayog NGO Darpan</strong> registration and appropriate tax exemption certificates.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            NITI Aayog NGO Darpan Unique ID *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. KA/2021/0089234"
                            value={ngoDarpanId}
                            onChange={(e) => setNgoDarpanId(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono uppercase focus:outline-hidden focus:border-ink"
                          />
                          <span className="text-[10px] text-ink-light mt-0.5 block">Official NITI Aayog portal verification ID</span>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Registered NGO / Trust Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Annam Relief Foundation"
                            value={ngoOrgName}
                            onChange={(e) => setNgoOrgName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">Legal Registration Type</label>
                          <select
                            value={ngoRegType}
                            onChange={(e) => setNgoRegType(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          >
                            <option value="Public Charitable Trust (Indian Trusts Act 1882)">Public Charitable Trust (Indian Trusts Act 1882)</option>
                            <option value="Registered Society (Societies Registration Act 1860)">Registered Society (Societies Registration Act 1860)</option>
                            <option value="Section 8 Non-Profit Company (Companies Act 2013)">Section 8 Non-Profit Company (Companies Act 2013)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Registration Certificate Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. IV-1082/2018"
                            value={ngoRegNo}
                            onChange={(e) => setNgoRegNo(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Income Tax 12A & 80G Certificate No.
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 12A/80G/CIT(E)/BLR/2021-22/T-44"
                            value={ngo12a80g}
                            onChange={(e) => setNgo12a80g(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">Organization PAN Number</label>
                          <input
                            type="text"
                            placeholder="e.g. AABTA1234F"
                            maxLength={10}
                            value={ngoPan}
                            onChange={(e) => setNgoPan(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono uppercase focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Daily Beneficiary Feeding Capacity (meals/day)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={ngoCapacity}
                            onChange={(e) => setNgoCapacity(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">Operational City & Pincode</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Bengaluru"
                              value={ngoCity}
                              onChange={(e) => setNgoCity(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                            />
                            <input
                              type="text"
                              placeholder="Pincode (560025)"
                              maxLength={6}
                              value={ngoPincode}
                              onChange={(e) => setNgoPincode(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-hidden focus:border-ink"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Relief Storage & Refrigeration Capacity
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2 commercial refrigerators (600L), 4 insulated hot-holding boxes"
                            value={ngoStorage}
                            onChange={(e) => setNgoStorage(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-2.5 pt-2 text-xs text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ngoHygienePledge}
                          onChange={(e) => setNgoHygienePledge(e.target.checked)}
                          className="mt-0.5 rounded border-stone-300 text-accent-trust focus:ring-accent-trust"
                        />
                        <span>
                          <strong>Beneficiary Nutrition & Safety Undertaking:</strong> We certify that rescued meals are distributed promptly in clean containers directly to beneficiaries without resale or delay.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* DRIVER INDIAN FIELDS */}
                  {selectedRole === 'driver' && (
                    <div className="space-y-4 bg-amber-500/10 p-5 rounded-2xl border border-amber-300">
                      <div className="text-xs text-ink-muted leading-relaxed">
                        Under the <strong className="text-ink">Indian Motor Vehicles Act, 1988</strong>, all transport volunteers must possess a valid Driving Licence, vehicle registration certificate, and active insurance.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Full Legal Name (as on Driving Licence) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Vikram Singh"
                            value={drvLegalName}
                            onChange={(e) => setDrvLegalName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Indian Driving Licence (DL) Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. KA01 20210087654"
                            value={drvDlNumber}
                            onChange={(e) => setDrvDlNumber(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono uppercase focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Vehicle Registration Number (RC) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. KA-05-MB-4421"
                            value={drvVehicleNo}
                            onChange={(e) => setDrvVehicleNo(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono uppercase focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">Vehicle Type / Category</label>
                          <select
                            value={drvVehicleType}
                            onChange={(e) => setDrvVehicleType(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          >
                            <option value="Cargo Van (Maruti Eeco Cargo)">Cargo Van (Maruti Eeco Cargo)</option>
                            <option value="Two-Wheeler with Insulated Carrier Box">Two-Wheeler with Insulated Carrier Box</option>
                            <option value="Auto Rickshaw Cargo">Auto Rickshaw Cargo</option>
                            <option value="Light Commercial Vehicle (Tata Ace / Pickup)">Light Commercial Vehicle (Tata Ace / Pickup)</option>
                            <option value="Personal Car (Hatchback/Sedan)">Personal Car (Hatchback/Sedan)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            PUC (Pollution Under Control) Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. PUC/KA05/2024/9912"
                            value={drvPucNo}
                            onChange={(e) => setDrvPucNo(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono uppercase focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Vehicle Insurance Policy Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. NIC-MOTOR-2024-883719"
                            value={drvInsuranceNo}
                            onChange={(e) => setDrvInsuranceNo(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Masked Aadhaar Number (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. XXXX-XXXX-9128"
                            value={drvAadhaar}
                            onChange={(e) => setDrvAadhaar(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Emergency Contact Phone
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 97777 11223"
                            value={drvEmergencyPhone}
                            onChange={(e) => setDrvEmergencyPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-ink-muted block mb-1">
                            Service Area Pincodes (Comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="560001, 560025, 560034, 560038"
                            value={drvPincodes}
                            onChange={(e) => setDrvPincodes(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-ink"
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-2.5 pt-2 text-xs text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={drvPledge}
                          onChange={(e) => setDrvPledge(e.target.checked)}
                          className="mt-0.5 rounded border-stone-300 text-amber-700 focus:ring-amber-600"
                        />
                        <span>
                          <strong>Transit Safety & OTP Pledge:</strong> I commit to transporting food hygienically without tampering, following assigned GPS routes, and exchanging 4-digit security codes at both pickup and drop-off points.
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Registration Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] rounded-2xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering Partner Account...' : 'Complete Registration & Go to Profile'}</span>
                </button>
              </form>
            )}
          </GlassPanel>
        </div>
      )}

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        defaultRole={selectedRole}
      />
    </div>
  );
}
