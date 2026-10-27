import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'foodbridge_local_dev_jwt_secret_super_secure_random_key_2026_98765'
);

const COOKIE_NAME = 'foodbridge_session';

// Protected path prefixes
const PROTECTED_PREFIXES = ['/restaurant', '/ngo', '/driver', '/profile'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname starts with any protected prefix
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload?.userId) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route guard
    const userRole = payload.role as string;
    if (pathname.startsWith('/restaurant') && userRole !== 'restaurant') {
      // Allow seamless navigation or redirect to appropriate dashboard
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
    if (pathname.startsWith('/ngo') && userRole !== 'ngo') {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
    if (pathname.startsWith('/driver') && userRole !== 'driver') {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Token expired or invalid
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    '/restaurant/:path*',
    '/ngo/:path*',
    '/driver/:path*',
    '/profile/:path*',
  ],
};
