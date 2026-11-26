/**
 * Super-admin: list student and teacher accounts, active and archived.
 *
 * Active rows come through RLS (archived rows are hidden there); archived rows
 * come only from `list_archived_accounts()`, which re-checks the caller.
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-super-admin'

type ActiveRow = {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'teacher'
  created_at: string
}

export async function GET() {
  const gate = await requireSuperAdmin()
  if ('response' in gate) return gate.response

  try {
    const sb = await getSupabaseServer()
    const active: ActiveRow[] = []
    const pageSize = 1000
    for (let from = 0; from < 100000; from += pageSize) {
      const { data, error } = await sb
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .in('role', ['student', 'teacher'])
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(from, from + pageSize - 1)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      active.push(...((data ?? []) as ActiveRow[]))
      if ((data ?? []).length < pageSize) break
    }

    const { data: archived, error: archivedError } = await sb.rpc('list_archived_accounts')
    if (archivedError) {
      console.error('[admin/accounts GET] archived', archivedError)
      return NextResponse.json({ error: 'Liste des comptes archivés indisponible.' }, { status: 500 })
    }

    return NextResponse.json({ active, archived: archived ?? [] })
  } catch (e) {
    console.error('[admin/accounts GET]', e)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
