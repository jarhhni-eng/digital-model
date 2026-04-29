/**
 * /api/lesson-results
 *
 * POST — score a lesson attempt and persist it
 * GET  — retrieve results (filtered by userId and/or testId)
 *
 * Stored in data/lesson-results.json  (LessonResultRecord[])
 */

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { readJsonFile, writeJsonFile } from '@/lib/server/json-store'
import type { LessonResultRecord } from '@/lib/submissions-types'

const FILE = 'lesson-results.json'

// Registry: map testId → scorer function (extend here for new lessons)
const SCORERS: Record<string, Function> = {}

const LESSON_TITLES: Record<string, string> = {}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId         = String(body.userId ?? '').trim()
    const testId         = String(body.testId ?? '').trim()
    const selectedChoices: Record<string, string> = body.selectedChoices ?? {}

    if (!userId || !testId) {
      return NextResponse.json(
        { error: 'userId and testId are required' },
        { status: 400 },
      )
    }

    const scorer = SCORERS[testId]
    if (!scorer) {
      return NextResponse.json(
        { error: `No scorer registered for testId: ${testId}` },
        { status: 400 },
      )
    }

    const scoreResult = scorer(selectedChoices)

    const record: LessonResultRecord = {
      id: randomUUID(),
      userId,
      testId,
      lessonTitle: LESSON_TITLES[testId] ?? testId,
      submittedAt: new Date().toISOString(),
      selectedChoices,
      globalCorrect: scoreResult.globalCorrect,
      globalTotal:   scoreResult.globalTotal,
      globalPercent: scoreResult.globalPercent,
      competencyScores: scoreResult.competencyScores,
      diagnosticAnswer: scoreResult.diagnosticAnswer,
    }

    const list = await readJsonFile<LessonResultRecord[]>(FILE, [])
    list.push(record)
    await writeJsonFile(FILE, list)

    return NextResponse.json({ ok: true, result: scoreResult })
  } catch (err) {
    console.error('[lesson-results POST]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const testId = searchParams.get('testId')

    let list = await readJsonFile<LessonResultRecord[]>(FILE, [])
    if (userId) list = list.filter((r) => r.userId === userId)
    if (testId) list = list.filter((r) => r.testId === testId)

    // Sort newest first
    list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))

    return NextResponse.json({ results: list })
  } catch (err) {
    console.error('[lesson-results GET]', err)
    return NextResponse.json({ error: 'Failed to load results' }, { status: 500 })
  }
}
