-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'restaurant',
    "verified_status" TEXT NOT NULL DEFAULT 'pending',
    "status" TEXT NOT NULL DEFAULT 'active',
    "avatar_url" TEXT,
    "auth_provider" TEXT DEFAULT 'email',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_login_at" DATETIME
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,
    "ip_address" TEXT,
    CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RestaurantProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "cuisine_type" TEXT NOT NULL,
    "operating_hours" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fssai_license" TEXT NOT NULL,
    "fssai_expiry" TEXT,
    "gstin" TEXT,
    "pan_number" TEXT,
    "trade_license_no" TEXT,
    "fostac_supervisor_name" TEXT,
    "establishment_type" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "fssai_surplus_declaration" BOOLEAN NOT NULL DEFAULT true,
    "verification_doc_url" TEXT,
    "logistics_capability" TEXT NOT NULL DEFAULT 'staff_handoff_cold_storage',
    "photos" TEXT NOT NULL DEFAULT '[]',
    "total_meals_donated" INTEGER NOT NULL DEFAULT 0,
    "co2_saved_kg" REAL NOT NULL DEFAULT 0.0,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "RestaurantProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NGOProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "registration_no" TEXT NOT NULL,
    "darpan_id" TEXT,
    "registration_type" TEXT,
    "pan_number" TEXT,
    "section_12a_80g" TEXT,
    "fcra_status" TEXT,
    "authorized_signatory" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "hygiene_undertaking" BOOLEAN NOT NULL DEFAULT true,
    "service_area" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "capacity_per_day" INTEGER NOT NULL DEFAULT 500,
    "daily_meal_capacity" INTEGER,
    "storage_capacity" TEXT NOT NULL,
    "verification_doc_url" TEXT,
    "has_own_transport" BOOLEAN NOT NULL DEFAULT true,
    "contact_person" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "total_meals_received" INTEGER NOT NULL DEFAULT 0,
    "people_served" INTEGER NOT NULL DEFAULT 0,
    "partner_restaurants_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "NGOProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DriverProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "full_legal_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dl_number" TEXT NOT NULL,
    "dl_expiry" TEXT NOT NULL,
    "aadhaar_last4" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "puc_number" TEXT NOT NULL,
    "puc_expiry" TEXT,
    "insurance_policy_no" TEXT NOT NULL,
    "has_insulated_carrier" BOOLEAN NOT NULL DEFAULT true,
    "emergency_contact_name" TEXT NOT NULL,
    "emergency_contact_phone" TEXT NOT NULL,
    "service_city" TEXT NOT NULL,
    "service_pincodes" TEXT NOT NULL DEFAULT '[]',
    "volunteer_pledge" BOOLEAN NOT NULL DEFAULT true,
    "total_pickups_completed" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DriverProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurplusListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurant_id" TEXT NOT NULL,
    "restaurant_name" TEXT NOT NULL,
    "restaurant_address" TEXT NOT NULL,
    "restaurant_lat" REAL NOT NULL,
    "restaurant_lng" REAL NOT NULL,
    "restaurant_phone" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "remaining_quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "dietary_tags" TEXT NOT NULL DEFAULT '[]',
    "prepared_at" DATETIME NOT NULL,
    "expiry_at" DATETIME NOT NULL,
    "pickup_window_start" DATETIME NOT NULL,
    "pickup_window_end" DATETIME NOT NULL,
    "packaging_status" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "photo_urls" TEXT NOT NULL DEFAULT '[]',
    "logistics_offer" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SurplusListing_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "RestaurantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NGONeedRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ngo_id" TEXT NOT NULL,
    "ngo_name" TEXT NOT NULL,
    "ngo_address" TEXT NOT NULL,
    "ngo_lat" REAL NOT NULL,
    "ngo_lng" REAL NOT NULL,
    "ngo_contact" TEXT,
    "quantity_needed" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "category_preference" TEXT NOT NULL,
    "needed_by" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "NGONeedRequest_ngo_id_fkey" FOREIGN KEY ("ngo_id") REFERENCES "NGOProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TieUpRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listing_id" TEXT NOT NULL,
    "listing_title" TEXT NOT NULL,
    "food_category" TEXT NOT NULL,
    "ngo_id" TEXT NOT NULL,
    "ngo_name" TEXT NOT NULL,
    "ngo_address" TEXT NOT NULL,
    "ngo_phone" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "restaurant_name" TEXT NOT NULL,
    "restaurant_address" TEXT NOT NULL,
    "restaurant_phone" TEXT NOT NULL,
    "quantity_requested" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "proposed_pickup_time" DATETIME NOT NULL,
    "transport_mode" TEXT NOT NULL,
    "vehicle_type" TEXT,
    "people_count" INTEGER,
    "notes" TEXT,
    "counter_proposal" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" DATETIME,
    CONSTRAINT "TieUpRequest_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "SurplusListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TieUpRequest_ngo_id_fkey" FOREIGN KEY ("ngo_id") REFERENCES "NGOProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TieUpRequest_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "RestaurantProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransportRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tie_up_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "listing_title" TEXT NOT NULL,
    "food_category" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "restaurant_name" TEXT NOT NULL,
    "restaurant_address" TEXT NOT NULL,
    "restaurant_lat" REAL NOT NULL,
    "restaurant_lng" REAL NOT NULL,
    "restaurant_phone" TEXT NOT NULL,
    "ngo_id" TEXT NOT NULL,
    "ngo_name" TEXT NOT NULL,
    "ngo_address" TEXT NOT NULL,
    "ngo_lat" REAL NOT NULL,
    "ngo_lng" REAL NOT NULL,
    "ngo_phone" TEXT NOT NULL,
    "driver_name" TEXT NOT NULL,
    "driver_phone" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "transport_assigned_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "current_lat" REAL NOT NULL,
    "current_lng" REAL NOT NULL,
    "last_location_update_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickup_otp" TEXT NOT NULL,
    "delivery_otp" TEXT NOT NULL,
    "pickup_otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "delivery_otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "proof_pickup_url" TEXT,
    "proof_delivery_url" TEXT,
    "issue_notes" TEXT,
    "estimated_arrival_minutes" INTEGER,
    "pickup_window_start" DATETIME NOT NULL,
    "pickup_window_end" DATETIME NOT NULL,
    "tracking_history" TEXT NOT NULL DEFAULT '[]',
    "timeline_events" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TransportRecord_tie_up_id_fkey" FOREIGN KEY ("tie_up_id") REFERENCES "TieUpRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IssueFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transport_id" TEXT NOT NULL,
    "listing_title" TEXT NOT NULL,
    "restaurant_name" TEXT NOT NULL,
    "ngo_name" TEXT NOT NULL,
    "raised_by" TEXT NOT NULL,
    "raised_by_name" TEXT NOT NULL,
    "issue_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "admin_notes" TEXT,
    "action_taken" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" DATETIME,
    "resolved_by" TEXT,
    CONSTRAINT "IssueFlag_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "TransportRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppNotification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlatformAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "total_food_saved_kg" REAL NOT NULL DEFAULT 0.0,
    "total_meals_donated" INTEGER NOT NULL DEFAULT 0,
    "total_co2_offset_kg" REAL NOT NULL DEFAULT 0.0,
    "active_listings_count" INTEGER NOT NULL DEFAULT 0,
    "active_tie_ups_count" INTEGER NOT NULL DEFAULT 0,
    "active_transports_count" INTEGER NOT NULL DEFAULT 0,
    "registered_restaurants" INTEGER NOT NULL DEFAULT 0,
    "registered_ngos" INTEGER NOT NULL DEFAULT 0,
    "pending_verifications" INTEGER NOT NULL DEFAULT 0,
    "resolved_disputes" INTEGER NOT NULL DEFAULT 0,
    "avg_pickup_minutes" REAL NOT NULL DEFAULT 0.0,
    "completion_rate_percent" REAL NOT NULL DEFAULT 0.0,
    "waste_diversion_rate_percent" REAL NOT NULL DEFAULT 0.0,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_verified_status_idx" ON "User"("verified_status");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");

-- CreateIndex
CREATE INDEX "Session_expires_at_idx" ON "Session"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantProfile_user_id_key" ON "RestaurantProfile"("user_id");

-- CreateIndex
CREATE INDEX "RestaurantProfile_user_id_idx" ON "RestaurantProfile"("user_id");

-- CreateIndex
CREATE INDEX "RestaurantProfile_city_idx" ON "RestaurantProfile"("city");

-- CreateIndex
CREATE INDEX "RestaurantProfile_fssai_license_idx" ON "RestaurantProfile"("fssai_license");

-- CreateIndex
CREATE UNIQUE INDEX "NGOProfile_user_id_key" ON "NGOProfile"("user_id");

-- CreateIndex
CREATE INDEX "NGOProfile_user_id_idx" ON "NGOProfile"("user_id");

-- CreateIndex
CREATE INDEX "NGOProfile_city_idx" ON "NGOProfile"("city");

-- CreateIndex
CREATE INDEX "NGOProfile_darpan_id_idx" ON "NGOProfile"("darpan_id");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_user_id_key" ON "DriverProfile"("user_id");

-- CreateIndex
CREATE INDEX "DriverProfile_user_id_idx" ON "DriverProfile"("user_id");

-- CreateIndex
CREATE INDEX "DriverProfile_service_city_idx" ON "DriverProfile"("service_city");

-- CreateIndex
CREATE INDEX "DriverProfile_dl_number_idx" ON "DriverProfile"("dl_number");

-- CreateIndex
CREATE INDEX "SurplusListing_restaurant_id_idx" ON "SurplusListing"("restaurant_id");

-- CreateIndex
CREATE INDEX "SurplusListing_status_idx" ON "SurplusListing"("status");

-- CreateIndex
CREATE INDEX "SurplusListing_category_idx" ON "SurplusListing"("category");

-- CreateIndex
CREATE INDEX "SurplusListing_expiry_at_idx" ON "SurplusListing"("expiry_at");

-- CreateIndex
CREATE INDEX "SurplusListing_created_at_idx" ON "SurplusListing"("created_at");

-- CreateIndex
CREATE INDEX "NGONeedRequest_ngo_id_idx" ON "NGONeedRequest"("ngo_id");

-- CreateIndex
CREATE INDEX "NGONeedRequest_status_idx" ON "NGONeedRequest"("status");

-- CreateIndex
CREATE INDEX "NGONeedRequest_needed_by_idx" ON "NGONeedRequest"("needed_by");

-- CreateIndex
CREATE INDEX "TieUpRequest_listing_id_idx" ON "TieUpRequest"("listing_id");

-- CreateIndex
CREATE INDEX "TieUpRequest_ngo_id_idx" ON "TieUpRequest"("ngo_id");

-- CreateIndex
CREATE INDEX "TieUpRequest_restaurant_id_idx" ON "TieUpRequest"("restaurant_id");

-- CreateIndex
CREATE INDEX "TieUpRequest_status_idx" ON "TieUpRequest"("status");

-- CreateIndex
CREATE INDEX "TieUpRequest_created_at_idx" ON "TieUpRequest"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TransportRecord_tie_up_id_key" ON "TransportRecord"("tie_up_id");

-- CreateIndex
CREATE INDEX "TransportRecord_status_idx" ON "TransportRecord"("status");

-- CreateIndex
CREATE INDEX "TransportRecord_restaurant_id_idx" ON "TransportRecord"("restaurant_id");

-- CreateIndex
CREATE INDEX "TransportRecord_ngo_id_idx" ON "TransportRecord"("ngo_id");

-- CreateIndex
CREATE INDEX "TransportRecord_created_at_idx" ON "TransportRecord"("created_at");

-- CreateIndex
CREATE INDEX "IssueFlag_transport_id_idx" ON "IssueFlag"("transport_id");

-- CreateIndex
CREATE INDEX "IssueFlag_status_idx" ON "IssueFlag"("status");

-- CreateIndex
CREATE INDEX "IssueFlag_severity_idx" ON "IssueFlag"("severity");

-- CreateIndex
CREATE INDEX "IssueFlag_created_at_idx" ON "IssueFlag"("created_at");

-- CreateIndex
CREATE INDEX "AppNotification_user_id_idx" ON "AppNotification"("user_id");

-- CreateIndex
CREATE INDEX "AppNotification_read_idx" ON "AppNotification"("read");

-- CreateIndex
CREATE INDEX "AppNotification_created_at_idx" ON "AppNotification"("created_at");

-- CreateIndex
CREATE INDEX "AuditLog_entity_type_entity_id_idx" ON "AuditLog"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "AuditLog_actor_id_idx" ON "AuditLog"("actor_id");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
