/**
 * POST /api/auth/register
 * Local auth — creates a new user in data/users.json,
 * then sets a signed session cookie so the user is immediately logged in.
 */
import { NextResponse } from 'next/server'
import { createUser } from '@/lib/local-auth/users-store'
import { encodeSession, COOKIE_NAME, TTL_SECONDS } from '@/lib/local-auth/session'
import type { UserRole } from '@/lib/auth-types'

const VALID_ROLES: UserRole[] = ['student', 'teacher', 'admin']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = String(body.username ?? body.email ?? '').trim()
    const password = String(body.password ?? '')
    const role = (body.role ?? 'student') as UserRole
    const firstName = body.firstName ? String(body.firstName).trim() : undefined
    const lastName = body.lastName ? String(body.lastName).trim() : undefined

    if (!username || password.length < 4) {
      return NextResponse.json(
        { error: 'A username and a password (min 4 chars) are required.' },
        { status: 400 },
      )
    }
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
    }

    const user = createUser({ username, password, role, firstName, lastName })
    const session = { userId: user.id, username: user.username, role: user.role }
    const token = await encodeSession(session)

    const res = NextResponse.json({ ok: true, user: session })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: TTL_SECONDS,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed.'
    const status = msg.toLowerCase().includes('already') ? 409 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
