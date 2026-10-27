import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurant_id');
    const ngoId = searchParams.get('ngo_id');
    const status = searchParams.get('status');

    const where: any = {};
    if (restaurantId) where.restaurant_id = restaurantId;
    if (ngoId) where.ngo_id = ngoId;
    if (status) where.status = status;

    const transports = await prisma.transportRecord.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        issues: true,
      },
    });

    const formatted = transports.map((t) => ({
      ...t,
      tracking_history: JSON.parse(t.tracking_history || '[]'),
      timeline_events: JSON.parse(t.timeline_events || '[]'),
    }));

    return NextResponse.json({ transports: formatted });
  } catch (error) {
    console.error('Error fetching transports:', error);
    return NextResponse.json({ error: 'Failed to fetch transports' }, { status: 500 });
  }
}
