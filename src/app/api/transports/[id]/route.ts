import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transport = await prisma.transportRecord.findUnique({
      where: { id },
      include: { issues: true },
    });

    if (!transport) {
      return NextResponse.json({ error: 'Transport record not found' }, { status: 404 });
    }

    return NextResponse.json({
      transport: {
        ...transport,
        tracking_history: JSON.parse(transport.tracking_history || '[]'),
        timeline_events: JSON.parse(transport.timeline_events || '[]'),
      },
    });
  } catch (error) {
    console.error('Error fetching transport record:', error);
    return NextResponse.json({ error: 'Failed to fetch transport' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nextStatus, driver_name, driver_phone, vehicle_number, proof_url, notes, otp } = body;

    const user = await getAuthenticatedUser();
    const actorName = user?.name || 'Authorized Logistics Coordinator';

    const transport = await prisma.transportRecord.findUnique({
      where: { id },
      include: {
        tie_up: {
          include: {
            restaurant: true,
            ngo: true,
          },
        },
      },
    });

    if (!transport) {
      return NextResponse.json({ error: 'Transport not found' }, { status: 404 });
    }

    // Verify OTP if needed
    if (nextStatus === 'picked_up' && otp && otp !== transport.pickup_otp) {
      return NextResponse.json({ error: 'Invalid pickup OTP. Please verify with restaurant staff.' }, { status: 400 });
    }

    if ((nextStatus === 'delivered' || nextStatus === 'completed') && otp && otp !== transport.delivery_otp) {
      return NextResponse.json({ error: 'Invalid delivery OTP. Please verify with NGO recipient.' }, { status: 400 });
    }

    const descriptions: Record<string, string> = {
      confirmed: 'Transport pickup confirmed.',
      en_route: `Driver ${driver_name || transport.driver_name} is en route to restaurant pickup location.`,
      picked_up: `Food verified and loaded at ${transport.restaurant_name}. Ready for transit.`,
      in_transit: 'Transport actively in transit towards delivery destination.',
      delivered: `Food delivered at ${transport.ngo_name}. Receipt OTP verified!`,
      completed: 'Transport cycle successfully completed & archived.',
      issue: `Issue reported: ${notes || 'Requires attention'}`,
    };

    const currentTimeline = JSON.parse(transport.timeline_events || '[]');
    currentTimeline.push({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      description: descriptions[nextStatus] || `Status updated to ${nextStatus}`,
      actor: actorName,
    });

    const isPickup = nextStatus === 'picked_up';
    const isDelivery = nextStatus === 'delivered' || nextStatus === 'completed';

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.transportRecord.update({
        where: { id },
        data: {
          status: nextStatus,
          last_location_update_at: new Date(),
          ...(driver_name ? { driver_name } : {}),
          ...(driver_phone ? { driver_phone } : {}),
          ...(vehicle_number ? { vehicle_number } : {}),
          ...(isPickup ? { pickup_otp_verified: true, ...(proof_url ? { proof_pickup_url: proof_url } : {}) } : {}),
          ...(isDelivery ? { delivery_otp_verified: true, ...(proof_url ? { proof_delivery_url: proof_url } : {}) } : {}),
          ...(notes ? { issue_notes: notes } : {}),
          timeline_events: JSON.stringify(currentTimeline),
        },
      });

      // If delivered, update impact analytics
      if (isDelivery) {
        const kgSaved = transport.unit === 'kg' ? transport.quantity : Math.round(transport.quantity * 0.4);
        const meals = transport.unit === 'servings' || transport.unit === 'meals' ? Math.round(transport.quantity) : Math.round(transport.quantity * 2.5);
        const co2 = Math.round(kgSaved * 2.5);

        // Update platform analytics
        await tx.platformAnalytics.updateMany({
          data: {
            total_food_saved_kg: { increment: kgSaved },
            total_meals_donated: { increment: meals },
            total_co2_offset_kg: { increment: co2 },
          },
        });

        // Update restaurant impact
        await tx.restaurantProfile.update({
          where: { id: transport.restaurant_id },
          data: {
            total_meals_donated: { increment: meals },
            co2_saved_kg: { increment: co2 },
          },
        });

        // Update NGO impact
        await tx.nGOProfile.update({
          where: { id: transport.ngo_id },
          data: {
            total_meals_received: { increment: meals },
            people_served: { increment: Math.round(meals * 0.9) },
          },
        });
      }

      // If picked up and remaining listing was 0, update listing status
      if (isPickup) {
        await tx.surplusListing.updateMany({
          where: { id: transport.listing_id, remaining_quantity: 0 },
          data: { status: 'picked_up' },
        });
      }

      // Notify parties
      if (transport.tie_up?.restaurant) {
        await tx.appNotification.create({
          data: {
            user_id: transport.tie_up.restaurant.user_id,
            role: 'restaurant',
            type: isDelivery ? 'food_delivered' : 'driver_en_route',
            title: `Transport Status: ${nextStatus.toUpperCase()}`,
            message: `${transport.listing_title.slice(0, 30)}... is now ${nextStatus.replace('_', ' ')}.`,
            link: `/restaurant/transports/${transport.id}`,
          },
        });
      }

      if (transport.tie_up?.ngo) {
        await tx.appNotification.create({
          data: {
            user_id: transport.tie_up.ngo.user_id,
            role: 'ngo',
            type: isDelivery ? 'food_delivered' : 'driver_en_route',
            title: `Transport Status: ${nextStatus.toUpperCase()}`,
            message: `${transport.listing_title.slice(0, 30)}... is now ${nextStatus.replace('_', ' ')}.`,
            link: `/ngo/transport/${transport.id}`,
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          entity_type: 'transport',
          entity_id: transport.id,
          actor_id: user?.id || 'system',
          actor_name: actorName,
          actor_role: user?.role || 'driver',
          action: `TRANSPORT_${nextStatus.toUpperCase()}`,
          details: descriptions[nextStatus] || `Updated status to ${nextStatus}`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      message: 'Transport status updated',
      transport: {
        ...result,
        tracking_history: JSON.parse(result.tracking_history || '[]'),
        timeline_events: JSON.parse(result.timeline_events || '[]'),
      },
    });
  } catch (error) {
    console.error('Error updating transport status:', error);
    return NextResponse.json({ error: 'Failed to update transport status' }, { status: 500 });
  }
}
