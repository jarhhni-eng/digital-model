/**
 * Beery-Buktenica Developmental Test of Visual-Motor Integration (Beery VMI)
 * Types, constants, scoring, and storage helpers.
 */

export const BEERY_VMI_TEST_ID = 'test-visuo-motor'
export const BEERY_VMI_SHAPE_COUNT = 27
export const BEERY_VMI_IMAGE_BASE = '/beery-vmi'
export const BEERY_VMI_STORAGE_KEY = 'beery-vmi-session'
export const BEERY_VMI_RESULT_KEY = 'beery-vmi-last-result'

export type BeeryDrawingTool = 'pencil' | 'erase'

export interface BeeryItemResponse {
  itemIndex: number
  drawingDataUrl: string | null
  startedAt: string
  completedAt: string | null
  completed: boolean
}

export type BeeryErrorCategory =
  | 'visual-perception'
  | 'visual-motor-integration'
  | 'motor-coordination'

export interface BeeryErrorAnalysis {
  itemIndex: number
  visualPerception: boolean
  visualMotorIntegration: boolean
  motorCoordination: boolean
  notes?: string
}

export interface BeeryVMISession {
  testId: string
  startedAt: string
  responses: BeeryItemResponse[]
  participantId?: string
  participantName?: string
}

export interface BeeryVMIProfile {
  vmi: number
  visualPerception: number
  motorCoordination: number
}

export interface BeeryVMIResult {
  session: BeeryVMISession
  rawScore: number
  standardScore: number
  percentile: number
  profile: BeeryVMIProfile
  errorAnalysis: BeeryErrorAnalysis[]
  completedAt: string
}

/** Get image path for a shape (1-based index). */
export function getBeeryShapeImagePath(itemNumber: number): string {
  return `${BEERY_VMI_IMAGE_BASE}/shape_${itemNumber}.png`
}

/**
 * Compute raw score: number of items with a completed drawing.
 * In a full implementation, each item could be scored pass/fail by an examiner or algorithm.
 */
export function computeBeeryRawScore(responses: BeeryItemResponse[]): number {
  return responses.filter((r) => r.completed && r.drawingDataUrl).length
}

/**
 * Convert raw score to standard score (mean 100, SD 15).
 * Uses a simplified linear mapping for demo; real Beery VMI uses normative tables by age.
 */
export function rawToStandardScore(rawScore: number, maxItems: number = BEERY_VMI_SHAPE_COUNT): number {
  if (maxItems <= 0) return 100
  const proportion = rawScore / maxItems
  // Map 0..1 to roughly 55..145 (mean 100, SD 15)
  const standardScore = Math.round(55 + proportion * 90)
  return Math.max(55, Math.min(145, standardScore))
}

/**
 * Convert standard score to percentile (simplified normal approximation).
 */
export function standardScoreToPercentile(standardScore: number): number {
  // Approximate: 100 -> 50th, 115 -> ~84th, 85 -> ~16th
  const z = (standardScore - 100) / 15
  const percentile = 50 + z * 34
  return Math.round(Math.max(1, Math.min(99, percentile)))
}

/**
 * Build profile scores (VMI, Visual Perception, Motor Coordination).
 * Real test uses separate subscales; here we derive from same raw score for demo.
 */
export function computeBeeryProfile(
  rawScore: number,
  errorAnalysis: BeeryErrorAnalysis[],
  maxItems: number = BEERY_VMI_SHAPE_COUNT
): BeeryVMIProfile {
  const base = rawToStandardScore(rawScore, maxItems)
  const vpErrors = errorAnalysis.filter((e) => e.visualPerception).length
  const mcErrors = errorAnalysis.filter((e) => e.motorCoordination).length
  const vmiErrors = errorAnalysis.filter((e) => e.visualMotorIntegration).length
  return {
    vmi: Math.max(55, Math.min(145, base - vmiErrors * 2)),
    visualPerception: Math.max(55, Math.min(145, base - vpErrors * 2)),
    motorCoordination: Math.max(55, Math.min(145, base - mcErrors * 2)),
  }
}

export function loadBeerySession(): BeeryVMISession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(BEERY_VMI_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BeeryVMISession
  } catch {
    return null
  }
}

export function saveBeerySession(session: BeeryVMISession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(BEERY_VMI_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
}

export function clearBeerySession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(BEERY_VMI_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function saveBeeryResult(result: BeeryVMIResult): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(BEERY_VMI_RESULT_KEY, JSON.stringify(result))
  } catch {
    // ignore
  }
}

export function loadBeeryResult(): BeeryVMIResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(BEERY_VMI_RESULT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as BeeryVMIResult
  } catch {
    return null
  }
}

/** Error category labels for UI. */
export const BEERY_ERROR_CATEGORIES: { id: BeeryErrorCategory; label: string; examples: string }[] = [
  {
    id: 'visual-perception',
    label: 'Visual perception',
    examples: 'Wrong orientation, missing parts, extra elements, confusion between shapes',
  },
  {
    id: 'visual-motor-integration',
    label: 'Visual-motor integration',
    examples: 'Incorrect proportions, distorted angles, spacing errors',
  },
  {
    id: 'motor-coordination',
    label: 'Motor coordination',
    examples: 'Shaky lines, unstable strokes, difficulty controlling the pencil',
  },
]
