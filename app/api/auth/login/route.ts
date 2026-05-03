/**
 * POST /api/auth/login
 * Local auth — reads data/users.json, verifies password hash,
 * sets a signed session cookie.
 */
import { NextResponse } from 'next/server'
import { findByUsername, hashPassword } from '@/lib/local-auth/users-store'
import { encodeSession, COOKIE_NAME, TTL_SECONDS } from '@/lib/local-auth/session'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = String(body.username ?? body.email ?? '').trim()
    const password = String(body.password ?? '')

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required.' }, { status: 400 })
    }

    const user = findByUsername(username)
    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

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
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
