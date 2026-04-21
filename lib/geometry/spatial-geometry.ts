/**
 * Spatial Geometry (3D/la géométrie dans l'espace) — WAIS-style spatial reasoning test.
 * Twenty-one questions covering planes, lines, spatial relationships, intersections, orthogonality, and sections.
 */

export const SPATIAL_GEOMETRY_TEST_ID = 'test-geo-3d-geometry'
export const SPATIAL_GEOMETRY_RESULTS_KEY = 'spatial-geometry:results'

export interface SpatialGeometryQuestion {
  id: string // G1-D1-Q1, G1-D1-Q2, etc.
  question: string // LaTeX-formatted question text
  options: string[] // A, B, C, D options
  correctAnswer: number // 0-3 for A-D
  requiresImage: boolean
  imagePath?: string
  topic: string // e.g., 'planes', 'lines', 'parallel-perpendicular', etc.
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
  score: number // 0..100 percent of questions correct
}

export const SPATIAL_GEOMETRY_QUESTIONS: SpatialGeometryQuestion[] = [
  {
    id: 'G1-D1-Q1',
    question: `Deux plans π₁ et π₂ se coupent selon une droite d. Lequel des énoncés suivants est toujours vrai ?`,
    options: [
      'Les deux plans sont perpendiculaires',
      'La droite d est la seule intersection possible',
      'Les deux plans contiennent une infinité de points communs',
      'Les deux plans sont parallèles'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q1.svg',
    topic: 'planes'
  },
  {
    id: 'G1-D1-Q2',
    question: `Si une droite l est parallèle à un plan π, combien de points l et π ont-ils en commun ?`,
    options: [
      'Exactement un point',
      'Zéro point',
      'Une infinité de points',
      'Entre 1 et 3 points'
    ],
    correctAnswer: 1,
    requiresImage: false,
    topic: 'parallel-perpendicular'
  },
  {
    id: 'G1-D1-Q3',
    question: `Trois droites non coplanaires forment-elles nécessairement une surface réglée ?`,
    options: [
      'Oui, toujours',
      'Non, jamais',
      'Seulement si elles sont parallèles',
      'Seulement si elles sont concourantes'
    ],
    correctAnswer: 1,
    requiresImage: false,
    topic: 'spatial-positions'
  },
  {
    id: 'G1-D1-Q4',
    question: `Un plan π est perpendiculaire à un plan π' si et seulement si :`,
    options: [
      'π contient une droite perpendiculaire à π\'',
      'Tout point de π est équidistant de π\'',
      'π et π\' ne se coupent pas',
      'π et π\' ont une infinité de droites en commun'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q4.svg',
    topic: 'orthogonality'
  },
  {
    id: 'G1-D1-Q5',
    question: `Soit un cube ABCDEFGH d'arête a. Quel est la distance entre les droites AB et GH ?`,
    options: [
      'a',
      'a√2',
      'a√3',
      'a/2'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q5.svg',
    topic: 'spatial-positions'
  },
  {
    id: 'G1-D1-Q6',
    question: `Une section d'une pyramide par un plan parallèle à la base est :`,
    options: [
      'Une figure similaire à la base',
      'Un triangle équilatéral',
      'Un carré',
      'Un rectangle'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q6.svg',
    topic: 'geometric-sections'
  },
  {
    id: 'G1-D1-Q7',
    question: `Deux droites sont dites gauches si :`,
    options: [
      'Elles ne se coupent pas et sont parallèles',
      'Elles ne se coupent pas et ne sont pas parallèles',
      'Elles sont perpendiculaires',
      'Elles appartiennent au même plan'
    ],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q7.svg',
    topic: 'spatial-positions'
  },
  {
    id: 'G1-D1-Q8',
    question: `Un prisme droit a une base régulière hexagonale. Combien de plans de symétrie possède-t-il ?`,
    options: [
      '6 plans',
      '7 plans',
      '12 plans',
      '3 plans'
    ],
    correctAnswer: 1,
    requiresImage: false,
    topic: 'geometric-sections'
  },
  {
    id: 'G1-D1-Q9',
    question: `Dans un espace 3D, le lieu des points équidistants de deux droites parallèles est :`,
    options: [
      'Un plan unique',
      'Deux plans perpendiculaires',
      'Un plan parallèle aux deux droites',
      'Une droite'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q9.svg',
    topic: 'locus'
  },
  {
    id: 'G1-D1-Q10',
    question: `La projection orthogonale d'un cercle sur un plan est :`,
    options: [
      'Toujours un cercle',
      'Toujours une ellipse',
      'Un cercle ou une ellipse selon l\'angle',
      'Un segment de droite'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q10.svg',
    topic: 'projections'
  },
  {
    id: 'G1-D1-Q11',
    question: `Un tétraèdre régulier possède combien d'axes de symétrie d'ordre 3 ?`,
    options: [
      '0',
      '2',
      '4',
      '8'
    ],
    correctAnswer: 2,
    requiresImage: false,
    topic: 'symmetry'
  },
  {
    id: 'G1-D1-Q12',
    question: `Deux plans distincts qui ne se coupent pas sont :`,
    options: [
      'Nécessairement perpendiculaires',
      'Nécessairement parallèles',
      'Parfois parallèles, parfois gauches',
      'Toujours gauches'
    ],
    correctAnswer: 1,
    requiresImage: false,
    topic: 'planes'
  },
  {
    id: 'G1-D1-Q13',
    question: `Une droite l perpendiculaire à deux droites concourantes d'un plan π est :`,
    options: [
      'Parallèle à π',
      'Contenue dans π',
      'Perpendiculaire à π',
      'Oblique par rapport à π'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q13.svg',
    topic: 'orthogonality'
  },
  {
    id: 'G1-D1-Q14',
    question: `L'intersection de trois plans en position générale est :`,
    options: [
      'Toujours un point',
      'Toujours une droite',
      'Un point, une droite, ou vide',
      'Toujours vide'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q14.svg',
    topic: 'intersections'
  },
  {
    id: 'G1-D1-Q15',
    question: `Dans un parallélépipède rectangle, les diagonales principales se coupent-elles en un même point ?`,
    options: [
      'Oui, toujours',
      'Non, jamais',
      'Seulement si c\'est un cube',
      'Seulement si les arêtes sont égales'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q15.svg',
    topic: 'spatial-positions'
  },
  {
    id: 'G1-D1-Q16',
    question: `La section d'un cube par un plan peut-elle être un hexagone régulier ?`,
    options: [
      'Non, jamais',
      'Oui, toujours',
      'Oui, mais seulement dans des cas particuliers',
      'Oui, mais seulement si le plan passe par un sommet'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q16.svg',
    topic: 'geometric-sections'
  },
  {
    id: 'G1-D1-Q17',
    question: `Une droite l et un plan π sont perpendiculaires si :`,
    options: [
      'l est perpendiculaire à une seule droite de π',
      'l est perpendiculaire à toutes les droites de π',
      'l est perpendiculaire à deux droites sécantes de π',
      'Les réponses b) et c) sont équivalentes'
    ],
    correctAnswer: 3,
    requiresImage: false,
    topic: 'orthogonality'
  },
  {
    id: 'G1-D1-Q18',
    question: `Quel est l'angle dièdre entre deux faces adjacentes d'un cube ?`,
    options: [
      '45°',
      '60°',
      '90°',
      '120°'
    ],
    correctAnswer: 2,
    requiresImage: false,
    topic: 'angles'
  },
  {
    id: 'G1-D1-Q19',
    question: `La distance d'un point P à un plan π est définie comme :`,
    options: [
      'La longueur du segment PM où M est un point quelconque de π',
      'La longueur du segment perpendiculaire de P à π',
      'La moitié de la distance entre P et un point arbitraire de π',
      'Le diamètre de la sphère centrée en P tangente à π'
    ],
    correctAnswer: 1,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q19.svg',
    topic: 'distance'
  },
  {
    id: 'G1-D1-Q20',
    question: `Deux sphères distinctes peuvent-elles se coupent selon un grand cercle ?`,
    options: [
      'Non, jamais',
      'Oui, toujours',
      'Oui, dans certains cas particuliers',
      'Seulement si elles ont le même rayon'
    ],
    correctAnswer: 2,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q20.svg',
    topic: 'spheres'
  },
  {
    id: 'G1-D1-Q21',
    question: `Une pyramide régulière à base carrée a tous ses plans de symétrie en commun avec :`,
    options: [
      'Un prisme à base carrée',
      'Un prisme à base triangulaire',
      'Un parallélépipède rectangle',
      'Un octaèdre régulier'
    ],
    correctAnswer: 0,
    requiresImage: true,
    imagePath: '/images/geometry/3d/q21.svg',
    topic: 'symmetry'
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
