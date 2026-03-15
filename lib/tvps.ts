/**
 * TVPS-3 – Test of Visual Perceptual Skills (3rd ed.)
 * Visuo-Perceptive Capacity: 7 subtests, multiple-choice items.
 */

export const TVPS_TEST_ID = 'test-visuo-perceptive'
export const TVPS_IMAGE_DIR = '/images'
export const TVPS_ITEMS_PER_SUBTEST = 16
export const TVPS_OPTIONS_PER_ITEM = 4 // A, B, C, D (can extend to 5)

export const TVPS_STORAGE_KEY = 'tvps-session'
export const TVPS_RESULT_KEY = 'tvps-last-result'

export interface TVPSSubtest {
  id: string
  name: string
  startItemIndex: number // 1-based
  itemCount: number
}

export const TVPS_SUBTESTS: TVPSSubtest[] = [
  { id: 'visual-discrimination', name: 'Visual Discrimination', startItemIndex: 1, itemCount: TVPS_ITEMS_PER_SUBTEST },
  { id: 'visual-memory', name: 'Visual Memory', startItemIndex: 17, itemCount: TVPS_ITEMS_PER_SUBTEST },
  { id: 'spatial-relationships', name: 'Spatial Relationships', startItemIndex: 33, itemCount: TVPS_ITEMS_PER_SUBTEST },
  { id: 'form-constancy', name: 'Form Constancy', startItemIndex: 49, itemCount: TVPS_ITEMS_PER_SUBTEST },
  { id: 'sequential-memory', name: 'Sequential Memory', startItemIndex: 65, itemCount: TVPS_ITEMS_PER_SUBTEST },
  { id: 'figure-ground', name: 'Figure-Ground', startItemIndex: 81, itemCount: TVPS_ITEMS_PER_SUBTEST },
  { id: 'visual-closure', name: 'Visual Closure', startItemIndex: 97, itemCount: TVPS_ITEMS_PER_SUBTEST },
]

export const TVPS_TOTAL_ITEMS = TVPS_SUBTESTS.reduce((sum, s) => sum + s.itemCount, 0)

export type TVPSOption = 'A' | 'B' | 'C' | 'D'

export interface TVPSParticipantInfo {
  name: string
  gender: string
  school: string
  examiner: string
  dateOfBirth: string
  dateOfEvaluation: string
  chronologicalAge: string
  gradeLevel: string
  participantId: string
}

export interface TVPSItemResponse {
  itemIndex: number
  selectedOption: TVPSOption | null
  /** When the item was first shown (for response time). */
  shownAt: string | null
  /** When the answer was selected. */
  answeredAt: string | null
  /** Response time in milliseconds. */
  responseTimeMs: number | null
  /** Set when answer key is available. */
  correct: boolean | null
}

export interface TVPSSession {
  testId: string
  startedAt: string
  participantInfo: TVPSParticipantInfo | null
  responses: TVPSItemResponse[]
}

export interface TVPSSubtestScore {
  subtestId: string
  subtestName: string
  rawScore: number
  standardScore: number
  percentile: number
}

export interface TVPSResult {
  session: TVPSSession
  subtestScores: TVPSSubtestScore[]
  compositeScore: number
  compositePercentile: number
  completedAt: string
}

/** Get image path for a 1-based item index. */
export function getTVPSImagePath(itemIndex: number): string {
  const padded = String(itemIndex).padStart(4, '0')
  return `${TVPS_IMAGE_DIR}/TVPS_page-${padded}.jpg`
}

/** Get subtest for a 1-based item index. */
export function getSubtestForItem(itemIndex: number): TVPSSubtest | undefined {
  return TVPS_SUBTESTS.find(
    (s) =>
      itemIndex >= s.startItemIndex &&
      itemIndex < s.startItemIndex + s.itemCount
  )
}

/**
 * Optional answer key: correct option per item (1-based index).
 * Length = TVPS_TOTAL_ITEMS. Set to null to only record responses.
 */
export const TVPS_ANSWER_KEY: TVPSOption[] | null = null

export function computeSubtestRawScore(
  responses: TVPSItemResponse[],
  subtest: TVPSSubtest,
  answerKey: TVPSOption[] | null
): number {
  if (!answerKey) return 0
  return responses
    .filter(
      (r) =>
        r.itemIndex >= subtest.startItemIndex &&
        r.itemIndex < subtest.startItemIndex + subtest.itemCount
    )
    .reduce(
      (count, r) =>
        count + (answerKey[r.itemIndex - 1] === r.selectedOption ? 1 : 0),
      0
    )
}

/** Convert raw score to standard score (mean 100, SD 15) – simplified. */
export function rawToStandardScore(raw: number, maxItems: number): number {
  if (maxItems <= 0) return 100
  const p = raw / maxItems
  const ss = Math.round(55 + p * 90)
  return Math.max(55, Math.min(145, ss))
}

/** Standard score to percentile – simplified normal approx. */
export function standardScoreToPercentile(standardScore: number): number {
  const z = (standardScore - 100) / 15
  const p = 50 + z * 34
  return Math.round(Math.max(1, Math.min(99, p)))
}

export function computeTVPSResult(session: TVPSSession): TVPSResult {
  const key = TVPS_ANSWER_KEY
  const subtestScores: TVPSSubtestScore[] = TVPS_SUBTESTS.map((sub) => {
    const raw = computeSubtestRawScore(session.responses, sub, key)
    const standardScore = rawToStandardScore(raw, sub.itemCount)
    const percentile = standardScoreToPercentile(standardScore)
    return {
      subtestId: sub.id,
      subtestName: sub.name,
      rawScore: raw,
      standardScore,
      percentile,
    }
  })
  const compositeScore =
    subtestScores.length > 0
      ? Math.round(
          subtestScores.reduce((s, x) => s + x.standardScore, 0) /
            subtestScores.length
        )
      : 100
  const compositePercentile = standardScoreToPercentile(compositeScore)
  return {
    session,
    subtestScores,
    compositeScore,
    compositePercentile,
    completedAt: new Date().toISOString(),
  }
}

export function createEmptyTVPSSession(participantInfo: TVPSParticipantInfo | null = null): TVPSSession {
  const now = new Date().toISOString()
  const responses: TVPSItemResponse[] = Array.from({ length: TVPS_TOTAL_ITEMS }, (_, i) => ({
    itemIndex: i + 1,
    selectedOption: null,
    shownAt: null,
    answeredAt: null,
    responseTimeMs: null,
    correct: null,
  }))
  return {
    testId: TVPS_TEST_ID,
    startedAt: now,
    participantInfo,
    responses,
  }
}

export function loadTVPSSession(): TVPSSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(TVPS_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TVPSSession
  } catch {
    return null
  }
}

export function saveTVPSSession(session: TVPSSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(TVPS_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
}

export function clearTVPSSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(TVPS_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function saveTVPSResult(result: TVPSResult): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(TVPS_RESULT_KEY, JSON.stringify(result))
  } catch {
    // ignore
  }
}

export function loadTVPSResult(): TVPSResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(TVPS_RESULT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TVPSResult
  } catch {
    return null
  }
}
