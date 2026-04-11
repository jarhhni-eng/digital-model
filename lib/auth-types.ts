export type UserRole = 'student' | 'teacher' | 'admin'

export interface StoredUser {
  id: string
  username: string
  passwordHash: string
  role: UserRole
  createdAt: string
}

export interface AuthSession {
  userId: string
  username: string
  role: UserRole
}
