/**
 * WAIS Visual Puzzles – Visuo-Constructive Capacity test
 * One puzzle image per question, four options (A, B, C, D).
 */

export const VISUO_CONSTRUCTIVE_TEST_ID = 'test-visuo-constructive'
/** First and last page numbers in filename (inclusive). */
export const VISUO_CONSTRUCTIVE_FIRST_PAGE = 3
export const VISUO_CONSTRUCTIVE_LAST_PAGE = 27
export const VISUO_CONSTRUCTIVE_IMAGE_DIR = '/images'

export const VISUO_CONSTRUCTIVE_STORAGE_KEY = 'visuo-constructive-session'
export const VISUO_CONSTRUCTIVE_RESULT_KEY = 'visuo-constructive-last-result'

export type VisualPuzzleOption = 'A' | 'B' | 'C' | 'D'

export interface VisualPuzzleItemResponse {
  questionNumber: number
  selectedOption: VisualPuzzleOption | null
  answeredAt: string | null
}

export interface VisuoConstructiveSession {
  testId: string
  startedAt: string
  responses: VisualPuzzleItemResponse[]
}

export interface VisuoConstructiveResult {
  session: VisuoConstructiveSession
  totalQuestions: number
  answeredCount: number
  correctCount: number | null
  /** Score 0–100 when answer key is present; otherwise null. */
  scorePercent: number | null
  completedAt: string
}

/** Get image path for a 1-based question index (item 1 → page 3, item 2 → page 4, …). */
export function getConstructiveImagePath(questionNumber: number): string {
  const page = VISUO_CONSTRUCTIVE_FIRST_PAGE + questionNumber - 1
  const padded = String(page).padStart(4, '0')
  return `${VISUO_CONSTRUCTIVE_IMAGE_DIR}/constructive_page-${padded}.jpg`
}

export const VISUO_CONSTRUCTIVE_QUESTION_COUNT =
  VISUO_CONSTRUCTIVE_LAST_PAGE - VISUO_CONSTRUCTIVE_FIRST_PAGE + 1

/**
 * Optional answer key: correct option per question (1-based index).
 * Set to null to only record responses without scoring correct/incorrect.
 */
export const VISUO_CONSTRUCTIVE_ANSWER_KEY: VisualPuzzleOption[] | null = null
// Example when key is known: ['A', 'B', 'C', 'D', 'A', ... ]

export function computeCorrectCount(
  responses: VisualPuzzleItemResponse[],
  answerKey: VisualPuzzleOption[] | null
): number | null {
  if (!answerKey || answerKey.length === 0) return null
  return responses.reduce((count, r) => {
    const correct = answerKey[r.questionNumber - 1]
    return count + (r.selectedOption === correct ? 1 : 0)
  }, 0)
}

export function loadVisuoConstructiveSession(): VisuoConstructiveSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(VISUO_CONSTRUCTIVE_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as VisuoConstructiveSession
  } catch {
    return null
  }
}

export function saveVisuoConstructiveSession(session: VisuoConstructiveSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(VISUO_CONSTRUCTIVE_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
}

export function clearVisuoConstructiveSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(VISUO_CONSTRUCTIVE_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function saveVisuoConstructiveResult(result: VisuoConstructiveResult): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(VISUO_CONSTRUCTIVE_RESULT_KEY, JSON.stringify(result))
  } catch {
    // ignore
  }
}

export function loadVisuoConstructiveResult(): VisuoConstructiveResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(VISUO_CONSTRUCTIVE_RESULT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as VisuoConstructiveResult
  } catch {
    return null
  }
}
