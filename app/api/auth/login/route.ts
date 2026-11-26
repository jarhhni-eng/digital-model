/**
 * POST /api/auth/login
 *
 * Calls Supabase Auth with the cookie-bound server client so the response
 * Set-Cookie header carries the new session. NO local users.json lookup.
 *
 * Body: { username: email, password }
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.username ?? body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required.' },
        { status: 400 },
      )
    }

    const sb = await getSupabaseServer()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      if (error && /banned/i.test(error.message)) {
        return NextResponse.json({ error: 'This account has been deactivated.' }, { status: 403 })
      }
      return NextResponse.json(
        { error: error?.message ?? 'Invalid credentials.' },
        { status: 401 },
      )
    }

    // Pull the role from public.profiles. RLS allows the just-signed-in
    // user to read their own row.
    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    // RLS hides archived profiles. Never fall back to a default role for them.
    if (profileError) {
      console.error('[auth/login] profile', profileError)
      return NextResponse.json({ error: 'Profile lookup failed.' }, { status: 500 })
    }
    if (!profile) {
      await sb.auth.signOut()
      return NextResponse.json({ error: 'This account has been deactivated.' }, { status: 403 })
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        username: data.user.email ?? email,
        role: profile.role,
      },
    })
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
