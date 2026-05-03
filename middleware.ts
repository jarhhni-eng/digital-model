/**
 * middleware.ts
 * Route protection using the local session cookie (Edge-compatible).
 * No Supabase dependency.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { decodeSession, COOKIE_NAME } from '@/lib/local-auth/session'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/profile-setup',
  '/tests',
  '/results',
  '/teacher',
  '/admin',
  '/analytics',
]

// Pages that are always public (no auth required).
const PUBLIC_PATHS = new Set(['/', '/register'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow Next.js internals, static assets, and auth API routes.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await decodeSession(token) : null

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  // Unauthenticated user trying to access a protected page → login.
  if (needsAuth && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated user hitting the login or register page → their dashboard.
  if (session && PUBLIC_PATHS.has(pathname)) {
    const url = request.nextUrl.clone()
    if (session.role === 'admin') url.pathname = '/admin'
    else if (session.role === 'teacher') url.pathname = '/teacher/dashboard'
    else url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
