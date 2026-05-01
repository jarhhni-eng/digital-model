/**
 * Flexibilité cognitive — 2-Back Task
 *
 * Évalue la mémoire de travail et la mise à jour continue d'informations.
 * Le participant doit, pour chaque lettre, indiquer :
 *  - "A" → la lettre actuelle est identique à celle affichée 2 étapes avant
 *  - "B" → elle est différente
 *
 * Évaluation à partir du 3ᵉ item (index ≥ 2).
 *
 * Clé de réponse calculée algorithmiquement à partir de la séquence fixe
 * (vérifiée mathématiquement — voir tests unitaires éventuels).
 */

export const COGNITIVE_FLEXIBILITY_TEST_ID = 'test-cognitive-flexibility'
export const COGNITIVE_FLEXIBILITY_RESULTS_KEY = 'cognitive-flexibility:results'

export const NBACK_LEVEL = 2
export const NBACK_DISPLAY_MS = 2000
export const NBACK_ISI_MS = 350
export const NBACK_FIXATION_MS = 500

/** Séquence fixe (22 lettres) spécifiée par le prompt. */
export const NBACK_SEQUENCE = [
  'A', 'B', 'B', 'A', 'C', 'D', 'C', 'A', 'B', 'E',
  'F', 'F', 'F', 'A', 'N', 'M', 'N', 'M', 'N', 'X',
  'Y', 'X',
]

export type NBackResponse = 'A' | 'B' | null

export interface NBackTrial {
  index: number
  letter: string
  /** "A", "B" ou null si non évalué (2 premières lettres). */
  expected: NBackResponse
}

export interface NBackTrialResult extends NBackTrial {
  response: NBackResponse
  reactionTimeMs: number | null
  correct: boolean | null  // null = trial non scoré
}

export interface NBackResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: NBackTrialResult[]
  totalMs: number
  evaluatedCount: number
  correctCount: number
  incorrectCount: number
  missedCount: number
  meanRT: number
  rtStdDev: number
  accuracy: number  // %
  level: 'Low' | 'Moyen' | 'Good'
}

/** Construit la liste de trials avec la clé de réponse attendue. */
export function buildNBackTrials(): NBackTrial[] {
  return NBACK_SEQUENCE.map((letter, i) => {
    let expected: NBackResponse = null
    if (i >= NBACK_LEVEL) {
      expected = letter === NBACK_SEQUENCE[i - NBACK_LEVEL] ? 'A' : 'B'
    }
    return { index: i, letter, expected }
  })
}

export function scoreNBack(
  results: NBackTrialResult[],
): Omit<NBackResult, 'id' | 'userName' | 'startedAt' | 'completedAt' | 'trials' | 'totalMs'> {
  const evaluated = results.filter((r) => r.expected !== null)
  const correctCount = evaluated.filter((r) => r.correct === true).length
  const missedCount = evaluated.filter((r) => r.response === null).length
  const incorrectCount = evaluated.length - correctCount - missedCount

  const rts = evaluated
    .filter((r) => r.response !== null && r.reactionTimeMs != null)
    .map((r) => r.reactionTimeMs!) as number[]
  const meanRT = rts.length
    ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length)
    : 0
  const variance = rts.length
    ? rts.reduce((a, b) => a + (b - meanRT) ** 2, 0) / rts.length
    : 0
  const rtStdDev = Math.round(Math.sqrt(variance))

  const accuracy = evaluated.length
    ? Math.round((correctCount / evaluated.length) * 100)
    : 0

  let level: 'Low' | 'Moyen' | 'Good' = 'Low'
  if (accuracy >= 75) level = 'Good'
  else if (accuracy >= 50) level = 'Moyen'

  return {
    evaluatedCount: evaluated.length,
    correctCount,
    incorrectCount,
    missedCount,
    meanRT,
    rtStdDev,
    accuracy,
    level,
  }
}

export function listNBackResults(): NBackResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(COGNITIVE_FLEXIBILITY_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as NBackResult[]) : []
  } catch {
    return []
  }
}

export function saveNBackResult(r: NBackResult) {
  if (typeof window === 'undefined') return
  const all = listNBackResults()
  all.push(r)
  window.localStorage.setItem(COGNITIVE_FLEXIBILITY_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}
