/**
 * Digit Span — WAIS-IV inspired working memory test.
 * Nine fixed sequences, played via speech synthesis. The user reproduces each
 * sequence in order, scored 1 point per exact match.
 */

export const DIGIT_SPAN_TEST_ID = 'test-working-memory'
export const DIGIT_SPAN_RESULTS_KEY = 'digit-span:results'

export const DIGIT_SPAN_SEQUENCES: number[][] = [
  [3, 2],
  [4, 9],
  [5, 6],
  [5, 7, 8],
  [6, 4, 2],
  [2, 4, 9],
  [2, 4, 5, 6],
  [5, 6, 8, 1],
  [8, 4, 2, 0],
]

export interface DigitSpanTrialResult {
  index: number
  sequence: number[]
  answer: number[]
  correct: boolean
  reactionTimeMs: number
}

export interface DigitSpanResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: DigitSpanTrialResult[]
  totalMs: number
  correctCount: number
  score: number // 0..100 percent of sequences correct
}

export function listDigitSpanResults(): DigitSpanResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(DIGIT_SPAN_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as DigitSpanResult[]) : []
  } catch {
    return []
  }
}

export function saveDigitSpanResult(r: DigitSpanResult) {
  if (typeof window === 'undefined') return
  const all = listDigitSpanResults()
  all.push(r)
  window.localStorage.setItem(DIGIT_SPAN_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('memory-changed'))
}

export function getLatestDigitSpanResult(userName?: string): DigitSpanResult | undefined {
  const all = listDigitSpanResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}

export function speakDigits(digits: number[], intervalMs = 900): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(resolve, digits.length * intervalMs)
      return
    }
    window.speechSynthesis.cancel()
    let i = 0
    const next = () => {
      if (i >= digits.length) {
        resolve()
        return
      }
      const u = new SpeechSynthesisUtterance(String(digits[i]))
      u.lang = 'fr-FR'
      u.rate = 0.85
      u.onend = () => {
        i++
        setTimeout(next, intervalMs)
      }
      u.onerror = () => {
        i++
        setTimeout(next, intervalMs)
      }
      window.speechSynthesis.speak(u)
    }
    next()
  })
}

export function parseDigitAnswer(text: string): number[] {
  return text
    .replace(/\s+/g, '')
    .split('')
    .filter((c) => /[0-9]/.test(c))
    .map((c) => Number(c))
}

export function compareDigits(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}
