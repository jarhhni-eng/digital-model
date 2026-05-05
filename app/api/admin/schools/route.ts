/**
 * Super-admin: list all schools and create a school.
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-super-admin'

export async function GET() {
  const gate = await requireSuperAdmin()
  if ('response' in gate) return gate.response

  const sb = await getSupabaseServer()
  const { data, error } = await sb.from('schools').select('*').order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ schools: data ?? [] })
}

export async function POST(request: Request) {
  const gate = await requireSuperAdmin()
  if ('response' in gate) return gate.response

  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const city = body.city != null ? String(body.city).trim() || null : null
    const is_active = body.is_active === false ? false : true

    if (name.length < 2) {
      return NextResponse.json({ error: 'Le nom de l’établissement est requis.' }, { status: 400 })
    }

    const sb = await getSupabaseServer()
    const { data, error } = await sb
      .from('schools')
      .insert({ name, city, is_active })
      .select('id, name, city, is_active, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ school: data })
  } catch (e) {
    console.error('[admin/schools POST]', e)
    return NextResponse.json({ error: 'Create failed.' }, { status: 500 })
  }
}
