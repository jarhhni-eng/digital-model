/**
 * Symétrie Axiale (Axial Symmetry)
 * Cognitive & Learning Assessment Test - 18 Questions + 1 Pre-question
 * Evaluates: Recognition (C1), Application/Reasoning (C2)
 */

export const SYMETRIE_AXIALE_TEST_ID = 'test-geo-symetrie-axiale'
export const SYMETRIE_AXIALE_RESULTS_KEY = 'symetrie-axiale:results'

export interface SymetrieAxialeQuestion {
  id: string // Pre-question, Q1-Q18
  competencies: string[] // C1, C2
  question: string
  options: string[]
  correctAnswer: number | number[] | null // null for pre-question/self-assessment
  requiresImage: boolean
  imagePath?: string // For shared image (Q9-Q15)
  part: 'preQuestion' | 'course' | 'visualization' | 'reasoning'
  correction?: string
}

export interface SymetrieAxialeTrialResult {
  index: number
  questionId: string
  selected: number
  correct: boolean
  /** Per-question score in [0, 1] — supports partial credit. */
  score?: number
  reactionTimeMs: number
}

export interface SymetrieAxialeResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: SymetrieAxialeTrialResult[]
  totalMs: number
  correctCount: number
  score: number
}

export const SYMETRIE_AXIALE_QUESTIONS: SymetrieAxialeQuestion[] = [
  // ==================== PRE-QUESTION (= Q1) — perception measurement ====================
  // The standalone "Pre-question" was removed; Q1 now plays that role:
  // it is a self-evaluation, not auto-graded (correctAnswer: null).
  {
    id: 'Q1',
    competencies: [],
    question: 'À quel degré te rappelles-tu la leçon de la symétrie axiale ?',
    options: [
      'J\'ai tout oublié',
      'Je me rappelle',
      'Je me rappelle quelques parties',
      'Je me rappelle tout'
    ],
    correctAnswer: null,
    requiresImage: false,
    part: 'preQuestion',
    correction: 'Auto-évaluation'
  },

  {
    id: 'Q2',
    competencies: ['C1'],
    question: 'La symétrie axiale conserve :',
    options: [
      'La distance et la mesure des angles seulement',
      'L\'alignement des points et la mesure des angles seulement',
      'Les périmètres, les aires, les angles et l\'alignement',
      'J\'ai tout oublié'
    ],
    correctAnswer: 2,
    requiresImage: false,
    part: 'course',
    correction: 'Réponse correcte: C'
  },

  {
    id: 'Q3',
    competencies: ['C1'],
    question: '$M$ et $M\'$ sont symétriques par rapport à une droite $(D)$ :',
    options: [
      '$(D)$ est la médiatrice de $[MM\']$',
      'Tout point appartenant à $(D)$ est invariant',
      'Le milieu de $[MM\']$ appartient à $(D)$',
      'J\'ai oublié'
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: false,
    part: 'course',
    correction: 'Réponses correctes: A, B, C'
  },

  {
    id: 'Q4',
    competencies: ['C1'],
    question: 'Si $E$ et $F$ sont les symétriques de $A$ et $B$ par rapport à $(D)$ :',
    options: [
      'Le symétrique de $[AF]$ est $[EF]$',
      'Le symétrique de $[AF]$ est $[FE]$',
      'Le symétrique de $[AF]$ est $[EB]$',
      'J\'ai oublié'
    ],
    correctAnswer: 1,
    requiresImage: false,
    part: 'course',
    correction: 'Réponse correcte: B'
  },

  {
    id: 'Q5',
    competencies: ['C1'],
    question: 'Les symétriques de trois points alignés sont :',
    options: [
      'Trois points alignés',
      'Trois points non alignés',
      'Quatre points alignés',
      'J\'ai oublié'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q6',
    competencies: ['C1'],
    question: 'La symétrie axiale conserve :',
    options: [
      'L\'alignement des points',
      'Les distances',
      'Les angles seulement',
      'J\'ai oublié'
    ],
    correctAnswer: [0, 1],
    requiresImage: false,
    part: 'course',
    correction: 'Réponses correctes: A, B'
  },

  {
    id: 'Q7',
    competencies: ['C1'],
    question: 'Le symétrique de $\\widehat{ABC}$ par rapport à $(AB)$, sachant que $C\'$ est le symétrique de $C$ :',
    options: [
      '$\\widehat{ABC}$',
      '$\\widehat{ABC\'}$',
      'Un angle de même mesure',
      'J\'ai oublié'
    ],
    correctAnswer: 1,
    requiresImage: false,
    part: 'course',
    correction: 'Réponse correcte: B'
  },

  {
    id: 'Q8',
    competencies: ['C1'],
    question: 'Si $A,B,C$ sont les symétriques de $E,F,G$ par rapport à $(D)$, alors le symétrique de $\\widehat{ACB}$ est :',
    options: [
      '$\\widehat{EFG}$',
      '$\\widehat{FGE}$',
      '$\\widehat{EGF}$',
      'J\'ai oublié'
    ],
    correctAnswer: 2,
    requiresImage: false,
    part: 'course',
    correction: 'Réponse correcte: C'
  },

  // ==================== PARTIE II: VISUALISATION (Q9-Q15) — C1 ====================
  {
    id: 'Q9',
    competencies: ['C1'],
    question: 'Répondre par vrai ou faux : Le symétrique de $A$ par rapport à $(GH)$ est $F$',
    options: [
      'Vrai',
      'Faux',
      'Le symétrique de $A$ par rapport à $(EF)$ est $C$',
      'Aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/symetrie-axiale/shared-i.png',
    part: 'visualization',
    correction: 'À déterminer selon la figure'
  },

  {
    id: 'Q10',
    competencies: ['C1'],
    question: 'Le symétrique du segment $[AB]$ par rapport à $(EF)$ est :',
    options: [
      '$[BC]$',
      '$[AD]$',
      '$[DC]$',
      'Aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/symetrie-axiale/shared-i.png',
    part: 'visualization',
    correction: 'À déterminer selon la figure'
  },

  {
    id: 'Q11',
    competencies: ['C1'],
    question: 'Trouver deux parallélogrammes :',
    options: [
      '$ABCD$',
      '$AGFH$',
      '$EGFH$',
      'Aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/symetrie-axiale/shared-i.png',
    part: 'visualization',
    correction: 'À déterminer selon la figure'
  },

  {
    id: 'Q12',
    competencies: ['C1'],
    question: 'Le symétrique de $\\widehat{BAD}$ par rapport à $(GH)$ est :',
    options: [
      '$\\widehat{BAD}$',
      '$\\widehat{BCD}$',
      '$\\widehat{ADC}$',
      'Aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/symetrie-axiale/shared-i.png',
    part: 'visualization',
    correction: 'À déterminer selon la figure'
  },

  {
    id: 'Q13',
    competencies: ['C1'],
    question: 'Le symétrique de $\\widehat{BAD}$ par rapport à $(AC)$ est :',
    options: [
      '$\\widehat{BAD}$',
      '$\\widehat{BCD}$',
      '$\\widehat{ADC}$',
      'Aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/symetrie-axiale/shared-i.png',
    part: 'visualization',
    correction: 'À déterminer selon la figure'
  },

  {
    id: 'Q14',
    competencies: ['C1'],
    question: 'Le symétrique de la droite $(GH)$ par rapport à $(AC)$ est :',
    options: [
      '$(GH)$',
      '$(AC)$',
      '$(BD)$',
      'Aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/symetrie-axiale/shared-i.png',
    part: 'visualization',
    correction: 'À déterminer selon la figure'
  },

  {
    id: 'Q15',
    competencies: ['C1'],
    question: 'Le symétrique de la droite $(EG)$ par rapport à $(AC)$ est :',
    options: [
      '$(GH)$',
      '$(FH)$',
      '$(CH)$',
      'Aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/symetrie-axiale/shared-i.png',
    part: 'visualization',
    correction: 'À déterminer selon la figure'
  },

  // ==================== PARTIE III: RAISONNEMENT (Q16-Q18) — C2 ====================
  {
    id: 'Q16',
    competencies: ['C2'],
    question: 'Si $ABCD$ est un parallélogramme et $(D)$ est la médiatrice de $[AB]$ passant par le centre :',
    options: [
      '$ABCD$ est un rectangle',
      '$ABCD$ est un carré',
      'On ne peut rien conclure',
      'Je ne sais pas'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'reasoning',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q17',
    competencies: ['C2'],
    question: 'Si $ABCD$ est un rectangle et $I,J$ sont les milieux de $[AB]$ et $[CD]$ :',
    options: [
      '$A$ est le symétrique de $B$ par rapport à $(IJ)$',
      '$D$ est le symétrique de $C$ par rapport à $(IJ)$',
      '$[AB]$ est le symétrique de $[CD]$',
      'Je ne sais pas'
    ],
    correctAnswer: [0, 1],
    requiresImage: false,
    part: 'reasoning',
    correction: 'Réponses correctes: A, B'
  },

  {
    id: 'Q18',
    competencies: ['C2'],
    question: 'Si $ABC$ est un triangle rectangle en $A$ et $D$ est le symétrique de $B$ par rapport à $(AC)$ :',
    options: [
      'Le triangle $BCD$ est isocèle',
      'L\'angle $\\widehat{BCD}$ est invariant',
      'Le triangle $BCD$ est rectangle en $C$',
      'Je ne sais pas'
    ],
    correctAnswer: 2,
    requiresImage: false,
    part: 'reasoning',
    correction: 'Réponse correcte: C'
  }
]

export function listSymetrieAxialeResults(): SymetrieAxialeResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SYMETRIE_AXIALE_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as SymetrieAxialeResult[]) : []
  } catch {
    return []
  }
}

export function saveSymetrieAxialeResult(r: SymetrieAxialeResult) {
  if (typeof window === 'undefined') return
  const all = listSymetrieAxialeResults()
  all.push(r)
  window.localStorage.setItem(SYMETRIE_AXIALE_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('symetrie-axiale-changed'))
}

export function getLatestSymetrieAxialeResult(userName?: string): SymetrieAxialeResult | undefined {
  const all = listSymetrieAxialeResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}
