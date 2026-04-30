/**
 * RAVLT — Rey Auditory Verbal Learning Test
 * Levels:
 *  1a) List A presented visually, free recall
 *  1b) List A presented via speech synthesis, free recall
 *  2)  List A re-read then recall (learning trial, scored on *new* words only, max 5)
 *  3)  List B (interference) presented and recalled
 *  4)  Immediate delayed recall of List A (no re-presentation)
 *  5)  Delayed long-term recall of List A after 20-minute pause
 */

export const RAVLT_TEST_ID = 'test-long-term-memory'
export const RAVLT_RESULTS_KEY = 'ravlt:results'
export const RAVLT_STATE_KEY = 'ravlt:state'

export const RAVLT_LIST_A = [
  'tambour',
  'rideau',
  'sonnette',
  'café',
  'école',
  'parent',
  'lune',
  'jardin',
  'chapeau',
  'paysan',
  'nez',
  'dindon',
  'couleur',
  'maison',
  'rivière',
] as const

export const RAVLT_LIST_B = [
  'bureau',
  'garde forestier',
  'oiseau',
  'chaussure',
  'poêle',
  'montagne',
  'lunettes',
  'serviette',
  'nuage',
  'bateau',
  'agneau',
  'fusil',
  'crayon',
  'église',
  'poisson',
] as const

export type RAVLTLevelKey = 'L1a' | 'L1b' | 'L2' | 'L3' | 'L4' | 'L5'

export interface RAVLTLevelScore {
  level: RAVLTLevelKey
  correctWords: string[] // canonical words from target list that were recalled
  extraWords: string[] // user answers not in target list
  score: number
}

export interface RAVLTResult {
  id: string
  userName?: string
  startedAt: string
  completedAt?: string
  levels: Partial<Record<RAVLTLevelKey, RAVLTLevelScore>>
  totalScore: number
  l5UnlockAt?: string // timestamp when L5 becomes available (20 min after L4)
}

/** Normalize user text: lowercase + strip accents/punct + collapse spaces. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
}

/** Parse a free-recall answer box: split on newlines / commas / semicolons. */
export function parseAnswers(text: string): string[] {
  return text
    .split(/[\n,;]/g)
    .map((w) => normalize(w))
    .filter(Boolean)
}

export function scoreList(
  level: RAVLTLevelKey,
  answers: string[],
  targetList: readonly string[],
  previouslyRecalled: string[] = [],
): RAVLTLevelScore {
  const target = new Set(targetList.map(normalize))
  const prev = new Set(previouslyRecalled.map(normalize))
  const correctWords: string[] = []
  const extraWords: string[] = []
  const seen = new Set<string>()
  for (const a of answers) {
    if (seen.has(a)) continue
    seen.add(a)
    if (target.has(a)) correctWords.push(a)
    else extraWords.push(a)
  }

  let score: number
  if (level === 'L2') {
    // Spec: only NEW words (not recalled previously) count, max 5
    const newWords = correctWords.filter((w) => !prev.has(w))
    score = Math.min(5, newWords.length)
  } else {
    score = correctWords.length // out of 15
  }
  return { level, correctWords, extraWords, score }
}

export function listRAVLTResults(): RAVLTResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RAVLT_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as RAVLTResult[]) : []
  } catch {
    return []
  }
}

export function loadActiveRAVLT(): RAVLTResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(RAVLT_STATE_KEY)
    return raw ? (JSON.parse(raw) as RAVLTResult) : null
  } catch {
    return null
  }
}

export function saveActiveRAVLT(r: RAVLTResult) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RAVLT_STATE_KEY, JSON.stringify(r))
  window.dispatchEvent(new CustomEvent('memory-changed'))
}

export function clearActiveRAVLT() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(RAVLT_STATE_KEY)
}

export function finalizeRAVLT(r: RAVLTResult) {
  const all = listRAVLTResults()
  all.push(r)
  window.localStorage.setItem(RAVLT_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('memory-changed'))
  clearActiveRAVLT()
}

export function getLatestRAVLTResult(userName?: string): RAVLTResult | undefined {
  const all = listRAVLTResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}

export function computeTotalScore(levels: Partial<Record<RAVLTLevelKey, RAVLTLevelScore>>): number {
  return (Object.values(levels) as RAVLTLevelScore[]).reduce((s, l) => s + (l?.score ?? 0), 0)
}

/** Speech synthesis reader — used for L1b and list B presentation. */
export function speakWords(words: readonly string[], intervalMs = 1000): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Fallback: just wait intervalMs per word
      setTimeout(resolve, words.length * intervalMs)
      return
    }
    window.speechSynthesis.cancel()
    let i = 0
    const speakNext = () => {
      if (i >= words.length) {
        resolve()
        return
      }
      const u = new SpeechSynthesisUtterance(words[i])
      u.lang = 'fr-FR'
      u.rate = 0.9
      u.onend = () => {
        i++
        setTimeout(speakNext, intervalMs)
      }
      u.onerror = () => {
        i++
        setTimeout(speakNext, intervalMs)
      }
      window.speechSynthesis.speak(u)
    }
    speakNext()
  })
}
