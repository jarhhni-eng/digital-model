/**
 * Vecteurs & Translation — Partie I : Questions du cours
 * Cognitive Assessment Test
 * 9 Questions (1 auto-évaluation + 8 questions de cours)
 *
 * Competencies:
 * C1: Construction d'un vecteur
 * C2: Expression des concepts et propriétés géométriques affines
 * C4: Reconnaître la similarité par translation
 */

export const VECTORS_TEST_ID = 'test-geo-vectors-complete'
export const VECTORS_RESULTS_KEY = 'geo-vectors:results'

export interface VectorsQuestion {
  id: string
  competencies: string[]
  question: string
  options: string[]
  correctAnswer: number | number[] | null
  requiresImage: boolean
  imagePath?: string
  /** When true, the interactive coordinate plane is rendered (LEFT panel). */
  showCoordPlane?: boolean
  part: 'autoeval' | 'course' | 'autoeval2' | 'construction'
  correction?: string
}

/**
 * Canonical points used by Q8 → Q18 — labelled on the coordinate plane.
 * (matches the spec: A(0,1), B(5,1), C(-1,-4), D(2,1), E(-2,0), F(6,0),
 *  G(8,1), H(1,1), C'(4,-3), F'(4,-2))
 */
export const VECTOR_POINTS: { name: string; x: number; y: number }[] = [
  { name: 'A',  x: 0,  y: 1  },
  { name: 'B',  x: 5,  y: 1  },
  { name: 'C',  x: -1, y: -4 },
  { name: 'D',  x: 2,  y: 1  },
  { name: 'E',  x: -2, y: 0  },
  { name: 'F',  x: 6,  y: 0  },
  { name: 'G',  x: 8,  y: 1  },
  { name: 'H',  x: 1,  y: 1  },
  { name: "C'", x: 4,  y: -3 },
  { name: "F'", x: 4,  y: -2 },
]

export interface VectorsTrialResult {
  index: number
  questionId: string
  selected: number
  correct: boolean
  reactionTimeMs: number
}

export interface VectorsResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: VectorsTrialResult[]
  totalMs: number
  correctCount: number
  score: number
}

export const VECTORS_QUESTIONS: VectorsQuestion[] = [
  {
    id: 'AutoEval-1',
    competencies: [],
    question: 'À quel degré tu te rappelles la leçon des vecteurs et translation ?',
    options: [
      'J\'ai tout oublié',
      'Je me rappelle',
      'Je me rappelle quelques parties',
      'Je me rappelle tout'
    ],
    correctAnswer: null,
    requiresImage: false,
    part: 'autoeval',
    correction: 'Auto-évaluation'
  },
  {
    id: 'Q1',
    competencies: ['C2'],
    question: 'Soient deux vecteurs colinéaires \\( \\vec{FG} \\) et \\( \\vec{AB} \\). Alors :',
    options: [
      'Les droites (FG) et (AB) sont parallèles, \\( FG = AB \\) et les vecteurs ont le même sens',
      'Les droites (FG) et (AB) sont parallèles et \\( FG = AB \\)',
      'Les vecteurs vérifient \\( \\vec{FG} = k\\, \\vec{AB} \\), avec \\( k \\in \\mathbb{R} \\)',
      'J\'ai oublié'
    ],
    correctAnswer: 2,
    requiresImage: false,
    part: 'course',
    correction: 'Réponse correcte: C'
  },
  {
    id: 'Q2',
    competencies: ['C2'],
    question: 'En utilisant la relation de Chasles : \\( \\vec{AB} + \\vec{BG} = \\;? \\)',
    options: [
      '\\( \\vec{AG} \\)',
      '\\( \\vec{AB} + \\vec{AG} \\)',
      '\\( \\vec{AB} - \\vec{BG} \\)',
      'J\'ai oublié'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
    correction: 'Réponse correcte: A'
  },
  {
    id: 'Q3',
    competencies: ['C2'],
    question: 'Soit \\( I \\) le milieu du segment \\( [AB] \\). Alors :',
    options: [
      '\\( \\vec{AI} + \\vec{IB} = \\vec{0} \\)',
      '\\( \\vec{AI} + \\vec{BI} = \\vec{0} \\)',
      '\\( \\vec{AB} - 2\\vec{IB} = \\vec{0} \\)',
      'J\'ai oublié'
    ],
    correctAnswer: [0, 2],
    requiresImage: false,
    part: 'course',
    correction: 'Réponses correctes: A, C'
  },
  {
    id: 'Q4',
    competencies: ['C4'],
    question: 'Une translation conserve :',
    options: [
      'L\'alignement des points',
      'Les distances',
      'Les angles',
      'J\'ai oublié'
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: false,
    part: 'course',
    correction: 'Réponses correctes: A, B, C'
  },
  {
    id: 'Q5',
    competencies: ['C2'],
    question: 'Si \\( \\vec{AB} = \\vec{FG} \\), alors :',
    options: [
      'Le quadrilatère \\( ABFG \\) est un parallélogramme',
      '\\( G \\) est l\'image de \\( F \\) par la translation de vecteur \\( \\vec{AB} \\)',
      'Le quadrilatère \\( ABGF \\) est un parallélogramme',
      'J\'ai oublié'
    ],
    correctAnswer: [1, 2],
    requiresImage: false,
    part: 'course',
    correction: 'Réponses correctes: B, C'
  },
  {
    id: 'Q6',
    competencies: ['C2'],
    question: 'Si \\( \\vec{AB} = \\vec{BG} \\), alors :',
    options: [
      'Les points \\( A, B, G \\) sont alignés',
      '\\( A \\) est le milieu du segment \\( [BG] \\)',
      'Les vecteurs \\( \\vec{AB} \\) et \\( \\vec{BG} \\) sont colinéaires',
      'J\'ai oublié'
    ],
    correctAnswer: [0, 2],
    requiresImage: false,
    part: 'course',
    correction: 'Réponses correctes: A, C'
  },
  {
    id: 'Q7',
    competencies: ['C2'],
    question: 'Si \\( \\vec{AB} + \\vec{AG} = \\vec{AC} \\), alors :',
    options: [
      '\\( ABCG \\) est un parallélogramme',
      '\\( GABC \\) est un parallélogramme',
      '\\( ACBG \\) est un parallélogramme',
      'J\'ai oublié'
    ],
    correctAnswer: [0, 1],
    requiresImage: false,
    part: 'course',
    correction: 'Réponses correctes: A, B'
  },
  // ─── Partie II : Application sur la figure (Q8 → Q18) ──────────────────────
  // Coordinate plane (LEFT) is shown for every question Q8 → Q18.
  {
    id: 'Q8',
    competencies: ['C2'],
    question:
      'Cocher les affirmations correctes parmi les vecteurs de la figure :',
    options: [
      '\\( \\vec{AB} = \\vec{BG} \\)',
      '\\( \\vec{AB} \\) et \\( \\vec{C\'H} \\) sont colinéaires',
      '\\( \\vec{AB} \\) et \\( \\vec{CC\'} \\) sont opposés',
      '\\( \\vec{DE} \\) et \\( \\vec{F\'F} \\) sont opposés',
      '\\( \\vec{DE} = \\vec{FF\'} \\)',
    ],
    correctAnswer: [2, 3, 4],
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponses correctes : C, D, E',
  },
  {
    id: 'Q9',
    competencies: ['C1'],
    question:
      'Placer le point \\( I \\) tel que : \\( \\vec{AI} = \\dfrac{2}{5}\\vec{AB} \\)',
    options: [
      '\\( I(2\\,;\\,1) \\)',
      '\\( I(4\\,;\\,1) \\)',
      '\\( I(-2\\,;\\,1) \\)',
      '\\( I(1\\,;\\,1) \\)',
    ],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
  {
    id: 'Q10',
    competencies: ['C1'],
    question:
      'Déterminer les points \\( M \\) et \\( Q \\) tels que : \\( \\vec{AM} = \\vec{AB} + \\vec{AD} \\) et \\( \\vec{BQ} = \\vec{BG} + \\vec{BC\'} \\)',
    options: [
      '\\( M(7\\,;\\,1) \\) et \\( Q(12\\,;\\,-3) \\)',
      '\\( M(8\\,;\\,0) \\) et \\( Q(7\\,;\\,-3) \\)',
      '\\( M(5\\,;\\,1) \\) et \\( Q(3\\,;\\,-3) \\)',
      '\\( M(8\\,;\\,2) \\) et \\( Q(7\\,;\\,-1) \\)',
    ],
    correctAnswer: 1,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : B',
  },
  {
    id: 'Q11',
    competencies: ['C1'],
    question:
      'Déterminer les points \\( N \\) et \\( P \\) tels que : \\( \\vec{AN} = \\vec{BH} \\) et \\( \\vec{DE} = -\\vec{C\'P} \\)',
    options: [
      '\\( N(-4\\,;\\,1) \\) et \\( P(6\\,;\\,-1) \\)',
      '\\( N(-4\\,;\\,1) \\) et \\( P(2\\,;\\,-1) \\)',
      '\\( N(4\\,;\\,1) \\) et \\( P(6\\,;\\,-1) \\)',
      '\\( N(-4\\,;\\,1) \\) et \\( P(4\\,;\\,-1) \\)',
    ],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
  {
    id: 'Q12',
    competencies: ['C2'],
    question: 'Donner les parallélogrammes présents dans la figure :',
    options: ['ABDC', 'DEFF\'', 'BC\'GH', 'ABHG'],
    correctAnswer: [0, 2, 3],
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponses correctes : A, C, D',
  },
  {
    id: 'Q13',
    competencies: ['C2'],
    question: 'Compléter : \\( \\vec{AB} + \\vec{AC} = \\;? \\)',
    options: [
      '\\( \\vec{AC\'} \\)',
      '\\( \\vec{AD} \\)',
      '\\( \\vec{BC} \\)',
      '\\( \\vec{AA} \\)',
    ],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
  {
    id: 'Q14',
    competencies: ['C2'],
    question:
      'En utilisant la relation de Chasles : \\( \\vec{BG} + \\vec{AB} + \\vec{GH} = \\;? \\)',
    options: [
      '\\( \\vec{AH} \\)',
      '\\( \\vec{BH} \\)',
      '\\( \\vec{AG} \\)',
      '\\( \\vec{BA} \\)',
    ],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
  {
    id: 'Q15',
    competencies: ['C2'],
    question: 'Si \\( N \\) est le milieu de \\( [AG] \\), alors :',
    options: [
      '\\( \\vec{AN} + \\vec{NG} = \\vec{0} \\)',
      '\\( \\vec{AN} + \\vec{BN} = \\vec{0} \\)',
      '\\( \\vec{AB} = \\vec{BG} \\)',
      'Je ne sais pas',
    ],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
  {
    id: 'Q16',
    competencies: ['C4'],
    question:
      'Image du point \\( E \\) par la translation de vecteur \\( \\vec{C\'H} \\) :',
    options: ['\\( D \\)', '\\( F\' \\)', '\\( E \\)', '\\( C \\)'],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
  {
    id: 'Q17',
    competencies: ['C4'],
    question:
      'Image du point \\( C \\) par la translation de vecteur \\( \\vec{AB} \\) :',
    options: ['\\( C\' \\)', '\\( D \\)', '\\( E \\)', '\\( A \\)'],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
  {
    id: 'Q18',
    competencies: ['C4'],
    question:
      'Image du segment \\( [ED] \\) par la translation de vecteur \\( \\vec{CC\'} \\) :',
    options: [
      '\\( (6\\,;\\,-2) \\) et \\( (8\\,;\\,0) \\)',
      '\\( (4\\,;\\,-2) \\) et \\( (6\\,;\\,0) \\)',
      '\\( (2\\,;\\,-2) \\) et \\( (4\\,;\\,0) \\)',
      '\\( (6\\,;\\,-3) \\) et \\( (8\\,;\\,1) \\)',
    ],
    correctAnswer: 0,
    requiresImage: true,
    showCoordPlane: true,
    part: 'construction',
    correction: 'Réponse correcte : A',
  },
]

export function listVectorsResults(): VectorsResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(VECTORS_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as VectorsResult[]) : []
  } catch {
    return []
  }
}

export function saveVectorsResult(r: VectorsResult) {
  if (typeof window === 'undefined') return
  const all = listVectorsResults()
  all.push(r)
  window.localStorage.setItem(VECTORS_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('vectors-changed'))
}

export function getLatestVectorsResult(userName?: string): VectorsResult | undefined {
  const all = listVectorsResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}
