'use client'

/**
 * Auth context — backed by local API routes (no Supabase).
 * Sessions live in an httpOnly cookie managed by the server.
 * The public surface (user, login, register, logout) is unchanged.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AuthSession, UserRole } from '@/lib/auth-types'

type AuthContextValue = {
  user: AuthSession | null
  loading: boolean
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; session?: AuthSession }>
  register: (
    username: string,
    password: string,
    role: UserRole,
    fullName?: string,
  ) => Promise<{ ok: boolean; error?: string; session?: AuthSession }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, ask the server who is logged in (reads the httpOnly cookie).
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? 'Login failed' }
    }
    setUser(data.user)
    return { ok: true, session: data.user as AuthSession }
  }, [])

  const register = useCallback(
    async (username: string, password: string, role: UserRole, fullName?: string) => {
      // Split fullName into firstName / lastName for the API.
      const parts = (fullName ?? '').trim().split(/\s+/)
      const firstName = parts[0] ?? ''
      const lastName = parts.slice(1).join(' ') || undefined

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, firstName, lastName }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error ?? 'Registration failed' }
      }
      setUser(data.user)
      return { ok: true, session: data.user as AuthSession }
    },
    [],
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
