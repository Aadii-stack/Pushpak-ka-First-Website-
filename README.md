# 🍲 FoodBridge — Restaurant Surplus-to-NGO Platform

> **Zero Food Waste. Zero Hunger.**  
> A full-stack platform that seamlessly connects restaurants, banquet halls, and food businesses with surplus food to verified hunger relief NGOs. Complete with real-time GPS tracking, safe shelf-life countdowns, smart ranking, OTP verification handoffs, operational dispute management, and an enterprise-grade production database system.

---

## 🌟 Key Highlights & Core Features

### 1. 👨‍🍳 Restaurant Portal
- **Surplus Food Listing Creation**: Specify food categories (Cooked meals, buffet surplus, packaged, bakery, produce, dairy), quantities & units (servings, kg, boxes, trays), dietary tags (Veg, Non-veg, Vegan, Halal, Jain, Gluten-free), and packaging status.
- **Auto-Computed Safe Shelf-Life Window**: Dynamic countdown timer ensuring food is requested and picked up while safe and fresh.
- **Logistics Offerings**: Specify whether the restaurant offers dock staff handoff, cold storage, self-delivery within radius, or pickup only.
- **NGO Request Management**: Instant notification of incoming tie-up requests with option to Accept, Decline, or propose counter-logistics.
- **Handoff Security**: Display of unique **Pickup Handoff OTP** provided to the driver upon loading.

### 2. 🏢 NGO Discovery & Matching Portal
- **Interactive Proximity Map**: Dual Map + List discovery interface powered by Leaflet and OpenStreetMap.
- **Radius & Distance Filtering**: Search within 2 km to 35 km of the NGO distribution base using the Haversine distance formula.
- **Smart Match AI Ranking**: Combines Proximity (40 pts) + Urgency/Expiry Time (35 pts) + Quantity Fit (15 pts) + Logistics Match (10 pts).
- **Partial Fulfillment Tie-Ups**: NGOs can request any portion of a large surplus listing (e.g. request 25 out of 60 meal boxes).
- **Standing Need Broadcasts**: NGOs can post urgent demand targets (e.g. "Need 120 hot meals by 8:30 PM for night shelter").
- **Privacy Protection**: Contact details are kept private during discovery and revealed only once a tie-up is confirmed.

### 3. 🚚 Volunteer & Driver Logistics Cockpit
- **Live GPS Tracking**: Real-time geolocation updates with interactive route polylines and simulated movement along the route between restaurant and NGO.
- **Two-Step OTP Verification**:
  1. *Pickup OTP*: Entered by driver at restaurant dock to verify handoff and start transit.
  2. *Delivery Receipt OTP*: Verified upon unloading at NGO facility to confirm safe receipt.
- **Photo Proof Upload**: Food inspection photo capture during loading and delivery.
- **Issue Flagging**: One-click reporting of transit delays, packaging issues, or quantity mismatches.

### 4. 🛡️ Admin Operations Command Center
- **Live City Command Map**: Real-time visual tracking of all active surplus listings, NGO hubs, and moving delivery vehicles across the city.
- **Document Compliance & Verification**: Review queue for Restaurant FSSAI food safety licenses and NGO 80G/12A registration certificates.
- **Dispute & Issue Resolution Center**: Instant review of flagged issues with severity tags and admin action logging.
- **Audit Logs**: Chronological accountability log for every status change, tie-up confirmation, and verification update.

### 5. 📊 Public Impact Transparency & Leaderboard
- **Impact Metrics**: Total meals rescued, kg of food diverted from landfills, and CO2 emissions prevented.
- **Donor Champions Leaderboard**: Ranking of top donor restaurants and active NGO distribution networks.
- **Downloadable Impact Certificate**: Official ESG and CSR verification certificate.

---

## 🗄️ Database System & Architecture

The application is powered by **Prisma ORM** with a fully normalized, relational schema:
- **Local Development**: SQLite (`file:./dev.db`) for zero-configuration, instant execution out-of-the-box.
- **Production Ready**: Full PostgreSQL schema (`prisma/schema.postgresql.prisma`) ready for deployment on Supabase, Neon, AWS RDS, Railway, or Docker.

### 📐 Database Schema & Normalized Models

1. **`User`**: Core user accounts (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `verified_status`, `status`, `auth_provider`, `last_login_at`, `created_at`, `updated_at`).
2. **`Session`**: Database-backed sessions for multi-device management and revocation (`token`, `expires_at`, `user_agent`, `ip_address`).
3. **`RestaurantProfile`**: Extended Indian legal & operational profile (`business_name`, `fssai_license`, `fssai_expiry`, `gstin`, `pan_number`, `trade_license_no`, `fostac_supervisor_name`, `address`, `lat`, `lng`, `logistics_capability`, `photos`, `total_meals_donated`, `co2_saved_kg`, `rating`).
4. **`NGOProfile`**: Verified NGO entity (`org_name`, `registration_no`, `darpan_id`, `pan_number`, `section_12a_80g`, `fcra_status`, `authorized_signatory`, `capacity_per_day`, `storage_capacity`, `has_own_transport`, `total_meals_received`, `people_served`).
5. **`DriverProfile`**: Field volunteer profile (`full_legal_name`, `dl_number`, `dl_expiry`, `aadhaar_last4`, `vehicle_number`, `vehicle_type`, `puc_number`, `insurance_policy_no`, `service_city`, `service_pincodes`).
6. **`SurplusListing`**: Surplus food posts (`title`, `category`, `quantity`, `remaining_quantity`, `unit`, `dietary_tags`, `prepared_at`, `expiry_at`, `pickup_window_start`, `pickup_window_end`, `packaging_status`, `status`, `photo_urls`, `logistics_offer`).
7. **`NGONeedRequest`**: Urgent standing demands broadcast by NGOs.
8. **`TieUpRequest`**: Mutual food reservation agreement between NGO and Restaurant (`status`: pending, accepted, declined, cancelled).
9. **`TransportRecord`**: Active delivery cycle with GPS tracking (`status`: confirmed, en_route, picked_up, in_transit, delivered, completed, issue), dual OTP verification (`pickup_otp`, `delivery_otp`), photo proof URLs, and JSON timeline events.
10. **`IssueFlag`**: Operational disputes flagged during transit with severity levels and administrative resolution notes.
11. **`AppNotification`**: Persistent in-app notifications for order updates, handoffs, and verifications.
12. **`AuditLog`**: Complete immutable audit trail for security compliance.
13. **`PlatformAnalytics`**: Live aggregated environmental and social impact statistics.

### 🔑 Database Relationships
- `User` 1:1 `RestaurantProfile` (Cascade Delete)
- `User` 1:1 `NGOProfile` (Cascade Delete)
- `User` 1:1 `DriverProfile` (Cascade Delete)
- `User` 1:N `Session` (Cascade Delete)
- `User` 1:N `AppNotification` (Cascade Delete)
- `RestaurantProfile` 1:N `SurplusListing` (Cascade Delete)
- `SurplusListing` 1:N `TieUpRequest` (Cascade Delete)
- `TieUpRequest` 1:1 `TransportRecord` (Cascade Delete)
- `TransportRecord` 1:N `IssueFlag` (Cascade Delete)

---

## 🔒 Security Best Practices & Authentication Flow

- **Password Hashing**: Stored using industry-standard **bcrypt** (12 salt rounds). Plaintext passwords are never stored.
- **Session Tokens**: Signed using **`jose`** JWT with HMAC-SHA256 (`HS256`).
- **Cookie Security**: Tokens are transmitted via `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookies, mitigating XSS and session hijacking attacks.
- **Route Guarding**: Next.js App Router **Middleware** (`src/middleware.ts`) protects dashboard routes (`/restaurant/*`, `/ngo/*`, `/driver/*`, `/profile`) and enforces role-based authorization.
- **Data Protection**: API routes explicitly strip `password_hash` via `sanitizeUser()`. Database credentials are kept server-side in `.env` and never leaked to the client.
- **SQL Injection Prevention**: All queries utilize Prisma ORM parameterized statements.
- **Duplicate Email Prevention**: Unique constraints enforced at both the database level and application validation layer.

---

## 🌐 Production API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new account with role and legal profile |
| `POST` | `/api/auth/login` | Authenticate with email & password, issue session cookie |
| `POST` | `/api/auth/logout` | Invalidate session in DB and clear cookie |
| `GET`  | `/api/auth/me` | Retrieve current authenticated user and profile |
| `PATCH`| `/api/auth/me` | Update current user details and profile |
| `GET`  | `/api/users/me` | Alias for retrieving current user identity |
| `PATCH`| `/api/users/me` | Alias for updating user identity |
| `POST` | `/api/auth/switch-role` | Demo role-switching helper (issues session for selected role) |
| `GET`  | `/api/listings` | Fetch surplus listings with filtering & pagination |
| `POST` | `/api/listings` | Create new surplus listing (restaurants only) |
| `GET`  | `/api/tie-ups` | Fetch tie-up requests |
| `POST` | `/api/tie-ups` | Create tie-up request for surplus listing |
| `POST` | `/api/tie-ups/:id/respond`| Accept or decline tie-up, deduct quantity, create transport |
| `GET`  | `/api/transports` | Fetch transport tracking records |
| `PATCH`| `/api/transports/:id` | Update transport status, verify OTPs, update impact metrics |
| `GET`  | `/api/issues` | Fetch flagged issues |
| `POST` | `/api/issues` | Report operational dispute |
| `POST` | `/api/issues/:id/resolve` | Resolve dispute with admin action |
| `GET`  | `/api/notifications` | Fetch user notifications |
| `PATCH`| `/api/notifications` | Mark notifications as read |
| `GET`  | `/api/standing-needs` | Fetch NGO standing needs |
| `POST` | `/api/standing-needs` | Post urgent standing need |
| `GET`  | `/api/analytics` | Fetch live platform metrics |
| `GET`  | `/api/audit-logs` | Fetch system audit history |

---

## ⚙️ Environment Variables

Create `.env` (or copy `.env.example`):

```env
# Application
NEXT_PUBLIC_APP_NAME="FoodBridge"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database Connection (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# Production PostgreSQL example:
# DATABASE_URL="postgresql://foodbridge_user:your_password@localhost:5432/foodbridge?schema=public"

# Authentication Secrets (minimum 32 characters)
JWT_SECRET="foodbridge_secure_jwt_production_secret_key_change_me_32_chars"
SESSION_EXPIRY_DAYS="7"
```

---

## 🚀 Setup & Execution Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
# Creates tables and applies initial SQL migration
npm run db:migrate
```

### 3. Seed Database with Initial Data
```bash
# Populates users (bcrypt hashed passwords: Password123!), profiles, listings, tie-ups, transports
npm run db:seed
```

### 4. Run Automated Test Suite
```bash
# Runs 20 automated tests validating database connectivity, auth, hashing, and constraints
npx tsx scripts/test-database-auth.ts
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 🐘 Switching to PostgreSQL for Production

To switch to PostgreSQL in production:
```bash
# 1. Switch active schema to PostgreSQL
npm run db:use-postgres

# 2. In .env, update DATABASE_URL:
# DATABASE_URL="postgresql://username:password@db-host:5432/foodbridge?schema=public"

# 3. Deploy migrations to PostgreSQL:
npx prisma migrate deploy

# 4. (Optional) Seed production database:
npm run db:seed

# To switch back to SQLite:
npm run db:use-sqlite
```

---

## 👥 Seed Demo Accounts

All seed accounts are initialized with password: `Password123!`

| Role | Name | Email | Password |
|------|------|-------|----------|
| 👨‍🍳 Restaurant | Chef Rajesh Sharma | `rajesh@greengarden.com` | `Password123!` |
| 👨‍🍳 Restaurant | Priya Narang | `priya@spicesymphony.com` | `Password123!` |
| 🏢 NGO | Anita Deshmukh | `anita@annamrelief.org` | `Password123!` |
| 🏢 NGO | Karan Mehra | `karan@hopenourish.org` | `Password123!` |
| 🚚 Driver | Vikram Singh | `vikram.driver@foodbridge.org` | `Password123!` |
