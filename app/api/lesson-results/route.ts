/**
 * /api/lesson-results
 *
 * POST — persist a lesson attempt as a row in public.test_sessions
 *        (+ optional rows in public.trial_results)
 * GET  — list completed sessions for the caller (or for a given testId)
 *
 * NO local lesson-results.json. Backed by Supabase.
 *
 * POST body:
 *   {
 *     testId:           string,
 *     score?:           number,                  // 0..100
 *     correctCount?:    number,
 *     totalQuestions?:  number,
 *     totalMs?:         number,
 *     selectedChoices?: Record<string, string>,  // questionId → choiceId
 *     metadata?:        Record<string, unknown>,
 *   }
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import {
  ensureTestSessionFkPrereqs,
  normalizeTrialQuestionIndices,
} from '@/lib/supabase/ensure-test-session-fk'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const testId = String(body.testId ?? '').trim()
    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 })
    }

    const sb = await getSupabaseServer()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const fk = await ensureTestSessionFkPrereqs(sb, user, testId)
    if (!fk.ok) {
      return NextResponse.json({ error: fk.message }, { status: fk.status })
    }

    const { data: session, error } = await sb
      .from('test_sessions')
      .insert({
        user_id: user.id,
        test_id: testId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        score: typeof body.score === 'number' ? body.score : null,
        correct_count: typeof body.correctCount === 'number' ? body.correctCount : null,
        total_questions: typeof body.totalQuestions === 'number' ? body.totalQuestions : null,
        total_ms: typeof body.totalMs === 'number' ? body.totalMs : null,
        metadata: {
          selectedChoices: body.selectedChoices ?? {},
          competencyScores: body.competencyScores ?? [],
          diagnosticAnswer: body.diagnosticAnswer ?? null,
          ...(body.metadata ?? {}),
        },
      })
      .select('id, score, correct_count, total_questions')
      .single()

    if (error || !session) {
      console.error('[lesson-results POST]', error?.message, error?.code)
      const code = error?.code
      const hint =
        code === '23503'
          ? 'Foreign key violation (missing tests row or profiles row).'
          : code === '23505'
            ? 'Unique constraint violation.'
            : error?.message ?? 'Insert failed'
      const status = code === '23503' || code === '23505' ? 409 : 500
      return NextResponse.json({ error: hint, code: code ?? undefined }, { status })
    }

    // Optional per-question rows. We store them as one trial per choice so
    // teachers/admin reviewers can see the breakdown.
    const choices = body.selectedChoices as Record<string, string> | undefined
    if (choices && Object.keys(choices).length > 0) {
      const rows = normalizeTrialQuestionIndices(
        Object.entries(choices).map(([questionId, choice], i) => ({
          session_id: session.id,
          question_index: i,
          question_id: questionId,
          selected: [choice] as unknown as Record<string, never>,
          free_text: null,
          correct: false,
          score: 0,
        })),
      )
      const { error: trialErr } = await sb.from('trial_results').insert(rows)
      if (trialErr) {
        console.error('[lesson-results POST] trial_results', trialErr.message, trialErr.code)
        const st = trialErr.code === '23505' || trialErr.code === '23503' ? 409 : 500
        return NextResponse.json({ error: trialErr.message, code: trialErr.code }, { status: st })
      }
    }

    return NextResponse.json({ ok: true, sessionId: session.id, result: session })
  } catch (err) {
    console.error('[lesson-results POST]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testIdFilter = searchParams.get('testId')

    const sb = await getSupabaseServer()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    let q = sb
      .from('test_sessions')
      .select(
        'id, test_id, score, correct_count, total_questions, completed_at, started_at, total_ms, metadata',
      )
      .order('completed_at', { ascending: false, nullsFirst: false })
      .order('started_at', { ascending: false })
    if (testIdFilter) q = q.eq('test_id', testIdFilter)

    const { data, error } = await q
    if (error) {
      console.error('[lesson-results GET]', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ results: data ?? [] })
  } catch (err) {
    console.error('[lesson-results GET]', err)
    return NextResponse.json({ error: 'Failed to load results' }, { status: 500 })
  }
}
