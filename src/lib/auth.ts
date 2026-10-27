import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'foodbridge_local_dev_jwt_secret_super_secure_random_key_2026_98765'
);

export const COOKIE_NAME = 'foodbridge_session';
const SESSION_EXPIRY = '7d';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token Creation & Verification
export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// Cookie Helpers (Server-side)
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_EXPIRY_MS / 1000),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// User Sanitization: Never expose password_hash
export function sanitizeUser(user: any) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// Server-side Authentication Resolver
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        restaurant_profile: true,
        ngo_profile: true,
        driver_profile: true,
      },
    });

    if (!user || user.status !== 'active') return null;
    return sanitizeUser(user);
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return null;
  }
}

// Session Creation in Database
export async function createDbSession(userId: string, token: string, userAgent?: string, ip?: string) {
  try {
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);
    await prisma.session.create({
      data: {
        user_id: userId,
        token,
        expires_at: expiresAt,
        user_agent: userAgent || null,
        ip_address: ip || null,
      },
    });
  } catch (err) {
    console.error('Failed to record session in database:', err);
  }
}

// Invalidate Session in Database
export async function invalidateDbSession(token: string) {
  try {
    await prisma.session.deleteMany({
      where: { token },
    });
  } catch (err) {
    console.error('Failed to invalidate session:', err);
  }
}
