/**
 * Spatial Geometry (3D/la géométrie dans l'espace)
 * Professional Cognitive Assessment Test - 16 Questions
 * Evaluates: Conceptual understanding, Spatial reasoning, Deductive reasoning
 */

export const SPATIAL_GEOMETRY_TEST_ID = 'test-geo-3d-geometry'
export const SPATIAL_GEOMETRY_RESULTS_KEY = 'spatial-geometry:results'

export interface SpatialGeometryQuestion {
  id: string // Q7-Q21, Mesure 2
  competencies: string[] // C1, C2, C3
  question: string
  options: string[]
  correctAnswer: number | null // null for self-assessment
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
  // ==================== PART 1: MÉTACOGNITION ====================
  {
    id: 'Mesure 2',
    competencies: [],
    question: 'La démonstration dans la géométrie de l\'espace est :',
    options: ['facile', 'difficile'],
    correctAnswer: null,
    requiresImage: false,
    part: 'metacognition',
    correction: 'Pas de réponse correcte (auto-évaluation)'
  },

  // ==================== PART 2: QCM GÉOMÉTRIE ====================
  {
    id: 'Q7',
    competencies: ['C2'],
    question: 'Une droite \\((D)\\) est parallèle à un plan \\((P)\\) si et seulement si :',
    options: [
      '\\((D)\\) est parallèle à toute droite incluse dans \\((P)\\)',
      '\\((D)\\) est parallèle à une seule droite ou incluse dans \\((P)\\)'
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
      'Toute droite coupant l\'un coupe l\'autre',
      'Une droite coupant l\'un ne coupe pas l\'autre'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q8.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },
  {
    id: 'Q9',
    competencies: ['C2'],
    question: 'Deux plans parallèles coupés par un plan donnent deux droites parallèles.',
    options: ['Image correcte', 'Image incorrecte'],
    correctAnswer: 0,
    requiresImage: false,
    imageOptions: ['/images/geometry/3d/q9_a.png', '/images/geometry/3d/q9_b.png'],
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },
  {
    id: 'Q10',
    competencies: ['C2'],
    question: 'Si une droite \\((D)\\) est parallèle à deux plans sécants selon \\(\\Delta\\), relation entre \\((D)\\) et \\(\\Delta\\) :',
    options: ['parallèles', 'sécantes'],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q10.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },
  {
    id: 'Q11',
    competencies: ['C2'],
    question: 'Si deux droites sont orthogonales :',
    options: [
      'toute parallèle à l\'une est orthogonale à l\'autre',
      'parallèle à l\'autre'
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
    question: 'Si deux droites sont parallèles et \\(\\Delta\\) est orthogonale à l\'une :',
    options: [
      '\\(\\Delta\\) est parallèle à l\'autre',
      '\\(\\Delta\\) est orthogonale à l\'autre'
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
    question: 'Position relative de \\((D)\\) et \\((D\')\\) :',
    options: ['sécantes', 'coplanaires'],
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
      '\\((D)\\) est parallèle à toute droite du plan'
    ],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q14.png',
    part: 'qcm',
    correction: 'Réponse correcte: B'
  },
  {
    id: 'Q15',
    competencies: ['C2'],
    question: '\\((D)\\) orthogonale à \\((P)\\) et \\((D\')\\) incluse dans \\((P)\\) :',
    options: ['parallèles', 'orthogonales'],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q15.png',
    part: 'qcm',
    correction: 'Réponse correcte: B'
  },
  {
    id: 'Q16',
    competencies: ['C2'],
    question: 'Position de \\((D)\\) et \\((P)\\) :',
    options: [
      'coupe le plan en un point',
      'ne coupe pas le plan'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q16.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },
  {
    id: 'Q17',
    competencies: ['C2'],
    question: 'Positions des plans :',
    options: ['parallèles', 'non parallèles'],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q17.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },
  {
    id: 'Q18',
    competencies: ['C1'],
    question: 'Position de \\((D)\\) et \\((P)\\) :',
    options: ['parallèles', 'sécantes'],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q18.png',
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  // ==================== PART 3: RAISONNEMENT DÉDUCTIF ====================
  {
    id: 'Q19',
    competencies: ['C1', 'C2'],
    question: 'Analyser la figure et déterminer les intersections :',
    options: [
      'réponses correctes (CG, BC, C)',
      'réponses incorrectes'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q19.png',
    part: 'deductive',
    correction: 'Réponse correcte: A'
  },
  {
    id: 'Q20',
    competencies: ['C1', 'C3'],
    question: '\\(ABCD\\) est un tétraèdre, \\(I \\in [AB]\\), \\(J \\in [AC]\\), \\(K \\in [CD]\\).',
    options: [
      'section par le plan \\((IJK)\\)',
      'autre section'
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
    question: 'Intersection de la droite \\((IJ)\\) avec le plan \\((BCD)\\) :',
    options: [
      'point correct (E ou F)',
      'point incorrect'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q21.png',
    part: 'deductive',
    correction: 'Réponse correcte: A'
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
