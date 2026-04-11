/**
 * Scoring System
 * Computes TestScore from a completed TestSession.
 * Correct answers are embedded here — never sent to the student UI.
 */

import type {
  TestSession,
  TestScore,
  ItemAnalysis,
  CompetencyScore,
} from './types'

// ── Answer keys (backend only) ────────────────────────────────
// Format: testId → { questionId: correctOptionIndex (0-based) }
const ANSWER_KEYS: Record<string, Record<string, number>> = {
  'test-attention-divided': {
    'atd-q1': 2, 'atd-q2': 0, 'atd-q3': 1, 'atd-q4': 3, 'atd-q5': 0,
    'atd-q6': 2, 'atd-q7': 1, 'atd-q8': 0, 'atd-q9': 3, 'atd-q10': 2,
    'atd-q11': 1, 'atd-q12': 0, 'atd-q13': 2, 'atd-q14': 3, 'atd-q15': 1,
  },
  'test-attention-selective': {
    'ats-q1': 1, 'ats-q2': 0, 'ats-q3': 3, 'ats-q4': 2, 'ats-q5': 1,
    'ats-q6': 0, 'ats-q7': 2, 'ats-q8': 3, 'ats-q9': 1, 'ats-q10': 0,
    'ats-q11': 2, 'ats-q12': 3,
  },
  'test-reasoning-abstract': {
    'ra-q1': 2, 'ra-q2': 1, 'ra-q3': 0, 'ra-q4': 3, 'ra-q5': 2,
    'ra-q6': 1, 'ra-q7': 0, 'ra-q8': 3, 'ra-q9': 2, 'ra-q10': 1,
    'ra-q11': 0, 'ra-q12': 3,
  },
  'test-spatial-rotation': {
    'sr-q1': 1, 'sr-q2': 3, 'sr-q3': 0, 'sr-q4': 2, 'sr-q5': 1,
    'sr-q6': 3, 'sr-q7': 0, 'sr-q8': 2, 'sr-q9': 1, 'sr-q10': 3,
    'sr-q11': 0, 'sr-q12': 2, 'sr-q13': 1, 'sr-q14': 3, 'sr-q15': 0,
  },
  'test-memory-working': {
    'mw-q1': 0, 'mw-q2': 2, 'mw-q3': 1, 'mw-q4': 3, 'mw-q5': 0,
    'mw-q6': 2, 'mw-q7': 1, 'mw-q8': 3, 'mw-q9': 0, 'mw-q10': 2,
    'mw-q11': 1, 'mw-q12': 3, 'mw-q13': 0, 'mw-q14': 2, 'mw-q15': 1,
    'mw-q16': 3,
  },
  'test-executive-inhibition': {
    'ei-q1': 1, 'ei-q2': 0, 'ei-q3': 3, 'ei-q4': 2, 'ei-q5': 1,
    'ei-q6': 0, 'ei-q7': 3, 'ei-q8': 2, 'ei-q9': 1, 'ei-q10': 0,
    'ei-q11': 3, 'ei-q12': 2,
  },
  'test-math-vectors': {
    'mv-c1-q1': 0, 'mv-c1-q2': 2, 'mv-c1-q3': 1, 'mv-c1-q4': 3,
    'mv-c1-q5': 0, 'mv-c1-q6': 2, 'mv-c1-q7': 1, 'mv-c1-q8': 3,
    'mv-c1-q9': 0, 'mv-c1-q10': 2,
    'mv-c2-q1': 1, 'mv-c2-q2': 3, 'mv-c2-q3': 0, 'mv-c2-q4': 2,
    'mv-c2-q5': 1, 'mv-c2-q6': 3, 'mv-c2-q7': 0, 'mv-c2-q8': 2,
    'mv-c2-q9': 1, 'mv-c2-q10': 3,
    'mv-c3-q1': 2, 'mv-c3-q2': 0, 'mv-c3-q3': 3, 'mv-c3-q4': 1,
    'mv-c3-q5': 2, 'mv-c3-q6': 0, 'mv-c3-q7': 3, 'mv-c3-q8': 1,
    'mv-c3-q9': 2, 'mv-c3-q10': 0,
  },
}

// ── Normative tables (simplified) ─────────────────────────────
// Raw score → Standard score (mean 100, SD 15) by test
// Using linear interpolation between anchor points
const NORMATIVE_ANCHORS: Record<string, Array<[number, number]>> = {
  // [rawScore, standardScore]
  'test-attention-divided': [
    [0, 55], [3, 70], [7, 85], [10, 100], [12, 115], [14, 130], [15, 140],
  ],
  'test-attention-selective': [
    [0, 55], [2, 70], [5, 85], [8, 100], [10, 115], [11, 128], [12, 140],
  ],
  'test-reasoning-abstract': [
    [0, 55], [2, 70], [5, 85], [8, 100], [10, 115], [11, 128], [12, 140],
  ],
  'test-spatial-rotation': [
    [0, 55], [3, 70], [6, 85], [10, 100], [12, 115], [14, 128], [15, 140],
  ],
  'test-memory-working': [
    [0, 55], [3, 70], [6, 85], [10, 100], [13, 115], [15, 128], [16, 140],
  ],
  'test-executive-inhibition': [
    [0, 55], [2, 70], [5, 85], [8, 100], [10, 115], [11, 128], [12, 140],
  ],
  'test-math-vectors': [
    [0, 55], [6, 70], [12, 85], [20, 100], [24, 115], [28, 128], [30, 140],
  ],
}

// ── Helpers ───────────────────────────────────────────────────

function lerp(x: number, anchors: Array<[number, number]>): number {
  if (x <= anchors[0][0]) return anchors[0][1]
  if (x >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1]
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i]
    const [x1, y1] = anchors[i + 1]
    if (x >= x0 && x <= x1) {
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return 100
}

/** Standard score (mean 100, SD 15) → approximate percentile */
function standardScoreToPercentile(ss: number): number {
  const z = (ss - 100) / 15
  // Approximation of the normal CDF
  const p =
    1 /
    (1 + Math.exp(-1.7075 * z - 0.0078 * z * z * z))
  return Math.round(Math.max(1, Math.min(99, p * 100)))
}

// ── Main scoring function ─────────────────────────────────────

export function computeTestScore(
  session: TestSession,
  questionIds?: string[]
): TestScore {
  const key = ANSWER_KEYS[session.testId] ?? {}
  const ids = questionIds ?? Object.keys(session.answers)

  let correct = 0
  const total = ids.length || Object.keys(key).length

  for (const qid of ids) {
    const answer = session.answers[qid]
    if (answer === null || answer === undefined) continue
    const correctIdx = key[qid]
    if (correctIdx === undefined) continue
    if (parseInt(answer, 10) === correctIdx) correct++
  }

  // Fall back to keyed questions if no explicit ids
  if (ids.length === 0) {
    for (const [qid, correctIdx] of Object.entries(key)) {
      const answer = session.answers[qid]
      if (answer !== null && answer !== undefined) {
        if (parseInt(answer, 10) === correctIdx) correct++
      }
    }
  }

  const rawScore = correct
  const maxScore = Math.max(total, Object.keys(key).length)

  const anchors = NORMATIVE_ANCHORS[session.testId] ?? [
    [0, 55], [Math.ceil(maxScore * 0.3), 70], [Math.ceil(maxScore * 0.5), 85],
    [Math.ceil(maxScore * 0.7), 100], [Math.ceil(maxScore * 0.85), 115],
    [Math.ceil(maxScore * 0.95), 130], [maxScore, 140],
  ]

  const standardScore = Math.round(lerp(rawScore, anchors))
  const percentile = standardScoreToPercentile(standardScore)

  return {
    testId: session.testId,
    studentId: session.studentId,
    sessionId: session.sessionId,
    rawScore,
    maxScore,
    standardScore,
    percentile,
    subScores: {},
    computedAt: new Date().toISOString(),
  }
}

// ── Domain aggregate score ────────────────────────────────────

export function computeDomainScore(
  standardScores: number[]
): number {
  if (standardScores.length === 0) return 0
  return Math.round(
    standardScores.reduce((a, b) => a + b, 0) / standardScores.length
  )
}

// ── Competency scoring (weighted by discrimination) ───────────

export function computeCompetencyScore(
  answers: Record<string, string | null>,
  answerKey: Record<string, number>,
  itemAnalyses: ItemAnalysis[],
  competencyId: string,
  studentId: string
): CompetencyScore {
  const analysisMap = new Map(itemAnalyses.map((a) => [a.questionId, a]))

  const informativeItems = itemAnalyses.filter((a) => a.isInformative)
  const allItems = itemAnalyses

  let weightedCorrect = 0
  let totalWeight = 0
  let rawCorrect = 0

  for (const analysis of informativeItems) {
    const qid = analysis.questionId
    const answer = answers[qid]
    const correct = answerKey[qid]
    if (answer === null || answer === undefined || correct === undefined) continue

    const weight = Math.max(0.1, analysis.discriminationIndex)
    totalWeight += weight
    if (parseInt(answer, 10) === correct) {
      weightedCorrect += weight
      rawCorrect++
    }
  }

  // Raw score across ALL items (informative + not)
  let totalRaw = 0
  let totalAnswered = 0
  for (const [qid, correct] of Object.entries(answerKey)) {
    const answer = answers[qid]
    if (answer === null || answer === undefined) continue
    totalAnswered++
    if (parseInt(answer, 10) === correct) totalRaw++
  }

  const weightedScore =
    totalWeight > 0 ? (weightedCorrect / totalWeight) * 100 : 0
  const standardizedScore = Math.round(weightedScore)

  return {
    competencyId,
    studentId,
    rawScore: totalRaw,
    weightedScore: Math.round(weightedScore * 10) / 10,
    standardizedScore,
    itemCount: totalAnswered,
    informativeItemCount: informativeItems.length,
  }
}

// ── Beery VMI normative scoring ───────────────────────────────
// (Preserved from existing lib/beery-vmi.ts for compatibility)
export function rawToBeeryStandardScore(raw: number, age: number): number {
  const base = Math.max(
    55,
    Math.min(145, Math.round(((raw / 27) * 90) + 55))
  )
  return base
}
