/**
 * users-store.ts
 * Read / write data/users.json — SERVER ONLY, never import from Edge middleware.
 */
import fs from 'fs'
import path from 'path'
import type { StoredUser, UserRole } from '@/lib/auth-types'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

export function readUsers(): StoredUser[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as StoredUser[]
  } catch {
    return []
  }
}

export function writeUsers(users: StoredUser[]): void {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

/** SHA-256 via Node's built-in crypto — only call from Route Handlers / Server Actions */
export function hashPassword(password: string): string {
  // Dynamic require keeps this file importable in Edge contexts at parse time
  // (the function itself is never called from Edge code).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('crypto') as typeof import('crypto')
  return nodeCrypto.createHash('sha256').update(password).digest('hex')
}

export function findByUsername(username: string): StoredUser | undefined {
  return readUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  )
}

export function createUser(params: {
  username: string
  password: string
  role: UserRole
  firstName?: string
  lastName?: string
}): StoredUser {
  const users = readUsers()
  const existing = users.find(
    (u) => u.username.toLowerCase() === params.username.toLowerCase(),
  )
  if (existing) throw new Error('User already exists')

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('crypto') as typeof import('crypto')

  const newUser: StoredUser = {
    id: nodeCrypto.randomUUID(),
    username: params.username.trim(),
    passwordHash: hashPassword(params.password),
    role: params.role,
    createdAt: new Date().toISOString(),
    firstName: params.firstName,
    lastName: params.lastName,
  }
  writeUsers([...users, newUser])
  return newUser
}
