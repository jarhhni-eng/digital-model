/**
 * Session-refresh middleware.
 *
 * Runs on every request, refreshes the Supabase session cookie if it's
 * expiring, and guards the routes listed in PROTECTED_PREFIXES. Imported
 * by the root middleware.ts.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

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

const PUBLIC_PATHS = new Set(['/', '/login', '/register'])

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(toSet) {
          for (const { name, value } of toSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of toSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // Refresh the session — must be the first DB call after createServerClient.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.has(path) || path.startsWith('/_next') || path.startsWith('/api/auth/callback')
  const needsAuth = PROTECTED_PREFIXES.some((p) => path.startsWith(p))

  if (needsAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Already-authed users hitting the auth pages → bounce to their dashboard.
  if (user && (path === '/login' || path === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}
