/**
 * Browser-side Supabase client.
 *
 * Use this from any 'use client' component. The client reads the session
 * from cookies that the middleware refreshes on every request, so it stays
 * in sync with the server-rendered tree.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowser() {
  if (_client) return _client
  _client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return _client
}
