'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FoodBridgeStore } from '@/lib/store';
import {
  SurplusListing,
  NGOProfile,
  FoodCategory,
  DietaryTag,
} from '@/lib/types';
import { calculateDistanceKm, formatDistance, calculateMatchScore } from '@/lib/geo';
import LiveMap from '@/components/Map/LiveMap';
import ExpiryCountdown from '@/components/ExpiryCountdown';
import TieUpRequestModal from '@/components/TieUpRequestModal';
import GlassPanel from '@/components/GlassPanel';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  HeartHandshake,
  Utensils,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';

type SortOption = 'smart_match' | 'nearest' | 'expiring_soonest' | 'largest_quantity';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('selected') || searchParams.get('highlight');

  const [currentNgo, setCurrentNgo] = useState<NGOProfile | null>(null);
  const [listings, setListings] = useState<SurplusListing[]>([]);

  // Filter States
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(20);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<DietaryTag[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('smart_match');
  const [minQuantityNeeded, setMinQuantityNeeded] = useState<number>(0);

  // Selected Listing for Modal
  const [selectedListing, setSelectedListing] = useState<SurplusListing | null>(null);
  const [isTieUpModalOpen, setIsTieUpModalOpen] = useState(false);

  // Layout View Mode: map-first split or list view
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  const loadData = () => {
    const user = FoodBridgeStore.getCurrentUser();
    const ngo = FoodBridgeStore.getNGOByUserId(user.id) || FoodBridgeStore.getNGOs()[0];
    setCurrentNgo(ngo);
    setListings(FoodBridgeStore.getListings().filter((l) => l.status === 'available' || l.status === 'partially_reserved'));
  };

  useEffect(() => {
    FoodBridgeStore.init();
    loadData();
    window.addEventListener('foodbridge_state_change', loadData);
    return () => window.removeEventListener('foodbridge_state_change', loadData);
  }, []);

  useEffect(() => {
    if (highlightId && listings.length > 0) {
      const match = listings.find((l) => l.id === highlightId);
      if (match) {
        setSelectedListing(match);
        setIsTieUpModalOpen(true);
      }
    }
  }, [highlightId, listings]);

  const ngoLat = currentNgo?.lat || 12.9645;
  const ngoLng = currentNgo?.lng || 77.6015;

  const processedListings = useMemo(() => {
    return listings
      .map((item) => {
        const distanceKm = calculateDistanceKm(ngoLat, ngoLng, item.restaurant_lat, item.restaurant_lng);
        const minutesUntilExpiry = Math.round((new Date(item.expiry_at).getTime() - Date.now()) / 60000);
        const isUrgent = minutesUntilExpiry <= 120; // under 2 hours
        const match = calculateMatchScore({
          distanceKm,
          maxRadiusKm: selectedRadiusKm,
          minutesUntilExpiry,
          listingQuantity: item.remaining_quantity,
          requestedQuantity: minQuantityNeeded > 0 ? minQuantityNeeded : undefined,
          restaurantLogistics: item.logistics_offer,
          ngoHasTransport: currentNgo?.has_own_transport ?? true,
        });

        return {
          ...item,
          distanceKm,
          minutesUntilExpiry,
          isUrgent,
          matchScore: match.score,
          matchLabel: match.label,
        };
      })
      .filter((item) => {
        if (item.distanceKm > selectedRadiusKm) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchRest = item.restaurant_name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchTitle && !matchRest && !matchDesc) return false;
        }

        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        if (selectedDietaryTags.length > 0) {
          const hasAll = selectedDietaryTags.every((t) => item.dietary_tags.includes(t));
          if (!hasAll) return false;
        }

        if (minQuantityNeeded > 0 && item.remaining_quantity < minQuantityNeeded) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'smart_match') return b.matchScore - a.matchScore;
        if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
        if (sortBy === 'expiring_soonest') return a.minutesUntilExpiry - b.minutesUntilExpiry;
        if (sortBy === 'largest_quantity') return b.remaining_quantity - a.remaining_quantity;
        return 0;
      });
  }, [listings, ngoLat, ngoLng, selectedRadiusKm, searchQuery, selectedCategory, selectedDietaryTags, sortBy, minQuantityNeeded, currentNgo]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedDietaryTags.length +
    (selectedRadiusKm !== 20 ? 1 : 0) +
    (minQuantityNeeded > 0 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const toggleDietaryTag = (tag: DietaryTag) => {
    if (selectedDietaryTags.includes(tag)) {
      setSelectedDietaryTags(selectedDietaryTags.filter((t) => t !== tag));
    } else {
      setSelectedDietaryTags([...selectedDietaryTags, tag]);
    }
  };

  const handleOpenTieUp = (listing: SurplusListing) => {
    setSelectedListing(listing);
    setIsTieUpModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Hero Moment: Warm, plain-spoken, not a cold stat block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-trust mb-1">
            <span className="w-2 h-2 rounded-full bg-accent-trust" />
            <span>Field radius for {currentNgo?.org_name || 'Annam Relief Foundation'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {processedListings.length} {processedListings.length === 1 ? 'kitchen' : 'kitchens'} near you have food ready now
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
            Live interactive map of surplus meals. Request a direct pickup before each kitchen's safe consumption window closes.
          </p>
        </div>

        {/* Layout View Mode Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <GlassPanel variant="subtle" className="p-1 flex items-center rounded-2xl">
            <button
              onClick={() => setViewMode('split')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Split view
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Map only
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              List only
            </button>
          </GlassPanel>
        </div>
      </div>

      {/* Collapsible Glass Filter Panel (Avoids an overwhelming wall of dropdowns) */}
      <GlassPanel variant="standard" className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, cuisine, or restaurant name..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-white/80 bg-white/60 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-accent-primary focus:outline-none placeholder:text-ink-light"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="min-h-[44px] py-2 px-3.5 rounded-2xl border border-white/80 bg-white/70 text-xs font-semibold text-ink focus:ring-2 focus:ring-accent-primary focus:outline-none"
            >
              <option value="smart_match">Best match for your NGO</option>
              <option value="nearest">Closest distance first</option>
              <option value="expiring_soonest">Expiring soonest (urgent)</option>
              <option value="largest_quantity">Largest food quantity</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-colors border ${
                isFilterExpanded || activeFilterCount > 0
                  ? 'bg-ink text-white border-ink shadow-xs'
                  : 'bg-white/60 text-ink-muted border-white/80 hover:bg-white hover:text-ink'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent-primary text-white text-[11px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {isFilterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Drawer */}
        {isFilterExpanded && (
          <div className="pt-4 border-t border-stone-200/50 grid grid-cols-1 sm:grid-cols-3 gap-5 animate-in fade-in duration-150">
            {/* Radius Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-semibold text-ink">Search distance</span>
                <span className="font-bold tabular-nums text-accent-trust">{selectedRadiusKm} km radius</span>
              </div>
              <input
                type="range"
                min={2}
                max={35}
                step={1}
                value={selectedRadiusKm}
                onChange={(e) => setSelectedRadiusKm(Number(e.target.value))}
                className="w-full accent-accent-trust h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-ink-light">
                <span>2 km</span>
                <span>35 km</span>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">Food category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-2xl border border-white/80 bg-white/70 text-xs font-medium text-ink focus:outline-none"
              >
                <option value="all">All food types</option>
                <option value="cooked_meals">Cooked meals and buffet</option>
                <option value="packaged">Packaged meal boxes</option>
                <option value="bakery">Bakery and bread</option>
                <option value="produce">Fresh produce</option>
                <option value="dairy_beverages">Dairy and beverages</option>
              </select>
            </div>

            {/* Minimum quantity needed */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink">Minimum portions needed</label>
              <input
                type="number"
                min={0}
                placeholder="Any quantity (e.g. 30)"
                value={minQuantityNeeded || ''}
                onChange={(e) => setMinQuantityNeeded(Number(e.target.value))}
                className="w-full py-2 px-3 rounded-2xl border border-white/80 bg-white/70 text-xs font-semibold text-ink focus:outline-none"
              />
            </div>

            {/* Dietary Tags */}
            <div className="sm:col-span-3 space-y-2 pt-2 border-t border-stone-200/40">
              <span className="text-xs font-semibold text-ink block">Dietary preferences</span>
              <div className="flex flex-wrap gap-2">
                {(['veg', 'non-veg', 'vegan', 'halal', 'jain', 'gluten_free'] as DietaryTag[]).map((tag) => {
                  const isSel = selectedDietaryTags.includes(tag);
                  const labels: Record<string, string> = {
                    veg: 'Vegetarian',
                    'non-veg': 'Non-vegetarian',
                    vegan: 'Vegan',
                    halal: 'Halal',
                    jain: 'Jain friendly',
                    gluten_free: 'Gluten free',
                  };
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietaryTag(tag)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSel
                          ? 'bg-accent-trust text-white border-accent-trust shadow-xs'
                          : 'bg-white/60 text-ink-muted border-white/80 hover:bg-white'
                      }`}
                    >
                      {isSel ? '✓ ' : ''}{labels[tag]}
                    </button>
                  );
                })}

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedDietaryTags([]);
                      setSelectedRadiusKm(20);
                      setMinQuantityNeeded(0);
                      setSearchQuery('');
                    }}
                    className="min-h-[36px] text-xs font-semibold text-accent-alert hover:underline px-2 py-1"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Main Map & Discovery Content */}
      <div
        className={`grid gap-6 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
        }`}
      >
        {/* Interactive Map Anchor */}
        {viewMode !== 'list' && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-7' : 'w-full'} space-y-3`}>
            <GlassPanel variant="prominent" className="p-4 h-[540px] flex flex-col space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-trust" />
                  <span className="font-semibold text-xs text-ink">
                    {processedListings.length} pickup locations within {selectedRadiusKm} km
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted">Tap any map pin to view pickup details</span>
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden border border-white/80 shadow-inner">
                <LiveMap
                  listings={processedListings}
                  center={[ngoLat, ngoLng]}
                  zoom={12}
                  userLocation={[ngoLat, ngoLng]}
                  showRadiusKm={selectedRadiusKm}
                  onSelectListing={(l) => handleOpenTieUp(l)}
                  className="h-full"
                />
              </div>
            </GlassPanel>
          </div>
        )}

        {/* Listings Cards Column (Varied Card Sizes by Urgency) */}
        {viewMode !== 'map' && (
          <div
            className={`${
              viewMode === 'split'
                ? 'lg:col-span-6 xl:col-span-5'
                : 'w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
            } space-y-4`}
          >
            {processedListings.length === 0 ? (
              <GlassPanel variant="standard" className="p-12 text-center space-y-3">
                <Utensils className="w-10 h-10 text-ink-light mx-auto" />
                <h3 className="font-serif font-bold text-ink text-base">No surplus listings match your current filters</h3>
                <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                  Try expanding your search distance or clearing dietary options to see listings across the city.
                </p>
                <button
                  onClick={() => {
                    setSelectedRadiusKm(30);
                    setSelectedCategory('all');
                    setSelectedDietaryTags([]);
                    setSearchQuery('');
                  }}
                  className="min-h-[44px] px-5 py-2 rounded-2xl bg-ink text-white font-semibold text-xs shadow-sm hover:bg-black transition-colors"
                >
                  Reset all filters
                </button>
              </GlassPanel>
            ) : (
              processedListings.map((item) => {
                // Urgent cards get prominent treatment, warmer border, and larger prominence
                const isUrgent = item.isUrgent;

                return (
                  <GlassPanel
                    key={item.id}
                    variant={isUrgent ? 'prominent' : 'standard'}
                    hoverLift
                    className={`overflow-hidden flex flex-col justify-between transition-all ${
                      isUrgent
                        ? 'border-2 border-accent-alert/50 shadow-[0_12px_36px_rgba(196,82,46,0.12)]'
                        : 'border border-white/80'
                    }`}
                  >
                    <div className="p-5 space-y-3.5">
                      {/* Urgency and Distance header */}
                      <div className="flex items-center justify-between gap-2">
                        {isUrgent ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-alert-subtle text-accent-alert border border-accent-alert/40 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-alert animate-ping" />
                            Expiring soon
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-trust-subtle text-accent-trust border border-accent-trust/20">
                            {item.matchScore}% match
                          </span>
                        )}

                        <span className="text-xs font-semibold text-ink-muted flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-accent-trust" />
                          {formatDistance(item.distanceKm)} away
                        </span>
                      </div>

                      {/* Main visual & Dish Title */}
                      <div className="flex gap-3.5 items-start">
                        <img
                          src={item.photo_urls[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                          alt={item.title}
                          className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-white/80 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif font-bold text-sm text-ink leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-ink-muted mt-0.5 font-medium">{item.restaurant_name}</p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <ExpiryCountdown expiryAt={item.expiry_at} compact />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Details Strip */}
                      <div className="p-3 rounded-2xl bg-white/50 border border-white/80 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-ink-muted">Available portions</span>
                          <strong className="text-ink font-bold text-sm tabular-nums">
                            {item.remaining_quantity} {item.unit}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-ink-muted">Transport</span>
                          <span className="text-ink font-medium capitalize">
                            {item.logistics_offer.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-white/40 border-t border-white/70 flex items-center justify-between">
                      <span className="text-[11px] text-ink-light">Direct phone shared on pickup request</span>
                      <button
                        onClick={() => handleOpenTieUp(item)}
                        className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-semibold text-xs shadow-sm transition-all flex items-center gap-2 ${
                          isUrgent
                            ? 'bg-accent-alert hover:bg-accent-alert-hover text-white shadow-[0_4px_16px_rgba(196,82,46,0.25)]'
                            : 'bg-accent-trust hover:bg-accent-trust-hover text-white shadow-[0_4px_16px_rgba(47,110,82,0.25)]'
                        }`}
                      >
                        <HeartHandshake className="w-4 h-4" />
                        <span>Request pickup</span>
                      </button>
                    </div>
                  </GlassPanel>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Tie-Up Modal */}
      {selectedListing && (
        <TieUpRequestModal
          isOpen={isTieUpModalOpen}
          onClose={() => {
            setIsTieUpModalOpen(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          currentNGO={currentNgo || undefined}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent-trust mx-auto" />
          <p className="text-xs font-semibold text-ink-muted">Loading surplus food map...</p>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
