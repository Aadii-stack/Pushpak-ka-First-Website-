'use client';

import {
  User,
  RestaurantProfile,
  NGOProfile,
  DriverProfile,
  SurplusListing,
  NGONeedRequest,
  TieUpRequest,
  TransportRecord,
  TransportStatus,
  IssueFlag,
  AppNotification,
  PlatformAnalytics,
  AuditLog,
  UserRole,
} from './types';
import {
  SEED_USERS,
  SEED_RESTAURANTS,
  SEED_NGOS,
  SEED_DRIVERS,
  SEED_LISTINGS,
  SEED_STANDING_NEEDS,
  SEED_TIE_UPS,
  SEED_TRANSPORTS,
  SEED_ISSUES,
  SEED_NOTIFICATIONS,
  SEED_ANALYTICS,
} from './seed-data';
import { calculateDistanceKm, interpolateRoute } from './geo';

const STORAGE_KEYS = {
  USERS: 'foodbridge_users',
  CURRENT_USER: 'foodbridge_current_user',
  AUTH_STATUS: 'foodbridge_auth_status',
  RESTAURANTS: 'foodbridge_restaurants',
  NGOS: 'foodbridge_ngos',
  DRIVERS: 'foodbridge_drivers',
  LISTINGS: 'foodbridge_listings',
  STANDING_NEEDS: 'foodbridge_standing_needs',
  TIE_UPS: 'foodbridge_tie_ups',
  TRANSPORTS: 'foodbridge_transports',
  ISSUES: 'foodbridge_issues',
  NOTIFICATIONS: 'foodbridge_notifications',
  AUDIT_LOGS: 'foodbridge_audit_logs',
  ANALYTICS: 'foodbridge_analytics',
};

// Safe localStorage access helper
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('foodbridge_state_change'));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export class FoodBridgeStore {
  // Initialize storage with seeds if empty
  static init() {
    if (typeof window === 'undefined') return;

    if (!window.localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStorage(STORAGE_KEYS.USERS, SEED_USERS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Restaurant Manager for initial demo view, or NGO
      setStorage(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
    } else {
      // Clean up legacy admin role if present
      const current = getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (current && (current as any).role === 'admin') {
        setStorage(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
      }
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.RESTAURANTS)) {
      setStorage(STORAGE_KEYS.RESTAURANTS, SEED_RESTAURANTS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.NGOS)) {
      setStorage(STORAGE_KEYS.NGOS, SEED_NGOS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
      setStorage(STORAGE_KEYS.DRIVERS, SEED_DRIVERS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
      setStorage(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.STANDING_NEEDS)) {
      setStorage(STORAGE_KEYS.STANDING_NEEDS, SEED_STANDING_NEEDS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.TIE_UPS)) {
      setStorage(STORAGE_KEYS.TIE_UPS, SEED_TIE_UPS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.TRANSPORTS)) {
      setStorage(STORAGE_KEYS.TRANSPORTS, SEED_TRANSPORTS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.ISSUES)) {
      setStorage(STORAGE_KEYS.ISSUES, SEED_ISSUES);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStorage(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.ANALYTICS)) {
      setStorage(STORAGE_KEYS.ANALYTICS, SEED_ANALYTICS);
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      setStorage(STORAGE_KEYS.AUDIT_LOGS, [
        {
          id: 'log_1',
          entity_type: 'transport',
          entity_id: 'tr_101',
          actor_id: 'usr_rest_1',
          actor_name: 'Rajesh Sharma',
          actor_role: 'restaurant',
          action: 'PICKUP_CONFIRMED',
          details: 'Handed over 40 kg Basmati Rice & Sambhar to Driver Vikram Singh',
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        },
      ]);
    }
  }

  // Reset to seed data
  static resetToSeed() {
    if (typeof window === 'undefined') return;
    setStorage(STORAGE_KEYS.USERS, SEED_USERS);
    setStorage(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEYS.AUTH_STATUS);
    }
    setStorage(STORAGE_KEYS.RESTAURANTS, SEED_RESTAURANTS);
    setStorage(STORAGE_KEYS.NGOS, SEED_NGOS);
    setStorage(STORAGE_KEYS.DRIVERS, SEED_DRIVERS);
    setStorage(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);
    setStorage(STORAGE_KEYS.STANDING_NEEDS, SEED_STANDING_NEEDS);
    setStorage(STORAGE_KEYS.TIE_UPS, SEED_TIE_UPS);
    setStorage(STORAGE_KEYS.TRANSPORTS, SEED_TRANSPORTS);
    setStorage(STORAGE_KEYS.ISSUES, SEED_ISSUES);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    setStorage(STORAGE_KEYS.ANALYTICS, SEED_ANALYTICS);
  }

  // Auth & Current User
  static getCurrentUser(): User {
    if (typeof window === 'undefined') return SEED_USERS[0];
    const user = getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
    if (user && (user as any).role === 'admin') {
      setStorage(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
      return SEED_USERS[0];
    }
    return user || SEED_USERS[0];
  }

  static getAuthUser(): User | null {
    if (typeof window === 'undefined') return SEED_USERS[0];
    const status = window.localStorage.getItem(STORAGE_KEYS.AUTH_STATUS);
    if (status === 'unauthenticated') return null;
    return this.getCurrentUser();
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(STORAGE_KEYS.AUTH_STATUS) !== 'unauthenticated';
  }

  static setCurrentUser(user: User): void {
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'authenticated');
    }
  }

  static switchRole(role: UserRole): User {
    const users = this.getUsers();
    const targetUser = users.find((u) => u.role === role) || users[0];
    this.setCurrentUser(targetUser);
    return targetUser;
  }

  static getUsers(): User[] {
    return getStorage<User[]>(STORAGE_KEYS.USERS, SEED_USERS).filter((u) => (u as any).role !== 'admin');
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'unauthenticated');
      window.dispatchEvent(new Event('foodbridge_state_change'));
    }
  }

  static login(email: string, password?: string, preferredRole?: UserRole): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    let target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!target && preferredRole) {
      target = users.find((u) => u.role === preferredRole);
    }
    if (!target) {
      // If not registered yet, default to first user or create one
      target = users[0];
    }
    this.setCurrentUser(target);
    return { success: true, user: target };
  }

  static loginWithGoogle(
    googleUser: { name: string; email: string; avatar_url?: string },
    role: UserRole = 'restaurant',
    extraProfileDetails?: any
  ): User {
    const users = this.getUsers();
    let existing = users.find((u) => u.email.toLowerCase() === googleUser.email.toLowerCase());

    if (existing) {
      if (googleUser.avatar_url) existing.avatar_url = googleUser.avatar_url;
      existing.auth_provider = 'google';
      this.setCurrentUser(existing);
      return existing;
    }

    // Create new user with Google credentials
    const newUser: User = {
      id: `usr_${role}_${Date.now()}`,
      role,
      name: googleUser.name,
      email: googleUser.email,
      phone: '+91 98765 00000',
      verified_status: 'verified',
      avatar_url: googleUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      created_at: new Date().toISOString(),
      auth_provider: 'google',
    };

    setStorage(STORAGE_KEYS.USERS, [...users, newUser]);

    // Create corresponding profile
    if (role === 'restaurant') {
      const newRest: RestaurantProfile = {
        id: `rest_${Date.now()}`,
        user_id: newUser.id,
        business_name: extraProfileDetails?.business_name || `${googleUser.name}'s Kitchen`,
        address: extraProfileDetails?.address || '120 MG Road, Bengaluru 560001',
        lat: 12.9716,
        lng: 77.5946,
        cuisine_type: extraProfileDetails?.cuisine_type || 'Multi-Cuisine & Healthy Meals',
        operating_hours: '10:00 AM - 11:00 PM',
        contact_person: googleUser.name,
        phone: newUser.phone,
        email: newUser.email,
        fssai_license: extraProfileDetails?.fssai_license || '11223344556600',
        fssai_expiry: extraProfileDetails?.fssai_expiry || '2028-05-31',
        gstin: extraProfileDetails?.gstin || '29AAAAA0000A1Z5',
        pan_number: extraProfileDetails?.pan_number || 'AAAAA0000A',
        trade_license_no: extraProfileDetails?.trade_license_no || 'BBMP/HL/2024/9912',
        fostac_supervisor_name: extraProfileDetails?.fostac_supervisor_name || googleUser.name,
        establishment_type: extraProfileDetails?.establishment_type || 'Dine-in Restaurant',
        city: extraProfileDetails?.city || 'Bengaluru',
        pincode: extraProfileDetails?.pincode || '560001',
        fssai_surplus_declaration: true,
        logistics_capability: 'staff_handoff_cold_storage',
        photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'],
        total_meals_donated: 0,
        co2_saved_kg: 0,
        rating: 5.0,
      };
      this.saveRestaurant(newRest);
    } else if (role === 'ngo') {
      const newNGO: NGOProfile = {
        id: `ngo_${Date.now()}`,
        user_id: newUser.id,
        org_name: extraProfileDetails?.org_name || `${googleUser.name} Relief Organization`,
        registration_no: extraProfileDetails?.registration_no || 'REG-NGO-2024-KA-8812',
        darpan_id: extraProfileDetails?.darpan_id || 'KA/2024/0077881',
        registration_type: extraProfileDetails?.registration_type || 'Public Charitable Trust',
        pan_number: extraProfileDetails?.pan_number || 'AABTP9999K',
        section_12a_80g: extraProfileDetails?.section_12a_80g || '12A/80G/CIT(E)/BLR/2024-25/X-01',
        fcra_status: 'Domestic Relief Only',
        authorized_signatory: googleUser.name,
        city: extraProfileDetails?.city || 'Bengaluru',
        pincode: extraProfileDetails?.pincode || '560001',
        hygiene_undertaking: true,
        service_area: extraProfileDetails?.service_area || 'Bengaluru Urban & Outskirts',
        address: extraProfileDetails?.address || '55 Halasuru Road, Bengaluru 560008',
        lat: 12.975,
        lng: 77.62,
        capacity_per_day: extraProfileDetails?.capacity_per_day || 400,
        storage_capacity: 'Commercial refrigerator and insulated hotboxes',
        has_own_transport: true,
        contact_person: googleUser.name,
        phone: newUser.phone,
        email: newUser.email,
        total_meals_received: 0,
        people_served: 0,
        partner_restaurants_count: 0,
      };
      this.saveNGO(newNGO);
    } else if (role === 'driver') {
      const newDriver: DriverProfile = {
        id: `drv_${Date.now()}`,
        user_id: newUser.id,
        full_legal_name: googleUser.name,
        phone: newUser.phone,
        email: newUser.email,
        dl_number: extraProfileDetails?.dl_number || 'KA01 20230099881',
        dl_expiry: extraProfileDetails?.dl_expiry || '2038-09-20',
        aadhaar_last4: extraProfileDetails?.aadhaar_last4 || 'XXXX-XXXX-3344',
        vehicle_number: extraProfileDetails?.vehicle_number || 'KA-01-EQ-9921',
        vehicle_type: extraProfileDetails?.vehicle_type || 'Two-Wheeler with Insulated Box',
        puc_number: extraProfileDetails?.puc_number || 'PUC/KA01/2024/7711',
        puc_expiry: '2025-11-20',
        insurance_policy_no: extraProfileDetails?.insurance_policy_no || 'ICICI-LOMB-2024-112233',
        has_insulated_carrier: true,
        emergency_contact_name: 'Family Contact',
        emergency_contact_phone: '+91 98888 77777',
        service_city: extraProfileDetails?.service_city || 'Bengaluru',
        service_pincodes: ['560001', '560025', '560034'],
        volunteer_pledge: true,
        total_pickups_completed: 0,
        rating: 5.0,
      };
      this.saveDriver(newDriver);
    }

    this.setCurrentUser(newUser);
    return newUser;
  }

  static registerUser(params: {
    role: UserRole;
    name: string;
    email: string;
    phone: string;
    password?: string;
    restaurantDetails?: Partial<RestaurantProfile>;
    ngoDetails?: Partial<NGOProfile>;
    driverDetails?: Partial<DriverProfile>;
  }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `usr_${params.role}_${Date.now()}`,
      role: params.role,
      name: params.name,
      email: params.email,
      phone: params.phone,
      verified_status: 'verified',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}`,
      created_at: new Date().toISOString(),
      auth_provider: 'email',
    };

    setStorage(STORAGE_KEYS.USERS, [...users, newUser]);

    if (params.role === 'restaurant' && params.restaurantDetails) {
      const restProfile: RestaurantProfile = {
        id: `rest_${Date.now()}`,
        user_id: newUser.id,
        business_name: params.restaurantDetails.business_name || params.name,
        address: params.restaurantDetails.address || 'Bengaluru, Karnataka',
        lat: params.restaurantDetails.lat || 12.9716,
        lng: params.restaurantDetails.lng || 77.5946,
        cuisine_type: params.restaurantDetails.cuisine_type || 'Multi-Cuisine',
        operating_hours: params.restaurantDetails.operating_hours || '10:00 AM - 11:00 PM',
        contact_person: params.name,
        phone: params.phone,
        email: params.email,
        fssai_license: params.restaurantDetails.fssai_license || '10022043000123',
        fssai_expiry: params.restaurantDetails.fssai_expiry || '2028-12-31',
        gstin: params.restaurantDetails.gstin || '29AAAAA0000A1Z5',
        pan_number: params.restaurantDetails.pan_number || 'AAAAA0000A',
        trade_license_no: params.restaurantDetails.trade_license_no || 'BBMP/HL/2024/001',
        fostac_supervisor_name: params.restaurantDetails.fostac_supervisor_name || params.name,
        establishment_type: params.restaurantDetails.establishment_type || 'Dine-in Restaurant',
        city: params.restaurantDetails.city || 'Bengaluru',
        pincode: params.restaurantDetails.pincode || '560001',
        fssai_surplus_declaration: true,
        logistics_capability: params.restaurantDetails.logistics_capability || 'staff_handoff_cold_storage',
        photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'],
        total_meals_donated: 0,
        co2_saved_kg: 0,
        rating: 5.0,
      };
      this.saveRestaurant(restProfile);
    } else if (params.role === 'ngo' && params.ngoDetails) {
      const ngoProfile: NGOProfile = {
        id: `ngo_${Date.now()}`,
        user_id: newUser.id,
        org_name: params.ngoDetails.org_name || params.name,
        registration_no: params.ngoDetails.registration_no || 'REG-NGO-2024-001',
        darpan_id: params.ngoDetails.darpan_id || 'KA/2024/0099881',
        registration_type: params.ngoDetails.registration_type || 'Public Charitable Trust',
        pan_number: params.ngoDetails.pan_number || 'AABTP1234F',
        section_12a_80g: params.ngoDetails.section_12a_80g || '12A/80G/CIT(E)/BLR/2024/001',
        fcra_status: params.ngoDetails.fcra_status || 'Domestic Relief Only',
        authorized_signatory: params.ngoDetails.authorized_signatory || params.name,
        city: params.ngoDetails.city || 'Bengaluru',
        pincode: params.ngoDetails.pincode || '560001',
        hygiene_undertaking: true,
        service_area: params.ngoDetails.service_area || 'Bengaluru City',
        address: params.ngoDetails.address || 'Bengaluru, Karnataka',
        lat: params.ngoDetails.lat || 12.9645,
        lng: params.ngoDetails.lng || 77.6015,
        capacity_per_day: params.ngoDetails.capacity_per_day || 500,
        storage_capacity: params.ngoDetails.storage_capacity || 'Cold storage & chillers',
        has_own_transport: params.ngoDetails.has_own_transport ?? true,
        contact_person: params.name,
        phone: params.phone,
        email: params.email,
        total_meals_received: 0,
        people_served: 0,
        partner_restaurants_count: 0,
      };
      this.saveNGO(ngoProfile);
    } else if (params.role === 'driver' && params.driverDetails) {
      const driverProfile: DriverProfile = {
        id: `drv_${Date.now()}`,
        user_id: newUser.id,
        full_legal_name: params.driverDetails.full_legal_name || params.name,
        phone: params.phone,
        email: params.email,
        dl_number: params.driverDetails.dl_number || 'KA01 20240011223',
        dl_expiry: params.driverDetails.dl_expiry || '2039-01-01',
        aadhaar_last4: params.driverDetails.aadhaar_last4 || 'XXXX-XXXX-1234',
        vehicle_number: params.driverDetails.vehicle_number || 'KA-01-AB-1234',
        vehicle_type: params.driverDetails.vehicle_type || 'Two-Wheeler with Delivery Box',
        puc_number: params.driverDetails.puc_number || 'PUC/KA01/2024/001',
        puc_expiry: params.driverDetails.puc_expiry || '2025-12-31',
        insurance_policy_no: params.driverDetails.insurance_policy_no || 'POL-MOTOR-2024-001',
        has_insulated_carrier: params.driverDetails.has_insulated_carrier ?? true,
        emergency_contact_name: params.driverDetails.emergency_contact_name || 'Emergency Contact',
        emergency_contact_phone: params.driverDetails.emergency_contact_phone || params.phone,
        service_city: params.driverDetails.service_city || 'Bengaluru',
        service_pincodes: params.driverDetails.service_pincodes || ['560001', '560025'],
        volunteer_pledge: true,
        total_pickups_completed: 0,
        rating: 5.0,
      };
      this.saveDriver(driverProfile);
    }

    this.setCurrentUser(newUser);
    return newUser;
  }

  static updateCurrentUser(userUpdates: Partial<User>, roleDetails?: any): User {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user logged in');

    const updatedUser: User = { ...user, ...userUpdates };
    const users = this.getUsers().map((u) => (u.id === user.id ? updatedUser : u));
    setStorage(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(updatedUser);

    if (roleDetails) {
      if (user.role === 'restaurant') {
        const rest = this.getRestaurantByUserId(user.id);
        if (rest) {
          this.saveRestaurant({ ...rest, ...roleDetails });
        }
      } else if (user.role === 'ngo') {
        const ngo = this.getNGOByUserId(user.id);
        if (ngo) {
          this.saveNGO({ ...ngo, ...roleDetails });
        }
      } else if (user.role === 'driver') {
        const driver = this.getDriverByUserId(user.id);
        if (driver) {
          this.saveDriver({ ...driver, ...roleDetails });
        }
      }
    }

    return updatedUser;
  }

  // Profiles
  static getRestaurants(): RestaurantProfile[] {
    return getStorage<RestaurantProfile[]>(STORAGE_KEYS.RESTAURANTS, SEED_RESTAURANTS);
  }

  static getRestaurantByUserId(userId: string): RestaurantProfile | undefined {
    return this.getRestaurants().find((r) => r.user_id === userId);
  }

  static getRestaurantById(id: string): RestaurantProfile | undefined {
    return this.getRestaurants().find((r) => r.id === id);
  }

  static saveRestaurant(restaurant: RestaurantProfile): void {
    const list = this.getRestaurants();
    const index = list.findIndex((r) => r.id === restaurant.id || r.user_id === restaurant.user_id);
    if (index >= 0) {
      list[index] = restaurant;
    } else {
      list.push(restaurant);
    }
    setStorage(STORAGE_KEYS.RESTAURANTS, list);
  }

  static getNGOs(): NGOProfile[] {
    return getStorage<NGOProfile[]>(STORAGE_KEYS.NGOS, SEED_NGOS);
  }

  static getNGOByUserId(userId: string): NGOProfile | undefined {
    return this.getNGOs().find((n) => n.user_id === userId);
  }

  static getNGOById(id: string): NGOProfile | undefined {
    return this.getNGOs().find((n) => n.id === id);
  }

  static saveNGO(ngo: NGOProfile): void {
    const list = this.getNGOs();
    const index = list.findIndex((n) => n.id === ngo.id || n.user_id === ngo.user_id);
    if (index >= 0) {
      list[index] = ngo;
    } else {
      list.push(ngo);
    }
    setStorage(STORAGE_KEYS.NGOS, list);
  }

  static getDrivers(): DriverProfile[] {
    return getStorage<DriverProfile[]>(STORAGE_KEYS.DRIVERS, SEED_DRIVERS);
  }

  static getDriverByUserId(userId: string): DriverProfile | undefined {
    return this.getDrivers().find((d) => d.user_id === userId);
  }

  static getDriverById(id: string): DriverProfile | undefined {
    return this.getDrivers().find((d) => d.id === id);
  }

  static saveDriver(driver: DriverProfile): void {
    const list = this.getDrivers();
    const index = list.findIndex((d) => d.id === driver.id || d.user_id === driver.user_id);
    if (index >= 0) {
      list[index] = driver;
    } else {
      list.push(driver);
    }
    setStorage(STORAGE_KEYS.DRIVERS, list);
  }

  // Listings
  static getListings(): SurplusListing[] {
    const listings = getStorage<SurplusListing[]>(STORAGE_KEYS.LISTINGS, SEED_LISTINGS);
    // Auto-update expired listings status if current time past expiry
    const now = new Date().toISOString();
    let changed = false;
    const updated = listings.map((l) => {
      if (l.status === 'available' && new Date(l.expiry_at) < new Date(now)) {
        changed = true;
        return { ...l, status: 'expired' as const };
      }
      return l;
    });
    if (changed) {
      setStorage(STORAGE_KEYS.LISTINGS, updated);
    }
    return updated;
  }

  static getListingById(id: string): SurplusListing | undefined {
    return this.getListings().find((l) => l.id === id);
  }

  static createListing(newListing: Omit<SurplusListing, 'id' | 'created_at' | 'status' | 'remaining_quantity'>): SurplusListing {
    const listings = this.getListings();
    const id = `list_${Date.now()}`;
    const listing: SurplusListing = {
      ...newListing,
      id,
      remaining_quantity: newListing.quantity,
      status: 'available',
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.LISTINGS, [listing, ...listings]);

    // Send notifications to nearby NGOs
    const ngos = this.getNGOs();
    ngos.forEach((ngo) => {
      const dist = calculateDistanceKm(listing.restaurant_lat, listing.restaurant_lng, ngo.lat, ngo.lng);
      if (dist <= 15) {
        this.addNotification({
          user_id: ngo.user_id,
          role: 'ngo',
          type: 'listing_expiring',
          title: `New Surplus Food: ${listing.title.slice(0, 30)}...`,
          message: `${listing.restaurant_name} (${dist.toFixed(1)} km away) just posted ${listing.quantity} ${listing.unit} of ${listing.category.replace('_', ' ')}.`,
          link: `/ngo/discover?highlight=${listing.id}`,
        });
      }
    });

    this.addAuditLog({
      entity_type: 'listing',
      entity_id: id,
      action: 'LISTING_CREATED',
      details: `Created listing: ${listing.title} (${listing.quantity} ${listing.unit})`,
    });

    return listing;
  }

  static updateListing(id: string, updates: Partial<SurplusListing>): SurplusListing | null {
    const listings = this.getListings();
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const updated = { ...listings[index], ...updates };
    listings[index] = updated;
    setStorage(STORAGE_KEYS.LISTINGS, listings);
    return updated;
  }

  // Standing Needs
  static getStandingNeeds(): NGONeedRequest[] {
    return getStorage<NGONeedRequest[]>(STORAGE_KEYS.STANDING_NEEDS, SEED_STANDING_NEEDS);
  }

  static createStandingNeed(need: Omit<NGONeedRequest, 'id' | 'created_at' | 'status'>): NGONeedRequest {
    const needs = this.getStandingNeeds();
    const id = `need_${Date.now()}`;
    const newNeed: NGONeedRequest = {
      ...need,
      id,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.STANDING_NEEDS, [newNeed, ...needs]);
    return newNeed;
  }

  // Tie-Up Requests
  static getTieUps(): TieUpRequest[] {
    return getStorage<TieUpRequest[]>(STORAGE_KEYS.TIE_UPS, SEED_TIE_UPS);
  }

  static createTieUpRequest(params: {
    listing_id: string;
    ngo_id: string;
    quantity_requested: number;
    proposed_pickup_time: string;
    transport_mode: 'ngo_pickup' | 'restaurant_delivers' | 'volunteer_driver';
    vehicle_type?: string;
    people_count?: number;
    notes?: string;
  }): TieUpRequest {
    const listing = this.getListingById(params.listing_id);
    const ngo = this.getNGOById(params.ngo_id);
    if (!listing || !ngo) throw new Error('Listing or NGO not found');

    const id = `tie_${Date.now()}`;
    const newTieUp: TieUpRequest = {
      id,
      listing_id: listing.id,
      listing_title: listing.title,
      food_category: listing.category,
      ngo_id: ngo.id,
      ngo_name: ngo.org_name,
      ngo_address: ngo.address,
      ngo_phone: ngo.phone,
      restaurant_id: listing.restaurant_id,
      restaurant_name: listing.restaurant_name,
      restaurant_address: listing.restaurant_address,
      restaurant_phone: listing.restaurant_phone || '+91 98765 43210',
      quantity_requested: params.quantity_requested,
      unit: listing.unit,
      status: 'pending',
      proposed_pickup_time: params.proposed_pickup_time,
      transport_mode: params.transport_mode,
      vehicle_type: params.vehicle_type,
      people_count: params.people_count,
      notes: params.notes,
      created_at: new Date().toISOString(),
    };

    const tieUps = this.getTieUps();
    setStorage(STORAGE_KEYS.TIE_UPS, [newTieUp, ...tieUps]);

    // Notify Restaurant
    const rest = this.getRestaurantById(listing.restaurant_id);
    if (rest) {
      this.addNotification({
        user_id: rest.user_id,
        role: 'restaurant',
        type: 'tie_up_request',
        title: `Tie-Up Request from ${ngo.org_name}`,
        message: `${ngo.org_name} requested ${params.quantity_requested} ${listing.unit} for "${listing.title}".`,
        link: `/restaurant/requests`,
      });
    }

    this.addAuditLog({
      entity_type: 'tie_up',
      entity_id: id,
      action: 'TIE_UP_REQUESTED',
      details: `NGO ${ngo.org_name} requested ${params.quantity_requested} ${listing.unit} from ${listing.restaurant_name}`,
    });

    return newTieUp;
  }

  static respondToTieUp(
    tieUpId: string,
    action: 'accept' | 'decline',
    counterProposal?: string
  ): { tieUp: TieUpRequest; transport?: TransportRecord } {
    const tieUps = this.getTieUps();
    const index = tieUps.findIndex((t) => t.id === tieUpId);
    if (index === -1) throw new Error('Tie-up not found');

    const tieUp = tieUps[index];
    const listing = this.getListingById(tieUp.listing_id);
    const ngo = this.getNGOById(tieUp.ngo_id);
    const rest = this.getRestaurantById(tieUp.restaurant_id);

    if (action === 'accept') {
      tieUp.status = 'accepted';
      tieUp.responded_at = new Date().toISOString();

      // Deduct quantity from listing
      if (listing) {
        const remaining = Math.max(0, listing.remaining_quantity - tieUp.quantity_requested);
        this.updateListing(listing.id, {
          remaining_quantity: remaining,
          status: remaining === 0 ? 'reserved' : 'partially_reserved',
        });
      }

      // Generate Transport Record
      const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const transportId = `tr_${Date.now()}`;

      const transport: TransportRecord = {
        id: transportId,
        tie_up_id: tieUp.id,
        listing_id: tieUp.listing_id,
        listing_title: tieUp.listing_title,
        food_category: tieUp.food_category,
        quantity: tieUp.quantity_requested,
        unit: tieUp.unit,
        restaurant_id: tieUp.restaurant_id,
        restaurant_name: tieUp.restaurant_name,
        restaurant_address: tieUp.restaurant_address,
        restaurant_lat: listing?.restaurant_lat || 12.9734,
        restaurant_lng: listing?.restaurant_lng || 77.6078,
        restaurant_phone: tieUp.restaurant_phone,
        ngo_id: tieUp.ngo_id,
        ngo_name: tieUp.ngo_name,
        ngo_address: tieUp.ngo_address,
        ngo_lat: ngo?.lat || 12.9645,
        ngo_lng: ngo?.lng || 77.6015,
        ngo_phone: tieUp.ngo_phone,
        driver_name:
          tieUp.transport_mode === 'restaurant_delivers'
            ? `${rest?.business_name} Driver Fleet`
            : 'Vikram Singh (NGO Volunteer)',
        driver_phone: '+91 97777 66554',
        vehicle_number: tieUp.vehicle_type || 'KA-01-EA-8821',
        transport_assigned_by: tieUp.transport_mode === 'restaurant_delivers' ? 'restaurant' : 'ngo',
        status: 'confirmed',
        current_lat: listing?.restaurant_lat || 12.9734,
        current_lng: listing?.restaurant_lng || 77.6078,
        last_location_update_at: new Date().toISOString(),
        pickup_otp: pickupOtp,
        delivery_otp: deliveryOtp,
        pickup_otp_verified: false,
        delivery_otp_verified: false,
        pickup_window_start: listing?.pickup_window_start || new Date().toISOString(),
        pickup_window_end: listing?.pickup_window_end || new Date(Date.now() + 7200000).toISOString(),
        estimated_arrival_minutes: 20,
        tracking_history: [
          {
            lat: listing?.restaurant_lat || 12.9734,
            lng: listing?.restaurant_lng || 77.6078,
            timestamp: new Date().toISOString(),
            label: 'Confirmed - Pickup Scheduled',
          },
        ],
        timeline_events: [
          {
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            description: `Tie-up confirmed by ${tieUp.restaurant_name}. Transport record initiated.`,
            actor: tieUp.restaurant_name,
          },
        ],
        created_at: new Date().toISOString(),
      };

      const transports = this.getTransports();
      setStorage(STORAGE_KEYS.TRANSPORTS, [transport, ...transports]);

      // Notify NGO
      if (ngo) {
        this.addNotification({
          user_id: ngo.user_id,
          role: 'ngo',
          type: 'tie_up_accepted',
          title: `Request Accepted by ${tieUp.restaurant_name}!`,
          message: `Your request for ${tieUp.quantity_requested} ${tieUp.unit} was approved. Transport tracking is now active.`,
          link: `/ngo/transport/${transport.id}`,
        });
      }

      this.addAuditLog({
        entity_type: 'tie_up',
        entity_id: tieUp.id,
        action: 'TIE_UP_ACCEPTED',
        details: `Tie-up confirmed for ${tieUp.quantity_requested} ${tieUp.unit}. Transport ${transport.id} created.`,
      });

      tieUps[index] = tieUp;
      setStorage(STORAGE_KEYS.TIE_UPS, tieUps);
      return { tieUp, transport };
    } else {
      tieUp.status = 'declined';
      tieUp.counter_proposal = counterProposal;
      tieUp.responded_at = new Date().toISOString();

      if (ngo) {
        this.addNotification({
          user_id: ngo.user_id,
          role: 'ngo',
          type: 'tie_up_declined',
          title: `Request Update from ${tieUp.restaurant_name}`,
          message: `Your request could not be fulfilled. ${counterProposal ? `Note: ${counterProposal}` : ''}`,
          link: `/ngo/requests`,
        });
      }

      this.addAuditLog({
        entity_type: 'tie_up',
        entity_id: tieUp.id,
        action: 'TIE_UP_DECLINED',
        details: `Tie-up declined by ${tieUp.restaurant_name}. Reason/counter: ${counterProposal || 'None'}`,
      });

      tieUps[index] = tieUp;
      setStorage(STORAGE_KEYS.TIE_UPS, tieUps);
      return { tieUp };
    }
  }

  // Transports
  static getTransports(): TransportRecord[] {
    return getStorage<TransportRecord[]>(STORAGE_KEYS.TRANSPORTS, SEED_TRANSPORTS);
  }

  static getTransportById(id: string): TransportRecord | undefined {
    return this.getTransports().find((t) => t.id === id);
  }

  static updateTransportStatus(
    id: string,
    nextStatus: TransportStatus,
    extra?: {
      driver_name?: string;
      driver_phone?: string;
      vehicle_number?: string;
      proof_url?: string;
      notes?: string;
    }
  ): TransportRecord | null {
    const transports = this.getTransports();
    const index = transports.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const t = transports[index];
    const user = this.getCurrentUser();
    t.status = nextStatus;
    t.last_location_update_at = new Date().toISOString();

    if (extra?.driver_name) t.driver_name = extra.driver_name;
    if (extra?.driver_phone) t.driver_phone = extra.driver_phone;
    if (extra?.vehicle_number) t.vehicle_number = extra.vehicle_number;

    if (nextStatus === 'picked_up') {
      t.pickup_otp_verified = true;
      if (extra?.proof_url) t.proof_pickup_url = extra.proof_url;
      // Mark listing as picked up if remaining is 0
      const listing = this.getListingById(t.listing_id);
      if (listing && listing.remaining_quantity === 0) {
        this.updateListing(listing.id, { status: 'picked_up' });
      }
    }

    if (nextStatus === 'delivered' || nextStatus === 'completed') {
      t.delivery_otp_verified = true;
      if (extra?.proof_url) t.proof_delivery_url = extra.proof_url;

      // Update Impact Metrics
      const analytics = this.getAnalytics();
      const kgSaved = t.unit === 'kg' ? t.quantity : Math.round(t.quantity * 0.4);
      const meals = t.unit === 'servings' || t.unit === 'meals' ? t.quantity : Math.round(t.quantity * 2.5);
      const co2 = Math.round(kgSaved * 2.5);

      setStorage(STORAGE_KEYS.ANALYTICS, {
        ...analytics,
        total_food_saved_kg: analytics.total_food_saved_kg + kgSaved,
        total_meals_donated: analytics.total_meals_donated + meals,
        total_co2_offset_kg: analytics.total_co2_offset_kg + co2,
      });

      // Update Restaurant & NGO impact numbers
      const restaurants = this.getRestaurants();
      const rIdx = restaurants.findIndex((r) => r.id === t.restaurant_id);
      if (rIdx !== -1) {
        restaurants[rIdx].total_meals_donated += meals;
        restaurants[rIdx].co2_saved_kg += co2;
        setStorage(STORAGE_KEYS.RESTAURANTS, restaurants);
      }

      const ngos = this.getNGOs();
      const nIdx = ngos.findIndex((n) => n.id === t.ngo_id);
      if (nIdx !== -1) {
        ngos[nIdx].total_meals_received += meals;
        ngos[nIdx].people_served += Math.round(meals * 0.9);
        setStorage(STORAGE_KEYS.NGOS, ngos);
      }
    }

    const descriptions: Record<TransportStatus, string> = {
      confirmed: 'Transport pickup confirmed.',
      en_route: `Driver ${t.driver_name} is en route to restaurant pickup location.`,
      picked_up: `Food verified and loaded at ${t.restaurant_name}. Ready for transit.`,
      in_transit: 'Transport actively in transit towards delivery destination.',
      delivered: `Food delivered at ${t.ngo_name}. Receipt OTP verified!`,
      completed: 'Transport cycle successfully completed & archived.',
      issue: `Issue reported: ${extra?.notes || 'Requires attention'}`,
    };

    t.timeline_events.push({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      description: descriptions[nextStatus] || `Status updated to ${nextStatus}`,
      actor: user.name,
    });

    transports[index] = t;
    setStorage(STORAGE_KEYS.TRANSPORTS, transports);

    // Notify counterparties
    const rest = this.getRestaurantById(t.restaurant_id);
    const ngo = this.getNGOById(t.ngo_id);
    const notifTitle = `Transport Status: ${nextStatus.toUpperCase()}`;
    const notifMsg = `${t.listing_title.slice(0, 30)}... is now ${nextStatus.replace('_', ' ')}.`;

    if (rest) {
      this.addNotification({
        user_id: rest.user_id,
        role: 'restaurant',
        type: nextStatus === 'delivered' ? 'food_delivered' : 'driver_en_route',
        title: notifTitle,
        message: notifMsg,
        link: `/restaurant/transports/${t.id}`,
      });
    }
    if (ngo) {
      this.addNotification({
        user_id: ngo.user_id,
        role: 'ngo',
        type: nextStatus === 'delivered' ? 'food_delivered' : 'driver_en_route',
        title: notifTitle,
        message: notifMsg,
        link: `/ngo/transport/${t.id}`,
      });
    }

    this.addAuditLog({
      entity_type: 'transport',
      entity_id: t.id,
      action: `TRANSPORT_${nextStatus.toUpperCase()}`,
      details: descriptions[nextStatus],
    });

    return t;
  }

  // Live GPS Simulation
  static simulateDriverMovement(transportId: string): TransportRecord | null {
    const transports = this.getTransports();
    const index = transports.findIndex((t) => t.id === transportId);
    if (index === -1) return null;

    const t = transports[index];
    const route = interpolateRoute(t.restaurant_lat, t.restaurant_lng, t.ngo_lat, t.ngo_lng, 12);
    
    // Find next step in route or advance
    const currentStep = t.tracking_history.length;
    const nextCoord = route[Math.min(currentStep, route.length - 1)];

    t.current_lat = nextCoord.lat;
    t.current_lng = nextCoord.lng;
    t.last_location_update_at = new Date().toISOString();
    t.estimated_arrival_minutes = Math.max(2, (t.estimated_arrival_minutes || 10) - 2);

    t.tracking_history.push({
      lat: nextCoord.lat,
      lng: nextCoord.lng,
      timestamp: new Date().toISOString(),
      label: `GPS Ping (ETA: ${t.estimated_arrival_minutes} mins)`,
    });

    transports[index] = t;
    setStorage(STORAGE_KEYS.TRANSPORTS, transports);
    return t;
  }

  // Issue Flagging
  static getIssues(): IssueFlag[] {
    return getStorage<IssueFlag[]>(STORAGE_KEYS.ISSUES, SEED_ISSUES);
  }

  static flagIssue(params: {
    transport_id: string;
    issue_type: IssueFlag['issue_type'];
    description: string;
    severity: IssueFlag['severity'];
  }): IssueFlag {
    const transport = this.getTransportById(params.transport_id);
    const user = this.getCurrentUser();
    if (!transport) throw new Error('Transport record not found');

    const id = `iss_${Date.now()}`;
    const issue: IssueFlag = {
      id,
      transport_id: transport.id,
      listing_title: transport.listing_title,
      restaurant_name: transport.restaurant_name,
      ngo_name: transport.ngo_name,
      raised_by: user.role === 'restaurant' ? 'restaurant' : user.role === 'driver' ? 'driver' : 'ngo',
      raised_by_name: user.name,
      issue_type: params.issue_type,
      description: params.description,
      severity: params.severity,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    const issues = this.getIssues();
    setStorage(STORAGE_KEYS.ISSUES, [issue, ...issues]);

    // Update transport status
    this.updateTransportStatus(transport.id, 'issue', { notes: params.description });

    // Notify involved parties
    const notifyRole = user.role === 'restaurant' ? 'ngo' : 'restaurant';
    const notifyLink = notifyRole === 'restaurant' ? `/restaurant/transports/${transport.id}` : `/ngo/transport/${transport.id}`;
    this.addNotification({
      user_id: user.role === 'restaurant' ? transport.ngo_id : transport.restaurant_id,
      role: notifyRole,
      type: 'issue_flagged',
      title: `🚨 Issue Flagged on #${transport.id}`,
      message: `${user.name} reported "${params.issue_type.replace('_', ' ')}": ${params.description}`,
      link: notifyLink,
    });

    this.addAuditLog({
      entity_type: 'issue',
      entity_id: id,
      action: 'ISSUE_FLAGGED',
      details: `[${params.severity.toUpperCase()}] ${params.issue_type}: ${params.description}`,
    });

    return issue;
  }

  static resolveIssue(
    issueId: string,
    resolution: { status: 'resolved' | 'dismissed'; admin_notes: string; action_taken?: string }
  ): IssueFlag | null {
    const issues = this.getIssues();
    const index = issues.findIndex((i) => i.id === issueId);
    if (index === -1) return null;

    const issue = issues[index];
    const user = this.getCurrentUser();
    issue.status = resolution.status;
    issue.admin_notes = resolution.admin_notes;
    issue.action_taken = resolution.action_taken;
    issue.resolved_at = new Date().toISOString();
    issue.resolved_by = user.name;

    issues[index] = issue;
    setStorage(STORAGE_KEYS.ISSUES, issues);

    // Resume transport to previous sensible state (e.g. in_transit or picked_up)
    const transport = this.getTransportById(issue.transport_id);
    if (transport && transport.status === 'issue') {
      const resumeStatus = transport.pickup_otp_verified ? 'in_transit' : 'en_route';
      this.updateTransportStatus(transport.id, resumeStatus, { notes: 'Issue resolved by Admin' });
    }

    this.addAuditLog({
      entity_type: 'issue',
      entity_id: issue.id,
      action: `ISSUE_${resolution.status.toUpperCase()}`,
      details: `Resolution: ${resolution.admin_notes}`,
    });

    return issue;
  }

  // Verifications (Admin)
  static updateVerificationStatus(
    userId: string,
    status: 'verified' | 'rejected'
  ): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index].verified_status = status;
    setStorage(STORAGE_KEYS.USERS, users);

    this.addNotification({
      user_id: userId,
      role: users[index].role,
      type: 'verification_status',
      title: status === 'verified' ? 'Account Verified 🎉' : 'Verification Update',
      message:
        status === 'verified'
          ? 'Your FoodBridge account verification documents have been approved. You can now transact freely!'
          : 'Your verification submission could not be verified. Please review the document guidelines and re-upload.',
      link: '/profile',
    });

    this.addAuditLog({
      entity_type: 'user',
      entity_id: userId,
      action: `VERIFICATION_${status.toUpperCase()}`,
      details: `Admin changed verification status to ${status}`,
    });

    return users[index];
  }

  // Notifications
  static getNotifications(userId?: string): AppNotification[] {
    const all = getStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (!userId) return all;
    return all.filter((n) => n.user_id === userId);
  }

  static addNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'read'>): AppNotification {
    const notifications = this.getNotifications();
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newNotif: AppNotification = {
      ...notif,
      id,
      read: false,
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);
    return newNotif;
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  static markAllNotificationsRead(userId: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.user_id === userId ? { ...n, read: true } : n));
    setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  static addAuditLog(params: {
    entity_type: AuditLog['entity_type'];
    entity_id: string;
    action: string;
    details: string;
  }): void {
    const user = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      action: params.action,
      details: params.details,
      timestamp: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs.slice(0, 99)]); // Keep last 100
  }

  // Platform Analytics
  static getAnalytics(): PlatformAnalytics {
    return getStorage<PlatformAnalytics>(STORAGE_KEYS.ANALYTICS, SEED_ANALYTICS);
  }
}
