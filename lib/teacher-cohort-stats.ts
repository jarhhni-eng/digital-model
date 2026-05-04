/**
 * Derive teacher-facing aggregates from `my_students` + visible `test_sessions`
 * (RLS already limits rows to the signed-in teacher’s roster).
 */

import type { Test } from '@/lib/mock-data'
import type { MyStudentViewRow } from '@/lib/results/results-service'
import type { Database } from '@/lib/types/database'

type SessionRow = Database['public']['Tables']['test_sessions']['Row']

export type RosterStudentRow = {
  id: string
  name: string
  email: string
  scholarLevel: string | null
  averageScore: number
  completedTests: number
  mathAverage2024_2025: number | null
  mathAverage2025_2026: number | null
}

export function mergeRosterWithSessions(
  roster: MyStudentViewRow[],
  sessions: SessionRow[],
): RosterStudentRow[] {
  const byUser = new Map<string, SessionRow[]>()
  for (const row of sessions) {
    const arr = byUser.get(row.user_id) ?? []
    arr.push(row)
    byUser.set(row.user_id, arr)
  }
  return roster.map((st) => {
    const rows = byUser.get(st.user_id) ?? []
    const completed = rows.filter((r) => r.status === 'completed' && r.score != null)
    const avg =
      completed.length > 0
        ? Math.round(
            (completed.reduce((sum, r) => sum + Number(r.score), 0) / completed.length) * 10,
          ) / 10
        : 0
    return {
      id: st.user_id,
      name: st.full_name?.trim() || st.email,
      email: st.email,
      scholarLevel: st.grade_level,
      averageScore: avg,
      completedTests: completed.length,
      mathAverage2024_2025: st.math_average_2024_2025,
      mathAverage2025_2026: st.math_average_2025_2026,
    }
  })
}

export function classDomainAveragesFromSessions(
  catalog: readonly Test[],
  sessions: SessionRow[],
): { domain: string; avgScore: number }[] {
  const testToDomain = new Map(catalog.map((t) => [t.id, t.domain]))
  const domainBuckets = new Map<string, { sum: number; n: number }>()
  for (const s of sessions) {
    if (s.status !== 'completed' || s.score == null) continue
    const domain = testToDomain.get(s.test_id) ?? 'Other'
    const b = domainBuckets.get(domain) ?? { sum: 0, n: 0 }
    b.sum += Number(s.score)
    b.n += 1
    domainBuckets.set(domain, b)
  }
  return Array.from(domainBuckets.entries()).map(([domain, b]) => ({
    domain: domain.length > 20 ? `${domain.slice(0, 18)}…` : domain,
    avgScore: Math.round((b.sum / b.n) * 10) / 10,
  }))
}

/** Weeks (ISO Monday) with count of completed assessments in that week. */
export function weeklyCompletionCounts(sessions: SessionRow[]): { week: string; completion: number }[] {
  const counts = new Map<string, number>()
  for (const s of sessions) {
    if (s.status !== 'completed' || !s.completed_at) continue
    const d = new Date(s.completed_at)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = monday.toISOString().slice(0, 10)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
  return sorted.map(([week, completion]) => ({
    week: `Sem. ${week.slice(5)}`,
    completion,
  }))
}

export function weakDomainsFromSessions(
  catalog: readonly Test[],
  sessions: SessionRow[],
  threshold = 70,
): { name: string; students: number }[] {
  const testToDomain = new Map(catalog.map((t) => [t.id, t.domain]))
  const scoresByDomain = new Map<string, { sum: number; n: number }>()
  const lowUsersByDomain = new Map<string, Set<string>>()

  for (const s of sessions) {
    if (s.status !== 'completed' || s.score == null) continue
    const domain = testToDomain.get(s.test_id) ?? 'Other'
    const sc = Number(s.score)
    const agg = scoresByDomain.get(domain) ?? { sum: 0, n: 0 }
    agg.sum += sc
    agg.n += 1
    scoresByDomain.set(domain, agg)
    if (sc < threshold) {
      const set = lowUsersByDomain.get(domain) ?? new Set()
      set.add(s.user_id)
      lowUsersByDomain.set(domain, set)
    }
  }

  const rows = [...scoresByDomain.keys()].map((d) => ({
    name: d,
    avgScore: scoresByDomain.get(d)!.sum / scoresByDomain.get(d)!.n,
    students: lowUsersByDomain.get(d)?.size ?? 0,
  }))
  rows.sort((a, b) => a.avgScore - b.avgScore)
  return rows.slice(0, 6).map((r) => ({
    name: r.name.length > 32 ? `${r.name.slice(0, 30)}…` : r.name,
    students: r.students,
  }))
}
