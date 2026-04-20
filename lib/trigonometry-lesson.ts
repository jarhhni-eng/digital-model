/**
 * Trigonometry lesson — unit circle as universal cognitive support.
 *
 * Each question must expose a visible, interactive unit circle and link
 * every numeric value back to a position on the circle.
 */

export const TRIG_TEST_ID = 'test-geo-trigonometry'
export const TRIG_LESSON_TITLE = 'Trigonométrie — Cercle trigonométrique'

export type TrigQuestionKind = 'place-point' | 'read-projection' | 'computation'

export interface TrigQuestion {
  id: string
  kind: TrigQuestionKind
  /** Stem rendered with LaTeX inside. */
  stemTex: string
  /** Target curvilinear abscissa in radians (used by Q1 and Q2 modes). */
  target?: number
  /** Which projection to highlight (Q2). */
  project?: 'cos' | 'sin'
  /** MCQ choices — each label is a LaTeX expression. */
  choices?: { id: string; tex: string; correct: boolean }[]
  /** Skill code (C1 ... C3) for per-competency scoring. */
  competency: 'C1' | 'C2' | 'C3'
}

export const COMPETENCY_LABELS: Record<string, string> = {
  C1: 'Placer un point à partir de son abscisse curviligne',
  C2: 'Lire cos(θ) et sin(θ) comme projections géométriques',
  C3: 'Utiliser le cercle pour calculer une expression trigonométrique',
}

export const trigQuestions: TrigQuestion[] = [
  {
    id: 'T2-D1-Q1-trig',
    kind: 'place-point',
    stemTex: String.raw`Placez le point $M$ sur le cercle à la position $M\!\left(\dfrac{7\pi}{6}\right)$.`,
    target: (7 * Math.PI) / 6,
    competency: 'C1',
  },
  {
    id: 'T2-D1-Q2-trig',
    kind: 'read-projection',
    stemTex: String.raw`Lisez la valeur de $\cos\!\left(\dfrac{2\pi}{3}\right)$ sur le cercle trigonométrique.`,
    target: (2 * Math.PI) / 3,
    project: 'cos',
    choices: [
      { id: 'a', tex: String.raw`-\dfrac{1}{2}`,    correct: true  },
      { id: 'b', tex: String.raw`\dfrac{1}{2}`,     correct: false },
      { id: 'c', tex: String.raw`\dfrac{\sqrt{3}}{2}`,  correct: false },
      { id: 'd', tex: String.raw`-\dfrac{\sqrt{3}}{2}`, correct: false },
    ],
    competency: 'C2',
  },
  {
    id: 'T3-D1-Q3-trig',
    stemTex: String.raw`Calculez $\cos\!\left(\dfrac{\pi}{3}\right) + \sin\!\left(\dfrac{\pi}{6}\right)$. Le cercle reste disponible comme support cognitif.`,
    kind: 'computation',
    choices: [
      { id: 'a', tex: String.raw`1`,                 correct: true },
      { id: 'b', tex: String.raw`\dfrac{1}{2}`,      correct: false },
      { id: 'c', tex: String.raw`\dfrac{\sqrt{3}}{2}`, correct: false },
      { id: 'd', tex: String.raw`\sqrt{3}`,          correct: false },
    ],
    competency: 'C3',
  },
]

/** Tolerance (radians) for accepting a dragged answer on Q1. */
export const PLACE_POINT_TOLERANCE = Math.PI / 36  // 5°

export interface TrigAnswer {
  questionId: string
  angle?: number       // Q1
  choiceId?: string    // Q2, Q3
}

export interface TrigScore {
  global: { correct: number; total: number; percent: number }
  perCompetency: { competency: string; label: string; correct: number; total: number; percent: number }[]
}

export function scoreTrig(answers: Record<string, TrigAnswer>): TrigScore {
  const perComp: Record<string, { c: number; t: number }> = {}
  let globalC = 0
  for (const q of trigQuestions) {
    const a = answers[q.id]
    let ok = false
    if (q.kind === 'place-point' && a?.angle != null && q.target != null) {
      const diff = Math.abs(((a.angle - q.target) + Math.PI) % (2 * Math.PI) - Math.PI)
      ok = diff <= PLACE_POINT_TOLERANCE
    } else if (q.choices && a?.choiceId) {
      ok = q.choices.find((c) => c.id === a.choiceId)?.correct ?? false
    }
    if (ok) globalC++
    perComp[q.competency] = perComp[q.competency] ?? { c: 0, t: 0 }
    perComp[q.competency].t += 1
    if (ok) perComp[q.competency].c += 1
  }
  const total = trigQuestions.length
  return {
    global: { correct: globalC, total, percent: Math.round((globalC / total) * 100) },
    perCompetency: Object.entries(perComp).map(([k, v]) => ({
      competency: k,
      label: COMPETENCY_LABELS[k] ?? k,
      correct: v.c,
      total: v.t,
      percent: Math.round((v.c / v.t) * 100),
    })),
  }
}
