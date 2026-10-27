import { NextResponse } from 'next/server';
import { getAuthenticatedUser, sanitizeUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching /api/auth/me:', error);
    return NextResponse.json({ error: 'Failed to retrieve user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, avatar_url, roleDetails } = body;

    // Update user core info
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(avatar_url ? { avatar_url } : {}),
      },
      include: {
        restaurant_profile: true,
        ngo_profile: true,
        driver_profile: true,
      },
    });

    // Update role profile if details provided
    if (roleDetails) {
      if (currentUser.role === 'restaurant' && currentUser.restaurant_profile) {
        await prisma.restaurantProfile.update({
          where: { id: currentUser.restaurant_profile.id },
          data: {
            ...roleDetails,
            ...(roleDetails.photos ? { photos: JSON.stringify(roleDetails.photos) } : {}),
          },
        });
      } else if (currentUser.role === 'ngo' && currentUser.ngo_profile) {
        await prisma.nGOProfile.update({
          where: { id: currentUser.ngo_profile.id },
          data: {
            ...roleDetails,
          },
        });
      } else if (currentUser.role === 'driver' && currentUser.driver_profile) {
        await prisma.driverProfile.update({
          where: { id: currentUser.driver_profile.id },
          data: {
            ...roleDetails,
            ...(roleDetails.service_pincodes ? { service_pincodes: JSON.stringify(roleDetails.service_pincodes) } : {}),
          },
        });
      }
    }

    const reloaded = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        restaurant_profile: true,
        ngo_profile: true,
        driver_profile: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(reloaded),
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
