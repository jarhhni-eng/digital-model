'use client'

/**
 * Auth context — backed by Supabase Auth.
 *
 * The public surface (user, login, register, logout) is unchanged so the
 * rest of the app keeps compiling. Internally, it now talks to Supabase
 * via `@supabase/ssr`. Sessions live in cookies (refreshed by middleware),
 * not in localStorage.
 *
 * The `username` field of AuthSession holds the user's email — that's how
 * we previously persisted login identifiers, so existing callsites don't
 * have to change.
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
import { getSupabaseBrowser } from '@/lib/supabase/client'

type AuthContextValue = {
  user: AuthSession | null
  loading: boolean
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; session?: AuthSession }>
  register: (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string,
  ) => Promise<{ ok: boolean; error?: string; session?: AuthSession }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadSession(): Promise<AuthSession | null> {
  const sb = getSupabaseBrowser()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  // Pull role from public.profiles (RLS allows the user to read their own row).
  const { data: profile } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    userId: user.id,
    username: user.email ?? '',
    role: (profile?.role ?? 'student') as UserRole,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadSession().then((s) => {
      if (!cancelled) {
        setUser(s)
        setLoading(false)
      }
    })

    // React to login/logout in other tabs and to background refresh.
    const sb = getSupabaseBrowser()
    const { data: sub } = sb.auth.onAuthStateChange(async () => {
      const s = await loadSession()
      if (!cancelled) setUser(s)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const sb = getSupabaseBrowser()
      const { data, error } = await sb.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        return { ok: false, error: error?.message ?? 'Login failed' }
      }
      const session = await loadSession()
      if (!session) return { ok: false, error: 'Profile lookup failed' }
      setUser(session)
      return { ok: true, session }
    },
    [],
  )

  const register = useCallback(
    async (email: string, password: string, role: UserRole, fullName?: string) => {
      const sb = getSupabaseBrowser()
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { role, full_name: fullName ?? '' },
        },
      })
      if (error || !data.user) {
        return { ok: false, error: error?.message ?? 'Registration failed' }
      }
      // The handle_new_user() trigger creates the profile row server-side.
      const session = await loadSession()
      if (!session) return { ok: false, error: 'Profile creation failed' }
      setUser(session)
      return { ok: true, session }
    },
    [],
  )

  const logout = useCallback(async () => {
    const sb = getSupabaseBrowser()
    await sb.auth.signOut()
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
