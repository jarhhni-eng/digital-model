// ─── Spatial Orientation Test ─────────────────────────────────────────────────

export const SPATIAL_ORIENTATION_TEST_ID = 'test-spatial-orientation'
export const SPATIAL_ORIENTATION_STORAGE_KEY = 'spatialOrientationResults'

// Fixed answer choices — always displayed in this order
export const ANSWER_CHOICES = [
  { id: 'A', label: 'Car',                  value: 'car' },
  { id: 'B', label: 'Stop sign',            value: 'stop sign' },
  { id: 'C', label: 'House',                value: 'house' },
  { id: 'D', label: 'Flower',               value: 'flower' },
  { id: 'E', label: 'Tree',                 value: 'tree' },
  { id: 'F', label: 'Numerical road sign',  value: 'numerical road sign' },
  { id: 'G', label: 'Traffic light',        value: 'traffic light' },
] as const

export type AnswerValue = typeof ANSWER_CHOICES[number]['value']

// Answer key  (question number 1-based → correct answer value)
const ANSWER_KEY: Record<number, AnswerValue> = {
  1:  'stop sign',
  2:  'car',
  3:  'house',
  4:  'car',
  5:  'traffic light',
  6:  'car',
  7:  'flower',
  8:  'stop sign',
  9:  'tree',
  10: 'car',
  11: 'house',
  12: 'traffic light',
  13: 'tree',
  14: 'traffic light',
  15: 'car',
  16: 'house',
  17: 'traffic light',
  18: 'traffic light',
}

export interface SpatialQuestion {
  number: number           // 1 – 18
  mainImage: string        // always /images/main/main.jpg
  orientationImage: string // /images/orientation/1.png … 18.png
  correctAnswer: AnswerValue
}

export const spatialQuestions: SpatialQuestion[] = Array.from(
  { length: 18 },
  (_, i) => ({
    number: i + 1,
    mainImage: '/images/main/main.jpg',
    orientationImage: `/images/orientation/${i + 1}.png`,
    correctAnswer: ANSWER_KEY[i + 1],
  })
)

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface SpatialResponse {
  questionNumber: number
  selected: AnswerValue | null
  responseTimeMs: number    // milliseconds spent on this question
  isCorrect: boolean
}

export interface SpatialResult {
  responses: SpatialResponse[]
  totalCorrect: number
  totalQuestions: number
  completedAt: string
}

export function computeSpatialResult(
  responses: Omit<SpatialResponse, 'isCorrect'>[]
): SpatialResult {
  const scored: SpatialResponse[] = responses.map((r) => ({
    ...r,
    isCorrect:
      r.selected !== null &&
      r.selected === ANSWER_KEY[r.questionNumber],
  }))
  return {
    responses: scored,
    totalCorrect: scored.filter((r) => r.isCorrect).length,
    totalQuestions: 18,
    completedAt: new Date().toISOString(),
  }
}
