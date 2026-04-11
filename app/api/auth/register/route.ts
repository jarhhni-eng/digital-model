import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { hashPassword } from '@/lib/server/password'
import { readJsonFile, writeJsonFile } from '@/lib/server/json-store'
import type { StoredUser } from '@/lib/auth-types'
import type { UserRole } from '@/lib/auth-types'

const USERS_FILE = 'users.json'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = String(body.username ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const role = (body.role ?? 'student') as UserRole

    if (username.length < 2 || password.length < 4) {
      return NextResponse.json(
        { error: 'Username (min 2) and password (min 4) required.' },
        { status: 400 }
      )
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
    }

    const users = await readJsonFile<StoredUser[]>(USERS_FILE, [])
    if (users.some((u) => u.username === username)) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 })
    }

    const user: StoredUser = {
      id: randomUUID(),
      username,
      passwordHash: hashPassword(password),
      role,
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    await writeJsonFile(USERS_FILE, users)

    return NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role },
    })
  } catch {
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 })
  }
}
