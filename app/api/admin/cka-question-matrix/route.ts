import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'
import {
  autoevalCode,
  geometryTestOrder,
  lessonNameForTest,
  questionsForTest,
  scoreQuestion,
  summarizeLine,
  testNameFor,
  type AutoevalSlot,
} from '@/lib/geometry/cka-question-stats'
import type { Json } from '@/lib/types/database'

type SessionRow = {
  id: string
  user_id: string
  test_id: string
  score: number | null
  total_ms: number | null
  started_at: string
  completed_at: string | null
  metadata: Json
}

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
  const testIds = geometryTestOrder()

  const [{ data: profiles }, { data: studentProfiles }, { data: sessions }] = await Promise.all([
    sb.from('profiles').select('id, full_name').eq('role', 'student'),
    sb.from('student_profiles').select('*'),
    sb
      .from('test_sessions')
      .select('id, user_id, test_id, score, total_ms, started_at, completed_at, metadata')
      .in('test_id', testIds)
      .not('completed_at', 'is', null),
  ])

  const latest = new Map<string, SessionRow>()
  for (const row of (sessions ?? []) as SessionRow[]) {
    const key = `${row.user_id}|${row.test_id}`
    const prev = latest.get(key)
    if (!prev || (row.completed_at ?? '') > (prev.completed_at ?? '')) latest.set(key, row)
  }
  const latestSessions = [...latest.values()]
  const trials: TrialRow[] = []
  for (let i = 0; i < latestSessions.length; i += 200) {
    const ids = latestSessions.slice(i, i + 200).map((row) => row.id)
    if (ids.length === 0) continue
    const { data } = await sb
      .from('trial_results')
      .select('session_id, question_id, question_index, score, selected, free_text')
      .in('session_id', ids)
    trials.push(...((data ?? []) as TrialRow[]))
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
    const rows = latestSessions
      .filter((session) => session.test_id === testId)
      .map((session) => {
        const profile = profileById.get(session.user_id)
        const school = schoolById.get(session.user_id) as {
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
        for (const trial of trialsBySession.get(session.id) ?? []) {
          if (trial.question_id) byId.set(trial.question_id, trial)
          if (trial.question_index != null) byIndex.set(trial.question_index, trial)
        }
        const cells = questions.map((question, index) => {
          const trial = byId.get(question.id) ?? byIndex.get(index) ?? null
          return scoreQuestion(question, trial
            ? {
                score: trial.score == null ? null : Number(trial.score),
                selected: trial.selected,
                freeText: trial.free_text,
              }
            : null)
        })
        const autos = ([1, 2, 3] as AutoevalSlot[]).map((slot) => {
          const match = questions.findIndex((question) => question.autoSlot === slot)
          const question = match >= 0 ? questions[match] : null
          const text = question ? cells[match]?.selectedText || null : null
          return {
            slot,
            prompt: question?.prompt ?? null,
            text,
            code: text ? autoevalCode(slot, text) : null,
          }
        })
        const durationMs =
          session.total_ms ??
          (session.completed_at
            ? Math.max(0, new Date(session.completed_at).getTime() - new Date(session.started_at).getTime())
            : null)
        return {
          studentId: session.user_id,
          firstName: names.firstName,
          lastName: names.lastName,
          level: school?.grade_level ?? null,
          className: school?.class_name ?? null,
          teacher: school?.teacher_name ?? null,
          teacherId: school?.teacher_id ?? null,
          school: school?.school_name ?? null,
          completedAt: session.completed_at,
          globalPercent: session.score == null ? null : Number(session.score),
          durationMs,
          clicks: clicksFrom(session.metadata),
          cells,
          autos,
          stats: summarizeLine(questions, cells),
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
