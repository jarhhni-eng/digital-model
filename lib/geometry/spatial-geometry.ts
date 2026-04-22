/**
 * Spatial Geometry (3D/la géométrie dans l'espace)
 * Professional Cognitive Assessment Test - 16 Questions
 * Evaluates: Conceptual understanding, Spatial reasoning, Deductive reasoning
 */

export const SPATIAL_GEOMETRY_TEST_ID = 'test-geo-3d-geometry'
export const SPATIAL_GEOMETRY_RESULTS_KEY = 'spatial-geometry:results'

export interface SpatialGeometryQuestion {
  id: string // Mesure 1, Q1-Q21
  competencies: string[] // C1, C2, C3
  question: string
  options: string[]
  correctAnswer: number | number[] | null // number for single, array for multiple, null for self-assessment
  requiresImage: boolean
  imagePath?: string
  imageOptions?: string[] // For image-based options
  part: 'metacognition' | 'qcm' | 'deductive'
  correction?: string
}

export interface SpatialGeometryTrialResult {
  index: number
  questionId: string
  selected: number
  correct: boolean
  reactionTimeMs: number
}

export interface SpatialGeometryResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: SpatialGeometryTrialResult[]
  totalMs: number
  correctCount: number
  score: number
}

export const SPATIAL_GEOMETRY_QUESTIONS: SpatialGeometryQuestion[] = [
  // ==================== MESURE 1: MÉTACOGNITION ====================
  {
    id: 'Mesure 1',
    competencies: [],
    question: 'Est-ce que tu trouves une difficulté dans la reconnaissance des formes géométriques 3D dans l\'espace ?',
    options: ['Oui', 'Non'],
    correctAnswer: null,
    requiresImage: false,
    part: 'metacognition',
    correction: 'Pas de réponse correcte (auto-évaluation)'
  },

  // ==================== Q1-Q21: QUESTIONS STANDARD ====================
  {
    id: 'Q1',
    competencies: ['C1'],
    question: 'Par trois points non alignés \\(A, B, C\\) de l\'espace \\((E)\\) passe :',
    options: [
      'un plan et un seul \\((ABC)\\)',
      'deux plans',
      'trois plans différents',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q2',
    competencies: ['C1'],
    question: '\\(A\\) et \\(B\\) sont deux points d\'un plan \\((P)\\). La droite \\((AB)\\) est :',
    options: [
      'incluse dans \\((P)\\)',
      'orthogonale à \\((P)\\)',
      'parallèle à \\((P)\\)',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q3',
    competencies: ['C1'],
    question: 'Deux plans \\((P)\\) et \\((P\')\\) ont un point commun \\(A\\) :',
    options: [
      'ils se coupent suivant une droite',
      'ils se coupent en un point',
      'ils sont parallèles',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q4',
    competencies: ['C2'],
    question: 'Si \\((D)\\) et \\((D\')\\) sont parallèles et \\(\\Delta\\) est parallèle à l\'une :',
    options: [
      '\\(\\Delta\\) est parallèle à l\'autre',
      'perpendiculaire',
      'sécante',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q5',
    competencies: ['C2'],
    question: 'Si \\(\\Delta\\) est parallèle à \\((D)\\) et \\((D\')\\) :',
    options: [
      '\\((D)\\) et \\((D\')\\) sont parallèles',
      'ne sont pas parallèles',
      'sont perpendiculaires',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q6',
    competencies: ['C1'],
    question: 'Deux plans parallèles et un plan \\((Q)\\) parallèle à l\'un.',
    options: [
      'Image A',
      'Image B'
    ],
    correctAnswer: 0,
    requiresImage: false,
    imageOptions: ['/images/geometry/3d/q6_a.jpg', '/images/geometry/3d/q6_b.png'],
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q7',
    competencies: ['C2'],
    question: 'Une droite \\((D)\\) est parallèle à un plan \\((P)\\) si :',
    options: [
      'parallèle à toute droite',
      'parallèle à une seule',
      'incluse dans le plan',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q8',
    competencies: ['C1'],
    question: 'Deux plans \\((P)\\) et \\((P\')\\) sont parallèles :',
    options: [
      'toute droite coupe les deux plans',
      'toute droite orthogonale à l\'un est orthogonale à l\'autre',
      'coupe un seul plan',
      'aucune réponse'
    ],
    correctAnswer: [0, 1],
    requiresImage: true,
    imagePath: '/images/geometry/3d/q8.png',
    part: 'qcm',
    correction: 'Réponses correctes: A, B'
  },

  {
    id: 'Q9',
    competencies: ['C2'],
    question: 'Plans parallèles coupés par un plan :',
    options: [
      'Image A',
      'Image B'
    ],
    correctAnswer: [0, 1],
    requiresImage: false,
    imageOptions: ['/images/geometry/3d/q9_a.png', '/images/geometry/3d/q9_b.png'],
    part: 'qcm',
    correction: 'Réponses correctes: A, B'
  },

  {
    id: 'Q10',
    competencies: ['C2'],
    question: '\\((D)\\) parallèle à deux plans sécants :',
    options: [
      'parallèles',
      'perpendiculaires',
      'sécantes',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q10.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q11',
    competencies: ['C2'],
    question: 'Deux droites orthogonales :',
    options: [
      'orthogonale conservée',
      'parallèle',
      'sécante',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q11.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q12',
    competencies: ['C2'],
    question: 'Droites parallèles et \\(\\Delta\\) orthogonale :',
    options: [
      'parallèle',
      'orthogonale',
      'partielle',
      'aucune réponse'
    ],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q12.png',
    part: 'qcm',
    correction: 'Réponse correcte: B'
  },

  {
    id: 'Q13',
    competencies: ['C2'],
    question: 'Position relative :',
    options: [
      'sécantes',
      'coplanaires',
      'incluses',
      'aucune réponse'
    ],
    correctAnswer: null,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q13.png',
    part: 'qcm',
    correction: 'À déterminer selon la figure'
  },

  {
    id: 'Q14',
    competencies: ['C1'],
    question: 'Position relative :',
    options: [
      'parallèles',
      'incluses',
      'parallèle à toute droite',
      'aucune réponse'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q14.png',
    part: 'qcm',
    correction: 'Réponse correcte: C'
  },

  {
    id: 'Q15',
    competencies: ['C2'],
    question: '\\((D)\\) \\(\\perp\\) \\((P)\\) et \\((D\') \\subset (P)\\) :',
    options: [
      'parallèles',
      'orthogonales',
      'parallèle à toute droite',
      'aucune réponse'
    ],
    correctAnswer: [1, 2],
    requiresImage: true,
    imagePath: '/images/geometry/3d/q15.png',
    part: 'qcm',
    correction: 'Réponses correctes: B, C'
  },

  {
    id: 'Q16',
    competencies: ['C2'],
    question: 'Position droite-plan :',
    options: [
      'coupe en un point',
      'point \\(I\\)',
      'orthogonale',
      'aucune réponse'
    ],
    correctAnswer: [0, 1],
    requiresImage: true,
    imagePath: '/images/geometry/3d/q16.png',
    part: 'qcm',
    correction: 'Réponses correctes: A, B'
  },

  {
    id: 'Q17',
    competencies: ['C2'],
    question: 'Plans :',
    options: [
      'parallèles',
      'droites parallèles',
      'orthogonalité conservée',
      'aucune réponse'
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: true,
    imagePath: '/images/geometry/3d/q17.png',
    part: 'qcm',
    correction: 'Réponses correctes: A, B, C'
  },

  {
    id: 'Q18',
    competencies: ['C1'],
    question: 'Droite et plan :',
    options: [
      'parallèles',
      'coplanaires',
      'sécantes',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q18.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q19',
    competencies: ['C1', 'C2'],
    question: 'Intersections :',
    options: [
      '\\((CG)\\)',
      '\\((BC)\\)',
      'point \\(C\\)',
      'autres'
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: true,
    imagePath: '/images/geometry/3d/q19.png',
    part: 'deductive',
    correction: 'Réponses correctes: A, B, C'
  },

  {
    id: 'Q20',
    competencies: ['C1', 'C3'],
    question: 'Tétraèdre :',
    options: [
      'section \\((IJK)\\)',
      '\\((ABD)\\)',
      '\\((ABC)\\)',
      'aucune'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q20.png',
    part: 'deductive',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q21',
    competencies: ['C1', 'C3'],
    question: 'Intersection :',
    options: [
      '\\(E\\)',
      '\\(F\\)',
      'autre',
      'aucune'
    ],
    correctAnswer: [0, 1],
    requiresImage: true,
    imagePath: '/images/geometry/3d/q21.png',
    part: 'deductive',
    correction: 'Réponses correctes: A, B'
  }
]

export function listSpatialGeometryResults(): SpatialGeometryResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SPATIAL_GEOMETRY_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as SpatialGeometryResult[]) : []
  } catch {
    return []
  }
}

export function saveSpatialGeometryResult(r: SpatialGeometryResult) {
  if (typeof window === 'undefined') return
  const all = listSpatialGeometryResults()
  all.push(r)
  window.localStorage.setItem(SPATIAL_GEOMETRY_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('geometry-changed'))
}

export function getLatestSpatialGeometryResult(userName?: string): SpatialGeometryResult | undefined {
  const all = listSpatialGeometryResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}
