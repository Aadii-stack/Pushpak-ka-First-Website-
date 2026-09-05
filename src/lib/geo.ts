/**
 * Geolocation and Distance Calculation Utilities
 */

// Haversine formula to compute distance in kilometers between two geo-coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Calculate ETA based on urban speed (avg 25 km/h + pickup buffer)
export function calculateETA(distanceKm: number): number {
  const avgSpeedKmh = 25;
  const travelMinutes = (distanceKm / avgSpeedKmh) * 60;
  return Math.max(5, Math.round(travelMinutes + 5)); // Minimum 5 mins buffer
}

/**
 * Smart Ranking Algorithm for NGO Discovery
 * Combines:
 * 1. Proximity Score (0-40 pts): Closer = higher
 * 2. Urgency Score (0-35 pts): Expiring soonest (safe window) = highest priority
 * 3. Quantity Fit (0-15 pts): Stated need vs surplus
 * 4. Logistics Match (0-10 pts): e.g. Self-deliver or NGO has transport
 */
export function calculateMatchScore(params: {
  distanceKm: number;
  maxRadiusKm?: number;
  minutesUntilExpiry: number;
  listingQuantity: number;
  requestedQuantity?: number;
  restaurantLogistics: string;
  ngoHasTransport: boolean;
}): { score: number; label: 'Perfect Match' | 'High Match' | 'Good Match' | 'Standard'; color: string } {
  const {
    distanceKm,
    maxRadiusKm = 25,
    minutesUntilExpiry,
    listingQuantity,
    requestedQuantity,
    restaurantLogistics,
    ngoHasTransport,
  } = params;

  // Proximity (0-40)
  const proximityRatio = Math.max(0, 1 - distanceKm / maxRadiusKm);
  const proximityScore = proximityRatio * 40;

  // Urgency (0-35): Listings with 1-4 hours left get maximum urgency score
  let urgencyScore = 0;
  if (minutesUntilExpiry <= 0) {
    urgencyScore = 0; // Expired
  } else if (minutesUntilExpiry <= 120) {
    urgencyScore = 35; // Critical urgency
  } else if (minutesUntilExpiry <= 360) {
    urgencyScore = 28;
  } else if (minutesUntilExpiry <= 720) {
    urgencyScore = 20;
  } else {
    urgencyScore = 12;
  }

  // Quantity fit (0-15)
  let quantityScore = 10;
  if (requestedQuantity && requestedQuantity > 0) {
    if (listingQuantity >= requestedQuantity) {
      quantityScore = 15;
    } else {
      quantityScore = Math.round((listingQuantity / requestedQuantity) * 12);
    }
  }

  // Logistics alignment (0-10)
  let logisticsScore = 5;
  if (restaurantLogistics === 'self_deliver') {
    logisticsScore = 10;
  } else if (ngoHasTransport && (restaurantLogistics === 'pickup_only' || restaurantLogistics === 'staff_handoff_cold_storage')) {
    logisticsScore = 10;
  } else if (!ngoHasTransport && restaurantLogistics === 'pickup_only') {
    logisticsScore = 2; // Needs third party or volunteer driver
  }

  const total = Math.min(100, Math.round(proximityScore + urgencyScore + quantityScore + logisticsScore));

  if (total >= 85) return { score: total, label: 'Perfect Match', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (total >= 70) return { score: total, label: 'High Match', color: 'bg-green-100 text-green-800 border-green-300' };
  if (total >= 50) return { score: total, label: 'Good Match', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  return { score: total, label: 'Standard', color: 'bg-slate-100 text-slate-700 border-slate-300' };
}

// Generate points along a route between origin and destination with natural curvature
export function interpolateRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  steps: number = 10
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  
  // Slight wobble for realistic road simulation
  const midLatOffset = (Math.random() - 0.5) * 0.005;
  const midLngOffset = (Math.random() - 0.5) * 0.005;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve with a slight offset midpoint
    const midLat = (startLat + endLat) / 2 + midLatOffset;
    const midLng = (startLng + endLng) / 2 + midLngOffset;

    const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * midLat + t * t * endLat;
    const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * midLng + t * t * endLng;
    points.push({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
  }
  return points;
}
