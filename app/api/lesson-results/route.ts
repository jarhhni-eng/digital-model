/**
 * /api/lesson-results
 *
 * POST — persist a lesson attempt in data/submissions.json
 * GET  — list completed sessions for the caller (optionally filtered by testId)
 *
 * Auth: local session cookie (no Supabase).
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeSession, COOKIE_NAME } from '@/lib/local-auth/session'
import {
  readSubmissions,
  addSubmission,
  type StoredSubmission,
} from '@/lib/local-auth/submissions-store'

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return decodeSession(token)
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const testId = String(body.testId ?? '').trim()
    if (!testId) return NextResponse.json({ error: 'testId is required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomUUID } = require('crypto') as typeof import('crypto')
    const sub: StoredSubmission = {
      id: randomUUID(),
      userId: session.userId,
      testId,
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      scorePercent: typeof body.score === 'number' ? body.score : null,
      correctCount: typeof body.correctCount === 'number' ? body.correctCount : 0,
      totalQuestions: typeof body.totalQuestions === 'number' ? body.totalQuestions : 0,
      totalMs: typeof body.totalMs === 'number' ? body.totalMs : null,
      answers: [],
      selectedChoices: body.selectedChoices ?? {},
      metadata: {
        competencyScores: body.competencyScores ?? [],
        diagnosticAnswer: body.diagnosticAnswer ?? null,
        ...(body.metadata ?? {}),
      },
    }
    addSubmission(sub)

    return NextResponse.json({ ok: true, sessionId: sub.id, result: sub })
  } catch (err) {
    console.error('[lesson-results POST]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const testIdFilter = searchParams.get('testId')

    const all = readSubmissions()
    const results = all
      .filter((s) => s.userId === session.userId && (!testIdFilter || s.testId === testIdFilter))
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

    return NextResponse.json({ results })
  } catch (err) {
    console.error('[lesson-results GET]', err)
    return NextResponse.json({ error: 'Failed to load results' }, { status: 500 })
  }
}
