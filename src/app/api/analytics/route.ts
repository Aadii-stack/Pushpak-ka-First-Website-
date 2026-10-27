import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let analytics = await prisma.platformAnalytics.findUnique({
      where: { id: 'global' },
    });

    if (!analytics) {
      analytics = await prisma.platformAnalytics.create({
        data: { id: 'global' },
      });
    }

    // Refresh dynamic live counts
    const [activeListings, activeTieUps, activeTransports, restaurantsCount, ngosCount] = await Promise.all([
      prisma.surplusListing.count({ where: { status: 'available' } }),
      prisma.tieUpRequest.count({ where: { status: 'pending' } }),
      prisma.transportRecord.count({ where: { status: { in: ['confirmed', 'en_route', 'in_transit', 'picked_up'] } } }),
      prisma.restaurantProfile.count(),
      prisma.nGOProfile.count(),
    ]);

    const refreshed = await prisma.platformAnalytics.update({
      where: { id: 'global' },
      data: {
        active_listings_count: activeListings,
        active_tie_ups_count: activeTieUps,
        active_transports_count: activeTransports,
        registered_restaurants: restaurantsCount,
        registered_ngos: ngosCount,
      },
    });

    return NextResponse.json({ analytics: refreshed });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch platform analytics' }, { status: 500 });
  }
}
