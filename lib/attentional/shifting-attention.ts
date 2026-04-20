/**
 * Shifting Attention — Cued Task Switching Paradigm
 * - Stimulus: number 1..9 (not 5)
 * - Task 1 (cue ODD/EVEN): Left=even, Right=odd
 * - Task 2 (cue HIGH/LOW): Left=less than 5, Right=greater than 5
 * - Trials mix repeat + switch
 */

export const SHIFTING_ATTENTION_TEST_ID = 'test-cognitive-flexibility'
export const SHIFTING_ATTENTION_RESULTS_KEY = 'shifting-attention:results'

export type SATask = 'parity' | 'magnitude'

export interface ShATrial {
  index: number
  task: SATask
  digit: number // 1..9 != 5
  isSwitch: boolean // different from previous trial
}

export interface ShATrialResult extends ShATrial {
  response: 'left' | 'right' | null
  reactionTimeMs: number | null
  correct: boolean
}

export interface ShAResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: ShATrialResult[]
  totalMs: number
  correctCount: number
  meanRT: number
  switchCost: number // mean RT switch - mean RT repeat
  score: number
}

export const SHA_TRAINING_COUNT = 12
export const SHA_TEST_COUNT = 40 // reduced from 80 for practicality
export const SHA_FIXATION_MS = 400
export const SHA_CUE_MS = 400
export const SHA_MAX_RESPONSE_MS = 3000
export const SHA_ITI_MS = 500

export function correctSide(trial: ShATrial): 'left' | 'right' {
  if (trial.task === 'parity') {
    return trial.digit % 2 === 0 ? 'left' : 'right'
  } else {
    return trial.digit < 5 ? 'left' : 'right'
  }
}

function randomDigit(): number {
  const pool = [1, 2, 3, 4, 6, 7, 8, 9]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function buildShATrials(count: number, mixRatio = 0.5): ShATrial[] {
  const trials: ShATrial[] = []
  let prev: SATask | null = null
  for (let i = 0; i < count; i++) {
    let task: SATask
    if (i === 0) {
      task = Math.random() < 0.5 ? 'parity' : 'magnitude'
    } else {
      const shouldSwitch = Math.random() < mixRatio
      task = shouldSwitch ? (prev === 'parity' ? 'magnitude' : 'parity') : (prev as SATask)
    }
    trials.push({
      index: i,
      task,
      digit: randomDigit(),
      isSwitch: prev !== null && prev !== task,
    })
    prev = task
  }
  return trials
}

export function listShAResults(): ShAResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SHIFTING_ATTENTION_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as ShAResult[]) : []
  } catch {
    return []
  }
}

export function saveShAResult(r: ShAResult) {
  if (typeof window === 'undefined') return
  const all = listShAResults()
  all.push(r)
  window.localStorage.setItem(SHIFTING_ATTENTION_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}

export function getLatestShAResult(userName?: string): ShAResult | undefined {
  const all = listShAResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}
