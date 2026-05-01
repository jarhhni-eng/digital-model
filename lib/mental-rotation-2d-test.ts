// ─── 2D Mental Rotation Test (LEFT / RIGHT selection) ────────────────────────

export const MENTAL_ROTATION_2D_TEST_ID = 'test-mental-rotation-2d'
export const MENTAL_ROTATION_2D_STORAGE_KEY = 'mentalRotation2dResults'
export const MENTAL_ROTATION_2D_DURATION_SECONDS = 15 * 60 // 15 minutes (900 s)

export const SIDES = ['LEFT', 'RIGHT'] as const
export type Side = typeof SIDES[number]

// Predefined answer key (Rotation 1 → 19)
const RAW_KEY: Record<number, Side> = {
  1:  'LEFT',
  2:  'LEFT',
  3:  'LEFT',
  4:  'LEFT',
  5:  'RIGHT',
  6:  'LEFT',
  7:  'LEFT',
  8:  'LEFT',
  9:  'LEFT',
  10: 'RIGHT',
  11: 'LEFT',
  12: 'LEFT',
  13: 'RIGHT',
  14: 'RIGHT',
  15: 'RIGHT',
  16: 'LEFT',
  17: 'LEFT',
  18: 'LEFT',
  19: 'RIGHT',
}

export interface Rotation2DQuestion {
  number: number          // 1..19
  imagePath: string       // /rotation-2d/Rotation (N).png
  correct: Side
}

export const TOTAL_QUESTIONS_2D = 19

export const rotation2dQuestions: Rotation2DQuestion[] = Array.from(
  { length: TOTAL_QUESTIONS_2D },
  (_, i) => ({
    number: i + 1,
    imagePath: `/rotation-2d/Rotation (${i + 1}).png`,
    correct: RAW_KEY[i + 1]!,
  }),
)

// ─── Scoring ──────────────────────────────────────────────────────────────────
// +1 → correct
// 0 → incorrect / unanswered

export interface Rotation2DResponse {
  questionNumber: number
  selected: Side | null
  isCorrect: boolean
  responseTimeMs: number
}

export interface Rotation2DResult {
  responses: Rotation2DResponse[]
  totalScore: number   // 0..19
  maxScore: number     // 19
  timeUsedSeconds: number
  completedAt: string
}

export function computeRotation2DResult(
  rawResponses: { questionNumber: number; selected: Side | null; responseTimeMs: number }[],
  timeUsedSeconds: number,
): Rotation2DResult {
  const responses: Rotation2DResponse[] = rotation2dQuestions.map((q) => {
    const r = rawResponses.find((x) => x.questionNumber === q.number)
    const selected = r?.selected ?? null
    return {
      questionNumber: q.number,
      selected,
      isCorrect: selected !== null && selected === q.correct,
      responseTimeMs: r?.responseTimeMs ?? 0,
    }
  })
  return {
    responses,
    totalScore: responses.reduce((s, r) => s + (r.isCorrect ? 1 : 0), 0),
    maxScore: TOTAL_QUESTIONS_2D,
    timeUsedSeconds,
    completedAt: new Date().toISOString(),
  }
}
