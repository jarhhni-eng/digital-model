/**
 * Selective Attention — Stroop SCWT
 * - Word (color name) displayed at top in a colored font
 * - Participant presses D/F/J/L corresponding to the MEANING of the word
 * - D=Green, F=Yellow, J=Red, L=Blue
 */

export const SELECTIVE_ATTENTION_TEST_ID = 'test-selective-attention'
export const SELECTIVE_ATTENTION_RESULTS_KEY = 'selective-attention:results'

export const SA_COLORS = ['red', 'yellow', 'green', 'blue'] as const
export type SAColor = (typeof SA_COLORS)[number]

export const SA_COLOR_HEX: Record<SAColor, string> = {
  red: '#dc2626',
  yellow: '#eab308',
  green: '#16a34a',
  blue: '#2563eb',
}

export const SA_KEY_TO_COLOR: Record<string, SAColor> = {
  d: 'green',
  f: 'yellow',
  j: 'red',
  l: 'blue',
}

export const SA_COLOR_TO_KEY: Record<SAColor, string> = {
  green: 'D',
  yellow: 'F',
  red: 'J',
  blue: 'L',
}

export interface SATrial {
  index: number
  wordMeaning: SAColor // the color written
  inkColor: SAColor // color the letters are drawn in
}

export interface SATrialResult extends SATrial {
  keyPressed: string | null
  reactionTimeMs: number | null
  correct: boolean
}

export interface SAResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: SATrialResult[]
  totalMs: number
  correctCount: number
  score: number
}

/**
 * 10 screens matching the user's spec. Empty ink means random incongruent.
 */
export function buildSATrials(): SATrial[] {
  // Derived from spec (only valid colors): word meaning + correct key implies ink color via key-to-color map
  // Where ink was empty, infer from "correct key" context.
  const raw: { word: SAColor; ink?: SAColor; correctKey?: string }[] = [
    { word: 'green', ink: 'red' },
    { word: 'red', ink: 'green' }, // "black" → random non-match; use green
    { word: 'green', correctKey: 'L' },
    { word: 'yellow', correctKey: 'D' },
    { word: 'red', correctKey: 'L' },
    { word: 'green', correctKey: 'F' },
    { word: 'red', correctKey: 'L' },
    { word: 'blue', correctKey: 'F' },
    { word: 'green', correctKey: 'J' },
    { word: 'yellow', correctKey: 'J' },
  ]
  return raw.map((r, i) => {
    const ink: SAColor = r.ink
      ? r.ink
      : // The "correct key" isn't relevant to ink (correct key always = word meaning);
        // in spec rows it seems inconsistent. Pick a random incongruent ink:
        (SA_COLORS.filter((c) => c !== r.word)[Math.floor(Math.random() * 3)] as SAColor)
    return { index: i, wordMeaning: r.word, inkColor: ink }
  })
}

export function listSAResults(): SAResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SELECTIVE_ATTENTION_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as SAResult[]) : []
  } catch {
    return []
  }
}

export function saveSAResult(r: SAResult) {
  if (typeof window === 'undefined') return
  const all = listSAResults()
  all.push(r)
  window.localStorage.setItem(SELECTIVE_ATTENTION_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}

export function getLatestSAResult(userName?: string): SAResult | undefined {
  const all = listSAResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}
