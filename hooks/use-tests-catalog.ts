'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { Test } from '@/lib/mock-data'
import { mockTests } from '@/lib/mock-data'
import { listTestsCatalog, mergeDbCatalogOntoMock } from '@/lib/tests-catalog'

type CatalogSource = 'database' | 'mock'

/**
 * Loads `public.tests` after the user is known so the JWT is present on the client.
 * Merges DB rows onto `mockTests` so every in-app test id keeps questions/metadata.
 * Falls back to mock-only when the request fails or returns no rows.
 */
export function useTestsCatalog() {
  const { user } = useAuth()
  const uid = user?.userId ?? null

  const [catalog, setCatalog] = useState<Test[]>(() => mockTests)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<CatalogSource>('mock')

  useEffect(() => {
    let cancelled = false

    if (!uid) {
      setCatalog(mockTests)
      setSource('mock')
      setLoading(false)
      return
    }

    setLoading(true)
    listTestsCatalog()
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data.length > 0) {
          setCatalog(mergeDbCatalogOntoMock(data))
          setSource('database')
        } else {
          setCatalog(mockTests)
          setSource('mock')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCatalog(mockTests)
          setSource('mock')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [uid])

  return { catalog, loading, fromDatabase: source === 'database' }
}
