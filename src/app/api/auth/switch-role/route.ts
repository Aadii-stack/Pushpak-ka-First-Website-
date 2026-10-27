import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionToken, setSessionCookie, createDbSession, sanitizeUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    if (!['restaurant', 'ngo', 'driver'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const targetUser = await prisma.user.findFirst({
      where: { role, status: 'active' },
      include: {
        restaurant_profile: true,
        ngo_profile: true,
        driver_profile: true,
      },
      orderBy: { created_at: 'asc' },
    });

    if (!targetUser) {
      return NextResponse.json({ error: `No active user found for role ${role}` }, { status: 404 });
    }

    const token = await createSessionToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
    });

    await createDbSession(targetUser.id, token, req.headers.get('user-agent') || undefined);
    await setSessionCookie(token);

    return NextResponse.json({
      message: `Switched to role: ${role}`,
      user: sanitizeUser(targetUser),
    });
  } catch (error) {
    console.error('Role switch error:', error);
    return NextResponse.json({ error: 'Failed to switch role' }, { status: 500 });
  }
}
