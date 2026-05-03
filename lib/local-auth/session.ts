/**
 * session.ts
 * Signed session token using Web Crypto API (works in Edge + Node).
 *
 * Format:  base64url(payload).base64url(signature)
 * Algorithm: HMAC-SHA-256
 */
import type { AuthSession, UserRole } from '@/lib/auth-types'

export const COOKIE_NAME = 'cognitest_session'
export const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

interface Payload {
  userId: string
  username: string
  role: UserRole
  exp: number
}

function getSecret(): string {
  return process.env.SESSION_SECRET ?? 'dev-secret-change-in-production-32chars!!'
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function toBase64url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString('base64url')
}

function fromBase64url(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'base64url'))
}

export async function encodeSession(session: AuthSession): Promise<string> {
  const payload: Payload = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const key = await getKey(getSecret())
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return `${data}.${toBase64url(sig)}`
}

export async function decodeSession(token: string): Promise<AuthSession | null> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return null
    const data = token.slice(0, dot)
    const sig = token.slice(dot + 1)

    const key = await getKey(getSecret())
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64url(sig),
      new TextEncoder().encode(data),
    )
    if (!valid) return null

    const payload: Payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return { userId: payload.userId, username: payload.username, role: payload.role }
  } catch {
    return null
  }
}
