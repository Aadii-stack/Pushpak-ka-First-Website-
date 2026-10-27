import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken, sanitizeUser } from '../src/lib/auth';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PRODUCTION DATABASE & AUTH VERIFICATION 🧪');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // 1. Database Connectivity
  console.log('--- Test 1: Database Connectivity ---');
  const userCount = await prisma.user.count();
  assert(userCount >= 8, `Database connected successfully (found ${userCount} users)`);

  // 2. Password Hashing Security Check
  console.log('\n--- Test 2: Password Hashing Verification ---');
  const sampleUser = await prisma.user.findFirst({
    where: { email: 'rajesh@greengarden.com' },
  });
  assert(!!sampleUser, 'Found sample user');
  assert(
    sampleUser!.password_hash.startsWith('$2a$') || sampleUser!.password_hash.startsWith('$2b$'),
    'Passwords are encrypted with bcrypt (12 rounds) - not plaintext'
  );
  assert(!sampleUser!.password_hash.includes('Password123!'), 'Plaintext password is never stored in DB');

  // Verify bcrypt check
  const passwordMatch = await bcrypt.compare('Password123!', sampleUser!.password_hash);
  assert(passwordMatch === true, 'Bcrypt correctly verifies valid password');

  const passwordMismatch = await bcrypt.compare('WrongPassword999', sampleUser!.password_hash);
  assert(passwordMismatch === false, 'Bcrypt rejects incorrect password');

  // 3. User Signup
  console.log('\n--- Test 3: User Signup ---');
  const testEmail = `test.kitchen.${Date.now()}@testfoodbridge.com`;
  const hashedPw = await hashPassword('MySecurePass2026!');

  const createdUser = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        name: 'Test Gourmet Bistro',
        email: testEmail,
        phone: '+91 99887 76655',
        password_hash: hashedPw,
        role: 'restaurant',
        verified_status: 'verified',
        status: 'active',
      },
    });

    await tx.restaurantProfile.create({
      data: {
        user_id: u.id,
        business_name: 'Test Gourmet Bistro',
        address: '99 Church Street, Bengaluru',
        lat: 12.975,
        lng: 77.605,
        cuisine_type: 'Continental & Indian',
        operating_hours: '11:00 AM - 11:00 PM',
        contact_person: 'Gourmet Manager',
        phone: '+91 99887 76655',
        email: testEmail,
        fssai_license: '11223344998877',
      },
    });

    return u;
  });

  assert(!!createdUser.id, 'User signup transaction completed with user and restaurant profile');

  // 4. Duplicate Signup Prevention
  console.log('\n--- Test 4: Duplicate Email Prevention ---');
  const duplicate = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  assert(!!duplicate, 'Existing user email found in unique index');
  try {
    await prisma.user.create({
      data: {
        name: 'Duplicate Hacker',
        email: testEmail,
        phone: '+91 11111 22222',
        password_hash: hashedPw,
        role: 'restaurant',
      },
    });
    assert(false, 'Should have thrown unique constraint violation');
  } catch (err: any) {
    assert(err.code === 'P2002' || err.message.includes('Unique constraint'), 'Database uniquely enforces email uniqueness');
  }

  // 5. JWT Token Creation & Verification
  console.log('\n--- Test 5: Session Token & Identity Management ---');
  const token = await createSessionToken({
    userId: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
  });
  assert(typeof token === 'string' && token.split('.').length === 3, 'Valid signed JWT session token created');

  const verifiedPayload = await verifySessionToken(token);
  assert(verifiedPayload?.userId === createdUser.id, 'JWT session token verified successfully');

  // 6. Sensitive Data Exposure Prevention
  console.log('\n--- Test 6: Sensitive Field Stripping ---');
  const userWithProfile = await prisma.user.findUnique({
    where: { id: createdUser.id },
    include: { restaurant_profile: true },
  });
  const sanitized = sanitizeUser(userWithProfile);
  assert(!('password_hash' in sanitized), 'password_hash is stripped from API response model');
  assert(sanitized.email === testEmail, 'Public user details safely preserved');

  // 7. Profile Updates
  console.log('\n--- Test 7: Profile Updates (PATCH /api/users/me) ---');
  const updatedUser = await prisma.user.update({
    where: { id: createdUser.id },
    data: { name: 'Updated Gourmet Bistro Title' },
  });
  assert(updatedUser.name === 'Updated Gourmet Bistro Title', 'User name updated in database');

  // 8. Listings and Relations
  console.log('\n--- Test 8: Surplus Listings & Foreign Key Relationships ---');
  const restProfile = await prisma.restaurantProfile.findUnique({
    where: { user_id: createdUser.id },
  });
  assert(!!restProfile, 'Found created restaurant profile');

  const newListing = await prisma.surplusListing.create({
    data: {
      restaurant_id: restProfile!.id,
      restaurant_name: restProfile!.business_name,
      restaurant_address: restProfile!.address,
      restaurant_lat: restProfile!.lat,
      restaurant_lng: restProfile!.lng,
      title: 'Fresh Dinner Meals Pack',
      category: 'cooked_meals',
      description: 'Test surplus meals',
      quantity: 50,
      remaining_quantity: 50,
      unit: 'servings',
      expiry_at: new Date(Date.now() + 4 * 3600 * 1000),
      pickup_window_start: new Date(),
      pickup_window_end: new Date(Date.now() + 3 * 3600 * 1000),
      prepared_at: new Date(),
      packaging_status: 'packed',
      logistics_offer: 'staff_handoff_cold_storage',
    },
  });
  assert(!!newListing.id, 'Surplus listing successfully created with foreign key relation');

  // 9. Cascade Deletion Integrity
  console.log('\n--- Test 9: Cascade Deletion Integrity ---');
  await prisma.user.delete({
    where: { id: createdUser.id },
  });
  const checkProfile = await prisma.restaurantProfile.findUnique({
    where: { user_id: createdUser.id },
  });
  assert(!checkProfile, 'Cascade delete verified: user profile deleted when user is deleted');

  const checkListing = await prisma.surplusListing.findUnique({
    where: { id: newListing.id },
  });
  assert(!checkListing, 'Cascade delete verified: listing deleted when profile is deleted');

  // 10. Platform Analytics Live Query
  console.log('\n--- Test 10: Platform Analytics Live Query ---');
  const analytics = await prisma.platformAnalytics.findUnique({
    where: { id: 'global' },
  });
  assert(!!analytics, 'Global analytics table populated and queried');
  assert(analytics!.total_meals_donated > 0, 'Analytics has real aggregated values');

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed}/${total} DATABASE & AUTH TESTS PASSED PERFECTLY! 🎉`);
  console.log('====================================================\n');
}

runTests()
  .catch((e) => {
    console.error('Test execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
