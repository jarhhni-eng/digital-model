'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { AuthUser } from './types'
import { MOCK_CREDENTIALS } from './mock-users'

// ── Storage key ──────────────────────────────────────────────
const SESSION_KEY = 'cognitest_session'

// ── Context shape ────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (
    username: string,
    password: string,
    role?: 'student' | 'teacher' | 'admin'
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const parsed: AuthUser = JSON.parse(raw)
        setUser(parsed)
      }
    } catch {
      // ignore corrupted storage
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (
      username: string,
      password: string,
      role?: 'student' | 'teacher' | 'admin'
    ): Promise<{ success: boolean; error?: string }> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 600))

      // Exact credential match
      let credential = MOCK_CREDENTIALS.find(
        (c) =>
          c.username.toLowerCase() === username.toLowerCase() &&
          c.password === password
      )

      // Demo fallback: accept any credentials if username matches a role prefix
      if (!credential && role) {
        const demoCred = MOCK_CREDENTIALS.find(
          (c) => c.username === role && c.password === 'demo'
        )
        if (demoCred) credential = demoCred
      }

      // Final fallback for demo environment: accept any username/password
      // and assign role based on the role toggle selection
      if (!credential && role) {
        const fallbackUser: AuthUser = {
          id: `${role}-${username.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'demo'}`,
          username: username || role,
          role,
          displayName:
            username.charAt(0).toUpperCase() + username.slice(1) || `Demo ${role}`,
          createdAt: new Date().toISOString(),
        }
        try {
          localStorage.setItem(SESSION_KEY, JSON.stringify(fallbackUser))
          // Backwards compat
          localStorage.setItem('cogniTestRole', role)
          localStorage.setItem('cogniTestEmail', username)
        } catch {
          // ignore
        }
        setUser(fallbackUser)
        return { success: true }
      }

      if (!credential) {
        return { success: false, error: 'Identifiants incorrects.' }
      }

      const authenticatedUser = { ...credential.user }
      // Override role from toggle if explicitly provided and they match direction
      if (role && role !== authenticatedUser.role) {
        // Don't allow role override for real credentials
        return {
          success: false,
          error: `Ce compte est un compte ${authenticatedUser.role}.`,
        }
      }

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser))
        localStorage.setItem('cogniTestRole', authenticatedUser.role)
        localStorage.setItem('cogniTestEmail', authenticatedUser.username)
      } catch {
        // ignore
      }

      setUser(authenticatedUser)
      return { success: true }
    },
    []
  )

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem('cogniTestRole')
      localStorage.removeItem('cogniTestEmail')
    } catch {
      // ignore
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
