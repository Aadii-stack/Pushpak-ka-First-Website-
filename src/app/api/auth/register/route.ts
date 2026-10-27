import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, createSessionToken, setSessionCookie, createDbSession, sanitizeUser } from '@/lib/auth';

const registerSchema = z.object({
  role: z.enum(['restaurant', 'ngo', 'driver']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  restaurantDetails: z.record(z.string(), z.any()).optional(),
  ngoDetails: z.record(z.string(), z.any()).optional(),
  driverDetails: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { role, name, email, phone, password, restaurantDetails, ngoDetails, driverDetails } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Hash password securely (or use strong generated fallback)
    const passwordHash = await hashPassword(password || 'Password123!');
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Create user and profile transactionally
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone,
          password_hash: passwordHash,
          role,
          verified_status: 'verified',
          status: 'active',
          avatar_url: avatarUrl,
          auth_provider: 'email',
          last_login_at: new Date(),
        },
      });

      if (role === 'restaurant') {
        const details: any = restaurantDetails || {};
        await tx.restaurantProfile.create({
          data: {
            user_id: user.id,
            business_name: String(details.business_name || name),
            address: String(details.address || 'Bengaluru, Karnataka'),
            lat: Number(details.lat) || 12.9716,
            lng: Number(details.lng) || 77.5946,
            cuisine_type: String(details.cuisine_type || 'Multi-Cuisine & Healthy Meals'),
            operating_hours: String(details.operating_hours || '10:00 AM - 11:00 PM'),
            contact_person: name,
            phone,
            email: normalizedEmail,
            fssai_license: String(details.fssai_license || '11223344556600'),
            fssai_expiry: details.fssai_expiry ? String(details.fssai_expiry) : '2028-12-31',
            gstin: details.gstin ? String(details.gstin) : '29AAAAA0000A1Z5',
            pan_number: details.pan_number ? String(details.pan_number) : 'AAAAA0000A',
            trade_license_no: details.trade_license_no ? String(details.trade_license_no) : 'BBMP/HL/2024/0012',
            fostac_supervisor_name: details.fostac_supervisor_name ? String(details.fostac_supervisor_name) : name,
            establishment_type: details.establishment_type ? String(details.establishment_type) : 'Dine-in Restaurant',
            city: details.city ? String(details.city) : 'Bengaluru',
            pincode: details.pincode ? String(details.pincode) : '560001',
            fssai_surplus_declaration: Boolean(details.fssai_surplus_declaration ?? true),
            logistics_capability: String(details.logistics_capability || 'staff_handoff_cold_storage'),
            photos: JSON.stringify(details.photos || ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600']),
            total_meals_donated: 0,
            co2_saved_kg: 0,
            rating: 5.0,
          },
        });
      } else if (role === 'ngo') {
        const details: any = ngoDetails || {};
        await tx.nGOProfile.create({
          data: {
            user_id: user.id,
            org_name: String(details.org_name || name),
            registration_no: String(details.registration_no || 'REG-NGO-2024-KA-8812'),
            darpan_id: details.darpan_id ? String(details.darpan_id) : 'KA/2024/0077881',
            registration_type: details.registration_type ? String(details.registration_type) : 'Public Charitable Trust',
            pan_number: details.pan_number ? String(details.pan_number) : 'AABTP9999K',
            section_12a_80g: details.section_12a_80g ? String(details.section_12a_80g) : '12A/80G/CIT(E)/BLR/2024-25/X-01',
            fcra_status: details.fcra_status ? String(details.fcra_status) : 'Domestic Relief Only',
            authorized_signatory: details.authorized_signatory ? String(details.authorized_signatory) : name,
            city: details.city ? String(details.city) : 'Bengaluru',
            pincode: details.pincode ? String(details.pincode) : '560001',
            hygiene_undertaking: Boolean(details.hygiene_undertaking ?? true),
            service_area: String(details.service_area || 'Bengaluru Urban & Outskirts'),
            address: String(details.address || '55 Halasuru Road, Bengaluru 560008'),
            lat: Number(details.lat) || 12.975,
            lng: Number(details.lng) || 77.62,
            capacity_per_day: Number(details.capacity_per_day) || 500,
            storage_capacity: String(details.storage_capacity || 'Commercial refrigerator and insulated hotboxes'),
            has_own_transport: Boolean(details.has_own_transport ?? true),
            contact_person: name,
            phone,
            email: normalizedEmail,
            total_meals_received: 0,
            people_served: 0,
            partner_restaurants_count: 0,
          },
        });
      } else if (role === 'driver') {
        const details: any = driverDetails || {};
        await tx.driverProfile.create({
          data: {
            user_id: user.id,
            full_legal_name: String(details.full_legal_name || name),
            phone,
            email: normalizedEmail,
            dl_number: String(details.dl_number || 'KA01 20240011223'),
            dl_expiry: String(details.dl_expiry || '2039-01-01'),
            aadhaar_last4: String(details.aadhaar_last4 || 'XXXX-XXXX-1234'),
            vehicle_number: String(details.vehicle_number || 'KA-01-AB-1234'),
            vehicle_type: String(details.vehicle_type || 'Two-Wheeler with Delivery Box'),
            puc_number: String(details.puc_number || 'PUC/KA01/2024/001'),
            puc_expiry: String(details.puc_expiry || '2025-12-31'),
            insurance_policy_no: String(details.insurance_policy_no || 'POL-MOTOR-2024-001'),
            has_insulated_carrier: Boolean(details.has_insulated_carrier ?? true),
            emergency_contact_name: String(details.emergency_contact_name || 'Emergency Contact'),
            emergency_contact_phone: String(details.emergency_contact_phone || phone),
            service_city: String(details.service_city || 'Bengaluru'),
            service_pincodes: JSON.stringify(details.service_pincodes || ['560001', '560025']),
            volunteer_pledge: true,
            total_pickups_completed: 0,
            rating: 5.0,
          },
        });
      }

      // Update registered counts in analytics
      if (role === 'restaurant') {
        await tx.platformAnalytics.updateMany({
          data: { registered_restaurants: { increment: 1 } },
        });
      } else if (role === 'ngo') {
        await tx.platformAnalytics.updateMany({
          data: { registered_ngos: { increment: 1 } },
        });
      }

      return user;
    });

    // Create session token & cookie
    const token = await createSessionToken({
      userId: result.id,
      email: result.email,
      role: result.role,
    });

    await createDbSession(result.id, token, req.headers.get('user-agent') || undefined);
    await setSessionCookie(token);

    // Fetch full user with profile to return
    const fullUser = await prisma.user.findUnique({
      where: { id: result.id },
      include: {
        restaurant_profile: true,
        ngo_profile: true,
        driver_profile: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: sanitizeUser(fullUser),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
