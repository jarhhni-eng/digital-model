import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { getSupabaseServer } from '@/lib/supabase/server'

export type SuperAdminGate = { user: User } | { response: NextResponse }

export async function requireSuperAdmin(): Promise<SuperAdminGate> {
  const sb = await getSupabaseServer()
  const {
    data: { user },
    error: authErr,
  } = await sb.auth.getUser()
  if (authErr || !user) {
    return { response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  const { data: row, error: pErr } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (pErr || row?.role !== 'super_admin') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user }
}
