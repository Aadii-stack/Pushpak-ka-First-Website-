import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, counter_proposal } = body;

    const user = await getAuthenticatedUser();
    const actorName = user?.name || 'Restaurant Manager';

    const tieUp = await prisma.tieUpRequest.findUnique({
      where: { id },
      include: {
        listing: true,
        restaurant: true,
        ngo: true,
      },
    });

    if (!tieUp) {
      return NextResponse.json({ error: 'Tie-up request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const result = await prisma.$transaction(async (tx) => {
        // Update tie-up
        const updatedTieUp = await tx.tieUpRequest.update({
          where: { id },
          data: {
            status: 'accepted',
            responded_at: new Date(),
          },
        });

        // Deduct from listing
        if (tieUp.listing) {
          const remaining = Math.max(0, tieUp.listing.remaining_quantity - tieUp.quantity_requested);
          await tx.surplusListing.update({
            where: { id: tieUp.listing_id },
            data: {
              remaining_quantity: remaining,
              status: remaining === 0 ? 'reserved' : 'partially_reserved',
            },
          });
        }

        // Create TransportRecord
        const transport = await tx.transportRecord.create({
          data: {
            tie_up_id: tieUp.id,
            listing_id: tieUp.listing_id,
            listing_title: tieUp.listing_title,
            food_category: tieUp.food_category,
            quantity: tieUp.quantity_requested,
            unit: tieUp.unit,
            restaurant_id: tieUp.restaurant_id,
            restaurant_name: tieUp.restaurant_name,
            restaurant_address: tieUp.restaurant_address,
            restaurant_lat: tieUp.restaurant.lat,
            restaurant_lng: tieUp.restaurant.lng,
            restaurant_phone: tieUp.restaurant_phone,
            ngo_id: tieUp.ngo_id,
            ngo_name: tieUp.ngo_name,
            ngo_address: tieUp.ngo_address,
            ngo_lat: tieUp.ngo.lat,
            ngo_lng: tieUp.ngo.lng,
            ngo_phone: tieUp.ngo_phone,
            driver_name:
              tieUp.transport_mode === 'restaurant_delivers'
                ? `${tieUp.restaurant_name} Fleet`
                : 'Vikram Singh (Field Volunteer)',
            driver_phone: '+91 97777 66554',
            vehicle_number: tieUp.vehicle_type || 'KA-01-EA-8821',
            transport_assigned_by: tieUp.transport_mode === 'restaurant_delivers' ? 'restaurant' : 'ngo',
            status: 'confirmed',
            current_lat: tieUp.restaurant.lat,
            current_lng: tieUp.restaurant.lng,
            pickup_otp: pickupOtp,
            delivery_otp: deliveryOtp,
            pickup_otp_verified: false,
            delivery_otp_verified: false,
            pickup_window_start: tieUp.listing?.pickup_window_start || new Date(),
            pickup_window_end: tieUp.listing?.pickup_window_end || new Date(Date.now() + 7200000),
            estimated_arrival_minutes: 20,
            tracking_history: JSON.stringify([
              {
                lat: tieUp.restaurant.lat,
                lng: tieUp.restaurant.lng,
                timestamp: new Date().toISOString(),
                label: 'Confirmed - Scheduled for Dispatch',
              },
            ]),
            timeline_events: JSON.stringify([
              {
                status: 'confirmed',
                timestamp: new Date().toISOString(),
                description: `Tie-up confirmed by ${tieUp.restaurant_name}. Transport record initiated.`,
                actor: actorName,
              },
            ]),
          },
        });

        // Notify NGO
        await tx.appNotification.create({
          data: {
            user_id: tieUp.ngo.user_id,
            role: 'ngo',
            type: 'tie_up_accepted',
            title: `Request Accepted by ${tieUp.restaurant_name}!`,
            message: `Your request for ${tieUp.quantity_requested} ${tieUp.unit} was approved. Transport tracking is now active.`,
            link: `/ngo/transport/${transport.id}`,
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            entity_type: 'tie_up',
            entity_id: tieUp.id,
            actor_id: user?.id || tieUp.restaurant.user_id,
            actor_name: actorName,
            actor_role: 'restaurant',
            action: 'TIE_UP_ACCEPTED',
            details: `Tie-up confirmed for ${tieUp.quantity_requested} ${tieUp.unit}. Transport ${transport.id} created.`,
          },
        });

        return { updatedTieUp, transport };
      });

      return NextResponse.json({
        message: 'Tie-up accepted and transport created',
        tieUp: result.updatedTieUp,
        transport: {
          ...result.transport,
          tracking_history: JSON.parse(result.transport.tracking_history),
          timeline_events: JSON.parse(result.transport.timeline_events),
        },
      });
    } else {
      // Decline
      const updatedTieUp = await prisma.tieUpRequest.update({
        where: { id },
        data: {
          status: 'declined',
          counter_proposal: counter_proposal || null,
          responded_at: new Date(),
        },
      });

      // Notify NGO
      await prisma.appNotification.create({
        data: {
          user_id: tieUp.ngo.user_id,
          role: 'ngo',
          type: 'tie_up_declined',
          title: `Request Update from ${tieUp.restaurant_name}`,
          message: `Your request could not be fulfilled. ${counter_proposal ? `Note: ${counter_proposal}` : ''}`,
          link: `/ngo/requests`,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          entity_type: 'tie_up',
          entity_id: tieUp.id,
          actor_id: user?.id || tieUp.restaurant.user_id,
          actor_name: actorName,
          actor_role: 'restaurant',
          action: 'TIE_UP_DECLINED',
          details: `Tie-up declined by ${tieUp.restaurant_name}. Reason/counter: ${counter_proposal || 'None'}`,
        },
      });

      return NextResponse.json({
        message: 'Tie-up declined',
        tieUp: updatedTieUp,
      });
    }
  } catch (error) {
    console.error('Error responding to tie-up:', error);
    return NextResponse.json({ error: 'Failed to respond to tie-up' }, { status: 500 });
  }
}
