// ─── Corsi Block Tapping Task ─────────────────────────────────────────────────

export const CORSI_TEST_ID      = 'test-visuo-spatial-memory'
export const CORSI_STORAGE_KEY  = 'corsiTestResults'

export const TOTAL_ATTEMPTS       = 5
export const HIGHLIGHT_DURATION_MS = 1000   // each block lit for 1 s
export const INTER_BLOCK_DELAY_MS  = 400    // gap between blocks
export const PRE_SEQUENCE_DELAY_MS = 3000   // wait before first block lights

// ─── Block layout ─────────────────────────────────────────────────────────────
// Positions based on Kessels et al. (2000) CBT layout, normalised to a
// 100 × 100 percentage grid inside the display container.
export interface BlockPos {
  id: number    // 1-based
  x: number     // % from left
  y: number     // % from top
}

export const BLOCK_POSITIONS: BlockPos[] = [
  { id: 1, x: 20, y: 75 },
  { id: 2, x: 65, y: 58 },
  { id: 3, x: 80, y: 12 },
  { id: 4, x: 42, y: 35 },
  { id: 5, x: 14, y: 46 },
  { id: 6, x: 55, y: 80 },
  { id: 7, x: 78, y: 44 },
  { id: 8, x: 44, y: 8  },
  { id: 9, x: 7,  y: 16 },
]

// ─── Sequence generation ──────────────────────────────────────────────────────
// Attempt 1-2 → length 3, Attempt 3-4 → length 4, Attempt 5 → length 5
export function sequenceLengthFor(attempt: number): number {
  if (attempt <= 2) return 3
  if (attempt <= 4) return 4
  return 5
}

export function generateSequence(length: number): number[] {
  const ids = BLOCK_POSITIONS.map((b) => b.id)
  const shuffled = [...ids].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, length)
}

// ─── Scoring ──────────────────────────────────────────────────────────────────
export interface AttemptRecord {
  attemptNumber: number
  sequenceLength: number
  targetSequence: number[]
  userSequence: number[]
  isCorrect: boolean
}

export interface CorsiResult {
  attempts: AttemptRecord[]
  score: number           // 0–5
  maxScore: number        // 5
  completedAt: string
}

export function sequencesMatch(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}
