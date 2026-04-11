import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { readJsonFile, writeJsonFile } from '@/lib/server/json-store'
import type { TestSubmission } from '@/lib/submissions-types'
import { mockTestQuestions } from '@/lib/mock-data'

const FILE = 'submissions.json'

function scoreAnswers(
  answers: { questionId: string; selectedValue: string | null }[]
): number | null {
  const mcqWithKey = mockTestQuestions.filter(
    (q) => q.type === 'mcq' && q.options && q.correctOptionIndex !== undefined
  )
  if (mcqWithKey.length === 0) return null
  let correct = 0
  let total = 0
  for (const q of mcqWithKey) {
    const a = answers.find((x) => x.questionId === q.id)
    if (!a?.selectedValue || !q.options) continue
    total++
    const idx = q.options.indexOf(a.selectedValue)
    if (idx === q.correctOptionIndex) correct++
  }
  if (total === 0) return null
  return Math.round((correct / total) * 100)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = String(body.userId ?? '')
    const testId = String(body.testId ?? '')
    const startedAt = String(body.startedAt ?? new Date().toISOString())
    const answers = Array.isArray(body.answers) ? body.answers : []
    if (!userId || !testId) {
      return NextResponse.json({ error: 'userId and testId required' }, { status: 400 })
    }
    const scorePercent = scoreAnswers(answers)
    const submission: TestSubmission = {
      id: randomUUID(),
      userId,
      testId,
      startedAt,
      submittedAt: new Date().toISOString(),
      answers,
      scorePercent,
    }
    const list = await readJsonFile<TestSubmission[]>(FILE, [])
    list.push(submission)
    await writeJsonFile(FILE, list)
    return NextResponse.json({ ok: true, submission })
  } catch {
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const list = await readJsonFile<TestSubmission[]>(FILE, [])
  if (userId) {
    return NextResponse.json({ submissions: list.filter((s) => s.userId === userId) })
  }
  return NextResponse.json({ submissions: list })
}
