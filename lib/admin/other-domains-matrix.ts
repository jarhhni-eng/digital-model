/**
 * "Autres domaines" aggregated tables: one table per non-CKA test.
 *
 * Read-only. Scores come straight from the stored rows:
 * - internal sittings: `test_sessions.correct_count` / `total_questions` / `score`
 *   (the same fields the student dashboard reads), latest finished sitting;
 * - external tests: validated `external_results` rows, one column group per capacity.
 * Nothing is recalculated into another scale and no missing value becomes zero.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import { geometryCognitionTestIds, platformDomains } from '@/lib/platform-domains'
import { isExternalTest } from '@/lib/assessment/administration'
import { VP_HUB_TEST_ID, VP_SUBTESTS } from '@/lib/visuo-perceptive'

type Client = SupabaseClient<Database>

export type OtherStatus = 'completed' | 'pending' | 'in-progress' | 'partial' | null

export type OtherCell = {
  earned: number | null
  max: number | null
  percent: number | null
  status: Exclude<OtherStatus, 'partial'>
  date: string | null
}

export type OtherGroup = { key: string; label: string }

export type OtherStudentRow = {
  status: OtherStatus
  cells: Record<string, OtherCell>
  /** TVPS-3 only: mean of the subtest percentages, as on the student dashboard. */
  meanPercent?: number | null
}

export type OtherTestSection = {
  id: string
  name: string
  domainName: string
  mode: 'internal' | 'external'
  kind: 'tvps' | 'standard'
  groups: OtherGroup[]
  completedCount: number
  rows: Record<string, OtherStudentRow>
}

type SessionRow = {
  id: string
  user_id: string
  test_id: string
  status: string | null
  score: number | string | null
  correct_count: number | string | null
  total_questions: number | string | null
  started_at: string
  completed_at: string | null
  pending: unknown
}

type ExternalRow = {
  student_id: string
  test_id: string
  capacity: string | null
  raw_score: number | string | null
  max_score: number | string | null
  normalized_score: number | string | null
  assessed_on: string | null
  created_at: string | null
}

type LooseQuery<T> = {
  select: (cols: string) => LooseQuery<T>
  in: (col: string, values: string[]) => LooseQuery<T>
  eq: (col: string, value: string) => LooseQuery<T>
  order: (col: string, opts: { ascending: boolean }) => LooseQuery<T>
  range: (from: number, to: number) => Promise<{ data: T[] | null; error: { message: string } | null }>
}
type LooseClient = { from: <T>(table: string) => LooseQuery<T> }

function finite(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

async function readAll<T>(
  sb: Client,
  table: string,
  cols: string,
  build: (q: LooseQuery<T>) => LooseQuery<T>,
): Promise<{ rows: T[]; error: string | null }> {
  const loose = sb as unknown as LooseClient
  const pageSize = 1000
  const rows: T[] = []
  for (let from = 0; from < 100000; from += pageSize) {
    const { data, error } = await build(loose.from<T>(table).select(cols)).range(from, from + pageSize - 1)
    if (error) return { rows, error: `${table}: ${error.message}` }
    const page = data ?? []
    rows.push(...page)
    if (page.length < pageSize) break
  }
  return { rows, error: null }
}

function isFinished(row: SessionRow): boolean {
  return row.status === 'completed' || row.completed_at != null
}

function endMs(row: SessionRow): number {
  const time = new Date(row.completed_at ?? row.started_at).getTime()
  return Number.isFinite(time) ? time : 0
}

/** Latest finished sitting, else the latest open one. */
function cellFromSessions(rows: SessionRow[]): OtherCell | null {
  if (rows.length === 0) return null
  const finished = rows.filter(isFinished).sort((a, b) => endMs(b) - endMs(a))
  if (finished.length === 0) {
    const open = [...rows].sort((a, b) => endMs(b) - endMs(a))[0]
    return { earned: null, max: null, percent: null, status: 'in-progress', date: open.started_at }
  }
  const row = finished[0]
  const date = row.completed_at ?? row.started_at
  const score = finite(row.score)
  if (row.pending === true && score == null) {
    return { earned: null, max: null, percent: null, status: 'pending', date }
  }
  const earned = finite(row.correct_count)
  const max = finite(row.total_questions)
  const percent = score ?? (earned != null && max != null && max > 0 ? (earned / max) * 100 : null)
  return { earned, max, percent, status: 'completed', date }
}

function cellFromExternal(row: ExternalRow): OtherCell {
  const earned = finite(row.raw_score)
  const max = finite(row.max_score)
  const percent = finite(row.normalized_score) ?? (earned != null && max != null && max > 0 ? (earned / max) * 100 : null)
  return { earned, max, percent, status: 'completed', date: row.assessed_on ?? row.created_at }
}

function externalStamp(row: ExternalRow): number {
  const time = new Date(row.assessed_on ?? row.created_at ?? 0).getTime()
  return Number.isFinite(time) ? time : 0
}

function overallStatus(cells: OtherCell[], expected: number): OtherStatus {
  const done = cells.filter((cell) => cell.status === 'completed').length
  if (expected > 1 && done > 0 && done < expected) return 'partial'
  if (done > 0) return 'completed'
  if (cells.some((cell) => cell.status === 'pending')) return 'pending'
  if (cells.some((cell) => cell.status === 'in-progress')) return 'in-progress'
  return null
}

export async function buildOtherDomainSections(
  sb: Client,
  studentIds: string[],
  archived: Set<string>,
): Promise<{ sections: OtherTestSection[]; error: string | null; warning: string | null }> {
  const geometry = new Set(geometryCognitionTestIds())
  const catalogue = platformDomains.flatMap((domain) =>
    domain.subdomains.flatMap((sub) =>
      sub.capacities
        .filter((capacity) => !geometry.has(capacity.testId))
        .map((capacity) => ({
          id: capacity.testId,
          name: capacity.nameFr ?? capacity.name,
          domainName: domain.name,
        })),
    ),
  )
  const seen = new Set<string>()
  const tests = catalogue.filter((test) => (seen.has(test.id) ? false : (seen.add(test.id), true)))
  const subtestIds = VP_SUBTESTS.map((subtest) => subtest.testId)
  const sessionTestIds = [...tests.map((test) => test.id), ...subtestIds]

  const [sessions, external] = await Promise.all([
    readAll<SessionRow>(
      sb,
      'test_sessions',
      'id, user_id, test_id, status, score, correct_count, total_questions, started_at, completed_at, pending:metadata->pendingAdminValidation',
      (q) => q.in('test_id', sessionTestIds).order('id', { ascending: true }),
    ),
    readAll<ExternalRow>(
      sb,
      'external_results',
      'student_id, test_id, capacity, raw_score, max_score, normalized_score, assessed_on, created_at',
      (q) => q.eq('validation_status', 'validated').order('id', { ascending: true }),
    ),
  ])
  if (sessions.error) return { sections: [], error: sessions.error, warning: null }
  // Shown on the page instead of being swallowed; the internal tables still load.
  const warning = external.error ? `Résultats externes non chargés (${external.error})` : null

  const sessionsBy = new Map<string, SessionRow[]>()
  for (const row of sessions.rows) {
    if (archived.has(row.user_id)) continue
    const key = `${row.user_id}|${row.test_id}`
    const list = sessionsBy.get(key) ?? []
    list.push(row)
    sessionsBy.set(key, list)
  }
  const testsWithSessions = new Set(sessions.rows.map((row) => row.test_id))

  const externalBy = new Map<string, ExternalRow>()
  const capacitiesByTest = new Map<string, Set<string>>()
  for (const row of external.rows) {
    if (archived.has(row.student_id) || geometry.has(row.test_id)) continue
    const capacity = (row.capacity ?? '').trim() || 'Score'
    const caps = capacitiesByTest.get(row.test_id) ?? new Set<string>()
    caps.add(capacity)
    capacitiesByTest.set(row.test_id, caps)
    const key = `${row.student_id}|${row.test_id}|${capacity}`
    const current = externalBy.get(key)
    if (!current || externalStamp(row) >= externalStamp(current)) externalBy.set(key, row)
  }

  const sections: OtherTestSection[] = tests.map((test) => {
    const mode: 'internal' | 'external' = isExternalTest(test.id) ? 'external' : 'internal'

    if (test.id === VP_HUB_TEST_ID) {
      const groups: OtherGroup[] = VP_SUBTESTS.map((subtest) => ({ key: subtest.testId, label: subtest.title }))
      if (testsWithSessions.has(VP_HUB_TEST_ID)) groups.push({ key: VP_HUB_TEST_ID, label: 'Passation globale' })
      const rows: Record<string, OtherStudentRow> = {}
      let completedCount = 0
      for (const studentId of studentIds) {
        const cells: Record<string, OtherCell> = {}
        for (const group of groups) {
          const cell = cellFromSessions(sessionsBy.get(`${studentId}|${group.key}`) ?? [])
          if (cell) cells[group.key] = cell
        }
        const subtestCells = subtestIds.map((id) => cells[id]).filter(Boolean)
        // Same rule as computeTvps3MeanPercent: rounded percent per finished subtest, rounded mean.
        const percents = subtestCells
          .filter((cell) => cell.status === 'completed' && cell.percent != null)
          .map((cell) => Math.round(cell.percent as number))
        const meanPercent = percents.length > 0 ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : null
        const status = overallStatus(subtestCells, subtestIds.length)
        if (status === 'completed' || status === 'partial') completedCount += 1
        rows[studentId] = { status, cells, meanPercent }
      }
      return { ...test, mode, kind: 'tvps', groups, completedCount, rows }
    }

    const groups: OtherGroup[] = []
    const hasSessions = testsWithSessions.has(test.id)
    const caps = [...(capacitiesByTest.get(test.id) ?? [])].sort((a, b) => a.localeCompare(b, 'fr'))
    // Internal tests are imported never (the import refuses them), so their only source is the app.
    if (mode === 'internal' || hasSessions || caps.length === 0) groups.push({ key: 'app', label: mode === 'internal' ? 'Score' : 'Passation application' })
    if (mode === 'external') for (const cap of caps) groups.push({ key: `ext:${cap}`, label: cap })

    const rows: Record<string, OtherStudentRow> = {}
    let completedCount = 0
    for (const studentId of studentIds) {
      const cells: Record<string, OtherCell> = {}
      const app = cellFromSessions(sessionsBy.get(`${studentId}|${test.id}`) ?? [])
      if (app) cells.app = app
      if (mode === 'external') {
        for (const cap of caps) {
          const row = externalBy.get(`${studentId}|${test.id}|${cap}`)
          if (row) cells[`ext:${cap}`] = cellFromExternal(row)
        }
      }
      const status = overallStatus(Object.values(cells), 1)
      if (status === 'completed') completedCount += 1
      rows[studentId] = { status, cells }
    }
    return { ...test, mode, kind: 'standard', groups, completedCount, rows }
  })

  return { sections, error: null, warning }
}
