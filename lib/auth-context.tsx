'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AuthSession, UserRole } from '@/lib/auth-types'

const STORAGE_KEY = 'cogniTestSession'

type AuthContextValue = {
  user: AuthSession | null
  loading: boolean
  login: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; session?: AuthSession }>
  register: (
    username: string,
    password: string,
    role: UserRole
  ) => Promise<{ ok: boolean; error?: string; session?: AuthSession }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

function saveSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      localStorage.setItem('cogniTestRole', session.role === 'admin' ? 'teacher' : session.role)
      localStorage.setItem('cogniTestEmail', session.username)
    } else {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('cogniTestRole')
      localStorage.removeItem('cogniTestEmail')
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(loadSession())
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Login failed' }
    }
    const session: AuthSession = {
      userId: data.user.id,
      username: data.user.username,
      role: data.user.role,
    }
    setUser(session)
    saveSession(session)
    return { ok: true, session }
  }, [])

  const register = useCallback(
    async (username: string, password: string, role: UserRole) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { ok: false, error: data.error ?? 'Registration failed' }
      }
      const session: AuthSession = {
        userId: data.user.id,
        username: data.user.username,
        role: data.user.role,
      }
      setUser(session)
      saveSession(session)
      return { ok: true, session }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    saveSession(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
