/**
 * Vitesse de traitement — Visual Search Task
 *
 * Inspiré de Chesham et al. (2019), Wickens (2023).
 * Élément cible : un rectangle ROUGE et VERTICAL.
 * Distracteurs : rectangles rouges horizontaux, verts verticaux, verts horizontaux.
 *
 * Chaque écran présente une "image" générée dynamiquement (SVG) où chaque
 * rectangle est cliquable individuellement. La cible est présente dans 70 %
 * des essais ; dans les 30 % restants l'utilisateur ne doit rien cliquer
 * (catch-trial : laisser le timer expirer).
 */

export const PROCESSING_SPEED_TEST_ID = 'test-processing-speed'
export const PROCESSING_SPEED_RESULTS_KEY = 'processing-speed:results'

export const PROC_SPEED_TRIAL_COUNT = 50
export const PROC_SPEED_DISPLAY_MS = 4000
export const PROC_SPEED_ISI_MS = 500
export const PROC_SPEED_TARGET_PROBABILITY = 0.7

export const PROC_SPEED_GRID_COLS = 6
export const PROC_SPEED_GRID_ROWS = 5
export const PROC_SPEED_FILL_RATIO = 0.7 // proportion de cellules occupées

export type RectColor = 'red' | 'green'
export type RectOrient = 'vertical' | 'horizontal'

export interface RectStim {
  id: string
  /** colonne 0..GRID_COLS-1 */
  col: number
  /** ligne 0..GRID_ROWS-1 */
  row: number
  color: RectColor
  orient: RectOrient
  /** Vrai uniquement si rouge ET vertical */
  isTarget: boolean
}

export interface ProcSpeedTrial {
  index: number
  rects: RectStim[]
  /** Au moins un rectangle rouge vertical présent. */
  hasTarget: boolean
}

export interface ProcSpeedTrialResult extends ProcSpeedTrial {
  /** id du rectangle cliqué, ou null si rien. */
  clickedId: string | null
  /** Le rect cliqué était-il la cible ? */
  clickedTarget: boolean
  reactionTimeMs: number | null
  /** Bonne réponse globale pour cet essai. */
  correct: boolean
  errorType: 'none' | 'commission' | 'omission' | 'wrong-click'
}

export interface ProcSpeedResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: ProcSpeedTrialResult[]
  totalMs: number
  correctCount: number
  hits: number
  commissions: number   // clic alors qu'aucune cible
  omissions: number     // pas de clic alors que la cible existait
  wrongClicks: number   // a cliqué un mauvais rectangle alors que la cible existait
  meanRT: number
  rtStdDev: number
  accuracy: number      // %
  score: number         // 0..100
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeRects(hasTarget: boolean): RectStim[] {
  const total = PROC_SPEED_GRID_COLS * PROC_SPEED_GRID_ROWS
  const fill = Math.round(total * PROC_SPEED_FILL_RATIO)

  // toutes les cellules
  const cells = []
  for (let r = 0; r < PROC_SPEED_GRID_ROWS; r++) {
    for (let c = 0; c < PROC_SPEED_GRID_COLS; c++) {
      cells.push({ row: r, col: c })
    }
  }
  const chosen = shuffle(cells).slice(0, fill)

  const distractorTypes: { color: RectColor; orient: RectOrient }[] = [
    { color: 'red', orient: 'horizontal' },
    { color: 'green', orient: 'vertical' },
    { color: 'green', orient: 'horizontal' },
  ]

  const rects: RectStim[] = chosen.map((cell, i) => {
    const d = pickRandom(distractorTypes)
    return {
      id: `r${i}`,
      col: cell.col,
      row: cell.row,
      color: d.color,
      orient: d.orient,
      isTarget: false,
    }
  })

  if (hasTarget && rects.length > 0) {
    // remplace 1 rect aléatoire par la cible
    const idx = Math.floor(Math.random() * rects.length)
    rects[idx] = {
      ...rects[idx],
      color: 'red',
      orient: 'vertical',
      isTarget: true,
    }
  }
  return rects
}

export function buildProcSpeedTrials(): ProcSpeedTrial[] {
  const trials: ProcSpeedTrial[] = []
  for (let i = 0; i < PROC_SPEED_TRIAL_COUNT; i++) {
    const hasTarget = Math.random() < PROC_SPEED_TARGET_PROBABILITY
    trials.push({ index: i, hasTarget, rects: makeRects(hasTarget) })
  }
  return trials
}

export function scoreProcSpeed(
  trials: ProcSpeedTrialResult[],
): Omit<ProcSpeedResult, 'id' | 'userName' | 'startedAt' | 'completedAt' | 'trials' | 'totalMs'> {
  const hits = trials.filter((t) => t.hasTarget && t.clickedTarget).length
  const commissions = trials.filter((t) => !t.hasTarget && t.clickedId !== null).length
  const omissions = trials.filter((t) => t.hasTarget && t.clickedId === null).length
  const wrongClicks = trials.filter(
    (t) => t.hasTarget && t.clickedId !== null && !t.clickedTarget,
  ).length
  const correctCount = trials.filter((t) => t.correct).length

  const rts = trials
    .filter((t) => t.clickedTarget && t.reactionTimeMs != null)
    .map((t) => t.reactionTimeMs!) as number[]
  const meanRT = rts.length
    ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length)
    : 0
  const variance = rts.length
    ? rts.reduce((a, b) => a + (b - meanRT) ** 2, 0) / rts.length
    : 0
  const rtStdDev = Math.round(Math.sqrt(variance))

  const accuracy = trials.length
    ? Math.round((correctCount / trials.length) * 100)
    : 0

  // score combiné : précision pénalisée par les erreurs et bonifiée par la rapidité
  // Référence ~ 1500 ms = neutre ; <800 ms = bonus, >2500 ms = pénalité
  const speedBonus = meanRT
    ? Math.max(-15, Math.min(15, Math.round((1500 - meanRT) / 50)))
    : 0
  const score = Math.max(
    0,
    Math.min(100, accuracy + speedBonus - 2 * commissions - 2 * wrongClicks),
  )

  return {
    correctCount,
    hits,
    commissions,
    omissions,
    wrongClicks,
    meanRT,
    rtStdDev,
    accuracy,
    score,
  }
}

export function listProcSpeedResults(): ProcSpeedResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PROCESSING_SPEED_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as ProcSpeedResult[]) : []
  } catch {
    return []
  }
}

export function saveProcSpeedResult(r: ProcSpeedResult) {
  if (typeof window === 'undefined') return
  const all = listProcSpeedResults()
  all.push(r)
  window.localStorage.setItem(PROCESSING_SPEED_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}

export function getLatestProcSpeedResult(userName?: string): ProcSpeedResult | undefined {
  return listProcSpeedResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0]
}
