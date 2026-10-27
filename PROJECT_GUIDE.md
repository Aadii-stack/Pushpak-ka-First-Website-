# FoodBridge: Project and Code Guide

## 1. What this project does

FoodBridge is a web application for coordinating surplus-food donations. It provides separate experiences for restaurants that publish available food, NGOs that find and request donations, and volunteer drivers who help with delivery. The repository also contains admin and public-impact pages.

The typical business workflow represented in the application is:

1. A restaurant account publishes a surplus listing, including quantity, category, pickup window, expiry, dietary information, and logistics capability.
2. An NGO discovers a listing and submits a tie-up request for some quantity.
3. The restaurant accepts or declines. Acceptance reserves the requested quantity and creates a transport record.
4. The transport record tracks handoff and delivery status, OTP checks, timeline events, and proof references.
5. Notifications and audit records describe important changes; delivery updates impact statistics.

Some user interface behavior is intentionally demo-oriented. The implementation details and limitations are called out below; the README's feature descriptions should not be treated as proof that every feature is production-integrated.

## 2. Technology stack

| Technology | Why it is used | How it is used here |
|---|---|---|
| TypeScript | Catches many errors early and documents the shape of application data. | Used by the Next.js pages, React components, API route handlers, shared types, and utilities. |
| Next.js 15 App Router | Combines the React web application and server endpoints in one project. | `src/app` contains route pages and `src/app/api/**/route.ts` contains HTTP handlers. `src/middleware.ts` performs request-time route checks. |
| React 19 | Builds interactive interfaces from components and state. | Client pages use hooks for forms, dashboard state, maps, status updates, and modal flows. Server rendering and client-side interactivity are mixed as needed. |
| Prisma ORM 6 | Provides typed access to relational data and manages schema migrations. | `src/lib/prisma.ts` creates a shared Prisma client; server handlers query and update the models in `prisma/schema.prisma`. |
| SQLite | Simple local database requiring no separate database server. | The active schema in this checkout sets the Prisma datasource to SQLite; `.env.example` documents `DATABASE_URL=file:./dev.db`. |
| PostgreSQL | Server database option for hosted or production deployments. | `prisma/schema.postgresql.prisma` contains the PostgreSQL variant. `scripts/switch-db.js` copies that schema into `schema.prisma` when requested. |
| Tailwind CSS 3 + PostCSS + Autoprefixer | Utility-first styling and browser-compatible CSS output. | Tailwind is configured in `tailwind.config.js`; global styles, design tokens, glass surfaces, and Leaflet styles are in `src/app/globals.css`. |
| Zod | Runtime validation for untrusted request bodies. | Registration and login API handlers parse request payloads with Zod schemas. |
| `jose` | Signs and verifies JSON Web Tokens. | Creates and verifies session tokens used by authentication cookies and middleware. |
| `bcryptjs` | Password hashing and comparison. | Password hashes are created with 12 rounds and checked at login. |
| Leaflet | Interactive map rendering. | The map components use Leaflet for displaying locations and routes. OpenStreetMap tiles are the documented map source. |
| Recharts | React charting. | Available for dashboard/impact visualizations where used by the UI. |
| Lucide React | Consistent icon set. | Supplies icons throughout navigation, cards, forms, and dashboards. |
| `date-fns` | Date formatting and manipulation helpers. | Used where date-driven UI operations need it. |
| `clsx` and `tailwind-merge` | Conditional class construction and merging Tailwind utilities. | Available to component styling code to compose class names without conflicting utilities. |
| `tsx` | Runs TypeScript scripts directly in Node. | Used to execute the Prisma seed script and database/auth test script. |

The key package scripts are in `package.json`:

- `npm run dev`: start the Next.js development server.
- `npm run build` / `npm run start`: build and run the production server.
- `npm run db:generate`: generate Prisma Client from the active schema.
- `npm run db:migrate`: run a development migration.
- `npm run db:push`: synchronize the schema to a database without creating a migration.
- `npm run db:seed`: reset and populate the database with demo data.
- `npm run db:use-postgres` / `npm run db:use-sqlite`: replace the active Prisma schema with the selected provider variant.

## 3. Application structure and important files

### Root configuration and project documentation

| File | Purpose |
|---|---|
| `package.json` | Dependencies, package metadata, and development/database scripts. |
| `package-lock.json` | Exact npm dependency resolution for reproducible installs. |
| `tsconfig.json` | TypeScript compiler options and path alias configuration. |
| `next.config.mjs` | Next.js options, including strict React mode and permitted image domains. |
| `tailwind.config.js` | Tailwind content paths, theme colors, typography, shadows, and animations. |
| `postcss.config.js` | CSS processing configuration for Tailwind and Autoprefixer. |
| `.env.example` | Names and example formats of application settings. Set private credentials in a local environment file; do not put real secrets in this guide or commit them. |
| `README.md` | Existing setup instructions and product feature overview. |
| `PROJECT_GUIDE.md` | This code, data-flow, and database guide. |

### Pages under `src/app`

Next.js uses the filesystem under `src/app` to define page URLs. Page files named `page.tsx` render the corresponding route.

| Route | File | Intended area |
|---|---|---|
| `/` | `src/app/page.tsx` | Public landing page with impact data and current listing previews. |
| `/login` | `src/app/login/page.tsx` | Login and registration experience. |
| `/profile` | `src/app/profile/page.tsx` | Account/profile experience shared across roles. |
| `/impact` | `src/app/impact/page.tsx` | Public impact information and statistics. |
| `/restaurant` | `src/app/restaurant/page.tsx` | Restaurant dashboard. |
| `/restaurant/listings` | `src/app/restaurant/listings/page.tsx` | Restaurant listing management. |
| `/restaurant/new-listing` | `src/app/restaurant/new-listing/page.tsx` | Surplus-food listing form. |
| `/restaurant/requests` | `src/app/restaurant/requests/page.tsx` | Incoming NGO requests. |
| `/restaurant/transports` | `src/app/restaurant/transports/page.tsx` | Restaurant-side transport list. |
| `/restaurant/transports/[id]` | `src/app/restaurant/transports/[id]/page.tsx` | Transport details for a restaurant. |
| `/ngo` | `src/app/ngo/page.tsx` | NGO dashboard. |
| `/ngo/discover` | `src/app/ngo/discover/page.tsx` | Listing discovery and match browsing. |
| `/ngo/requests` | `src/app/ngo/requests/page.tsx` | NGO's donation requests. |
| `/ngo/standing-needs` | `src/app/ngo/standing-needs/page.tsx` | NGO standing-need management. |
| `/ngo/transports` | `src/app/ngo/transports/page.tsx` | NGO-side transport list. |
| `/ngo/transport/[id]` | `src/app/ngo/transport/[id]/page.tsx` | Transport details for an NGO. |
| `/driver` | `src/app/driver/page.tsx` | Driver logistics dashboard. |
| `/admin` | `src/app/admin/page.tsx` | Admin landing page. |
| `/admin/issues` | `src/app/admin/issues/page.tsx` | Admin issue resolution area. |
| `/admin/live-map` | `src/app/admin/live-map/page.tsx` | Admin map area. |
| `/admin/verifications` | `src/app/admin/verifications/page.tsx` | Admin verification area. |

The global shell is in `src/app/layout.tsx`. It sets page metadata, imports global styles, and renders the navigation and footer around each page. `src/app/globals.css` defines the visual design tokens, responsive/global styling, background effects, and Leaflet CSS.

### Shared components under `src/components`

- `Navbar.tsx`: top-level navigation and account/role-related controls.
- `GlassPanel.tsx`: reusable surface container matching the application's frosted-glass visual style.
- `AnimatedIntro.tsx`: animated introduction/presentation UI.
- `ExpiryCountdown.tsx`: time-left presentation for perishable listings.
- `NotificationCenter.tsx`: notification list and read-state UI.
- `RoleSwitcher.tsx`: UI for switching the selected role/account view.
- `GoogleAuthModal.tsx`: Google-style authentication modal UI; its presence alone does not mean a Google OAuth provider is configured on the server.
- `TieUpRequestModal.tsx`: NGO request form/modal for a listing.
- `ProofModal.tsx`: transport proof display/capture UI.
- `IssueFlagModal.tsx`: issue reporting modal.
- `Map/LiveMap.tsx` and `Map/MapClient.tsx`: map wrapper and client-rendered Leaflet map implementation.

### Shared application logic under `src/lib`

| File | Responsibility |
|---|---|
| `types.ts` | Front-end TypeScript contracts for roles, profiles, listings, requests, transports, issues, notifications, logs, and analytics. |
| `store.ts` | Client-side state/data facade. It reads and writes browser `localStorage`, initializes demo fixtures, offers CRUD-like operations to pages, and syncs selected data from API endpoints. |
| `seed-data.ts` | Sample users, profiles, listings, requests, transports, issues, notifications, and analytics used by the demo and database seed process. |
| `auth.ts` | Server authentication helpers: password hashing/checking, JWT creation/verification, session cookies, resolving the logged-in user, and removing password hashes from user output. |
| `prisma.ts` | Shared Prisma Client singleton, avoiding multiple clients during Next.js development hot reload. |
| `geo.ts` | Distance, ETA, match-score, and simulated-route calculations. |

### API routes under `src/app/api`

API route handlers are server-side code. The route inventory is:

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/auth/register` | `POST` | Validates registration input, creates user and role profile in a database transaction, and establishes a session. |
| `/api/auth/login` | `POST` | Looks up a user, checks a supplied password where applicable, and issues a session cookie. |
| `/api/auth/logout` | `POST` | Ends the current session/cookie. |
| `/api/auth/me` | `GET`, `PATCH` | Reads or updates the current authenticated account. |
| `/api/auth/switch-role` | `POST` | Role-switching endpoint. |
| `/api/users/me` | `GET`, `PATCH` | Current-user profile endpoint. |
| `/api/listings` | `GET`, `POST` | Lists/filter/paginates surplus listings and creates restaurant listings. |
| `/api/standing-needs` | `GET`, `POST` | Reads and creates NGO demand requests. |
| `/api/tie-ups` | `GET`, `POST` | Reads and creates NGO-to-restaurant requests. |
| `/api/tie-ups/[id]/respond` | `POST` | Accepts, declines, or responds to an individual tie-up request. |
| `/api/transports` | `GET` | Reads transport records. |
| `/api/transports/[id]` | `GET`, `PATCH` | Reads a transport and updates its status/proof/OTP information. |
| `/api/issues` | `GET`, `POST` | Reads and reports operational issues. |
| `/api/issues/[id]/resolve` | `POST` | Resolves or dismisses an issue. |
| `/api/notifications` | `GET`, `PATCH` | Reads and updates notification read state. |
| `/api/audit-logs` | `GET` | Reads audit log entries. |
| `/api/analytics` | `GET` | Reads global statistics and refreshes selected live counts. |

Most database mutation handlers obtain the authenticated user through `getAuthenticatedUser()`, use Prisma to write records, and return JSON responses. Some list/read handlers support filters or pagination; check the particular route before relying on access control or exact request fields.

## 4. Main application logic

### Client state and server synchronization

The UI commonly uses `FoodBridgeStore` in `src/lib/store.ts`. In the browser, `FoodBridgeStore.init()` fills missing localStorage keys with seed data. Store updates are saved as JSON strings and dispatch a `foodbridge_state_change` browser event so pages can refresh displayed state. It also starts a non-blocking sync for the current user, listings, tie-ups, transports, and analytics through the corresponding API routes.

This means the current design is hybrid rather than a single universal database path:

- The server-side API and Prisma models are the persistent relational-data path.
- Browser store methods and seed data provide demo behavior and may persist changes only in that browser's localStorage.
- Backend synchronization currently covers a subset of entities; it is not a general bidirectional synchronization engine.
- A page using a local store method should not automatically be assumed to have persisted that change to the database. Follow the call into `store.ts` and its related API call to determine the actual behavior.

### Food listing and matching

Listings describe what food is available, how much remains, when it was prepared, when it expires, its pickup window, and how it can be handed over. The `SurplusListing` record keeps both the original quantity and the current remaining quantity. On the server, the listings API stores dietary tags and photo URLs as JSON text and parses those fields when returning listing results.

`src/lib/geo.ts` implements the matching helpers:

- **Distance:** `calculateDistanceKm` uses the Haversine formula to estimate great-circle distance between latitude/longitude points, with results rounded to 0.1 km.
- **ETA:** `calculateETA` estimates travel at 25 km/h plus a five-minute buffer, with a five-minute minimum. It is a heuristic, not a live traffic/routing service.
- **Match score:** `calculateMatchScore` combines proximity (up to 40 points), expiry urgency (up to 35), quantity fit (up to 15), and logistics alignment (up to 10). It returns a total capped at 100 and a label: Perfect (85+), High (70+), Good (50+), or Standard (below 50).
- **Route interpolation:** `interpolateRoute` generates points on a quadratic curve between two coordinates and adds a small random midpoint offset. This is a visual simulation, not a road-network route or GPS feed.

The discover screen can use the matching and map utilities to prioritize and display listings. The score is a deterministic heuristic for the inputs, not a machine-learning model.

### Request, reservation, and transport lifecycle

The persisted API workflow is centered on `TieUpRequest` and `TransportRecord`:

1. `POST /api/tie-ups` locates the listing and NGO, copies party/listing details onto a new pending tie-up, and notifies the restaurant.
2. `POST /api/tie-ups/[id]/respond` handles the response. On acceptance, it updates tie-up status, subtracts the requested quantity from the listing, chooses a listing status based on remaining quantity, and creates a transport record with initial timeline/tracking data and OTP values.
3. `PATCH /api/transports/[id]` updates transport status, driver fields, optional proof references, and timeline history. It checks a provided pickup OTP for `picked_up` and a delivery OTP for `delivered` or `completed`.
4. When marked delivered or completed, the handler updates platform, restaurant, and NGO impact counters. Food weight, meals, and CO2 savings are derived using fixed conversions in that route.
5. Notification and audit-log rows are created around key transitions.

The API uses database transactions for selected multi-record changes (such as accepting a tie-up and updating delivery impact counters) so those related writes succeed or roll back together.

### Issues, notifications, audit records, analytics

- An issue report creates an `IssueFlag`, changes the transport to `issue`, notifies the other party where a user can be resolved, and records an audit event.
- Notifications are per-user database records with a read flag and optional navigation link.
- `AuditLog` records an actor, action, entity, details, and timestamp. It is an application-level audit history, not a database-enforced immutable ledger.
- `/api/analytics` reads/creates a singleton `PlatformAnalytics` row and recalculates several counts (active listings, pending tie-ups, in-progress transports, and registered restaurant/NGO profiles). Other cumulative measures are updated by transport completion logic.

## 5. Authentication and authorization flow

The server authentication implementation is primarily in `src/lib/auth.ts`:

1. Passwords are processed with `bcryptjs` and 12 rounds.
2. `jose` signs a JWT using HS256. Its payload contains a user ID, role, and email, with a seven-day expiry.
3. The token is stored in the `foodbridge_session` cookie with `HttpOnly`, `SameSite=Lax`, and `Secure` enabled when `NODE_ENV` is production.
4. `getAuthenticatedUser()` verifies the cookie and reloads the account and associated profile from Prisma, then strips `password_hash` before returning user data.
5. `src/middleware.ts` checks JWT validity for restaurant, NGO, driver, and profile URL prefixes and redirects users to login or to a role-specific area.

`JWT_SECRET` must be set to a high-entropy private value outside local demo use. The source contains a development fallback if it is missing, so a deployment must configure the secret explicitly. The database session model exists, but actual token validity in the request path is based on JWT verification and user lookup; the session table is not checked on each request by `getAuthenticatedUser()`.

**Demo/production distinction:** The registration handler currently supplies fallback passwords and placeholder role-profile/legal details when optional fields are missing and sets new users to `verified`. The login request schema also makes email and password optional and contains a preferred-role fallback that can select an active account if no account was found by email. These are not safe production signup/login policies; verify and replace them before using real identities or compliance documents.

## 6. Database system and data model

### Current database selection

In this checkout, `prisma/schema.prisma` uses the SQLite provider. `.env.example` gives the local URL format `file:./dev.db`. The actual path resolution depends on Prisma's schema location/configuration; the checked-in database file is `prisma/dev.db`.

`prisma/schema.postgresql.prisma` is the PostgreSQL variant. The script `scripts/switch-db.js` copies the selected variant to `prisma/schema.prisma`; switching is a source-file change, not a runtime toggle. After switching providers, set `DATABASE_URL` for the target database, generate the Prisma client, and apply migrations/schema as appropriate. Keep both schema variants aligned when the data model changes.

Prisma describes the relational structure and generates client accessors. The foreign keys and indexes enforce important relationships and support common lookup paths. Many fields are modeled as `String` in Prisma even if `src/lib/types.ts` narrows them to TypeScript unions; the TypeScript union does not by itself enforce values in the database.

### Models

| Prisma model | What it represents |
|---|---|
| `User` | Login identity, unique email, password hash, role, verification/account status, and last-login timestamps. |
| `Session` | User-linked session token, expiry, and optional user-agent/IP metadata. |
| `RestaurantProfile` | A restaurant's business/legal information, address and coordinates, logistics capability, photos, and impact/rating totals. |
| `NGOProfile` | An NGO's registration, service area, address/coordinates, capacity, logistics, contacts, and impact totals. |
| `DriverProfile` | Driver identity, license/vehicle/insurance information, service area, and pickup/rating totals. |
| `SurplusListing` | Food listing data, source restaurant, quantity/remaining quantity, category/tags, preparation/expiry and pickup times, packaging, and listing status. |
| `NGONeedRequest` | An NGO's standing demand, desired category/quantity, needed-by time, and request status. |
| `TieUpRequest` | A proposed allocation of listing quantity between an NGO and restaurant, including pickup/transport preferences and decision status. |
| `TransportRecord` | The resulting delivery, parties, driver/vehicle data, OTP verification flags, current coordinates, tracking history, timeline, and proof references. |
| `IssueFlag` | An issue raised against a transport, including category, severity, review status, and resolution information. |
| `AppNotification` | User-targeted notification text, type, link, read state, and creation time. |
| `AuditLog` | Application-level record of an actor's action on an entity. |
| `PlatformAnalytics` | Singleton aggregate metrics for platform-level food, delivery, and impact totals. |

### Relationships and deletion behavior

- A user can have one restaurant, NGO, or driver profile; each profile is linked to its owning user.
- A user has many sessions and notifications.
- A restaurant profile has many surplus listings and incoming tie-up requests.
- An NGO profile has many standing needs and outgoing tie-up requests.
- A surplus listing can have many tie-up requests.
- A tie-up can have one transport record; `tie_up_id` is unique on transport records.
- A transport can have many issue flags.
- Several relations specify cascading deletion, so removing a parent can remove dependent records. Deletion behavior should be considered before operating on real data.

### JSON-like values and dates

Some collections are stored as JSON-encoded text in SQLite-compatible `String` columns rather than as normalized child tables or native JSON types. Examples include listing dietary tags/photo URLs, restaurant photos, driver pincodes, and transport tracking/timeline arrays. API code parses/stringifies these values at the boundary. Malformed JSON in a stored value can make parsing fail.

Times such as `prepared_at`, `expiry_at`, pickup windows, and timestamps use Prisma `DateTime` fields in the database. The front-end types often represent dates as ISO-like strings because JSON responses serialize dates as strings.

## 7. Seed and test utilities

- `prisma/seed.ts` populates database demo accounts and associated sample data from `src/lib/seed-data.ts`. It first deletes records from the database tables in dependency order. **Do not run `npm run db:seed` against a database containing data you need to keep.**
- `src/lib/seed-data.ts` is the shared fixture source for UI/demo entities.
- `scripts/test-database-auth.ts` is a database/auth integration-style script. It checks connectivity and authentication behaviors and creates then deletes test records. It expects a pre-populated database (including a sample user and analytics row), and it writes to the configured database. Point it only at a disposable development/test database.
- `prisma/migrations/20260927165057_init/migration.sql` is the initial SQL migration; `prisma/migrations/migration_lock.toml` records the migration provider.
- `prisma/dev.db` is a local SQLite database file, not source code. Handle it as mutable local data.

## 8. Environment settings

See `.env.example` for setting names. The application uses:

- `DATABASE_URL`: Prisma connection string for the active schema provider.
- `JWT_SECRET`: secret key used to sign/verify session JWTs.
- `SESSION_EXPIRY_DAYS`: documented in the example configuration; current auth helper uses a fixed seven-day expiry.
- `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_APP_URL`: public app metadata/configuration.
- Optional service settings are listed for possible map/SMS integrations; a listed variable does not prove that the corresponding service is currently wired up.

Never include real database URLs, signing keys, or API credentials in documentation, source control, screenshots, or bug reports.

## 9. Notes before production use

The project contains a substantial UI and database-backed API, but several things need an explicit production review:

- Align the client `FoodBridgeStore` behavior with the API so user actions persist consistently for all accounts/devices, rather than depending on seeded localStorage state.
- Replace demo authentication shortcuts and placeholder legal/profile values with required-field validation and a real verification workflow.
- Enforce authorization for every API operation, including reads and role/ownership checks; middleware alone does not secure API handlers.
- Validate quantities, date ranges, enum-like values, OTP state transitions, and ownership server-side. Client form validation is not a security boundary.
- Use a cryptographically secure OTP generator, store/compare OTPs safely, and implement attempt limits and expiry before real deliveries.
- Avoid returning contact details before the intended confirmation point; ensure API responses enforce the same privacy policy as the UI.
- Configure a strong `JWT_SECRET`, database backups, migration deployment, transport/storage security, rate limiting, and operational monitoring.
- Make map routing/location updates use an actual provider or authenticated GPS source if real-time navigation is required; the route interpolation helper creates a visual simulated path.
- Review impact metric conversion constants and idempotency so repeated delivery status updates cannot count the same donation more than once.

## 10. Local setup outline

1. Install Node.js and npm, then run `npm install`.
2. Copy `.env.example` to `.env` and configure `DATABASE_URL` and a private `JWT_SECRET`.
3. Ensure the active Prisma schema matches the selected provider.
4. Run `npm run db:generate`, then use the repository's migration or schema-push workflow for the local database.
5. Optionally run `npm run db:seed` against a disposable local database to load demo data.
6. Start the app with `npm run dev`.

For PostgreSQL, select the PostgreSQL schema first, configure the actual PostgreSQL URL, generate the Prisma client, and deploy/apply schema migrations to that database. The schema-switch script overwrites the active schema file, so keep the worktree clean or preserve any intentional schema edits before switching providers.
