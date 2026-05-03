/**
 * POST /api/auth/logout — terminates the Supabase session and clears
 * the auth cookies. The middleware will redirect subsequent requests
 * to /login automatically.
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function POST() {
  const sb = await getSupabaseServer()
  await sb.auth.signOut()
  return NextResponse.json({ ok: true })
}
