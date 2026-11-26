/**
 * Super-admin account archive (soft delete) and restore.
 *
 * Authority lives in the database: `archive_account()` / `restore_account()`
 * re-check that the caller is an active super admin, write the audit row and
 * are the only way to change the archive columns. This module adds the Auth
 * side, which needs the secret key:
 *   • archive → DB archive (data hidden at once) → ban (no login / refresh)
 *               → swap the Auth e-mail for a placeholder (frees the address)
 *   • restore → put the e-mail back → lift the ban → DB restore
 *
 * The order is chosen so a partial failure always leaves the account LOCKED,
 * never exposed. Every step is idempotent, so the super admin can retry.
 */
import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Client = SupabaseClient<Database>

/** ~100 years. Supabase Auth has no "forever"; `none` lifts the ban. */
const BAN_DURATION = '876000h'
const PLACEHOLDER_DOMAIN = 'archived.invalid'

export function archivedPlaceholderEmail(userId: string): string {
  return `archived-${userId}@${PLACEHOLDER_DOMAIN}`
}

export type ArchiveOutcome =
  | { ok: true; complete: boolean; warnings: string[] }
  | { ok: false; status: number; error: string }

type Target = {
  id: string
  email: string
  role: Database['public']['Enums']['user_role']
  archived_at: string | null
  archived_email: string | null
}

const ARCHIVABLE = new Set(['student', 'teacher'])

async function loadTarget(svc: Client, id: string): Promise<Target | null> {
  const { data } = await svc
    .from('profiles')
    .select('id, email, role, archived_at, archived_email')
    .eq('id', id)
    .maybeSingle()
  return (data as Target | null) ?? null
}

function rpcFailure(error: { code?: string; message: string }): ArchiveOutcome {
  if (error.code === '42501') return { ok: false, status: 403, error: error.message }
  if (error.code === 'P0002') return { ok: false, status: 404, error: 'Compte introuvable.' }
  if (error.code === '22023') return { ok: false, status: 400, error: 'Motif requis (3 à 500 caractères).' }
  console.error('[account-archive] rpc', error)
  return { ok: false, status: 500, error: 'Échec côté base de données.' }
}

export async function archiveAccount(args: {
  sb: Client
  svc: Client
  actorId: string
  targetId: string
  reason: string
  confirmEmail: string
}): Promise<ArchiveOutcome> {
  const { sb, svc, actorId, targetId, reason, confirmEmail } = args
  if (targetId === actorId) {
    return { ok: false, status: 403, error: 'Vous ne pouvez pas archiver votre propre compte.' }
  }

  const target = await loadTarget(svc, targetId)
  if (!target) return { ok: false, status: 404, error: 'Compte introuvable.' }
  if (!ARCHIVABLE.has(target.role)) {
    return { ok: false, status: 403, error: 'Seuls les comptes élève et enseignant peuvent être archivés.' }
  }

  // Typed confirmation must match the real address (the original one on a retry).
  const realEmail = (target.archived_at ? target.archived_email : target.email) ?? ''
  if (confirmEmail.trim().toLowerCase() !== realEmail.trim().toLowerCase()) {
    return { ok: false, status: 400, error: 'L’e-mail de confirmation ne correspond pas au compte.' }
  }

  // 1. Database (as the signed-in super admin, so the DB re-checks authority).
  const { error: rpcError } = await sb.rpc('archive_account', { target: targetId, reason })
  if (rpcError) return rpcFailure(rpcError)

  const warnings: string[] = []

  // 2. Block new logins and token refreshes.
  const ban = await svc.auth.admin.updateUserById(targetId, { ban_duration: BAN_DURATION })
  if (ban.error) {
    console.error('[account-archive] ban', ban.error)
    warnings.push('Le blocage de connexion a échoué : relancez l’archivage.')
  }

  // 3. Free the address for a new sign-up.
  const placeholder = archivedPlaceholderEmail(targetId)
  if (target.email !== placeholder) {
    const swap = await svc.auth.admin.updateUserById(targetId, { email: placeholder, email_confirm: true })
    if (swap.error) {
      console.error('[account-archive] email swap', swap.error)
      warnings.push('L’e-mail n’a pas pu être libéré : relancez l’archivage.')
    }
  }

  return { ok: true, complete: warnings.length === 0, warnings }
}

export async function restoreAccount(args: { sb: Client; svc: Client; targetId: string }): Promise<ArchiveOutcome> {
  const { sb, svc, targetId } = args

  const target = await loadTarget(svc, targetId)
  if (!target) return { ok: false, status: 404, error: 'Compte introuvable.' }
  if (!ARCHIVABLE.has(target.role)) {
    return { ok: false, status: 403, error: 'Seuls les comptes élève et enseignant peuvent être restaurés.' }
  }
  if (!target.archived_at) return { ok: false, status: 409, error: 'Ce compte n’est pas archivé.' }

  const original = target.archived_email?.trim()
  if (!original) {
    return { ok: false, status: 500, error: 'E-mail d’origine manquant : restauration manuelle requise.' }
  }

  // 1. The address may have been reused by a new sign-up since the archive.
  const { data: clash } = await svc
    .from('profiles')
    .select('id')
    .eq('email', original)
    .neq('id', targetId)
    .maybeSingle()
  if (clash) {
    return {
      ok: false,
      status: 409,
      error: `L’e-mail ${original} est désormais utilisé par un autre compte. Restauration impossible.`,
    }
  }

  if (target.email !== original) {
    const swap = await svc.auth.admin.updateUserById(targetId, { email: original, email_confirm: true })
    if (swap.error) {
      console.error('[account-archive] email restore', swap.error)
      const taken = /already|registered|exists/i.test(swap.error.message)
      return {
        ok: false,
        status: taken ? 409 : 500,
        error: taken
          ? `L’e-mail ${original} est désormais utilisé par un autre compte.`
          : 'Impossible de rétablir l’e-mail. Le compte reste archivé.',
      }
    }
  }

  // 2. Lift the ban. Data stays hidden until step 3, so a failure here is safe.
  const unban = await svc.auth.admin.updateUserById(targetId, { ban_duration: 'none' })
  if (unban.error) {
    console.error('[account-archive] unban', unban.error)
    return { ok: false, status: 500, error: 'Impossible de lever le blocage. Le compte reste archivé : réessayez.' }
  }

  // 3. Database (re-checks the caller is an active super admin).
  const { error: rpcError } = await sb.rpc('restore_account', { target: targetId })
  if (rpcError) return rpcFailure(rpcError)

  return { ok: true, complete: true, warnings: [] }
}
