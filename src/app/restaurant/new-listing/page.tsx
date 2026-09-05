'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FoodBridgeStore } from '@/lib/store';
import { FoodCategory, FoodUnit, DietaryTag, PackagingStatus, LogisticsCapability } from '@/lib/types';
import GlassPanel from '@/components/GlassPanel';
import {
  Utensils,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Package,
} from 'lucide-react';

const FOOD_CATEGORIES: { id: FoodCategory; label: string; icon: string }[] = [
  { id: 'cooked_meals', label: 'Cooked meals or buffet', icon: '🍲' },
  { id: 'packaged', label: 'Packaged meal boxes', icon: '🍱' },
  { id: 'bakery', label: 'Bakery and bread', icon: '🍞' },
  { id: 'produce', label: 'Fresh produce and greens', icon: '🥗' },
  { id: 'dairy_beverages', label: 'Dairy and beverages', icon: '🥛' },
  { id: 'buffet_surplus', label: 'Banquet bulk surplus', icon: '🥘' },
];

const DIETARY_OPTIONS: { id: DietaryTag; label: string }[] = [
  { id: 'veg', label: 'Vegetarian' },
  { id: 'non-veg', label: 'Non-vegetarian' },
  { id: 'vegan', label: '100% Vegan' },
  { id: 'halal', label: 'Halal prepared' },
  { id: 'jain', label: 'Jain friendly' },
  { id: 'gluten_free', label: 'Gluten free' },
];

const SAMPLE_PHOTOS = [
  { label: 'Buffet trays', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Meal boxes', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Bakery items', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80' },
  { label: 'Fresh salads', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80' },
];

export default function NewListingPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FoodCategory>('cooked_meals');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<FoodUnit>('servings');
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(['veg']);
  const [description, setDescription] = useState('');
  const [packagingStatus, setPackagingStatus] = useState<PackagingStatus>('sealed_containers');
  const [logisticsOffer, setLogisticsOffer] = useState<LogisticsCapability>('staff_handoff_cold_storage');
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTOS[0].url);

  // Time & Shelf-life state
  const [shelfLifeHours, setShelfLifeHours] = useState<number>(4);
  const [pickupWindowHours, setPickupWindowHours] = useState<number>(2.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDietaryTag = (tag: DietaryTag) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter((t) => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  // Determine warmth of shelf-life card: sage -> marigold -> rust red
  const getShelfLifeTheme = () => {
    if (shelfLifeHours <= 2) {
      return {
        bg: 'bg-accent-alert-subtle/80',
        border: 'border-accent-alert/40',
        text: 'text-accent-alert',
        badge: 'bg-accent-alert/15 text-accent-alert',
        label: 'Urgent safe window',
      };
    }
    if (shelfLifeHours <= 4) {
      return {
        bg: 'bg-accent-primary-subtle/80',
        border: 'border-accent-primary/40',
        text: 'text-accent-primary-hover',
        badge: 'bg-accent-primary/15 text-accent-primary-hover',
        label: 'Moderate window',
      };
    }
    return {
      bg: 'bg-accent-trust-subtle/80',
      border: 'border-accent-trust/30',
      text: 'text-accent-trust',
      badge: 'bg-accent-trust/15 text-accent-trust',
      label: 'Fresh window',
    };
  };

  const shelfTheme = getShelfLifeTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      const user = FoodBridgeStore.getCurrentUser();
      const rest = FoodBridgeStore.getRestaurantByUserId(user.id) || FoodBridgeStore.getRestaurants()[0];

      const now = Date.now();
      const expiryAt = new Date(now + shelfLifeHours * 3600 * 1000).toISOString();
      const pickupStart = new Date(now).toISOString();
      const pickupEnd = new Date(now + pickupWindowHours * 3600 * 1000).toISOString();

      FoodBridgeStore.createListing({
        restaurant_id: rest.id,
        restaurant_name: rest.business_name,
        restaurant_address: rest.address,
        restaurant_lat: rest.lat,
        restaurant_lng: rest.lng,
        restaurant_phone: rest.phone,
        title: title.trim(),
        category,
        description: description.trim(),
        quantity: Number(quantity),
        unit,
        dietary_tags: dietaryTags,
        prepared_at: new Date(now - 30 * 60000).toISOString(),
        expiry_at: expiryAt,
        pickup_window_start: pickupStart,
        pickup_window_end: pickupEnd,
        packaging_status: packagingStatus,
        photo_urls: [selectedPhoto],
        logistics_offer: logisticsOffer,
      });

      router.push('/restaurant/listings');
    } catch (err: any) {
      alert(err.message || 'Error creating listing');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <Link
          href="/restaurant"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl glass-subtle hover:bg-white/80 text-ink-muted hover:text-ink transition-colors"
          aria-label="Back to restaurant overview"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">List surplus food</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Share food ready in your kitchen now with nearby verified relief NGOs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassPanel variant="standard" className="p-6 sm:p-8 space-y-7">
          {/* Category selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-ink">
              Food category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FOOD_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`min-h-[48px] p-3.5 rounded-2xl text-left transition-all flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-white border-accent-primary/50 text-ink shadow-[0_4px_16px_rgba(232,134,58,0.15)] ring-2 ring-accent-primary font-semibold'
                        : 'bg-white/40 border-white/70 hover:bg-white/70 text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{cat.icon}</span>
                    <span className="text-xs leading-snug">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dish Title & Description */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink">
                Dish name or description
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="For example: 50 servings paneer makhani, cumin rice and roti"
                className="w-full text-sm font-medium p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none placeholder:text-ink-light"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink">
                Preparation notes and allergens
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention storage temperature, preparation time, allergen notes (nuts, dairy), and handling..."
                className="w-full text-xs font-normal p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none placeholder:text-ink-light resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink">
                Available quantity
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink">
                Portion unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as FoodUnit)}
                className="w-full text-sm font-medium p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none"
              >
                <option value="servings">Individual servings</option>
                <option value="boxes">Packed meal boxes</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="trays">Buffet trays</option>
                <option value="liters">Liters</option>
                <option value="meals">Complete meal kits</option>
              </select>
            </div>
          </div>

          {/* Dietary tags */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-ink">
              Dietary preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((tag) => {
                const isSel = dietaryTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleDietaryTag(tag.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSel
                        ? 'bg-accent-trust text-white border-accent-trust shadow-sm'
                        : 'bg-white/50 text-ink-muted border-white/80 hover:bg-white'
                    }`}
                  >
                    {isSel ? '✓ ' : ''}{tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Safe Shelf-Life Component (warms in color as expiry gets closer) */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 space-y-4 ${shelfTheme.bg} ${shelfTheme.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                <Clock className={`w-4 h-4 ${shelfTheme.text}`} />
                <span>Safe consumption and pickup window</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${shelfTheme.badge}`}>
                {shelfTheme.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-ink-muted">Safe consumption threshold</span>
                  <span className={`font-bold tabular-nums text-sm ${shelfTheme.text}`}>
                    {shelfLifeHours} hours
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={0.5}
                  value={shelfLifeHours}
                  onChange={(e) => setShelfLifeHours(Number(e.target.value))}
                  className="w-full accent-accent-primary h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-ink-muted">
                  The listing automatically closes once this safe window completes.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-ink-muted">Latest pickup deadline</span>
                  <span className="font-bold tabular-nums text-sm text-ink">
                    {pickupWindowHours} hours
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={Math.min(12, shelfLifeHours)}
                  step={0.5}
                  value={pickupWindowHours}
                  onChange={(e) => setPickupWindowHours(Number(e.target.value))}
                  className="w-full accent-accent-primary h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-ink-muted">
                  Latest time the NGO team should arrive at your kitchen handoff dock.
                </p>
              </div>
            </div>
          </div>

          {/* Packaging and Logistics support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink">
                Current packaging state
              </label>
              <select
                value={packagingStatus}
                onChange={(e) => setPackagingStatus(e.target.value as PackagingStatus)}
                className="w-full text-xs font-medium p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none"
              >
                <option value="sealed_containers">Sealed stainless or thermal containers</option>
                <option value="packed">Individually portioned meal boxes</option>
                <option value="bulk_containers">Bulk cauldrons (NGO must bring containers)</option>
                <option value="needs_packing">Needs packing during handoff</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-ink">
                Restaurant transport support
              </label>
              <select
                value={logisticsOffer}
                onChange={(e) => setLogisticsOffer(e.target.value as LogisticsCapability)}
                className="w-full text-xs font-medium p-3.5 rounded-2xl border border-white/80 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-primary focus:outline-none"
              >
                <option value="staff_handoff_cold_storage">Kitchen staff handoff from cold dock</option>
                <option value="self_deliver">Restaurant can self-deliver within 6 km</option>
                <option value="pickup_only">Pickup only (NGO vehicle needed)</option>
              </select>
            </div>
          </div>

          {/* Photo Selection */}
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-ink">
              Food presentation photo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SAMPLE_PHOTOS.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(photo.url)}
                  className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all aspect-video relative group ${
                    selectedPhoto === photo.url
                      ? 'border-accent-primary ring-2 ring-accent-primary/40 shadow-md'
                      : 'border-white/70 opacity-75 hover:opacity-100 hover:border-white'
                  }`}
                >
                  <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                    <span className="text-[11px] text-white font-medium truncate">{photo.label}</span>
                  </div>
                  {selectedPhoto === photo.url && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent-primary text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200/60 flex items-center justify-between">
            <Link
              href="/restaurant"
              className="min-h-[44px] px-5 py-2.5 rounded-2xl border border-stone-200 bg-white/50 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-white transition-colors flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="min-h-[44px] px-6 py-3 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover text-white font-semibold text-sm shadow-[0_8px_24px_rgba(232,134,58,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish surplus food now</span>
            </button>
          </div>
        </GlassPanel>
      </form>
    </div>
  );
}
