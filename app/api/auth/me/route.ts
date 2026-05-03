/**
 * GET /api/auth/me
 * Returns the current session from the cookie, or 401.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/local-auth/session'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ user: null }, { status: 401 })

  const session = await decodeSession(token)
  if (!session) return NextResponse.json({ user: null }, { status: 401 })

  return NextResponse.json({ user: session })
}
