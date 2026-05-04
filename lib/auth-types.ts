export type UserRole = 'student' | 'teacher' | 'admin'

export interface StoredUser {
  id: string
  username: string
  passwordHash: string
  role: UserRole
  createdAt: string
  firstName?: string
  lastName?: string
  testAttempts?: number
}

export interface AuthSession {
  userId: string
  /** Signed-in email (Supabase). */
  username: string
  /** `profiles.full_name` or auth metadata when present. */
  displayName: string | null
  role: UserRole
}
