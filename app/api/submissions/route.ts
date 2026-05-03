/**
 * /api/submissions
 *
 * POST — score MCQ answers and persist the attempt in data/submissions.json
 * GET  — list submissions for the caller (or for a given userId)
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
import { mockTestQuestions } from '@/lib/mock-data'

interface AnswerInput {
  questionId: string
  selectedValue: string | null
  timeSpentMs?: number | null
}

function scoreAnswers(answers: AnswerInput[]) {
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
    const testId = String(body.testId ?? '')
    const startedAt = String(body.startedAt ?? new Date().toISOString())
    const answers: AnswerInput[] = Array.isArray(body.answers) ? body.answers : []

    if (!testId) return NextResponse.json({ error: 'testId required' }, { status: 400 })

    const { scorePercent, correctCount, total } = scoreAnswers(answers)

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomUUID } = require('crypto') as typeof import('crypto')
    const sub: StoredSubmission = {
      id: randomUUID(),
      userId: session.userId,
      testId,
      startedAt,
      submittedAt: new Date().toISOString(),
      scorePercent,
      correctCount,
      totalQuestions: total,
      answers,
      metadata: body.metadata ?? {},
    }
    addSubmission(sub)

    return NextResponse.json({
      ok: true,
      submission: {
        id: sub.id,
        userId: sub.userId,
        testId: sub.testId,
        startedAt: sub.startedAt,
        submittedAt: sub.submittedAt,
        scorePercent: sub.scorePercent,
      },
    })
  } catch (err) {
    console.error('[submissions POST]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const userIdFilter = searchParams.get('userId') ?? session.userId

    const all = readSubmissions()
    const submissions = all
      .filter((s) => s.userId === userIdFilter)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

    return NextResponse.json({ submissions })
  } catch (err) {
    console.error('[submissions GET]', err)
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 })
  }
}
