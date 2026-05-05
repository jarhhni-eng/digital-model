/**
 * Super-admin: update or deactivate a school.
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-super-admin'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, ctx: Ctx) {
  const gate = await requireSuperAdmin()
  if ('response' in gate) return gate.response

  const { id } = await ctx.params
  if (!id) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const patch: Record<string, unknown> = {}
    if (typeof body.name === 'string') {
      const n = body.name.trim()
      if (n.length >= 2) patch.name = n
    }
    if (body.city !== undefined) {
      patch.city = body.city === null || body.city === '' ? null : String(body.city).trim()
    }
    if (typeof body.is_active === 'boolean') {
      patch.is_active = body.is_active
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour.' }, { status: 400 })
    }

    const sb = await getSupabaseServer()
    const { data, error } = await sb
      .from('schools')
      .update(patch)
      .eq('id', id)
      .select('id, name, city, is_active, updated_at')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Établissement introuvable.' }, { status: 404 })
    }
    return NextResponse.json({ school: data })
  } catch (e) {
    console.error('[admin/schools PATCH]', e)
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}
