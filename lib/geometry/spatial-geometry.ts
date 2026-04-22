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
    question: 'Par trois points non alignés \\(A, B, C\\) de l\'espace \\((E)\\), il passe :',
    options: [
      'Un plan et un seul, le plan \\((ABC)\\)',
      'Deux plans différents contenant ces trois points',
      'Trois plans différents contenant ces trois points',
      'Aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q2',
    competencies: ['C1'],
    question: 'Si \\(A\\) et \\(B\\) sont deux points d\'un plan \\((P)\\), alors la droite \\((AB)\\) est :',
    options: [
      'Incluse dans le plan \\((P)\\)',
      'Orthogonale (perpendiculaire) au plan \\((P)\\)',
      'Parallèle au plan \\((P)\\) sans être incluse dedans',
      'Aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q3',
    competencies: ['C1'],
    question: 'Deux plans \\((P)\\) et \\((P\')\\) ont un point commun \\(A\\). Quelle est leur position relative ?',
    options: [
      'Les deux plans se coupent suivant une droite',
      'Les deux plans se coupent en un seul point \\(A\\)',
      'Les deux plans sont parallèles',
      'Aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q4',
    competencies: ['C2'],
    question: 'Si deux droites \\((D)\\) et \\((D\')\\) sont parallèles et \\(\\Delta\\) est parallèle à l\'une d\'elles, alors \\(\\Delta\\) est :',
    options: [
      'Parallèle à l\'autre droite aussi',
      'Perpendiculaire à l\'autre droite',
      'Sécante (qui coupe) l\'autre droite',
      'Aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q5',
    competencies: ['C2'],
    question: 'Si une droite \\(\\Delta\\) est parallèle à deux droites \\((D)\\) et \\((D\')\\), alors \\((D)\\) et \\((D\')\\) sont :',
    options: [
      'Parallèles l\'une à l\'autre',
      'Non parallèles (elles ne sont pas parallèles)',
      'Perpendiculaires l\'une à l\'autre',
      'Aucune réponse'
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'qcm',
    correction: 'Réponse correcte: A'
  },

  {
    id: 'Q6',
    competencies: ['C1'],
    question: 'Soient deux plans parallèles. Un troisième plan \\((Q)\\) est parallèle à l\'un d\'eux. Quelle est la position du plan \\((Q)\\) par rapport à l\'autre plan parallèle ?',
    options: [
      'Image A - Plan parallèle',
      'Image B - Plan sécant'
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
    question: 'Une droite $((D))$ est parallèle à un plan $((P))$ si et seulement si :',
    options: [
      '$((D))$ est parallèle à toute droite incluse dans $((P))$',
      '$((D))$ est parallèle à une seule droite incluse dans $((P))$',
      '$((D))$ est incluse dans $((P))$',
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
    question: 'Deux plans $((P))$ et $((P\'))$ sont parallèles :',
    options: [
      'Toute droite $((D))$ coupe l\'un des deux plans, elle coupe l\'autre plan aussi',
      'Toute droite $((D))$ orthogonale à l\'un des deux plans est orthogonale à l\'autre',
      'Toute droite $((D))$ coupe l\'un des deux plans, elle ne coupe pas l\'autre',
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
    question: 'Deux plans parallèles $((P))$ et $((P\'))$ sont coupés par un plan $((Q))$. Les droites d\'intersection sont parallèles. Quelle figure représente cette propriété ?',
    options: [
      '[Image A]',
      '[Image B]',
      '[Image C]',
      '[Image D]'
    ],
    correctAnswer: [0, 1],
    requiresImage: false,
    imageOptions: ['/images/geometry/3d/q9_a.png', '/images/geometry/3d/q9_b.png', '/images/geometry/3d/q9_c.png', '/images/geometry/3d/q9_d.png'],
    part: 'qcm',
    correction: 'Réponses correctes: A, B'
  },

  {
    id: 'Q10',
    competencies: ['C2'],
    question: 'Si une droite \\((D)\\) est parallèle à deux plans sécants selon la droite \\(\\Delta\\), alors la droite \\((D)\\) et la droite \\(\\Delta\\) sont :',
    options: [
      'Parallèles',
      'Perpendiculaires l\'une à l\'autre',
      'Sécantes (qui se coupent)',
      'Aucune réponse'
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
    question: 'Si deux droites \\((D)\\) et \\((D\')\\) sont orthogonales, et \\(\\Delta\\) est parallèle à \\((D)\\), alors \\(\\Delta\\) est :',
    options: [
      'Orthogonale à \\((D\')\\)',
      'Parallèle à \\((D\')\\)',
      'Sécante avec \\((D\')\\)',
      'Aucune réponse'
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
    question: 'Si deux droites \\((D)\\) et \\((D\')\\) sont parallèles, et \\(\\Delta\\) est orthogonale à l\'une d\'elles, alors \\(\\Delta\\) est :',
    options: [
      'Parallèle à l\'autre droite',
      'Orthogonale à l\'autre droite aussi',
      'Partiellement orthogonale',
      'Aucune réponse'
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
    question: 'Observez la figure et déterminez la position relative des deux droites \\((D)\\) et \\((D\')\\) :',
    options: [
      'Les droites sont sécantes (elles se coupent)',
      'Les droites sont coplanaires',
      'Les droites sont incluses dans un même plan',
      'Aucune réponse'
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
    question: 'D\'après la figure, la droite \\((D)\\) est :',
    options: [
      'Parallèle au plan \\((P)\\)',
      'Incluse dans le plan \\((P)\\)',
      'Parallèle à toute droite du plan \\((P)\\)',
      'Aucune réponse'
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
    question: 'Si une droite \\((D)\\) est orthogonale (perpendiculaire) au plan \\((P)\\) et \\((D\')\\) est incluse dans le plan \\((P)\\), alors \\((D)\\) et \\((D\')\\) sont :',
    options: [
      'Parallèles',
      'Orthogonales l\'une à l\'autre',
      'Orthogonales et parallèles à toute droite du plan',
      'Aucune réponse'
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
    question: 'D\'après la figure, la droite \\((D)\\) et le plan \\((P)\\) sont :',
    options: [
      'La droite coupe le plan en un point',
      'Le point d\'intersection est \\(I\\)',
      'La droite est orthogonale au plan',
      'Aucune réponse'
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
    question: 'Deux plans parallèles sont coupés par deux plans sécants. Parmi les affirmations suivantes, lesquelles sont correctes ?',
    options: [
      'Les deux plans de départ restent parallèles',
      'Les droites d\'intersection sont parallèles entre elles',
      'L\'orthogonalité entre les droites est conservée',
      'Aucune réponse'
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
    question: 'D\'après la figure, la droite \\((D)\\) et le plan \\((P)\\) sont :',
    options: [
      'La droite est parallèle au plan',
      'La droite et le plan sont coplanaires',
      'La droite est sécante avec le plan',
      'Aucune réponse'
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
    question: 'En analysant la figure, identifiez les intersections possibles de la droite avec les faces du polyèdre :',
    options: [
      'L\'intersection est la droite \\((CG)\\)',
      'L\'intersection est la droite \\((BC)\\)',
      'L\'intersection est au point \\(C\\)',
      'Les trois intersections précédentes'
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
    question: '\\(ABCD\\) est un tétraèdre. Les points \\(I\\), \\(J\\), \\(K\\) sont respectivement sur \\([AB]\\), \\([AC]\\), \\([CD]\\). Quelle est la section du tétraèdre par le plan \\((IJK)\\) ?',
    options: [
      'La section est le polygone \\((IJK)\\)',
      'La section est le triangle \\((ABD)\\)',
      'La section est le triangle \\((ABC)\\)',
      'Aucune section possible'
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
    question: 'En observant la figure, où la droite \\((IJ)\\) intersecte-t-elle le plan \\((BCD)\\) ?',
    options: [
      'Le point d\'intersection est \\(E\\)',
      'Le point d\'intersection est \\(F\\)',
      'Le point d\'intersection est ailleurs',
      'Aucune intersection'
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
