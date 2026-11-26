import { NextResponse } from 'next/server'

/**
 * CSRF guard for state-changing, cookie-authenticated routes.
 *
 * Browsers always send `Origin` on cross-origin POST requests. Reject any
 * request whose Origin does not match the host it was sent to. Requests
 * without an Origin header (same-origin GET-style tooling) are refused too,
 * since every caller of these routes is our own UI.
 */
export function rejectCrossOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin')
  const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwarded || request.headers.get('host')
  if (!origin || !host) {
    return NextResponse.json({ error: 'Origin check failed.' }, { status: 403 })
  }
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return NextResponse.json({ error: 'Origin check failed.' }, { status: 403 })
  }
  if (originHost !== host) {
    return NextResponse.json({ error: 'Origin check failed.' }, { status: 403 })
  }
  return null
}
