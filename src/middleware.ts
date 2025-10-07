// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'sagenex_auth_token';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  // If the user is trying to access the login page but is already authenticated,
  // redirect them to the admin dashboard.
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/admin/onboard-user', request.url));
  }

  // If the user is trying to access a protected admin route without a token,
  // redirect them to the login page.
  if (!token && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
