/**
 * Sustained Attention to Response Task (SART)
 * - 20 digits (1..9), each shown ~1s
 * - Press SPACE for every digit EXCEPT 3
 * - Inhibition targets: digit "3" at specific positions (indices 2, 5, 9, 14, 19 => 0-based)
 * - Score: 1 point per correct response (press on non-3, no-press on 3), max 20
 */

export const SUSTAINED_ATTENTION_TEST_ID = 'test-sustained-attention'
export const SUSTAINED_ATTENTION_RESULTS_KEY = 'sustained-attention:results'

export const SART_TRIAL_COUNT = 20
export const SART_DIGIT_MS = 1000
export const SART_ISI_MS = 300

// 0-based positions where the digit must be 3 (spec: 3rd, 6th, 10th, 15th, 20th)
export const SART_NO_GO_POSITIONS = [2, 5, 9, 14, 19]

export interface SARTTrial {
  index: number
  digit: number
  isNoGo: boolean
}

export interface SARTTrialResult extends SARTTrial {
  pressed: boolean
  reactionTimeMs: number | null
  correct: boolean
}

export interface SARTResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: SARTTrialResult[]
  totalMs: number
  correctCount: number
  commissionErrors: number // pressed on 3
  omissionErrors: number // didn't press on non-3
  meanRT: number
  score: number
}

export function buildSARTTrials(): SARTTrial[] {
  const trials: SARTTrial[] = []
  for (let i = 0; i < SART_TRIAL_COUNT; i++) {
    const isNoGo = SART_NO_GO_POSITIONS.includes(i)
    const digit = isNoGo
      ? 3
      : (() => {
          // Random from 1..9 excluding 3
          const pool = [1, 2, 4, 5, 6, 7, 8, 9]
          return pool[Math.floor(Math.random() * pool.length)]
        })()
    trials.push({ index: i, digit, isNoGo })
  }
  return trials
}

export function listSARTResults(): SARTResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SUSTAINED_ATTENTION_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as SARTResult[]) : []
  } catch {
    return []
  }
}

export function saveSARTResult(r: SARTResult) {
  if (typeof window === 'undefined') return
  const all = listSARTResults()
  all.push(r)
  window.localStorage.setItem(SUSTAINED_ATTENTION_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}

export function getLatestSARTResult(userName?: string): SARTResult | undefined {
  const all = listSARTResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}
