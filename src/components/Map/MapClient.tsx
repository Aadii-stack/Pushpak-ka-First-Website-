'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SurplusListing, TransportRecord, NGOProfile } from '@/lib/types';

interface Props {
  listings?: SurplusListing[];
  transports?: TransportRecord[];
  ngos?: NGOProfile[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string;
  onSelectListing?: (listing: SurplusListing) => void;
  onSelectTransport?: (transport: TransportRecord) => void;
  showRadiusKm?: number;
  userLocation?: [number, number];
}

export default function MapClient({
  listings = [],
  transports = [],
  ngos = [],
  center = [12.9716, 77.5946], // Bangalore Default
  zoom = 13,
  selectedId,
  onSelectListing,
  onSelectTransport,
  showRadiusKm,
  userLocation,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker | L.Circle | L.Polyline }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      // CartoDB Voyager clean warm tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    Object.values(markersRef.current).forEach((layer) => layer.remove());
    markersRef.current = {};

    // Helper SVG icon generator matching Golden Hour Glass palette
    const createCustomIcon = (type: 'restaurant' | 'ngo' | 'driver' | 'user', color: string, iconSymbol: string) => {
      const isDriver = type === 'driver';
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center">
            ${isDriver ? '<div class="absolute w-8 h-8 rounded-full bg-[#2F6E52] opacity-60 radar-dot"></div>' : ''}
            <div style="background-color: ${color};" class="relative z-10 w-9 h-9 rounded-full border-2 border-white shadow-[0_4px_12px_rgba(34,40,43,0.18)] flex items-center justify-center text-white font-bold text-xs transition-transform hover:scale-110">
              ${iconSymbol}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });
    };

    // User / Current NGO Location Radius Circle
    if (userLocation && showRadiusKm) {
      const radiusCircle = L.circle(userLocation, {
        radius: showRadiusKm * 1000,
        color: '#2F6E52',
        fillColor: '#CFE8CB',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);
      markersRef.current['user_radius'] = radiusCircle;

      const userMarker = L.marker(userLocation, {
        icon: createCustomIcon('user', '#2F6E52', '📍'),
      })
        .addTo(map)
        .bindPopup(`
          <div class="p-3">
            <div class="font-bold text-xs text-[#22282B]">Your NGO base location</div>
            <div class="text-[11px] text-[#5C6660]">Searching within ${showRadiusKm} km radius</div>
          </div>
        `);
      markersRef.current['user_loc'] = userMarker;
    }

    // 1. Render Listings (Restaurants with surplus food)
    listings.forEach((listing) => {
      if (!listing.restaurant_lat || !listing.restaurant_lng) return;
      const isSelected = selectedId === listing.id;
      const icon = createCustomIcon('restaurant', isSelected ? '#C4522E' : '#E8863A', '🍲');

      const marker = L.marker([listing.restaurant_lat, listing.restaurant_lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="p-3.5 max-w-[260px] space-y-2 font-sans">
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF7F2] text-[#2F6E52] capitalize">
                ${listing.category.replace(/_/g, ' ')}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF3E8] text-[#E8863A]">
                ${listing.remaining_quantity} ${listing.unit}
              </span>
            </div>
            <h4 class="font-serif font-bold text-xs text-[#22282B] leading-snug">${listing.title}</h4>
            <div class="text-[11px] text-[#5C6660]">${listing.restaurant_name}</div>
            <div class="text-[10px] text-[#8C9690] truncate">${listing.restaurant_address}</div>
            <div class="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span class="text-[10px] font-medium text-[#2F6E52]">Available now</span>
              <a href="/ngo/discover?selected=${listing.id}" class="px-3 py-1 rounded-xl bg-[#2F6E52] hover:bg-[#255841] text-white text-[11px] font-semibold transition-colors">
                Request pickup
              </a>
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectListing) onSelectListing(listing);
      });

      markersRef.current[`list_${listing.id}`] = marker;
    });

    // 2. Render NGOs
    ngos.forEach((ngo) => {
      if (!ngo.lat || !ngo.lng) return;
      const icon = createCustomIcon('ngo', '#22282B', '🏢');
      const marker = L.marker([ngo.lat, ngo.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="p-3 max-w-[240px] space-y-1">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF7F2] text-[#2F6E52]">NGO partner</span>
            <h4 class="font-serif font-bold text-xs text-[#22282B] mt-1">${ngo.org_name}</h4>
            <p class="text-[11px] text-[#5C6660]">${ngo.service_area}</p>
            <div class="text-[10px] text-[#8C9690]">Capacity: ${ngo.capacity_per_day} meals/day</div>
          </div>
        `);
      markersRef.current[`ngo_${ngo.id}`] = marker;
    });

    // 3. Render Active Transports / Live Drivers
    transports.forEach((transport) => {
      if (!transport.current_lat || !transport.current_lng) return;
      const isSelected = selectedId === transport.id;
      const icon = createCustomIcon('driver', '#2F6E52', '🚚');

      const marker = L.marker([transport.current_lat, transport.current_lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="p-3.5 max-w-[260px] space-y-1.5 font-sans">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF7F2] text-[#2F6E52] capitalize">
                ${transport.status.replace(/_/g, ' ')}
              </span>
              <span class="text-[10px] font-semibold text-[#22282B]">ETA: ~${transport.estimated_arrival_minutes || 10}m</span>
            </div>
            <h4 class="font-serif font-bold text-xs text-[#22282B]">${transport.listing_title}</h4>
            <div class="text-[11px] text-[#5C6660]">
              Driver: <strong class="text-[#22282B]">${transport.driver_name}</strong> (${transport.vehicle_number})
            </div>
            <div class="text-[10px] text-[#5C6660]">
              To: ${transport.ngo_name}
            </div>
            <div class="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
              <span class="text-[10px] text-[#5C6660]">Portions: ${transport.quantity} ${transport.unit}</span>
              <a href="/ngo/transport/${transport.id}" class="px-3 py-1 rounded-xl bg-[#22282B] hover:bg-black text-white text-[11px] font-semibold transition-colors">
                Live track
              </a>
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectTransport) onSelectTransport(transport);
      });

      markersRef.current[`trans_${transport.id}`] = marker;

      // Draw Route Polyline from Restaurant to NGO
      if (transport.restaurant_lat && transport.ngo_lat) {
        const routeLine = L.polyline(
          [
            [transport.restaurant_lat, transport.restaurant_lng],
            [transport.current_lat, transport.current_lng],
            [transport.ngo_lat, transport.ngo_lng],
          ],
          {
            color: '#2F6E52',
            weight: 3.5,
            opacity: 0.85,
            dashArray: transport.status === 'in_transit' ? '6, 8' : undefined,
          }
        ).addTo(map);
        markersRef.current[`route_${transport.id}`] = routeLine;
      }
    });
  }, [listings, transports, ngos, center, zoom, selectedId, showRadiusKm, userLocation]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />;
}
