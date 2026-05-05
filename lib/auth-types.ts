export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin'

/** Roles allowed for public self-registration only (`/register`). */
export type PublicRegisterRole = 'student' | 'teacher'

/** Access to /admin and RLS paths that use `is_admin()` (admin + super_admin). */
export function isAdminAreaRole(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

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
