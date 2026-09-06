export type UserRole = 'restaurant' | 'ngo' | 'driver';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  verified_status: VerificationStatus;
  avatar_url?: string;
  created_at: string;
  auth_provider?: 'email' | 'google';
}

export type LogisticsCapability = 'none' | 'self_deliver' | 'pickup_only' | 'staff_handoff_cold_storage';

export interface RestaurantProfile {
  id: string;
  user_id: string;
  business_name: string;
  address: string;
  lat: number;
  lng: number;
  cuisine_type: string;
  operating_hours: string;
  contact_person: string;
  phone: string;
  email: string;
  fssai_license: string;
  fssai_expiry?: string;
  gstin?: string;
  pan_number?: string;
  trade_license_no?: string;
  fostac_supervisor_name?: string;
  establishment_type?: string;
  city?: string;
  pincode?: string;
  fssai_surplus_declaration?: boolean;
  verification_doc_url?: string;
  logistics_capability: LogisticsCapability;
  photos: string[];
  total_meals_donated: number;
  co2_saved_kg: number;
  rating: number;
}

export interface NGOProfile {
  id: string;
  user_id: string;
  org_name: string;
  registration_no: string;
  darpan_id?: string;
  registration_type?: string;
  pan_number?: string;
  section_12a_80g?: string;
  fcra_status?: string;
  authorized_signatory?: string;
  city?: string;
  pincode?: string;
  hygiene_undertaking?: boolean;
  service_area: string;
  address: string;
  lat: number;
  lng: number;
  capacity_per_day: number;
  daily_meal_capacity?: number;
  storage_capacity: string;
  verification_doc_url?: string;
  has_own_transport: boolean;
  contact_person: string;
  phone: string;
  email: string;
  total_meals_received: number;
  people_served: number;
  partner_restaurants_count: number;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  full_legal_name: string;
  phone: string;
  email: string;
  dl_number: string;
  dl_expiry: string;
  aadhaar_last4: string;
  vehicle_number: string;
  vehicle_type: string;
  puc_number: string;
  puc_expiry?: string;
  insurance_policy_no: string;
  has_insulated_carrier: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  service_city: string;
  service_pincodes: string[];
  volunteer_pledge: boolean;
  total_pickups_completed: number;
  rating: number;
}

export type FoodCategory =
  | 'cooked_meals'
  | 'packaged'
  | 'bakery'
  | 'produce'
  | 'dairy_beverages'
  | 'dry_ration'
  | 'buffet_surplus';

export type FoodUnit = 'servings' | 'kg' | 'boxes' | 'trays' | 'liters' | 'meals';

export type DietaryTag = 'veg' | 'non-veg' | 'vegan' | 'halal' | 'jain' | 'gluten_free' | 'dairy_free';

export type PackagingStatus = 'packed' | 'needs_packing' | 'sealed_containers' | 'bulk_containers';

export type ListingStatus = 'available' | 'reserved' | 'partially_reserved' | 'picked_up' | 'expired';

export interface SurplusListing {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_lat: number;
  restaurant_lng: number;
  restaurant_phone?: string; // Revealed only on confirmation
  title: string;
  category: FoodCategory;
  description: string;
  quantity: number;
  remaining_quantity: number;
  unit: FoodUnit;
  dietary_tags: DietaryTag[];
  prepared_at: string;
  expiry_at: string;
  pickup_window_start: string;
  pickup_window_end: string;
  packaging_status: PackagingStatus;
  status: ListingStatus;
  photo_urls: string[];
  logistics_offer: LogisticsCapability;
  created_at: string;
}

export interface NGONeedRequest {
  id: string;
  ngo_id: string;
  ngo_name: string;
  ngo_address: string;
  ngo_lat: number;
  ngo_lng: number;
  ngo_contact?: string;
  quantity_needed: number;
  unit: FoodUnit;
  category_preference: FoodCategory | 'any';
  needed_by: string;
  status: 'active' | 'fulfilled' | 'expired';
  description: string;
  created_at: string;
}

export type TieUpStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface TieUpRequest {
  id: string;
  listing_id: string;
  listing_title: string;
  food_category: FoodCategory;
  ngo_id: string;
  ngo_name: string;
  ngo_address: string;
  ngo_phone: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_phone: string;
  quantity_requested: number;
  unit: FoodUnit;
  status: TieUpStatus;
  proposed_pickup_time: string;
  transport_mode: 'ngo_pickup' | 'restaurant_delivers' | 'volunteer_driver';
  vehicle_type?: string;
  people_count?: number;
  notes?: string;
  counter_proposal?: string;
  created_at: string;
  responded_at?: string;
}

export type TransportStatus =
  | 'confirmed'
  | 'en_route'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'issue';

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  label?: string;
}

export interface TransportRecord {
  id: string;
  tie_up_id: string;
  listing_id: string;
  listing_title: string;
  food_category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_lat: number;
  restaurant_lng: number;
  restaurant_phone: string;
  ngo_id: string;
  ngo_name: string;
  ngo_address: string;
  ngo_lat: number;
  ngo_lng: number;
  ngo_phone: string;
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  transport_assigned_by: 'restaurant' | 'ngo' | 'driver';
  status: TransportStatus;
  current_lat: number;
  current_lng: number;
  last_location_update_at: string;
  pickup_otp: string;
  delivery_otp: string;
  pickup_otp_verified: boolean;
  delivery_otp_verified: boolean;
  proof_pickup_url?: string;
  proof_delivery_url?: string;
  issue_notes?: string;
  estimated_arrival_minutes?: number;
  pickup_window_start: string;
  pickup_window_end: string;
  tracking_history: LocationPoint[];
  timeline_events: {
    status: TransportStatus;
    timestamp: string;
    description: string;
    actor: string;
  }[];
  created_at: string;
}

export type IssueType =
  | 'food_not_ready'
  | 'vehicle_delayed'
  | 'quantity_mismatch'
  | 'quality_concern'
  | 'unreachable_contact'
  | 'route_blocked'
  | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';

export interface IssueFlag {
  id: string;
  transport_id: string;
  listing_title: string;
  restaurant_name: string;
  ngo_name: string;
  raised_by: 'restaurant' | 'ngo' | 'driver';
  raised_by_name: string;
  issue_type: IssueType;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  admin_notes?: string;
  action_taken?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  role: UserRole;
  type:
    | 'tie_up_request'
    | 'tie_up_accepted'
    | 'tie_up_declined'
    | 'pickup_starting'
    | 'driver_en_route'
    | 'food_picked_up'
    | 'food_delivered'
    | 'issue_flagged'
    | 'issue_resolved'
    | 'listing_expiring'
    | 'verification_status';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: 'listing' | 'tie_up' | 'transport' | 'issue' | 'user';
  entity_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface PlatformAnalytics {
  total_food_saved_kg: number;
  total_meals_donated: number;
  total_co2_offset_kg: number;
  active_listings_count: number;
  active_tie_ups_count: number;
  active_transports_count: number;
  registered_restaurants: number;
  registered_ngos: number;
  pending_verifications: number;
  resolved_disputes: number;
  avg_pickup_minutes: number;
  completion_rate_percent: number;
  waste_diversion_rate_percent: number;
}
