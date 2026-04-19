// ─── Raven's Progressive Matrices — test data & scoring ─────────────────────

export const RAVENS_TEST_ID = 'test-inductive-reasoning'
export const RAVENS_STORAGE_KEY = 'ravensTestResults'
export const RAVENS_DURATION_SECONDS = 40 * 60   // 40 minutes

// Series metadata
export type SeriesId = 'A' | 'B' | 'C' | 'D' | 'E'

export const SERIES_CHOICES: Record<SeriesId, number> = {
  A: 6,
  B: 6,
  C: 8,
  D: 8,
  E: 8,
}

// Answer key — correct option number (1-based)
const RAW_KEY: Record<SeriesId, number[]> = {
  A: [4, 5, 1, 2, 6, 3, 6, 2, 1, 3, 5, 4],
  B: [2, 6, 1, 2, 1, 3, 5, 6, 4, 3, 4, 5],
  C: [8, 2, 3, 8, 7, 4, 5, 1, 7, 6, 1, 2],
  D: [3, 4, 3, 7, 8, 6, 5, 4, 1, 2, 5, 6],
  E: [7, 6, 8, 2, 1, 5, 2, 4, 1, 6, 3, 5],
}

export interface RavensQuestion {
  /** e.g. "A1", "C7" */
  code: string
  series: SeriesId
  /** 1-based position within series */
  position: number
  /** absolute index 0–59 */
  index: number
  /** number of answer choices (6 or 8) */
  numChoices: number
  /** image path relative to /public  e.g. "/ravens/A1.png" */
  imagePath: string
  /** 1-based correct answer */
  correctAnswer: number
}

// Build the flat question list
const SERIES_ORDER: SeriesId[] = ['A', 'B', 'C', 'D', 'E']

export const ravensQuestions: RavensQuestion[] = SERIES_ORDER.flatMap((series) =>
  Array.from({ length: 12 }, (_, i) => ({
    code: `${series}${i + 1}`,
    series,
    position: i + 1,
    index: SERIES_ORDER.indexOf(series) * 12 + i,
    numChoices: SERIES_CHOICES[series],
    imagePath: `/ravens/${series}${i + 1}.png`,
    correctAnswer: RAW_KEY[series][i],
  }))
)

// ─── Scoring ─────────────────────────────────────────────────────────────────

export type RavensAnswers = Record<string, number>  // code → chosen (1-based)

export function computeRavensScore(answers: RavensAnswers): RavensScore {
  const bySeries: Record<SeriesId, { correct: number; total: number }> = {
    A: { correct: 0, total: 12 },
    B: { correct: 0, total: 12 },
    C: { correct: 0, total: 12 },
    D: { correct: 0, total: 12 },
    E: { correct: 0, total: 12 },
  }

  let total = 0
  for (const q of ravensQuestions) {
    if (answers[q.code] === q.correctAnswer) {
      bySeries[q.series].correct++
      total++
    }
  }

  return { total, maxTotal: 60, bySeries }
}

export interface RavensScore {
  total: number
  maxTotal: number
  bySeries: Record<SeriesId, { correct: number; total: number }>
}

export function interpretScore(total: number): { label: string; color: string } {
  if (total <= 15) return { label: 'Très faible',  color: 'text-red-600' }
  if (total <= 30) return { label: 'Faible',        color: 'text-orange-500' }
  if (total <= 45) return { label: 'Moyen',         color: 'text-amber-500' }
  if (total <= 55) return { label: 'Bon',           color: 'text-blue-600' }
  return               { label: 'Très élevé',     color: 'text-green-600' }
}

export interface RavensResult {
  answers: RavensAnswers
  score: RavensScore
  timeUsedSeconds: number
  completedAt: string
}
