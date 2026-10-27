import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ngoId = searchParams.get('ngo_id');
    const status = searchParams.get('status');

    const where: any = {};
    if (ngoId) where.ngo_id = ngoId;
    if (status) where.status = status;

    const standingNeeds = await prisma.nGONeedRequest.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { ngo: true },
    });

    return NextResponse.json({ standingNeeds });
  } catch (error) {
    console.error('Error fetching standing needs:', error);
    return NextResponse.json({ error: 'Failed to fetch standing needs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ngo = user.ngo_profile;
    if (!ngo) {
      return NextResponse.json({ error: 'Only registered NGOs can post standing food needs.' }, { status: 403 });
    }

    const body = await req.json();
    const { quantity_needed, unit, category_preference, needed_by, description } = body;

    const need = await prisma.nGONeedRequest.create({
      data: {
        ngo_id: ngo.id,
        ngo_name: ngo.org_name,
        ngo_address: ngo.address,
        ngo_lat: ngo.lat,
        ngo_lng: ngo.lng,
        ngo_contact: ngo.phone,
        quantity_needed: Number(quantity_needed),
        unit: unit || 'servings',
        category_preference: category_preference || 'any',
        needed_by: needed_by ? new Date(needed_by) : new Date(Date.now() + 6 * 3600 * 1000),
        status: 'active',
        description: description || '',
      },
    });

    return NextResponse.json({ message: 'Need request posted', need }, { status: 201 });
  } catch (error) {
    console.error('Error creating standing need:', error);
    return NextResponse.json({ error: 'Failed to create standing need' }, { status: 500 });
  }
}
