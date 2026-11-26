/**
 * Super-admin: archive (soft delete) a student or teacher account.
 *
 * POST body: { reason: string (3–500), confirmEmail: string }
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServer, tryGetSupabaseAdmin } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/api/require-super-admin'
import { rejectCrossOrigin } from '@/lib/api/same-origin'
import { archiveAccount } from '@/lib/admin/account-archive'

type Ctx = { params: Promise<{ id: string }> }

const Body = z.object({
  reason: z.string().trim().min(3).max(500),
  confirmEmail: z.string().trim().min(3).max(320),
})

export async function POST(request: Request, ctx: Ctx) {
  const blocked = rejectCrossOrigin(request)
  if (blocked) return blocked

  const gate = await requireSuperAdmin()
  if ('response' in gate) return gate.response

  const { id } = await ctx.params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Identifiant invalide.' }, { status: 400 })
  }

  const parsed = Body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Motif (3 à 500 caractères) et e-mail de confirmation requis.' },
      { status: 400 },
    )
  }

  const svc = tryGetSupabaseAdmin()
  if (!svc) {
    return NextResponse.json(
      { error: 'Archiving requires SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) on the server.' },
      { status: 503 },
    )
  }

  try {
    const sb = await getSupabaseServer()
    const outcome = await archiveAccount({
      sb,
      svc,
      actorId: gate.user.id,
      targetId: id,
      reason: parsed.data.reason,
      confirmEmail: parsed.data.confirmEmail,
    })
    if (!outcome.ok) return NextResponse.json({ error: outcome.error }, { status: outcome.status })
    return NextResponse.json(outcome)
  } catch (e) {
    console.error('[admin/accounts archive]', e)
    return NextResponse.json({ error: 'Archive failed.' }, { status: 500 })
  }
}
