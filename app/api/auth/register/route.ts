/**
 * POST /api/auth/register
 *
 * Creates an account in Supabase Auth (auth.users). The handle_new_user()
 * Postgres trigger creates the matching public.profiles row. NO local
 * users.json — that legacy store is no longer touched.
 *
 * Body:
 *   {
 *     username: string,        // email (kept name for back-compat)
 *     password: string,
 *     role: 'student' | 'teacher' | 'admin',
 *     firstName?: string,
 *     lastName?: string,
 *   }
 *
 * Response:
 *   { ok: true, user: { id, username, role } }
 */
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/auth-types'

const VALID_ROLES: UserRole[] = ['student', 'teacher', 'admin']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.username ?? body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const role = (body.role ?? 'student') as UserRole
    const firstName = body.firstName ? String(body.firstName).trim() : ''
    const lastName = body.lastName ? String(body.lastName).trim() : ''

    if (!email.includes('@') || password.length < 6) {
      return NextResponse.json(
        { error: 'A valid email and a password (min 6 chars) are required.' },
        { status: 400 },
      )
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
    const admin = getSupabaseAdmin()

    // Create the auth.users row. email_confirm: true skips email verification
    // (turn OFF in production once SMTP is configured).
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name: fullName },
    })

    if (error || !data.user) {
      const status = error?.message?.toLowerCase().includes('already') ? 409 : 400
      return NextResponse.json(
        { error: error?.message ?? 'Registration failed.' },
        { status },
      )
    }

    // The handle_new_user() trigger fired and created the profiles row.
    // We force-update role + full_name as a safety net in case the trigger
    // ever changes or the user_metadata payload is dropped.
    await admin
      .from('profiles')
      .update({ role, full_name: fullName || null })
      .eq('id', data.user.id)

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        username: data.user.email ?? email,
        role,
      },
    })
  } catch (err) {
    console.error('[auth/register]', err)
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 })
  }
}
