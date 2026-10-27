import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { calculateDistanceKm } from '@/lib/geo';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurant_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};
    if (restaurantId) where.restaurant_id = restaurantId;
    if (category && category !== 'all') where.category = category;
    if (status) where.status = status;

    const [listings, total] = await Promise.all([
      prisma.surplusListing.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.surplusListing.count({ where }),
    ]);

    // Format listings with parsed JSON fields
    const formatted = listings.map((l) => ({
      ...l,
      dietary_tags: JSON.parse(l.dietary_tags || '[]'),
      photo_urls: JSON.parse(l.photo_urls || '[]'),
    }));

    return NextResponse.json({
      listings: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    if (user.role !== 'restaurant') {
      return NextResponse.json({ error: 'Only restaurants can create food surplus listings.' }, { status: 403 });
    }

    const restProfile = user.restaurant_profile;
    if (!restProfile) {
      return NextResponse.json({ error: 'Restaurant profile not found for this account.' }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      category,
      description,
      quantity,
      unit,
      dietary_tags,
      prepared_at,
      expiry_at,
      pickup_window_start,
      pickup_window_end,
      packaging_status,
      photo_urls,
      logistics_offer,
    } = body;

    if (!title || !category || !quantity || !unit || !expiry_at) {
      return NextResponse.json({ error: 'Missing mandatory listing fields.' }, { status: 400 });
    }

    const newListing = await prisma.surplusListing.create({
      data: {
        restaurant_id: restProfile.id,
        restaurant_name: restProfile.business_name,
        restaurant_address: restProfile.address,
        restaurant_lat: restProfile.lat,
        restaurant_lng: restProfile.lng,
        restaurant_phone: restProfile.phone,
        title,
        category,
        description: description || '',
        quantity: Number(quantity),
        remaining_quantity: Number(quantity),
        unit,
        dietary_tags: JSON.stringify(dietary_tags || []),
        prepared_at: prepared_at ? new Date(prepared_at) : new Date(),
        expiry_at: new Date(expiry_at),
        pickup_window_start: pickup_window_start ? new Date(pickup_window_start) : new Date(),
        pickup_window_end: pickup_window_end ? new Date(pickup_window_end) : new Date(Date.now() + 4 * 3600 * 1000),
        packaging_status: packaging_status || 'packed',
        status: 'available',
        photo_urls: JSON.stringify(photo_urls || []),
        logistics_offer: logistics_offer || restProfile.logistics_capability,
      },
    });

    // Notify nearby NGOs within 15 km
    const ngos = await prisma.nGOProfile.findMany({
      include: { user: true },
    });

    for (const ngo of ngos) {
      const dist = calculateDistanceKm(restProfile.lat, restProfile.lng, ngo.lat, ngo.lng);
      if (dist <= 15) {
        await prisma.appNotification.create({
          data: {
            user_id: ngo.user_id,
            role: 'ngo',
            type: 'listing_expiring',
            title: `New Surplus Food: ${title.slice(0, 30)}...`,
            message: `${restProfile.business_name} (${dist.toFixed(1)} km away) just posted ${quantity} ${unit} of ${category.replace('_', ' ')}.`,
            link: `/ngo/discover?highlight=${newListing.id}`,
          },
        });
      }
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        entity_type: 'listing',
        entity_id: newListing.id,
        actor_id: user.id,
        actor_name: user.name,
        actor_role: 'restaurant',
        action: 'LISTING_CREATED',
        details: `Created listing: ${title} (${quantity} ${unit})`,
      },
    });

    return NextResponse.json({
      message: 'Listing created successfully',
      listing: {
        ...newListing,
        dietary_tags: JSON.parse(newListing.dietary_tags),
        photo_urls: JSON.parse(newListing.photo_urls),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
