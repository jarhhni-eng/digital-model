/**
 * Spatial Geometry (3D/la géométrie dans l'espace) — Professional 3D Geometry Test
 * 21 questions covering fundamental concepts in 3D geometry
 */

export const SPATIAL_GEOMETRY_TEST_ID = 'test-geo-3d-geometry'
export const SPATIAL_GEOMETRY_RESULTS_KEY = 'spatial-geometry:results'

export interface SpatialGeometryQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  requiresImage: boolean
  imagePath?: string
  imageOptions?: string[] // For Q6, Q9: paths to image option files
  topic: string
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
  {
    id: 'Q1',
    question: 'Par trois points non alignés A, B, C de l\'espace E passe :',
    options: [
      'un plan unique noté (ABC)',
      'deux plans',
      'trois plans différents',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    topic: 'fundamental-concepts'
  },
  {
    id: 'Q2',
    question: 'A et B sont deux points distincts d\'un plan (P). La droite (AB) est :',
    options: [
      'incluse dans le plan (P)',
      'orthogonale au plan (P)',
      'parallèle au plan (P)',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    topic: 'lines-planes'
  },
  {
    id: 'Q3',
    question: 'Deux plans distincts (P) et (P\') ont un point commun A. Alors :',
    options: [
      'ils se coupent suivant une droite passant par A',
      'ils se coupent uniquement en A',
      'ils sont parallèles',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    topic: 'plane-intersection'
  },
  {
    id: 'Q4',
    question: 'Si deux droites (D) et (D\') sont parallèles et Δ est parallèle à l\'une :',
    options: [
      'Δ est parallèle à l\'autre',
      'Δ est perpendiculaire à l\'autre',
      'Δ est sécante',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    topic: 'parallel-lines'
  },
  {
    id: 'Q5',
    question: 'Si une droite Δ est parallèle aux droites (D) et (D\') :',
    options: [
      '(D) et (D\') sont parallèles',
      'elles ne sont pas parallèles',
      'elles sont perpendiculaires',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    topic: 'parallel-lines'
  },
  {
    id: 'Q6',
    question: 'Deux plans (P) et (P\') sont parallèles. Tout plan (Q) parallèle à l\'un est parallèle à l\'autre.',
    options: [
      'Image A',
      'Image B',
      'incluses dans un plan',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    imageOptions: ['/images/geometry/3d/q6_a.jpg', '/images/geometry/3d/q6_b.png'],
    topic: 'parallel-planes'
  },
  {
    id: 'Q7',
    question: 'Une droite (D) est parallèle à un plan (P) si :',
    options: [
      'elle est parallèle à toute droite du plan',
      'elle est parallèle à une seule droite du plan',
      'elle est incluse dans le plan',
      'aucune réponse'
    ],
    correctAnswer: 1,
    requiresImage: false,
    topic: 'line-plane'
  },
  {
    id: 'Q8',
    question: 'Deux plans (P) et (P\') sont parallèles :',
    options: [
      'toute droite coupant l\'un coupe l\'autre',
      'une droite orthogonale à l\'un est orthogonale à l\'autre',
      'une droite coupant l\'un ne coupe pas l\'autre',
      'aucune réponse'
    ],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q8.png',
    topic: 'parallel-planes'
  },
  {
    id: 'Q9',
    question: 'Deux plans parallèles coupés par un plan donnent deux droites parallèles.',
    options: [
      'Image A',
      'Image B',
      'sécantes',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    imageOptions: ['/images/geometry/3d/q9_a.png', '/images/geometry/3d/q9_b.png'],
    topic: 'plane-sections'
  },
  {
    id: 'Q10',
    question: 'Relation entre une droite et une droite d\'intersection de deux plans :',
    options: [
      'parallèles',
      'perpendiculaires',
      'sécantes',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q10.png',
    topic: 'line-intersection'
  },
  {
    id: 'Q11',
    question: 'Si deux droites sont orthogonales :',
    options: [
      'toute parallèle à l\'une est orthogonale à l\'autre',
      'parallèle à l\'autre',
      'sécante',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q11.png',
    topic: 'orthogonality'
  },
  {
    id: 'Q12',
    question: 'Si deux droites sont parallèles et Δ est orthogonale à l\'une :',
    options: [
      'Δ est parallèle à l\'autre',
      'Δ est orthogonale à l\'autre',
      'seulement à une',
      'aucune réponse'
    ],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q12.png',
    topic: 'orthogonality'
  },
  {
    id: 'Q13',
    question: 'Déterminer la position relative :',
    options: [
      'sécantes',
      'coplanaires',
      'incluses dans un plan',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q13.png',
    topic: 'relative-position'
  },
  {
    id: 'Q14',
    question: 'Déterminer la position relative :',
    options: [
      'parallèles',
      'incluses dans un plan',
      'parallèle à toute droite du plan',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q14.png',
    topic: 'relative-position'
  },
  {
    id: 'Q15',
    question: '(D) est orthogonale au plan (P) et (D\') est incluse dans (P) :',
    options: [
      'parallèles',
      'orthogonales',
      'parallèle à toute droite du plan',
      'aucune réponse'
    ],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q15.png',
    topic: 'orthogonality'
  },
  {
    id: 'Q16',
    question: 'Position de (D) et (P) :',
    options: [
      'coupe en un point',
      'point d\'intersection I',
      'orthogonale en I',
      'aucune réponse'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q16.png',
    topic: 'line-plane'
  },
  {
    id: 'Q17',
    question: 'Positions des plans :',
    options: [
      'parallèles',
      'droites parallèles',
      'orthogonales conservées',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q17.png',
    topic: 'plane-position'
  },
  {
    id: 'Q18',
    question: 'Position de (D) et (P) :',
    options: [
      'parallèles',
      'coplanaires',
      'sécantes',
      'aucune réponse'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q18.png',
    topic: 'line-plane'
  },
  {
    id: 'Q19',
    question: '',
    options: [
      'droite (CG)',
      'droite (CD)',
      'droite (BC)',
      'point C'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q19.png',
    topic: 'spatial-sections'
  },
  {
    id: 'Q20',
    question: 'ABCD est un tétraèdre avec I ∈ [AB], J ∈ [AC], K ∈ [CD].',
    options: [
      'section par (IJK)',
      'section par (ABD)',
      'section de (ABC)',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q20.png',
    topic: 'spatial-sections'
  },
  {
    id: 'Q21',
    question: 'Intersection droite-plan :',
    options: [
      'point E',
      'point F',
      'autre point',
      'aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q21.png',
    topic: 'line-plane-intersection'
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
