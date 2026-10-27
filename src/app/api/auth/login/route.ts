import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie, createDbSession, sanitizeUser } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  preferredRole: z.enum(['restaurant', 'ngo', 'driver']).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid login payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, preferredRole } = parsed.data;

    let user: any = null;

    if (email && email.trim()) {
      const normalizedEmail = email.toLowerCase().trim();
      const foundUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          restaurant_profile: true,
          ngo_profile: true,
          driver_profile: true,
        },
      });

      if (foundUser) {
        // If password is provided, verify it
        if (password) {
          const isValid = await verifyPassword(password, foundUser.password_hash);
          if (!isValid) {
            return NextResponse.json(
              { error: 'Invalid email or password. Please check your credentials.' },
              { status: 401 }
            );
          }
        }
        user = foundUser;
      }
    }

    // If not found by email and preferredRole provided, find primary account for that role
    if (!user && preferredRole) {
      user = await prisma.user.findFirst({
        where: { role: preferredRole, status: 'active' },
        include: {
          restaurant_profile: true,
          ngo_profile: true,
          driver_profile: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found. Please verify your email or sign up.' },
        { status: 404 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'This account has been deactivated or suspended.' },
        { status: 403 }
      );
    }

    // Update last_login_at
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Create session token and set secure HttpOnly cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await createDbSession(user.id, token, req.headers.get('user-agent') || undefined);
    await setSessionCookie(token);

    return NextResponse.json({
      message: 'Logged in successfully',
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
