/**
 * /api/submissions
 *
 * POST — score MCQ answers against `mockTestQuestions` and persist the
 *        attempt as a row in public.test_sessions (+ trial_results).
 * GET  — list submissions for the caller (or for a given userId when
 *        called by a teacher/admin — RLS scopes the read).
 *
 * NO local submissions.json. Backed by Supabase.
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { mockTestQuestions } from '@/lib/mock-data'

interface AnswerInput {
  questionId: string
  selectedValue: string | null
  timeSpentMs?: number | null
}

function scoreAnswers(answers: AnswerInput[]): {
  scorePercent: number | null
  correctCount: number
  total: number
  perQuestion: { questionId: string; correct: boolean; selected: string | null }[]
} {
  const mcqWithKey = mockTestQuestions.filter(
    (q) => q.type === 'mcq' && q.options && q.correctOptionIndex !== undefined,
  )
  let correct = 0
  const perQuestion: { questionId: string; correct: boolean; selected: string | null }[] = []
  for (const q of mcqWithKey) {
    const a = answers.find((x) => x.questionId === q.id)
    if (!a?.selectedValue || !q.options) {
      perQuestion.push({ questionId: q.id, correct: false, selected: a?.selectedValue ?? null })
      continue
    }
    const idx = q.options.indexOf(a.selectedValue)
    const isCorrect = idx === q.correctOptionIndex
    if (isCorrect) correct++
    perQuestion.push({ questionId: q.id, correct: isCorrect, selected: a.selectedValue })
  }
  const total = mcqWithKey.length
  const scorePercent = total === 0 ? null : Math.round((correct / total) * 100)
  return { scorePercent, correctCount: correct, total, perQuestion }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const testId = String(body.testId ?? '')
    const startedAt = String(body.startedAt ?? new Date().toISOString())
    const answers: AnswerInput[] = Array.isArray(body.answers) ? body.answers : []

    if (!testId) {
      return NextResponse.json({ error: 'testId required' }, { status: 400 })
    }

    const sb = await getSupabaseServer()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { scorePercent, correctCount, total, perQuestion } = scoreAnswers(answers)

    const { data: session, error } = await sb
      .from('test_sessions')
      .insert({
        user_id: user.id,
        test_id: testId,
        status: 'completed',
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        score: scorePercent,
        correct_count: correctCount,
        total_questions: total,
        metadata: { rawAnswers: answers },
      })
      .select('id, score, correct_count, total_questions, started_at, completed_at')
      .single()

    if (error || !session) {
      console.error('[submissions POST]', error?.message)
      return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
    }

    if (perQuestion.length > 0) {
      const rows = perQuestion.map((p, i) => ({
        session_id: session.id,
        question_index: i,
        question_id: p.questionId,
        selected: (p.selected !== null ? [p.selected] : []) as unknown as Record<string, never>,
        free_text: null,
        correct: p.correct,
        score: p.correct ? 1 : 0,
      }))
      await sb.from('trial_results').insert(rows)
    }

    return NextResponse.json({
      ok: true,
      submission: {
        id: session.id,
        userId: user.id,
        testId,
        startedAt: session.started_at,
        submittedAt: session.completed_at,
        scorePercent: session.score,
      },
    })
  } catch (err) {
    console.error('[submissions POST]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userIdFilter = searchParams.get('userId')

  const sb = await getSupabaseServer()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let q = sb
    .from('test_sessions')
    .select('id, user_id, test_id, score, started_at, completed_at')
    .order('started_at', { ascending: false })
  if (userIdFilter) q = q.eq('user_id', userIdFilter)

  const { data, error } = await q
  if (error) {
    console.error('[submissions GET]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map back to the legacy TestSubmission shape so existing callers keep working.
  type SessionRow = {
    id: string
    user_id: string
    test_id: string
    score: number | null
    started_at: string
    completed_at: string | null
  }
  const submissions = (data ?? []).map((r: SessionRow) => ({
    id: r.id,
    userId: r.user_id,
    testId: r.test_id,
    startedAt: r.started_at,
    submittedAt: r.completed_at ?? r.started_at,
    answers: [],
    scorePercent: r.score,
  }))

  return NextResponse.json({ submissions })
}
