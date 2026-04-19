// ─── 3D Mental Rotation Test (Vandenberg & Kuse, 1978) ───────────────────────

export const MENTAL_ROTATION_TEST_ID  = 'test-mental-rotation'
export const MENTAL_ROTATION_STORAGE_KEY = 'mentalRotationResults'
export const MENTAL_ROTATION_DURATION_SECONDS = 20 * 60   // 20 minutes

export const OPTIONS = ['A', 'B', 'C', 'D'] as const
export type OptionLetter = typeof OPTIONS[number]

// Answer key — two correct letters per question
const RAW_KEY: Record<number, [OptionLetter, OptionLetter]> = {
  1:  ['A', 'C'],
  2:  ['A', 'D'],
  3:  ['B', 'D'],
  4:  ['B', 'C'],
  5:  ['A', 'C'],
  6:  ['A', 'D'],
  7:  ['B', 'D'],
  8:  ['B', 'C'],
  9:  ['B', 'D'],
  10: ['A', 'D'],
  11: ['B', 'D'],
  12: ['B', 'D'],
  13: ['B', 'D'],
  14: ['A', 'D'],
  15: ['B', 'D'],
  16: ['B', 'C'],
  17: ['A', 'C'],
  18: ['A', 'D'],
  19: ['B', 'D'],
  20: ['B', 'C'],
}

export interface RotationQuestion {
  number: number                          // 1–20
  imagePath: string                       // /rotation/rotation (N).jpg
  correctAnswers: [OptionLetter, OptionLetter]
}

export const rotationQuestions: RotationQuestion[] = Array.from(
  { length: 20 },
  (_, i) => ({
    number: i + 1,
    imagePath: `/rotation/Rotation (${i + 1}).png`,
    correctAnswers: RAW_KEY[i + 1],
  })
)

// ─── Scoring ──────────────────────────────────────────────────────────────────
// +2 → both correct answers selected
// +1 → exactly one correct answer among selected
// +0 → no correct answer, or no selection

export function scoreQuestion(
  selected: OptionLetter[],
  correct: [OptionLetter, OptionLetter]
): 0 | 1 | 2 {
  const correctSet = new Set(correct)
  const hits = selected.filter((s) => correctSet.has(s)).length
  return hits as 0 | 1 | 2
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface RotationResponse {
  questionNumber: number
  selected: OptionLetter[]
  score: 0 | 1 | 2         // per-question score
  responseTimeMs: number
}

export interface RotationResult {
  responses: RotationResponse[]
  totalScore: number        // 0–40  (max 2 pts × 20 questions)
  maxScore: number          // 40
  timeUsedSeconds: number
  completedAt: string
}

export function computeRotationResult(
  rawResponses: { questionNumber: number; selected: OptionLetter[]; responseTimeMs: number }[],
  timeUsedSeconds: number
): RotationResult {
  const responses: RotationResponse[] = rawResponses.map((r) => ({
    ...r,
    score: scoreQuestion(r.selected, RAW_KEY[r.questionNumber]),
  }))
  return {
    responses,
    totalScore: responses.reduce((s, r) => s + r.score, 0),
    maxScore: 40,
    timeUsedSeconds,
    completedAt: new Date().toISOString(),
  }
}
