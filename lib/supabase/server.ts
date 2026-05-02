/**
 * Server-side Supabase client.
 *
 * Use this from Server Components, Route Handlers, and Server Actions. It
 * reads/writes the auth cookie chain so RLS policies see the right user.
 *
 * NEVER expose the service-role key to the browser. `getSupabaseAdmin()`
 * below uses it and must only be called from trusted server code (e.g. cron
 * jobs, admin-only mutations).
 */
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

export async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component — cookies cannot be mutated there.
            // The middleware refreshes the session on the next request anyway.
          }
        },
      },
    },
  )
}

/**
 * Privileged client. Bypasses RLS — only call from secure server contexts
 * (cron, admin Route Handlers protected by an admin role check, etc.).
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin client')
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
