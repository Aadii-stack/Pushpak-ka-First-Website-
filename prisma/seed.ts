import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  SEED_USERS,
  SEED_RESTAURANTS,
  SEED_NGOS,
  SEED_DRIVERS,
  SEED_LISTINGS,
  SEED_STANDING_NEEDS,
  SEED_TIE_UPS,
  SEED_TRANSPORTS,
  SEED_ISSUES,
  SEED_NOTIFICATIONS,
  SEED_ANALYTICS,
} from '../src/lib/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const defaultPasswordHash = await bcrypt.hash('Password123!', 12);

  // 1. Clean existing records in correct relation order
  await prisma.auditLog.deleteMany({});
  await prisma.issueFlag.deleteMany({});
  await prisma.transportRecord.deleteMany({});
  await prisma.tieUpRequest.deleteMany({});
  await prisma.nGONeedRequest.deleteMany({});
  await prisma.surplusListing.deleteMany({});
  await prisma.appNotification.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.restaurantProfile.deleteMany({});
  await prisma.nGOProfile.deleteMany({});
  await prisma.driverProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.platformAnalytics.deleteMany({});

  // 2. Prepare all users including rest_4 owner
  const allUsers = [...SEED_USERS];
  if (!allUsers.find((u) => u.id === 'usr_rest_4')) {
    allUsers.push({
      id: 'usr_rest_4',
      role: 'restaurant',
      name: 'David Chen',
      email: 'david@urbangreens.com',
      phone: '+91 98555 66778',
      verified_status: 'verified',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: new Date().toISOString(),
    });
  }

  // 3. Seed Users
  for (const u of allUsers) {
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email.toLowerCase(),
        password_hash: defaultPasswordHash,
        name: u.name,
        phone: u.phone,
        role: u.role,
        verified_status: u.verified_status,
        status: 'active',
        avatar_url: u.avatar_url,
        auth_provider: u.auth_provider || 'email',
        created_at: new Date(u.created_at),
        updated_at: new Date(u.created_at),
      },
    });
  }
  console.log(`✅ Seeded ${allUsers.length} users with bcrypt password hashes`);

  // 4. Seed Restaurant Profiles
  for (const r of SEED_RESTAURANTS) {
    await prisma.restaurantProfile.create({
      data: {
        id: r.id,
        user_id: r.user_id,
        business_name: r.business_name,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        cuisine_type: r.cuisine_type,
        operating_hours: r.operating_hours,
        contact_person: r.contact_person,
        phone: r.phone,
        email: r.email,
        fssai_license: r.fssai_license,
        fssai_expiry: r.fssai_expiry,
        gstin: r.gstin,
        pan_number: r.pan_number,
        trade_license_no: r.trade_license_no,
        fostac_supervisor_name: r.fostac_supervisor_name,
        establishment_type: r.establishment_type,
        city: r.city,
        pincode: r.pincode,
        fssai_surplus_declaration: r.fssai_surplus_declaration ?? true,
        verification_doc_url: r.verification_doc_url,
        logistics_capability: r.logistics_capability,
        photos: JSON.stringify(r.photos || []),
        total_meals_donated: r.total_meals_donated,
        co2_saved_kg: r.co2_saved_kg,
        rating: r.rating,
      },
    });
  }
  console.log(`✅ Seeded ${SEED_RESTAURANTS.length} restaurant profiles`);

  // 5. Seed NGO Profiles
  for (const n of SEED_NGOS) {
    await prisma.nGOProfile.create({
      data: {
        id: n.id,
        user_id: n.user_id,
        org_name: n.org_name,
        registration_no: n.registration_no,
        darpan_id: n.darpan_id,
        registration_type: n.registration_type,
        pan_number: n.pan_number,
        section_12a_80g: n.section_12a_80g,
        fcra_status: n.fcra_status,
        authorized_signatory: n.authorized_signatory,
        city: n.city,
        pincode: n.pincode,
        hygiene_undertaking: n.hygiene_undertaking ?? true,
        service_area: n.service_area,
        address: n.address,
        lat: n.lat,
        lng: n.lng,
        capacity_per_day: n.capacity_per_day,
        daily_meal_capacity: n.daily_meal_capacity,
        storage_capacity: n.storage_capacity,
        verification_doc_url: n.verification_doc_url,
        has_own_transport: n.has_own_transport,
        contact_person: n.contact_person,
        phone: n.phone,
        email: n.email,
        total_meals_received: n.total_meals_received,
        people_served: n.people_served,
        partner_restaurants_count: n.partner_restaurants_count,
      },
    });
  }
  console.log(`✅ Seeded ${SEED_NGOS.length} NGO profiles`);

  // 6. Seed Driver Profiles
  for (const d of SEED_DRIVERS) {
    await prisma.driverProfile.create({
      data: {
        id: d.id,
        user_id: d.user_id,
        full_legal_name: d.full_legal_name,
        phone: d.phone,
        email: d.email,
        dl_number: d.dl_number,
        dl_expiry: d.dl_expiry,
        aadhaar_last4: d.aadhaar_last4,
        vehicle_number: d.vehicle_number,
        vehicle_type: d.vehicle_type,
        puc_number: d.puc_number,
        puc_expiry: d.puc_expiry,
        insurance_policy_no: d.insurance_policy_no,
        has_insulated_carrier: d.has_insulated_carrier,
        emergency_contact_name: d.emergency_contact_name,
        emergency_contact_phone: d.emergency_contact_phone,
        service_city: d.service_city,
        service_pincodes: JSON.stringify(d.service_pincodes || []),
        volunteer_pledge: d.volunteer_pledge,
        total_pickups_completed: d.total_pickups_completed,
        rating: d.rating,
      },
    });
  }
  console.log(`✅ Seeded ${SEED_DRIVERS.length} driver profiles`);

  // 7. Seed Surplus Listings
  for (const l of SEED_LISTINGS) {
    await prisma.surplusListing.create({
      data: {
        id: l.id,
        restaurant_id: l.restaurant_id,
        restaurant_name: l.restaurant_name,
        restaurant_address: l.restaurant_address,
        restaurant_lat: l.restaurant_lat,
        restaurant_lng: l.restaurant_lng,
        restaurant_phone: l.restaurant_phone,
        title: l.title,
        category: l.category,
        description: l.description,
        quantity: l.quantity,
        remaining_quantity: l.remaining_quantity,
        unit: l.unit,
        dietary_tags: JSON.stringify(l.dietary_tags || []),
        prepared_at: new Date(l.prepared_at),
        expiry_at: new Date(l.expiry_at),
        pickup_window_start: new Date(l.pickup_window_start),
        pickup_window_end: new Date(l.pickup_window_end),
        packaging_status: l.packaging_status,
        status: l.status,
        photo_urls: JSON.stringify(l.photo_urls || []),
        logistics_offer: l.logistics_offer,
        created_at: new Date(l.created_at),
      },
    });
  }
  console.log(`✅ Seeded ${SEED_LISTINGS.length} surplus listings`);

  // 8. Seed Standing Needs
  for (const n of SEED_STANDING_NEEDS) {
    await prisma.nGONeedRequest.create({
      data: {
        id: n.id,
        ngo_id: n.ngo_id,
        ngo_name: n.ngo_name,
        ngo_address: n.ngo_address,
        ngo_lat: n.ngo_lat,
        ngo_lng: n.ngo_lng,
        ngo_contact: n.ngo_contact,
        quantity_needed: n.quantity_needed,
        unit: n.unit,
        category_preference: n.category_preference,
        needed_by: new Date(n.needed_by),
        status: n.status,
        description: n.description,
        created_at: new Date(n.created_at),
      },
    });
  }
  console.log(`✅ Seeded ${SEED_STANDING_NEEDS.length} standing need requests`);

  // 9. Seed Tie-Up Requests
  for (const t of SEED_TIE_UPS) {
    await prisma.tieUpRequest.create({
      data: {
        id: t.id,
        listing_id: t.listing_id,
        listing_title: t.listing_title,
        food_category: t.food_category,
        ngo_id: t.ngo_id,
        ngo_name: t.ngo_name,
        ngo_address: t.ngo_address,
        ngo_phone: t.ngo_phone,
        restaurant_id: t.restaurant_id,
        restaurant_name: t.restaurant_name,
        restaurant_address: t.restaurant_address,
        restaurant_phone: t.restaurant_phone,
        quantity_requested: t.quantity_requested,
        unit: t.unit,
        status: t.status,
        proposed_pickup_time: new Date(t.proposed_pickup_time),
        transport_mode: t.transport_mode,
        vehicle_type: t.vehicle_type,
        people_count: t.people_count,
        notes: t.notes,
        counter_proposal: t.counter_proposal,
        created_at: new Date(t.created_at),
        responded_at: t.responded_at ? new Date(t.responded_at) : null,
      },
    });
  }
  console.log(`✅ Seeded ${SEED_TIE_UPS.length} tie-up requests`);

  // 10. Seed Transport Records
  for (const tr of SEED_TRANSPORTS) {
    await prisma.transportRecord.create({
      data: {
        id: tr.id,
        tie_up_id: tr.tie_up_id,
        listing_id: tr.listing_id,
        listing_title: tr.listing_title,
        food_category: tr.food_category,
        quantity: tr.quantity,
        unit: tr.unit,
        restaurant_id: tr.restaurant_id,
        restaurant_name: tr.restaurant_name,
        restaurant_address: tr.restaurant_address,
        restaurant_lat: tr.restaurant_lat,
        restaurant_lng: tr.restaurant_lng,
        restaurant_phone: tr.restaurant_phone,
        ngo_id: tr.ngo_id,
        ngo_name: tr.ngo_name,
        ngo_address: tr.ngo_address,
        ngo_lat: tr.ngo_lat,
        ngo_lng: tr.ngo_lng,
        ngo_phone: tr.ngo_phone,
        driver_name: tr.driver_name,
        driver_phone: tr.driver_phone,
        vehicle_number: tr.vehicle_number,
        transport_assigned_by: tr.transport_assigned_by,
        status: tr.status,
        current_lat: tr.current_lat,
        current_lng: tr.current_lng,
        last_location_update_at: new Date(tr.last_location_update_at),
        pickup_otp: tr.pickup_otp,
        delivery_otp: tr.delivery_otp,
        pickup_otp_verified: tr.pickup_otp_verified,
        delivery_otp_verified: tr.delivery_otp_verified,
        proof_pickup_url: tr.proof_pickup_url,
        proof_delivery_url: tr.proof_delivery_url,
        issue_notes: tr.issue_notes,
        estimated_arrival_minutes: tr.estimated_arrival_minutes,
        pickup_window_start: new Date(tr.pickup_window_start),
        pickup_window_end: new Date(tr.pickup_window_end),
        tracking_history: JSON.stringify(tr.tracking_history || []),
        timeline_events: JSON.stringify(tr.timeline_events || []),
        created_at: new Date(tr.created_at || Date.now()),
      },
    });
  }
  console.log(`✅ Seeded ${SEED_TRANSPORTS.length} transport records`);

  // 11. Seed Issues
  for (const iss of SEED_ISSUES) {
    await prisma.issueFlag.create({
      data: {
        id: iss.id,
        transport_id: iss.transport_id,
        listing_title: iss.listing_title,
        restaurant_name: iss.restaurant_name,
        ngo_name: iss.ngo_name,
        raised_by: iss.raised_by,
        raised_by_name: iss.raised_by_name,
        issue_type: iss.issue_type,
        description: iss.description,
        severity: iss.severity,
        status: iss.status,
        admin_notes: iss.admin_notes,
        action_taken: iss.action_taken,
        created_at: new Date(iss.created_at),
        resolved_at: iss.resolved_at ? new Date(iss.resolved_at) : null,
        resolved_by: iss.resolved_by,
      },
    });
  }
  console.log(`✅ Seeded ${SEED_ISSUES.length} issue flags`);

  // 12. Seed Notifications
  for (const n of SEED_NOTIFICATIONS) {
    await prisma.appNotification.create({
      data: {
        id: n.id,
        user_id: n.user_id,
        role: n.role,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        created_at: new Date(n.created_at),
      },
    });
  }
  console.log(`✅ Seeded ${SEED_NOTIFICATIONS.length} app notifications`);

  // 13. Seed Platform Analytics
  await prisma.platformAnalytics.upsert({
    where: { id: 'global' },
    update: {
      total_food_saved_kg: SEED_ANALYTICS.total_food_saved_kg,
      total_meals_donated: SEED_ANALYTICS.total_meals_donated,
      total_co2_offset_kg: SEED_ANALYTICS.total_co2_offset_kg,
      active_listings_count: SEED_ANALYTICS.active_listings_count,
      active_tie_ups_count: SEED_ANALYTICS.active_tie_ups_count,
      active_transports_count: SEED_ANALYTICS.active_transports_count,
      registered_restaurants: SEED_ANALYTICS.registered_restaurants,
      registered_ngos: SEED_ANALYTICS.registered_ngos,
      pending_verifications: SEED_ANALYTICS.pending_verifications,
      resolved_disputes: SEED_ANALYTICS.resolved_disputes,
      avg_pickup_minutes: SEED_ANALYTICS.avg_pickup_minutes,
      completion_rate_percent: SEED_ANALYTICS.completion_rate_percent,
      waste_diversion_rate_percent: SEED_ANALYTICS.waste_diversion_rate_percent,
    },
    create: {
      id: 'global',
      total_food_saved_kg: SEED_ANALYTICS.total_food_saved_kg,
      total_meals_donated: SEED_ANALYTICS.total_meals_donated,
      total_co2_offset_kg: SEED_ANALYTICS.total_co2_offset_kg,
      active_listings_count: SEED_ANALYTICS.active_listings_count,
      active_tie_ups_count: SEED_ANALYTICS.active_tie_ups_count,
      active_transports_count: SEED_ANALYTICS.active_transports_count,
      registered_restaurants: SEED_ANALYTICS.registered_restaurants,
      registered_ngos: SEED_ANALYTICS.registered_ngos,
      pending_verifications: SEED_ANALYTICS.pending_verifications,
      resolved_disputes: SEED_ANALYTICS.resolved_disputes,
      avg_pickup_minutes: SEED_ANALYTICS.avg_pickup_minutes,
      completion_rate_percent: SEED_ANALYTICS.completion_rate_percent,
      waste_diversion_rate_percent: SEED_ANALYTICS.waste_diversion_rate_percent,
    },
  });
  console.log(`✅ Seeded platform analytics`);

  // 14. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      id: 'log_seed_1',
      entity_type: 'transport',
      entity_id: 'tr_101',
      actor_id: 'usr_rest_1',
      actor_name: 'Chef Rajesh Sharma',
      actor_role: 'restaurant',
      action: 'SYSTEM_INITIALIZATION',
      details: 'FoodBridge production database initialized with verified sample data.',
      timestamp: new Date(),
    },
  });
  console.log(`✅ Seeded initial audit log`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
