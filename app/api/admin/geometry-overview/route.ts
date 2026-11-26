import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'
import { tryGetSupabaseAdmin } from '@/lib/supabase/server'
import { fetchCompletedSessions, latestCompletedByStudentTest } from '@/lib/admin/completed-sessions'
import { fetchArchivedUserIds, withoutArchived } from '@/lib/admin/archived-accounts'
import { geometryCognitionTestIds } from '@/lib/platform-domains'
import { GEO_SPACE_QUESTIONS } from '@/lib/geometry/geo-space'
import { DROITE_PLAN_QUESTIONS } from '@/lib/geometry/droite-plan'
import { VECTORS_QUESTIONS } from '@/lib/geometry/geo-vectors-complete'
import { SYMETRIE_AXIALE_QUESTIONS } from '@/lib/geometry/symetrie-axiale'
import { SYMETRIE_CENTRALE_QUESTIONS } from '@/lib/geometry/symetrie-centrale'
import { PRODUIT_SCALAIRE_QUESTIONS } from '@/lib/geometry/produit-scalaire'
import { PRODUIT_SCALAIRE_TC_QUESTIONS } from '@/lib/geometry/produit-scalaire-tronc-commun'
import { SPACE_VOLUMES_QUESTIONS } from '@/lib/geometry/space-volumes'
import { TRIG_CIRCLE_QUESTIONS } from '@/lib/geometry/trig-unit-circle'

type TrialRow = { session_id: string; question_id: string | null; score: number | null; correct: boolean | null; selected: unknown }

function expectedLabel(answer: unknown): string {
  const letter = (n: number) => (Number.isInteger(n) && n >= 0 && n < 26 ? String.fromCharCode(65 + n) : String(n))
  if (typeof answer === 'number') return letter(answer)
  if (Array.isArray(answer)) return answer.map((n) => letter(Number(n))).join(', ')
  return ''
}

const EXPECTED = new Map<string, string>()
for (const question of [
  ...GEO_SPACE_QUESTIONS,
  ...DROITE_PLAN_QUESTIONS,
  ...VECTORS_QUESTIONS,
  ...SYMETRIE_AXIALE_QUESTIONS,
  ...SYMETRIE_CENTRALE_QUESTIONS,
  ...PRODUIT_SCALAIRE_QUESTIONS,
  ...PRODUIT_SCALAIRE_TC_QUESTIONS,
  ...SPACE_VOLUMES_QUESTIONS,
  ...TRIG_CIRCLE_QUESTIONS,
]) {
  const row = question as { id?: string; correctAnswer?: unknown }
  if (row.id) EXPECTED.set(row.id, expectedLabel(row.correctAnswer))
}
type ExternalRow = {
  student_id: string
  test_id: string
  domain: string
  capacity: string
  raw_score: number | null
  max_score: number | null
  normalized_score: number | null
  validation_status: string
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

function externalPercent(row: ExternalRow): number | null {
  if (row.validation_status !== 'validated') return null
  if (row.normalized_score != null) return Number(row.normalized_score)
  if (row.raw_score != null && row.max_score != null && Number(row.max_score) > 0) {
    return (Number(row.raw_score) / Number(row.max_score)) * 100
  }
  return null
}

export async function GET() {
  const gate = await requireAdmin()
  if ('response' in gate) return gate.response
  const { sb } = gate
  const reader = tryGetSupabaseAdmin() ?? sb
  const geometryIds = geometryCognitionTestIds()

  const [{ data: rawProfiles }, { data: rawStudentProfiles }, sessionsResult, archivedResult] = await Promise.all([
    reader.from('profiles').select('id, full_name, email').eq('role', 'student').is('archived_at', null),
    reader.from('student_profiles').select('user_id, school_name, grade_level, academic_track, teacher_name'),
    fetchCompletedSessions(reader, geometryIds),
    fetchArchivedUserIds(reader),
  ])
  if (sessionsResult.error) return NextResponse.json({ error: sessionsResult.error }, { status: 500 })
  if (archivedResult.error) {
    // Fail closed: never risk returning archived accounts' data.
    return NextResponse.json({ error: archivedResult.error }, { status: 500 })
  }
  const archived = archivedResult.ids
  const profiles = withoutArchived(rawProfiles, archived, (row) => row.id)
  const studentProfiles = withoutArchived(rawStudentProfiles, archived, (row) => row.user_id)
  const sessionRows = withoutArchived(sessionsResult.rows, archived, (row) => row.user_id)

  let external: ExternalRow[] = []
  let externalReady = true
  const loose = sb as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, value: string) => Promise<{ data: ExternalRow[] | null; error: { message: string } | null }>
      }
    }
  }
  const externalQuery = await loose
    .from('external_results')
    .select('student_id, test_id, domain, capacity, raw_score, max_score, normalized_score, validation_status')
    .eq('validation_status', 'validated')
  if (externalQuery.error) externalReady = false
  else external = withoutArchived(externalQuery.data, archived, (row) => row.student_id)

  const schoolByStudent = new Map((studentProfiles ?? []).map((row) => [row.user_id, row]))
  const latest = latestCompletedByStudentTest(sessionRows)

  const latestSessions = [...latest.values()]
  const trials: TrialRow[] = []
  for (let i = 0; i < latestSessions.length; i += 200) {
    const ids = latestSessions.slice(i, i + 200).map((row) => row.id)
    if (ids.length === 0) continue
    const { data } = await reader
      .from('trial_results')
      .select('session_id, question_id, score, correct, selected')
      .in('session_id', ids)
    trials.push(...((data ?? []) as TrialRow[]))
  }
  const sessionById = new Map(latestSessions.map((row) => [row.id, row]))
  const nameById = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]))
  const questions = trials.map((trial) => {
    const session = sessionById.get(trial.session_id)
    return {
      studentId: session?.user_id ?? '',
      name: session ? nameById.get(session.user_id) ?? null : null,
      testId: session?.test_id ?? '',
      questionId: trial.question_id,
      score: trial.score == null ? null : Number(trial.score),
      correct: trial.correct,
      selected: trial.selected,
      expected: trial.question_id ? EXPECTED.get(trial.question_id) ?? '' : '',
    }
  })

  const students = (profiles ?? []).map((profile) => {
    const school = schoolByStudent.get(profile.id)
    const internal = [...latest.values()]
      .filter((row) => row.user_id === profile.id && row.score != null)
      .map((row) => Number(row.score))
    const externalScores = external.filter((row) => row.student_id === profile.id).map(externalPercent).filter((n): n is number => n != null)
    const internalAverage = mean(internal)
    const externalAverage = mean(externalScores)
    const comparable = internalAverage != null && externalAverage != null ? mean([internalAverage, externalAverage]) : null
    return {
      studentId: profile.id,
      name: profile.full_name,
      email: profile.email,
      school: school?.school_name ?? null,
      level: school?.grade_level ?? null,
      track: school?.academic_track ?? null,
      teacher: school?.teacher_name ?? null,
      internalCount: internal.length,
      externalCount: externalScores.length,
      internalAverage,
      externalAverage,
      comparableAverage: comparable,
    }
  })

  return NextResponse.json({ students, questions, externalReady, geometryTestIds: geometryIds })
}
