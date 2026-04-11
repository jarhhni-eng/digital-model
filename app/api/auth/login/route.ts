import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/server/password'
import { readJsonFile } from '@/lib/server/json-store'
import type { StoredUser } from '@/lib/auth-types'

const USERS_FILE = 'users.json'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = String(body.username ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required.' }, { status: 400 })
    }

    const users = await readJsonFile<StoredUser[]>(USERS_FILE, [])
    const user = users.find((u) => u.username === username)
    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role },
    })
  } catch {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
