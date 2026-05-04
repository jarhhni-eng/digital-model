/**
 * Merge catalog tests (`mockTests`) with the current user's `test_sessions`
 * rows from Supabase for UI on /tests and /results.
 */

import type { Test } from '@/lib/mock-data'
import type { Database } from '@/lib/types/database'

export type SessionStatus = Database['public']['Tables']['test_sessions']['Row']['status']

export type TestWithProgress = Test & {
  /** Derived from latest matching session (not mock status). */
  status: 'upcoming' | 'in-progress' | 'completed'
  /** Latest session score % when completed; null otherwise. */
  latestScore: number | null
  /** Latest session id when useful for links/debug. */
  latestSessionId?: string
}

type SessionRow = Database['public']['Tables']['test_sessions']['Row']

/** Newest session wins per `test_id`. */
export function latestSessionByTestId(sessions: SessionRow[]): Map<string, SessionRow> {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  )
  const map = new Map<string, SessionRow>()
  for (const row of sorted) {
    if (!map.has(row.test_id)) map.set(row.test_id, row)
  }
  return map
}

function rowToUiStatus(row: SessionRow): 'upcoming' | 'in-progress' | 'completed' {
  if (row.status === 'completed') return 'completed'
  if (row.status === 'in-progress') return 'in-progress'
  return 'upcoming'
}

/**
 * Overlay real session state onto catalog tests (order preserved).
 */
export function mergeCatalogWithSessions(
  catalog: readonly Test[],
  sessions: SessionRow[],
): TestWithProgress[] {
  const byTest = latestSessionByTestId(sessions)
  return catalog.map((t) => {
    const row = byTest.get(t.id)
    if (!row) {
      return {
        ...t,
        status: 'upcoming',
        latestScore: null,
      }
    }
    const status = rowToUiStatus(row)
    const latestScore =
      status === 'completed' && row.score != null ? Math.round(Number(row.score)) : null
    return {
      ...t,
      status,
      latestScore,
      latestSessionId: row.id,
    }
  })
}

/** Group catalog entries by `domain` string for results-style layout. */
export function groupTestsByDomain(tests: TestWithProgress[]): { domain: string; tests: TestWithProgress[] }[] {
  const order: string[] = []
  const buckets = new Map<string, TestWithProgress[]>()
  for (const t of tests) {
    const d = t.domain || 'Other'
    if (!buckets.has(d)) {
      buckets.set(d, [])
      order.push(d)
    }
    buckets.get(d)!.push(t)
  }
  return order.map((domain) => ({ domain, tests: buckets.get(domain)! }))
}

/** Mean of completed non-null scores in the list; 0 if none. */
export function averageCompletedScore(tests: TestWithProgress[]): number {
  const done = tests.filter((t) => t.status === 'completed' && t.latestScore != null)
  if (!done.length) return 0
  return Math.round(done.reduce((s, t) => s + (t.latestScore as number), 0) / done.length)
}

/** Chronological points for “progress over time” charts (oldest → newest). */
export function completedSessionsChronology(
  catalog: readonly Test[],
  sessions: SessionRow[],
): { test: string; score: number }[] {
  const titleByTestId = new Map(catalog.map((t) => [t.id, t.title]))
  const short = (s: string, max = 22) =>
    s.length <= max ? s : `${s.slice(0, max - 1)}…`

  return [...sessions]
    .filter((row) => row.status === 'completed' && row.score != null)
    .sort(
      (a, b) =>
        new Date(a.completed_at ?? a.started_at).getTime() -
        new Date(b.completed_at ?? b.started_at).getTime(),
    )
    .map((row) => ({
      test: short(titleByTestId.get(row.test_id) ?? row.test_id),
      score: Math.round(Number(row.score)),
    }))
}
