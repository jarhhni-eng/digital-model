/**
 * Divided Attention Test
 * - Ball moves across screen; user keeps cursor centered on ball
 * - Color word appears at top; press SPACE if word matches ball color (Go),
 *   do nothing if mismatch (No-Go)
 * - 16 trials (4 per color × 4 colors: green, red, black, white)
 * - Score = number of correct responses / 16
 */

export const DIVIDED_ATTENTION_TEST_ID = 'test-divided-attention'
export const DIVIDED_ATTENTION_RESULTS_KEY = 'divided-attention:results'
export const DIVIDED_ATTENTION_IMAGE_DIR = '/images/divided-attention'

export const DA_COLORS = ['green', 'red', 'black', 'white'] as const
export type DAColor = (typeof DA_COLORS)[number]

export const DA_COLOR_LABEL: Record<DAColor, string> = {
  green: 'GREEN',
  red: 'RED',
  black: 'BLACK',
  white: 'WHITE',
}

export const DA_COLOR_HEX: Record<DAColor, string> = {
  green: '#16a34a',
  red: '#dc2626',
  black: '#000000',
  white: '#ffffff',
}

export const DA_TRIAL_COUNT = 16
export const DA_TRIAL_DURATION_MS = 3000

export interface DATrial {
  index: number
  wordColor: DAColor // word meaning
  ballColor: DAColor
  isGo: boolean // word === ballColor
}

export interface DATrialResult extends DATrial {
  pressed: boolean
  reactionTimeMs: number | null
  correct: boolean
}

export interface DARResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: DATrialResult[]
  totalMs: number
  correctCount: number
  score: number // 0..100 percent
}

export function daImagePath(n: number): string {
  return `${DIVIDED_ATTENTION_IMAGE_DIR}/Divided Attention ${n}.jpg`
}

export function buildDATrials(): DATrial[] {
  // 4 Go trials per color (word === ball) + mismatches to reach 16
  // Spec: each color name appears 4 times at the top; so 4 trials per color name.
  // Randomly decide match/mismatch per trial with ~50% match rate.
  const trials: DATrial[] = []
  let idx = 0
  for (const wordColor of DA_COLORS) {
    for (let i = 0; i < 4; i++) {
      const ballColor: DAColor =
        Math.random() < 0.5
          ? wordColor
          : (DA_COLORS.filter((c) => c !== wordColor)[Math.floor(Math.random() * 3)] as DAColor)
      trials.push({
        index: idx++,
        wordColor,
        ballColor,
        isGo: wordColor === ballColor,
      })
    }
  }
  // Shuffle
  for (let i = trials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[trials[i], trials[j]] = [trials[j], trials[i]]
  }
  trials.forEach((t, i) => (t.index = i))
  return trials
}

export function listDAResults(): DARResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(DIVIDED_ATTENTION_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as DARResult[]) : []
  } catch {
    return []
  }
}

export function saveDAResult(r: DARResult) {
  if (typeof window === 'undefined') return
  const all = listDAResults()
  all.push(r)
  window.localStorage.setItem(DIVIDED_ATTENTION_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}

export function getLatestDAResult(userName?: string): DARResult | undefined {
  const all = listDAResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}

export function toCSV(r: DARResult): string {
  const header = 'Participant,TrialIndex,WordColor,BallColor,Condition,Pressed,Correct,RT_ms,TotalTimeMs'
  const rows = r.trials.map((t) =>
    [
      r.userName ?? 'anonymous',
      t.index + 1,
      t.wordColor,
      t.ballColor,
      t.isGo ? 'Go' : 'NoGo',
      t.pressed ? 1 : 0,
      t.correct ? 1 : 0,
      t.reactionTimeMs ?? '',
      r.totalMs,
    ].join(','),
  )
  return [header, ...rows].join('\n')
}
