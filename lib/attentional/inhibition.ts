/**
 * Inhibition (Continuous Performance Test — variante Go/No-Go alphabétique)
 *
 * - 20 essais
 * - Une seule lettre par écran
 * - La lettre "A" est la cible "No-Go" (3 occurrences pseudo-aléatoires)
 * - Les 17 autres lettres (B..R) apparaissent chacune une fois (Go)
 *
 * Consigne : appuyer sur la barre Espace pour chaque lettre, SAUF "A".
 *
 * Indicateurs scorés :
 *  - meanRT (ms) sur les hits
 *  - hits = appuis corrects (lettre ≠ A)
 *  - commissionErrors = appui sur "A"
 *  - omissionErrors = pas d'appui sur lettre ≠ A
 *  - accuracy (%) = hits / (hits + omissions) × 100
 *  - commissionRate (%) = commissions / 3 × 100
 *  - score (%) = clamp(accuracy − 2 × commissions, 0, 100)
 */

export const INHIBITION_TEST_ID = 'test-inhibition'
export const INHIBITION_RESULTS_KEY = 'inhibition:results'

export const INHIBITION_TRIAL_COUNT = 20
export const INHIBITION_NO_GO_LETTER = 'A'
export const INHIBITION_NO_GO_COUNT = 3
export const INHIBITION_STIMULUS_MS = 1200
export const INHIBITION_ISI_MS = 350
export const INHIBITION_FIXATION_MS = 500

/** Go pool: 17 lettres distinctes (B..R), une chacune. */
export const INHIBITION_GO_POOL = [
  'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
]

export interface InhibitionTrial {
  index: number
  letter: string
  isNoGo: boolean
}

export interface InhibitionTrialResult extends InhibitionTrial {
  pressed: boolean
  reactionTimeMs: number | null
  correct: boolean
}

export interface InhibitionResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: InhibitionTrialResult[]
  totalMs: number
  hits: number
  commissionErrors: number
  omissionErrors: number
  meanRT: number
  rtStdDev: number
  accuracy: number       // % hits / (hits+omissions)
  commissionRate: number // % commissions / nb-A
  score: number          // 0..100
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Génère 3 positions pseudo-aléatoires pour "A" :
 *  - jamais en position 0
 *  - jamais consécutives
 */
function pickNoGoPositions(): number[] {
  const positions: number[] = []
  let safety = 0
  while (positions.length < INHIBITION_NO_GO_COUNT && safety++ < 200) {
    const p = 1 + Math.floor(Math.random() * (INHIBITION_TRIAL_COUNT - 1))
    if (positions.includes(p)) continue
    if (positions.some((q) => Math.abs(q - p) < 2)) continue
    positions.push(p)
  }
  // Fallback déterministe si le tirage échoue
  if (positions.length < INHIBITION_NO_GO_COUNT) return [3, 9, 15]
  return positions.sort((a, b) => a - b)
}

export function buildInhibitionTrials(): InhibitionTrial[] {
  const noGoPositions = pickNoGoPositions()
  const goLetters = shuffle(INHIBITION_GO_POOL).slice(
    0,
    INHIBITION_TRIAL_COUNT - INHIBITION_NO_GO_COUNT,
  )

  const trials: InhibitionTrial[] = []
  let goIdx = 0
  for (let i = 0; i < INHIBITION_TRIAL_COUNT; i++) {
    const isNoGo = noGoPositions.includes(i)
    trials.push({
      index: i,
      letter: isNoGo ? INHIBITION_NO_GO_LETTER : goLetters[goIdx++],
      isNoGo,
    })
  }
  return trials
}

export function scoreInhibition(
  trials: InhibitionTrialResult[],
): Omit<InhibitionResult, 'id' | 'userName' | 'startedAt' | 'completedAt' | 'trials' | 'totalMs'> {
  const hits = trials.filter((t) => !t.isNoGo && t.pressed).length
  const commissionErrors = trials.filter((t) => t.isNoGo && t.pressed).length
  const omissionErrors = trials.filter((t) => !t.isNoGo && !t.pressed).length
  const noGoCount = trials.filter((t) => t.isNoGo).length || INHIBITION_NO_GO_COUNT

  const rts = trials
    .filter((t) => !t.isNoGo && t.pressed && t.reactionTimeMs != null)
    .map((t) => t.reactionTimeMs!) as number[]
  const meanRT = rts.length
    ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length)
    : 0
  const variance = rts.length
    ? rts.reduce((a, b) => a + (b - meanRT) ** 2, 0) / rts.length
    : 0
  const rtStdDev = Math.round(Math.sqrt(variance))

  const goTotal = hits + omissionErrors
  const accuracy = goTotal ? Math.round((hits / goTotal) * 100) : 0
  const commissionRate = Math.round((commissionErrors / noGoCount) * 100)
  const score = Math.max(0, Math.min(100, accuracy - 2 * commissionErrors))

  return {
    hits,
    commissionErrors,
    omissionErrors,
    meanRT,
    rtStdDev,
    accuracy,
    commissionRate,
    score,
  }
}

export function listInhibitionResults(): InhibitionResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(INHIBITION_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as InhibitionResult[]) : []
  } catch {
    return []
  }
}

export function saveInhibitionResult(r: InhibitionResult) {
  if (typeof window === 'undefined') return
  const all = listInhibitionResults()
  all.push(r)
  window.localStorage.setItem(INHIBITION_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}

export function getLatestInhibitionResult(userName?: string): InhibitionResult | undefined {
  return listInhibitionResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0]
}
