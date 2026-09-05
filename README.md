# 🍲 FoodBridge — Restaurant Surplus-to-NGO Platform

> **Zero Food Waste. Zero Hunger.**
> A full-stack platform that seamlessly connects restaurants, banquet halls, and food businesses with surplus food to verified hunger relief NGOs. Complete with real-time GPS tracking, safe shelf-life countdowns, smart ranking, OTP verification handoffs, and operational dispute management.

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

## 🚀 Instant Demo Quick Switcher

FoodBridge includes a built-in **Role Switcher** in the top navigation bar:
- 👨‍🍳 **Restaurant Manager** (`Chef Rajesh Sharma` — *Green Garden Bistro*)
- 🏢 **NGO Coordinator** (`Anita Deshmukh` — *Annam Relief Foundation*)
- 🛡️ **Admin Operations** (`FoodBridge HQ Command`)
- 🚚 **Field Logistics Volunteer** (`Vikram Singh`)

Switch between any perspective with a single click to test the full lifecycle end-to-end!

---

## 🛠️ Tech Stack & Architecture

- **Frontend / Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS with custom eco-palette & responsive design
- **Maps & Geolocation**: Leaflet + OpenStreetMap (no external API keys required, with full GPS simulation engine)
- **State & Data Layer**: Reactive localStorage store with seed data, event bus, and audit logging
- **Icons**: Lucide React

---

## 📦 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
http://localhost:3000
```
