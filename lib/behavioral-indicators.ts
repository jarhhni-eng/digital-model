/**
 * Behavioral performance indicators for the Mathematics domain.
 * Derived from time-per-question data already stored in QuestionAnswerRecord.
 * Only applied to math-domain tests (testIds starting with 'test-vectors', etc.).
 */

import type { QuestionAnswerRecord } from './submissions-types'

export interface BehavioralSummary {
  userId: string
  testId: string
  avgTimePerQuestion: number       // milliseconds
  medianTimePerQuestion: number    // milliseconds
  hesitationCount: number          // questions with time > 1.5× median
  totalQuestions: number
  hesitationRate: number           // 0–1
  patternLabel: 'impulsif' | 'réflexif' | 'incertain' | 'normal'
}

/** Math test IDs that trigger behavioral analysis */
export const MATH_TEST_IDS = new Set([
  'test-vectors',
  'test-transformations-plane',
  'test-dot-product',
  'test-trigonometry',
  'test-line-plane',
  'test-dot-product-space',
])

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]!
    : ((sorted[mid - 1]! + sorted[mid]!) / 2)
}

export function computeBehavioralSummary(
  answers: QuestionAnswerRecord[],
  userId: string,
  testId: string
): BehavioralSummary {
  if (answers.length === 0) {
    return {
      userId,
      testId,
      avgTimePerQuestion: 0,
      medianTimePerQuestion: 0,
      hesitationCount: 0,
      totalQuestions: 0,
      hesitationRate: 0,
      patternLabel: 'normal',
    }
  }

  const times = answers.map((a) => a.timeSpentMs ?? 0)
  const avg = times.reduce((s, t) => s + t, 0) / times.length
  const med = median(times)
  const threshold = med * 1.5
  const hesitationCount = times.filter((t) => t > threshold).length
  const hesitationRate = hesitationCount / times.length

  return {
    userId,
    testId,
    avgTimePerQuestion: Math.round(avg),
    medianTimePerQuestion: Math.round(med),
    hesitationCount,
    totalQuestions: times.length,
    hesitationRate,
    patternLabel: classifyPattern(avg, hesitationRate),
  }
}

export function classifyPattern(
  avgTimeMs: number,
  hesitationRate: number
): 'impulsif' | 'réflexif' | 'incertain' | 'normal' {
  const avgSec = avgTimeMs / 1000
  if (avgSec < 5 && hesitationRate < 0.2) return 'impulsif'
  if (avgSec > 30 && hesitationRate > 0.5) return 'incertain'
  if (avgSec > 20 && hesitationRate < 0.3) return 'réflexif'
  return 'normal'
}

/** Generate mock behavioral data for demo/admin dashboard */
export function generateMockBehavioralData(): BehavioralSummary[] {
  const students = [
    { id: 'student-1', name: 'Ahmed Benali' },
    { id: 'student-2', name: 'Fatima Zahra' },
    { id: 'student-3', name: 'Youssef Mansour' },
    { id: 'student-4', name: 'Salma Alaoui' },
  ]

  const tests = [
    { testId: 'test-vectors', avgMs: 12000, hesRate: 0.25 },
    { testId: 'test-dot-product', avgMs: 28000, hesRate: 0.55 },
    { testId: 'test-trigonometry', avgMs: 4500, hesRate: 0.1 },
    { testId: 'test-line-plane', avgMs: 22000, hesRate: 0.28 },
  ]

  return students.flatMap((s, si) =>
    tests.map((t) => {
      const jitter = (si - 1.5) * 2000
      const avgMs = Math.max(2000, t.avgMs + jitter)
      const hesRate = Math.max(0, Math.min(1, t.hesRate + (si - 2) * 0.08))
      return {
        userId: s.id,
        testId: t.testId,
        avgTimePerQuestion: Math.round(avgMs),
        medianTimePerQuestion: Math.round(avgMs * 0.9),
        hesitationCount: Math.round(hesRate * 10),
        totalQuestions: 10,
        hesitationRate: hesRate,
        patternLabel: classifyPattern(avgMs, hesRate),
      }
    })
  )
}
