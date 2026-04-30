/**
 * Géométrie dans l'espace — Cognitive Assessment Test
 * Domain: Cognition et apprentissage de la géométrie
 *
 * Structure:
 *  - Partie I  : Q1 → Q18 (Questions du cours)
 *  - Partie II : Q19 → Q28 (Questions de raisonnement)
 *
 * Competencies:
 *  C1: Connaître les axiomes / déterminer un plan
 *  C2: Exprimer les positions relatives (droites / plans)
 *  C3: Utiliser et déduire dans des configurations de référence (cube, tétraèdre…)
 */

export const GEO_SPACE_TEST_ID = 'test-geo-space'
export const GEO_SPACE_RESULTS_KEY = 'geo-space:results'

export interface GeoSpaceQuestion {
  id: string
  competencies: string[]
  question: string
  options: string[]
  /** Single index, array of indices (multi-correct), or null (auto-eval). */
  correctAnswer: number | number[] | null
  requiresImage: boolean
  imagePath?: string
  part: 'course' | 'reasoning'
}

export interface GeoSpaceTrialResult {
  index: number
  questionId: string
  selected: number
  correct: boolean
  reactionTimeMs: number
}

export interface GeoSpaceResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: GeoSpaceTrialResult[]
  totalMs: number
  correctCount: number
  score: number
}

export const GEO_SPACE_QUESTIONS: GeoSpaceQuestion[] = [
  // ─── Partie I — Questions du cours ───────────────────────────────────────
  // Mesure 1 — diagnostic auto-évaluation (non scorée)
  {
    id: 'M1',
    competencies: [],
    question:
      'Mesure 1 — Est-ce que tu trouves une difficulté dans la reconnaissance des formes géométriques 3D dans l\'espace ?',
    options: ['Oui', 'Non'],
    correctAnswer: null,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q1',
    competencies: ['C1'],
    question:
      'Par trois points \\( A \\), \\( B \\), \\( C \\) non alignés de l\'espace \\( (E) \\) passe :',
    options: [
      'un plan et un seul, noté \\( (ABC) \\)',
      'deux plans',
      'trois plans différents',
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q2',
    competencies: ['C1'],
    question:
      '\\( A \\) et \\( B \\) sont deux points distincts d\'un plan \\( (P) \\) de l\'espace \\( (E) \\). Alors la droite \\( (AB) \\) :',
    options: [
      'est incluse dans le plan \\( (P) \\)',
      'est orthogonale au plan \\( (P) \\)',
      'est parallèle au plan \\( (P) \\)',
    ],
    correctAnswer: [0, 2],
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q3',
    competencies: ['C1'],
    question:
      '\\( (P) \\) et \\( (P\') \\) sont deux plans distincts de l\'espace. Si un point \\( A \\) est commun aux deux plans, alors les deux plans :',
    options: [
      'se coupent suivant une droite passant par le point \\( A \\)',
      'se coupent au point \\( A \\) uniquement',
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q4',
    competencies: ['C2'],
    question:
      'Si \\( (D) \\) et \\( (D\') \\) sont parallèles et une droite \\( (\\Delta) \\) est parallèle à l\'une des deux droites, alors :',
    options: [
      '\\( (\\Delta) \\) est parallèle à l\'autre droite',
      '\\( (\\Delta) \\) est perpendiculaire à l\'autre droite',
      '\\( (\\Delta) \\) est sécante avec l\'autre droite',
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q5',
    competencies: ['C2'],
    question:
      'Si une droite \\( (\\Delta) \\) est parallèle à chacune des droites \\( (D) \\) et \\( (D\') \\), alors :',
    options: [
      '\\( (D) \\) et \\( (D\') \\) sont parallèles',
      '\\( (D) \\) et \\( (D\') \\) ne sont pas parallèles',
      '\\( (D) \\) et \\( (D\') \\) sont perpendiculaires',
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q6',
    competencies: ['C1'],
    question:
      'Si deux plans \\( (P) \\) et \\( (P\') \\) sont parallèles, tout plan \\( (Q) \\) parallèle à l\'un des deux plans est parallèle à l\'autre plan. Quelle figure représente cette propriété ?',
    options: ['Figure 1', 'Figure 2', 'Figure 3'],
    correctAnswer: 0,
    requiresImage: true,
    part: 'course',
  },
  {
    id: 'Q7',
    competencies: ['C2'],
    question:
      'Une droite \\( (D) \\) est parallèle à un plan \\( (P) \\) si et seulement si :',
    options: [
      '\\( (D) \\) est parallèle à toute droite incluse dans \\( (P) \\)',
      '\\( (D) \\) est parallèle à une seule droite incluse dans \\( (P) \\)',
      '\\( (D) \\) est incluse dans \\( (P) \\)',
    ],
    correctAnswer: [0, 2],
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q8',
    competencies: ['C1'],
    question: 'Deux plans \\( (P) \\) et \\( (P\') \\) sont parallèles. Alors :',
    options: [
      'toute droite \\( (D) \\) qui coupe l\'un des deux plans coupe aussi l\'autre',
      'toute droite \\( (D) \\) orthogonale à l\'un des deux plans est orthogonale à l\'autre',
      'toute droite \\( (D) \\) qui coupe l\'un des deux plans ne coupe pas l\'autre',
    ],
    correctAnswer: [0, 1],
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q9',
    competencies: ['C2'],
    question:
      'Deux plans \\( (P) \\) et \\( (P\') \\) sont parallèles. Tout plan \\( (Q) \\) coupe \\( (P) \\) suivant une droite \\( (\\Delta) \\) et coupe \\( (P\') \\) suivant une droite \\( (\\Delta\') \\), et \\( (\\Delta) \\parallel (\\Delta\') \\). Quelles figures représentent cette propriété ?',
    options: ['Figure 1', 'Figure 2', 'Figure 3'],
    correctAnswer: [0, 1],
    requiresImage: true,
    part: 'course',
  },
  {
    id: 'Q10',
    competencies: ['C2'],
    question:
      'Si une droite \\( (D) \\) est strictement parallèle à deux plans sécants \\( (P) \\) et \\( (P\') \\) suivant une droite \\( (\\Delta) \\), alors les droites \\( (D) \\) et \\( (\\Delta) \\) sont …',
    options: ['Parallèles', 'Perpendiculaires', 'Sécantes'],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q11',
    competencies: ['C2'],
    question:
      'Si deux droites \\( (D) \\) et \\( (D\') \\) sont orthogonales, toute droite \\( (\\Delta) \\) parallèle à l\'une de ces deux droites :',
    options: [
      'est orthogonale à l\'autre droite',
      'est parallèle à l\'autre droite',
      'est sécante à l\'autre droite',
    ],
    correctAnswer: 0,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q12',
    competencies: ['C2'],
    question:
      'Si deux droites \\( (D) \\) et \\( (D\') \\) sont parallèles et la droite \\( (\\Delta) \\) est orthogonale à l\'une des deux droites, alors :',
    options: [
      '\\( (\\Delta) \\) est parallèle à l\'autre droite',
      '\\( (\\Delta) \\) est orthogonale à l\'autre droite',
      '\\( (\\Delta) \\) est orthogonale à \\( (D) \\) seulement',
    ],
    correctAnswer: 1,
    requiresImage: false,
    part: 'course',
  },
  {
    id: 'Q13',
    competencies: ['C2'],
    question:
      'Déterminer la position relative de \\( (D) \\) et \\( (D\') \\) dans le cas suivant :',
    options: [
      '\\( (D) \\) et \\( (D\') \\) sont sécantes',
      '\\( (D) \\) et \\( (D\') \\) sont coplanaires',
      '\\( (D) \\) et \\( (D\') \\) sont incluses dans le plan \\( (P) \\)',
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: true,
    part: 'course',
  },
  {
    id: 'Q14',
    competencies: ['C1'],
    question: 'Déterminer la position relative de \\( (D) \\) et \\( (P) \\) :',
    options: [
      '\\( (D) \\) et \\( (D\') \\) sont parallèles',
      '\\( (D) \\) et \\( (P) \\) sont inclus dans le plan \\( (P) \\)',
      '\\( (D) \\) est parallèle à toute droite incluse dans le plan \\( (P) \\)',
    ],
    correctAnswer: 2,
    requiresImage: true,
    part: 'course',
  },
  {
    id: 'Q15',
    competencies: ['C1', 'C2'],
    question:
      '\\( (D) \\) est orthogonale à \\( (P) \\) et \\( (D\') \\) est incluse dans \\( (P) \\). Déterminer les positions relatives de \\( (D) \\) et \\( (D\') \\) :',
    options: [
      '\\( (D) \\) et \\( (D\') \\) sont parallèles',
      '\\( (D) \\) et \\( (D\') \\) sont orthogonales',
      '\\( (D) \\) est orthogonale à toute droite incluse dans \\( (P) \\)',
    ],
    correctAnswer: [1, 2],
    requiresImage: true,
    part: 'course',
  },
  {
    id: 'Q16',
    competencies: ['C2'],
    question:
      'Déterminer la position relative de \\( (D) \\) et le plan \\( (P) \\) :',
    options: [
      'La droite \\( (D) \\) coupe le plan \\( (P) \\) en un seul point',
      '\\( I \\) est le point d\'intersection du plan \\( (P) \\) avec la droite \\( (D) \\)',
      '\\( (D) \\) est orthogonale au plan \\( (P) \\) en \\( I \\)',
    ],
    correctAnswer: [0, 1],
    requiresImage: true,
    part: 'course',
  },
  {
    id: 'Q17',
    competencies: ['C2'],
    question:
      'Déterminer les positions relatives des deux plans \\( (P) \\) et \\( (P\') \\) :',
    options: [
      '\\( (P) \\) et \\( (P\') \\) sont parallèles',
      'Toute droite incluse dans \\( (P\') \\) est parallèle à \\( (P) \\)',
      'Toute droite \\( (D) \\) orthogonale à \\( (P) \\) est orthogonale à \\( (P\') \\)',
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: true,
    part: 'course',
  },
  {
    id: 'Q18',
    competencies: ['C1'],
    question:
      'Déterminer la position relative de la droite \\( (D) \\) et le plan \\( (P) \\) comme figurée sur la photo ci-dessous :',
    options: [
      '\\( (D) \\) et \\( (P) \\) sont parallèles',
      '\\( (D) \\) et \\( (P) \\) sont coplanaires',
      '\\( (D) \\) et \\( (P) \\) sont sécantes en \\( A \\)',
    ],
    correctAnswer: 0,
    requiresImage: true,
    part: 'course',
  },

  // ─── Partie II — Questions de raisonnement ───────────────────────────────
  {
    id: 'Q19',
    competencies: ['C1', 'C2'],
    question:
      'Dans l\'espace, on donne deux plans \\( (P) \\) et \\( (P\') \\) tels que \\( (P) \\cap (P\') = \\Delta \\). Soit \\( (D) \\subset (P) \\) avec \\( (D) \\parallel (P\') \\). Alors :',
    options: [
      '\\( (D) \\parallel \\Delta \\)',
      '\\( (D) \\) coupe \\( \\Delta \\) en un point',
      '\\( (D) \\subset (P\') \\)',
      '\\( (D) \\) et \\( \\Delta \\) sont coplanaires dans \\( (P) \\)',
    ],
    correctAnswer: [0, 3],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q20',
    competencies: ['C2', 'C3'],
    question:
      'Soient \\( (D) \\) et \\( (D\') \\) deux droites orthogonales à un même plan \\( (P) \\). Alors :',
    options: [
      '\\( (D) \\parallel (D\') \\)',
      '\\( (D) \\) et \\( (D\') \\) sont sécantes',
      '\\( (D) \\) et \\( (D\') \\) sont non coplanaires',
      '\\( (D) \\) et \\( (D\') \\) peuvent être confondues',
    ],
    correctAnswer: [0, 3],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q21',
    competencies: ['C2', 'C3'],
    question:
      'Soit \\( ABCDEFGH \\) un cube. On considère le plan \\( (ACH) \\). Alors :',
    options: [
      '\\( (BD) \\parallel (ACH) \\)',
      '\\( (FG) \\parallel (ACH) \\)',
      '\\( (EG) \\) est incluse dans \\( (ACH) \\)',
      '\\( (BD) \\cap (ACH) \\) est réduit à un point',
    ],
    correctAnswer: [1, 3],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q22',
    competencies: ['C2', 'C3'],
    question:
      'Soit \\( ABCDEFGH \\) un cube. Les plans \\( (ABF) \\) et \\( (DCG) \\) sont :',
    options: [
      'Sécants selon une droite',
      'Strictement parallèles',
      'Confondus',
      'Orthogonaux',
    ],
    correctAnswer: 1,
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q23',
    competencies: ['C2', 'C3'],
    question:
      'Soient \\( (P) \\) un plan et \\( (D) \\) une droite orthogonale à \\( (P) \\) en \\( A \\). Si \\( (D\') \\) est une droite de \\( (P) \\) passant par \\( A \\), alors :',
    options: [
      '\\( (D) \\) et \\( (D\') \\) sont perpendiculaires',
      '\\( (D) \\) et \\( (D\') \\) sont parallèles',
      '\\( (D) \\) et \\( (D\') \\) sont coplanaires',
      '\\( (D) \\) et \\( (D\') \\) sont non coplanaires',
    ],
    correctAnswer: [0, 2],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q24',
    competencies: ['C3'],
    question:
      'Soit \\( ABCD \\) un tétraèdre régulier. Soit \\( I \\) le milieu de \\( [BC] \\). Alors :',
    options: [
      '\\( (AI) \\perp (BC) \\)',
      '\\( (DI) \\perp (BC) \\)',
      '\\( (BC) \\perp (ADI) \\)',
      '\\( (AD) \\parallel (BC) \\)',
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q25',
    competencies: ['C3'],
    question:
      'Soit \\( ABCDEFGH \\) un cube d\'arête \\( a \\). La droite \\( (AG) \\) (grande diagonale) et la droite \\( (BH) \\) :',
    options: [
      'Sont sécantes au centre du cube',
      'Sont parallèles',
      'Sont coplanaires',
      'Sont non coplanaires',
    ],
    correctAnswer: [0, 2],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q26',
    competencies: ['C2', 'C3'],
    question:
      'Soient \\( (P_1), (P_2), (P_3) \\) trois plans de l\'espace, deux à deux sécants selon trois droites distinctes \\( \\Delta_1 = (P_2) \\cap (P_3) \\), \\( \\Delta_2 = (P_1) \\cap (P_3) \\), \\( \\Delta_3 = (P_1) \\cap (P_2) \\). Alors :',
    options: [
      'Les trois droites \\( \\Delta_1, \\Delta_2, \\Delta_3 \\) sont concourantes ou parallèles',
      'Les trois droites sont toujours concourantes',
      'Les trois droites sont toujours parallèles',
      'Les trois droites peuvent être deux à deux parallèles',
    ],
    correctAnswer: [0, 3],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q27',
    competencies: ['C3'],
    question:
      'Dans un cube \\( ABCDEFGH \\), soit \\( M \\) le milieu de \\( [EF] \\) et \\( N \\) le milieu de \\( [GH] \\). Alors :',
    options: [
      '\\( (MN) \\parallel (EH) \\)',
      '\\( (MN) \\parallel (FG) \\)',
      '\\( (MN) \\parallel (ABC) \\)',
      '\\( (MN) \\) coupe \\( (ABCD) \\)',
    ],
    correctAnswer: [0, 1, 2],
    requiresImage: true,
    part: 'reasoning',
  },
  {
    id: 'Q28',
    competencies: ['C1', 'C2'],
    question:
      'Soit \\( (P) \\) un plan et \\( A \\) un point extérieur à \\( (P) \\). Par \\( A \\), il passe :',
    options: [
      'Une seule droite orthogonale à \\( (P) \\)',
      'Un seul plan parallèle à \\( (P) \\)',
      'Plusieurs droites orthogonales à \\( (P) \\)',
      'Plusieurs plans parallèles à \\( (P) \\)',
    ],
    correctAnswer: [0, 1],
    requiresImage: true,
    part: 'reasoning',
  },
]

// ─── Result persistence ─────────────────────────────────────────────────────

export function listGeoSpaceResults(): GeoSpaceResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GEO_SPACE_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as GeoSpaceResult[]) : []
  } catch {
    return []
  }
}

export function saveGeoSpaceResult(r: GeoSpaceResult) {
  if (typeof window === 'undefined') return
  const all = listGeoSpaceResults()
  all.push(r)
  window.localStorage.setItem(GEO_SPACE_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('geo-space-changed'))
}
