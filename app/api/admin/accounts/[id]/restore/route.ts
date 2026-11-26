/**
 * Super-admin: restore an archived student or teacher account.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServer, tryGetSupabaseAdmin } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-super-admin'
import { rejectCrossOrigin } from '@/lib/api/same-origin'
import { restoreAccount } from '@/lib/admin/account-archive'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, ctx: Ctx) {
  const blocked = rejectCrossOrigin(request)
  if (blocked) return blocked

  const gate = await requireSuperAdmin()
  if ('response' in gate) return gate.response

  const { id } = await ctx.params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 })
  }

  const svc = tryGetSupabaseAdmin()
  if (!svc) {
    return NextResponse.json(
      { error: 'Restoring requires SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) on the server.' },
      { status: 503 },
    )
  }

  try {
    const sb = await getSupabaseServer()
    const outcome = await restoreAccount({ sb, svc, targetId: id })
    if (!outcome.ok) return NextResponse.json({ error: outcome.error }, { status: outcome.status })
    return NextResponse.json(outcome)
  } catch (e) {
    console.error('[admin/accounts restore]', e)
    return NextResponse.json({ error: 'Restore failed.' }, { status: 500 })
  }
}
