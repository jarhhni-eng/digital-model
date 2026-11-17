import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/types/database'
import { parseGeometryAnalyticsReport } from '@/lib/geometry/geometry-analytics-report'
import { getCanonicalPartIndex } from '@/lib/geometry/geometry-partition'

type Client = SupabaseClient<Database>

export type CompletedSession = {
  id: string
  user_id: string
  test_id: string
  status: string | null
  score: number | null
  total_ms: number | null
  started_at: string
  completed_at: string | null
  metadata: Json
}

export type ScoreCell = { earned: number | null; max: number | null; percent: number | null }

function finite(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function endMs(row: CompletedSession): number {
  const stamp = row.completed_at ?? row.started_at
  const time = new Date(stamp).getTime()
  return Number.isFinite(time) ? time : 0
}

function metaObject(metadata: Json): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  return metadata as Record<string, unknown>
}

/** Every finished sitting, past the default 1000-row page. */
export async function fetchCompletedSessions(
  sb: Client,
  testIds?: string[],
): Promise<{ rows: CompletedSession[]; error: string | null }> {
  const pageSize = 1000
  const rows: CompletedSession[] = []
  for (let from = 0; from < 50000; from += pageSize) {
    let query = sb
      .from('test_sessions')
      .select('id, user_id, test_id, status, score, total_ms, started_at, completed_at, metadata')
      .or('status.eq.completed,completed_at.not.is.null')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)
    if (testIds && testIds.length > 0) query = query.in('test_id', testIds)
    const { data, error } = await query
    if (error) return { rows, error: error.message }
    const page = (data ?? []) as CompletedSession[]
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return { rows, error: null }
}

/** Latest finished sitting per student and test. An open retake does not hide it. */
export function latestCompletedByStudentTest(rows: CompletedSession[]): Map<string, CompletedSession> {
  const grouped = new Map<string, CompletedSession[]>()
  for (const row of rows) {
    if (row.status !== 'completed' && !row.completed_at) continue
    const key = `${row.user_id}|${row.test_id}`
    const list = grouped.get(key) ?? []
    list.push(row)
    grouped.set(key, list)
  }
  const latest = new Map<string, CompletedSession>()
  for (const [key, list] of grouped) {
    list.sort((a, b) => endMs(b) - endMs(a))
    latest.set(key, list[0])
  }
  return latest
}

/**
 * Same scores the individual page can already show: the stored analytics report,
 * otherwise the capacity breakdown and part traces saved with the sitting.
 */
export function geometryCellsFromSession(
  testId: string,
  session: { score: number | null; metadata: Json },
): { global: ScoreCell; capacities: Record<string, ScoreCell>; parts: Record<string, ScoreCell> } {
  const meta = metaObject(session.metadata)
  const report = parseGeometryAnalyticsReport(meta?.geometryAnalytics)
  if (report) {
    const capacities: Record<string, ScoreCell> = {}
    const parts: Record<string, ScoreCell> = {}
    for (const capacity of report.capacities) {
      capacities[capacity.code] = { earned: capacity.earned, max: capacity.max, percent: capacity.percent }
    }
    for (const part of report.parts) {
      parts[String(part.part)] = { earned: part.earned, max: part.max, percent: part.percent }
    }
    return {
      global: { earned: report.globalScoreOutOf20, max: 20, percent: report.globalPercent },
      capacities,
      parts,
    }
  }

  const capacities: Record<string, ScoreCell> = {}
  const breakdown = meta?.capacityBreakdown
  if (breakdown && typeof breakdown === 'object' && !Array.isArray(breakdown)) {
    for (const [code, raw] of Object.entries(breakdown as Record<string, unknown>)) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
      const entry = raw as Record<string, unknown>
      const earned = finite(entry.earned)
      const max = finite(entry.max)
      const percent = finite(entry.percent) ?? (earned != null && max != null && max > 0 ? (earned / max) * 100 : null)
      if (earned == null && max == null && percent == null) continue
      capacities[code] = { earned, max, percent }
    }
  }

  const partBuckets: Record<string, { earned: number; max: number }> = {}
  const traces = Array.isArray(meta?.perQuestion) ? meta.perQuestion : []
  for (const raw of traces) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const item = raw as Record<string, unknown>
    const part = getCanonicalPartIndex(testId, {
      id: String(item.questionId ?? ''),
      part: typeof item.part === 'string' ? item.part : undefined,
    })
    const score = finite(item.score)
    if (!part || score == null) continue
    const key = String(part)
    const bucket = partBuckets[key] ?? { earned: 0, max: 0 }
    bucket.earned += score
    bucket.max += 1
    partBuckets[key] = bucket
  }
  const parts: Record<string, ScoreCell> = {}
  for (const [key, bucket] of Object.entries(partBuckets)) {
    parts[key] = {
      earned: Math.round(bucket.earned * 1000) / 1000,
      max: bucket.max,
      percent: bucket.max > 0 ? Math.round((bucket.earned / bucket.max) * 10000) / 100 : null,
    }
  }

  const percent = finite(session.score) ?? finite(meta?.totalPercent)
  return {
    global: percent == null ? { earned: null, max: null, percent: null } : { earned: Math.round(percent * 2) / 10, max: 20, percent },
    capacities,
    parts,
  }
}
