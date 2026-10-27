import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

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

    const tieUps = await prisma.tieUpRequest.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        transport: true,
      },
    });

    return NextResponse.json({ tieUps });
  } catch (error) {
    console.error('Error fetching tie-ups:', error);
    return NextResponse.json({ error: 'Failed to fetch tie-ups' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      listing_id,
      ngo_id,
      quantity_requested,
      proposed_pickup_time,
      transport_mode,
      vehicle_type,
      people_count,
      notes,
    } = body;

    const listing = await prisma.surplusListing.findUnique({
      where: { id: listing_id },
      include: { restaurant: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const effectiveNgoId = ngo_id || user.ngo_profile?.id;
    const ngo = await prisma.nGOProfile.findUnique({
      where: { id: effectiveNgoId },
    });

    if (!ngo) {
      return NextResponse.json({ error: 'NGO profile not found' }, { status: 404 });
    }

    const tieUp = await prisma.tieUpRequest.create({
      data: {
        listing_id: listing.id,
        listing_title: listing.title,
        food_category: listing.category,
        ngo_id: ngo.id,
        ngo_name: ngo.org_name,
        ngo_address: ngo.address,
        ngo_phone: ngo.phone,
        restaurant_id: listing.restaurant_id,
        restaurant_name: listing.restaurant_name,
        restaurant_address: listing.restaurant_address,
        restaurant_phone: listing.restaurant_phone || '+91 98765 43210',
        quantity_requested: Number(quantity_requested),
        unit: listing.unit,
        status: 'pending',
        proposed_pickup_time: new Date(proposed_pickup_time || Date.now() + 3600 * 1000),
        transport_mode: transport_mode || 'ngo_pickup',
        vehicle_type: vehicle_type || 'Standard Carrier',
        people_count: people_count ? Number(people_count) : 2,
        notes: notes || '',
      },
    });

    // Notify Restaurant
    if (listing.restaurant) {
      await prisma.appNotification.create({
        data: {
          user_id: listing.restaurant.user_id,
          role: 'restaurant',
          type: 'tie_up_request',
          title: `Tie-Up Request from ${ngo.org_name}`,
          message: `${ngo.org_name} requested ${quantity_requested} ${listing.unit} for "${listing.title}".`,
          link: `/restaurant/requests`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        entity_type: 'tie_up',
        entity_id: tieUp.id,
        actor_id: user.id,
        actor_name: user.name,
        actor_role: user.role,
        action: 'TIE_UP_REQUESTED',
        details: `NGO ${ngo.org_name} requested ${quantity_requested} ${listing.unit} from ${listing.restaurant_name}`,
      },
    });

    return NextResponse.json({ message: 'Tie-up request created', tieUp }, { status: 201 });
  } catch (error) {
    console.error('Error creating tie-up request:', error);
    return NextResponse.json({ error: 'Failed to create tie-up request' }, { status: 500 });
  }
}
