import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearSessionCookie, invalidateDbSession, COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      await invalidateDbSession(token);
    }
    await clearSessionCookie();

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to complete logout' }, { status: 500 });
  }
}
