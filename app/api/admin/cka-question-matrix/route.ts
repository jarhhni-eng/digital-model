import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'
import { tryGetSupabaseAdmin } from '@/lib/supabase/server'
import { fetchCompletedSessions, latestCompletedByStudentTest } from '@/lib/admin/completed-sessions'
import {
  autoevalCode,
  formatScore,
  geometryTestOrder,
  lessonNameForTest,
  questionsForSession,
  questionsForTest,
  scoreFromPerQuestion,
  scoreQuestion,
  summarizeLine,
  testNameFor,
  VECTORS_AGGREGATE_TEST_ID,
  type AutoevalSlot,
} from '@/lib/geometry/cka-question-stats'
import type { Json } from '@/lib/types/database'

type TrialRow = {
  session_id: string
  question_id: string | null
  question_index: number | null
  score: number | null
  selected: unknown
  free_text: string | null
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function clicksFrom(metadata: Json): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const row = metadata as Record<string, unknown>
  return numberOrNull(row.totalClicks) ?? numberOrNull(row.clickCount) ?? numberOrNull(row.clicks)
}

function splitName(full: string | null): { firstName: string; lastName: string } {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { firstName: '', lastName: parts[0] ?? '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export async function GET() {
  const gate = await requireAdmin()
  if ('response' in gate) return gate.response
  const { sb } = gate
  const reader = tryGetSupabaseAdmin() ?? sb
  const testIds = geometryTestOrder()

  const [{ data: profiles }, { data: studentProfiles }, sessionsResult] = await Promise.all([
    reader.from('profiles').select('id, full_name').eq('role', 'student'),
    reader.from('student_profiles').select('*'),
    fetchCompletedSessions(reader, testIds),
  ])
  if (sessionsResult.error) return NextResponse.json({ error: sessionsResult.error }, { status: 500 })

  const latest = latestCompletedByStudentTest(sessionsResult.rows)
  const latestSessions = [...latest.values()]
  const trials: TrialRow[] = []
  for (let i = 0; i < latestSessions.length; i += 20) {
    const ids = latestSessions.slice(i, i + 20).map((row) => row.id)
    if (ids.length === 0) continue
    for (let from = 0; from < 20000; from += 1000) {
      const { data, error } = await reader
        .from('trial_results')
        .select('session_id, question_id, question_index, score, selected, free_text')
        .in('session_id', ids)
        .order('id', { ascending: true })
        .range(from, from + 999)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const page = (data ?? []) as TrialRow[]
      trials.push(...page)
      if (page.length < 1000) break
    }
  }
  const trialsBySession = new Map<string, TrialRow[]>()
  for (const trial of trials) {
    const list = trialsBySession.get(trial.session_id) ?? []
    list.push(trial)
    trialsBySession.set(trial.session_id, list)
  }

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const schoolById = new Map((studentProfiles ?? []).map((row) => [row.user_id, row]))

  const tests = testIds.map((testId) => {
    const questions = questionsForTest(testId)
    const sessionsForTest = latestSessions.filter((session) => session.test_id === testId)
    const sessionByUser = new Map(sessionsForTest.map((session) => [session.user_id, session]))
    const subjects =
      testId === VECTORS_AGGREGATE_TEST_ID
        ? (profiles ?? []).map((profile) => ({
            userId: profile.id,
            session: sessionByUser.get(profile.id) ?? null,
          }))
        : sessionsForTest.map((session) => ({ userId: session.user_id, session }))
    const rows = subjects
      .map(({ userId, session }) => {
        const profile = profileById.get(userId)
        const school = schoolById.get(userId) as {
          grade_level?: string | null
          class_name?: string | null
          teacher_name?: string | null
          teacher_id?: string | null
          school_name?: string | null
          math_control_2026_score?: number | null
          math_control_2026_max?: number | null
          math_s2_2025_score?: number | null
          math_s2_2025_max?: number | null
          math_regional_2025_score?: number | null
          math_regional_2025_max?: number | null
        } | undefined
        const names = splitName(profile?.full_name ?? null)
        const byId = new Map<string, TrialRow>()
        const byIndex = new Map<number, TrialRow>()
        for (const trial of session ? trialsBySession.get(session.id) ?? [] : []) {
          if (trial.question_id) byId.set(trial.question_id, trial)
          if (trial.question_index != null) byIndex.set(trial.question_index, trial)
        }
        const sessionQuestions = session ? questionsForSession(testId, session.metadata) : questions
        const cells = sessionQuestions.map((question, index) => {
          const trial = byId.get(question.id) ?? byIndex.get(index) ?? null
          const cell = scoreQuestion(question, trial
            ? {
                score: trial.score == null ? null : Number(trial.score),
                selected: trial.selected,
                freeText: trial.free_text,
              }
            : null)
          if (testId === VECTORS_AGGREGATE_TEST_ID && !trial && session && cell.score == null) {
            const stored = scoreFromPerQuestion(session.metadata, question.id)
            if (stored != null) {
              cell.score = stored
              cell.display = formatScore(stored)
              cell.status = stored >= 0.999 ? 'correcte' : stored > 0 ? 'partielle' : 'incorrecte'
            }
          }
          return cell
        })
        const autos = ([1, 2, 3] as AutoevalSlot[]).map((slot) => {
          const match = sessionQuestions.findIndex((question) => question.autoSlot === slot)
          const question = match >= 0 ? sessionQuestions[match] : null
          const text = question ? cells[match]?.selectedText || null : null
          return {
            slot,
            prompt: question?.prompt ?? null,
            text,
            code: text ? autoevalCode(slot, text) : null,
          }
        })
        const durationMs = session == null
          ? null
          : (session.total_ms ??
            (session.completed_at
              ? Math.max(0, new Date(session.completed_at).getTime() - new Date(session.started_at).getTime())
              : null))
        return {
          studentId: userId,
          firstName: names.firstName,
          lastName: names.lastName,
          level: school?.grade_level ?? null,
          className: school?.class_name ?? null,
          teacher: school?.teacher_name ?? null,
          teacherId: school?.teacher_id ?? null,
          school: school?.school_name ?? null,
          completedAt: session?.completed_at ?? null,
          globalPercent: session?.score == null ? null : Number(session.score),
          durationMs,
          clicks: session ? clicksFrom(session.metadata) : null,
          attempted: session != null,
          cells,
          autos,
          stats: summarizeLine(sessionQuestions, cells),
          notes: {
            controlScore: school?.math_control_2026_score ?? null,
            controlMax: school?.math_control_2026_max ?? null,
            semesterScore: school?.math_s2_2025_score ?? null,
            semesterMax: school?.math_s2_2025_max ?? null,
            regionalScore: school?.math_regional_2025_score ?? null,
            regionalMax: school?.math_regional_2025_max ?? null,
          },
        }
      })
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'fr'))
    return {
      id: testId,
      name: testNameFor(testId),
      lesson: lessonNameForTest(testId),
      questions: questions.map((question) => ({
        id: question.id,
        number: question.number,
        prompt: question.prompt,
        type: question.autoSlot
          ? `Autoévaluation ${question.autoSlot}`
          : question.multi
            ? 'QCM à réponses multiples'
            : question.scorable
              ? 'QCM'
              : 'Hors notation',
        multi: question.multi,
        scorable: question.scorable,
        autoSlot: question.autoSlot,
        max: question.scorable ? 1 : null,
      })),
      rows,
    }
  })

  return NextResponse.json({ tests })
}
