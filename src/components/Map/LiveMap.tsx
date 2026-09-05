'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SurplusListing, TransportRecord, NGOProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
  className?: string;
}

const DynamicMap = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="text-xs font-medium">Loading Interactive Map...</span>
    </div>
  ),
});

export default function LiveMap(props: Props) {
  return (
    <div className={`relative overflow-hidden rounded-xl shadow-inner border border-slate-200 ${props.className || 'h-[400px]'}`}>
      <DynamicMap {...props} />
    </div>
  );
}
