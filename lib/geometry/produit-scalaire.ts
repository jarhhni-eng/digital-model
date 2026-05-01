/**
 * Produit scalaire & Géométrie analytique — Cognitive Assessment Test
 * Domain: Cognition et apprentissage de la géométrie
 *
 * Mirrors the canonical Python dataset in tools/produit_scalaire/dataset.py.
 * 27 questions:
 *   Partie I  (T1, Q1–Q9)   — Cours
 *   Partie II (T2, Q10–Q17) — Visualisation / Construction
 *   Partie III(T3, Q18–Q27) — Raisonnement déductif
 *
 * Code convention: T{type}-D{lesson}-Q{n}
 *   lesson  D1 = Produit scalaire
 *   lesson  D2 = Géométrie analytique
 *
 * Competencies (C1 → C6):
 *  C1 Définition et propriétés du produit scalaire
 *  C2 Lecture / calcul dans un repère
 *  C3 Théorèmes (Al-Kashi, médiane) et raisonnement métrique
 *  C4 Cercles : équations, centre et rayon
 *  C5 Géométrie analytique : droites, distances, projections
 *  C6 Angles, cosinus et applications
 */

export const PRODUIT_SCALAIRE_TEST_ID = 'test-geo-produit-scalaire'
export const PRODUIT_SCALAIRE_RESULTS_KEY = 'geo-produit-scalaire:results'

export interface ProduitScalaireQuestion {
  id: string
  number: number
  typeCode: 1 | 2 | 3
  lessonCode: 1 | 2
  competencies: string[]
  question: string
  options: string[]
  /** Single index, array of indices (multi-correct), or null (open / diagnostic). */
  correctAnswer: number | number[] | null
  imagePath?: string
  expectedText?: string
  isDiagnostic?: boolean
  /** If true: rendered as a textarea, never scored. */
  isOpenEnded?: boolean
}

export interface ProduitScalaireTrialResult {
  index: number
  questionId: string
  selected: number[]
  freeText?: string
  correct: boolean
  reactionTimeMs: number
}

export interface ProduitScalaireResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  trials: ProduitScalaireTrialResult[]
  totalMs: number
  correctCount: number
  score: number
}

export const PRODUIT_SCALAIRE_QUESTIONS: ProduitScalaireQuestion[] = [
  // ═══ Partie I — Cours ═════════════════════════════════════════════════════
  {
    id: 'T1-D1-Q1',
    number: 1,
    typeCode: 1,
    lessonCode: 1,
    competencies: [],
    question: 'À quel degré te rappelles-tu la leçon du produit scalaire ?',
    options: [
      "J'ai tout oublié",
      'Je me rappelle quelques parties',
      'Je me rappelle bien',
      'Je me rappelle tout',
    ],
    correctAnswer: null,
    isDiagnostic: true,
  },
  {
    id: 'T1-D1-Q2',
    number: 2,
    typeCode: 1,
    lessonCode: 1,
    competencies: ['C1'],
    question:
      'Le produit scalaire de \\( \\vec{U}(a,c) \\) et \\( \\vec{V}(b,d) \\) est (cocher toutes les bonnes réponses) :',
    options: [
      '\\( \\|\\vec{U}\\|\\,\\|\\vec{V}\\|\\cos(\\widehat{(\\vec{U},\\vec{V})}) \\)',
      '\\( \\|\\vec{U}\\|\\,\\|\\vec{V}\\|\\sin(\\widehat{(\\vec{U},\\vec{V})}) \\)',
      '\\( ab + cd \\)',
      "J'ai oublié",
    ],
    correctAnswer: [0, 2],
  },
  {
    id: 'T1-D1-Q3',
    number: 3,
    typeCode: 1,
    lessonCode: 1,
    competencies: ['C1'],
    question: "Si l'un des vecteurs \\( \\vec{U} \\), \\( \\vec{V} \\) est nul :",
    options: [
      '\\( \\vec{U} \\cdot \\vec{V} = 0 \\)',
      '\\( \\vec{U} \\cdot \\vec{V} = \\vec{0} \\)',
      '\\( \\vec{U} \\) et \\( \\vec{V} \\) sont orthogonaux',
      "J'ai oublié",
    ],
    correctAnswer: 0,
  },
  {
    id: 'T1-D1-Q4',
    number: 4,
    typeCode: 1,
    lessonCode: 1,
    competencies: ['C1'],
    question: 'Si \\( \\vec{U} \\perp \\vec{V} \\), alors :',
    options: [
      '\\( \\vec{U} \\cdot \\vec{V} = 0 \\)',
      '\\( \\vec{U} \\cdot \\vec{V} = \\vec{0} \\)',
      '\\( \\vec{U} \\) ou \\( \\vec{V} \\) est nul',
      "J'ai oublié",
    ],
    correctAnswer: 0,
  },
  {
    id: 'T1-D1-Q5',
    number: 5,
    typeCode: 1,
    lessonCode: 1,
    competencies: ['C3'],
    question: "Théorème d'Al-Kashi — quelles formules sont correctes (cocher toutes les bonnes réponses) ?",
    options: [
      '\\( BC^2 = AB^2 + AC^2 - 2\\,\\vec{AB}\\cdot\\vec{AC} \\)',
      '\\( AB^2 = CB^2 + CA^2 - 2\\,\\vec{CB}\\cdot\\vec{CA} \\)',
      "J'ai oublié",
    ],
    correctAnswer: [0, 1],
  },
  {
    id: 'T1-D1-Q6',
    number: 6,
    typeCode: 1,
    lessonCode: 1,
    competencies: ['C3'],
    question:
      'Soit \\( I \\) milieu de \\( [BC] \\). Théorème de la médiane :',
    options: [
      '\\( AB^2 + AC^2 = \\tfrac{1}{2}BC^2 + 2AI^2 \\)',
      '\\( AC^2 + BC^2 = \\tfrac{1}{2}AB^2 + 2BI^2 \\)',
      "J'ai oublié",
    ],
    correctAnswer: 0,
  },
  {
    id: 'T1-D1-Q7',
    number: 7,
    typeCode: 1,
    lessonCode: 1,
    competencies: ['C1'],
    question:
      'Soient \\( \\vec{U}(a,b) \\) et \\( \\vec{V}(c,d) \\). Alors \\( \\det(\\vec{U},\\vec{V}) = \\)',
    options: [
      '\\( ac - bd \\)',
      '\\( ab - bc \\)',
      '\\( ad - bc \\)',
    ],
    correctAnswer: 2,
  },
  {
    id: 'T1-D2-Q8',
    number: 8,
    typeCode: 1,
    lessonCode: 2,
    competencies: ['C1'],
    question:
      '\\( M(x,y) \\) appartient au cercle de centre \\( \\Omega(x_0,y_0) \\) et de rayon 3 ssi :',
    options: [
      '\\( (x-x_0)^2 + (y-y_0)^2 = 3 \\)',
      '\\( (x-x_0)^2 + (y-y_0)^2 = 9 \\)',
      '\\( x^2 + y^2 = 2x + 2y + 9 \\)',
      "J'ai oublié",
    ],
    correctAnswer: 1,
  },
  {
    id: 'T1-D2-Q9',
    number: 9,
    typeCode: 1,
    lessonCode: 2,
    competencies: ['C1'],
    question:
      "Distance entre \\( \\Omega(3,4) \\) et la droite d'équation \\( ax+by+c=0 \\) :",
    options: [
      '\\( \\dfrac{|4a+3b+c|}{\\sqrt{a^2+b^2}} \\)',
      '\\( \\dfrac{|3a+4b+c|}{\\sqrt{a^2+c^2}} \\)',
      '\\( \\dfrac{|3a+4b+c|}{\\sqrt{a^2+b^2}} \\)',
      "J'ai oublié",
    ],
    correctAnswer: 2,
  },

  // ═══ Partie II — Visualisation / Construction ════════════════════════════
  {
    id: 'T2-D2-Q10',
    number: 10,
    typeCode: 2,
    lessonCode: 2,
    competencies: ['C2'],
    question:
      'Lire les coordonnées des points sur la figure : \\( B,\\ C,\\ D,\\ E,\\ F \\).',
    options: [],
    correctAnswer: null,
    isOpenEnded: true,
    imagePath: '/images/geometry/produit-scalaire/q10_points.png',
    expectedText:
      'Réponse attendue : \\( B(4,4) \\), \\( C(3,0) \\), \\( D(9,3) \\), \\( E(10,6) \\), \\( F(12,5) \\).',
  },
  {
    id: 'T2-D1-Q11',
    number: 11,
    typeCode: 2,
    lessonCode: 1,
    competencies: ['C2'],
    question:
      'Lire les coordonnées des vecteurs \\( \\vec{U},\\ \\vec{V},\\ \\vec{a},\\ \\vec{w} \\).',
    options: [],
    correctAnswer: null,
    isOpenEnded: true,
    imagePath: '/images/geometry/produit-scalaire/q11_vectors.png',
    expectedText:
      'Réponse attendue : \\( \\vec{U}(4,4) \\), \\( \\vec{V}(2,0) \\), \\( \\vec{a}(3,2) \\), \\( \\vec{w}(1,3) \\).',
  },
  {
    id: 'T2-D1-Q12',
    number: 12,
    typeCode: 2,
    lessonCode: 1,
    competencies: ['C2'],
    question:
      'Calculer \\( \\vec{U}\\cdot\\vec{V} \\) à partir des coordonnées lues sur la figure :',
    options: ['\\( 8 \\)', '\\( -8 \\)', '\\( 10 \\)'],
    correctAnswer: 0,
    imagePath: '/images/geometry/produit-scalaire/q11_vectors.png',
  },
  {
    id: 'T2-D1-Q13',
    number: 13,
    typeCode: 2,
    lessonCode: 1,
    competencies: ['C6'],
    question: 'Calculer \\( \\cos(\\widehat{(\\vec{a},\\vec{w})}) \\) :',
    options: [
      '\\( \\dfrac{9}{\\sqrt{34}} \\)',
      '\\( \\dfrac{9\\sqrt{34}}{34} \\)',
      '\\( \\dfrac{3}{\\sqrt{34}} \\)',
    ],
    correctAnswer: 0,
    imagePath: '/images/geometry/produit-scalaire/q11_vectors.png',
  },
  {
    id: 'T2-D2-Q14',
    number: 14,
    typeCode: 2,
    lessonCode: 2,
    competencies: ['C5'],
    question: 'Équation de la droite \\( (BC) \\) :',
    options: ['\\( x - y = 0 \\)', '\\( x + y = 0 \\)', '\\( x - 2y = 0 \\)'],
    correctAnswer: 0,
    imagePath: '/images/geometry/produit-scalaire/q10_points.png',
  },
  {
    id: 'T2-D1-Q15',
    number: 15,
    typeCode: 2,
    lessonCode: 1,
    competencies: ['C6'],
    question: 'Calculer \\( \\vec{a}\\cdot\\vec{w} \\) :',
    options: ['\\( 8 \\)', '\\( -8 \\)', '\\( 9 \\)'],
    correctAnswer: 2,
    imagePath: '/images/geometry/produit-scalaire/q11_vectors.png',
  },
  {
    id: 'T2-D2-Q16',
    number: 16,
    typeCode: 2,
    lessonCode: 2,
    competencies: ['C5'],
    question: 'Vecteur directeur de la droite \\( (EF) \\) :',
    options: ['\\( (1,3) \\)', '\\( (3,2) \\)', '\\( (2,0) \\)', '\\( (2,-1) \\)'],
    correctAnswer: 3,
    imagePath: '/images/geometry/produit-scalaire/q10_points.png',
  },
  {
    id: 'T2-D2-Q17',
    number: 17,
    typeCode: 2,
    lessonCode: 2,
    competencies: ['C5'],
    question: "Tracer la droite d'équation \\( x + y - 1 = 0 \\).",
    options: [],
    correctAnswer: null,
    isOpenEnded: true,
    expectedText:
      'Réponse attendue : droite passant par \\( (1,0) \\) et \\( (0,1) \\), pente \\( -1 \\).',
  },

  // ═══ Partie III — Raisonnement déductif ═════════════════════════════════
  // Données : Δ : 2x − 3y + 2 = 0,  A(2, −3)
  {
    id: 'T3-D2-Q18',
    number: 18,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C5'],
    question:
      'On considère \\( \\Delta:\\ 2x - 3y + 2 = 0 \\) et \\( A(2,-3) \\). Compléter le tableau de valeurs de \\( \\Delta \\) pour \\( x \\in \\{-1,0,1,2\\} \\).',
    options: [],
    correctAnswer: null,
    isOpenEnded: true,
    expectedText:
      'Réponse attendue : \\( x = -1 \\Rightarrow y = 0 \\) ; \\( x = 0 \\Rightarrow y = \\tfrac{2}{3} \\) ; \\( x = 1 \\Rightarrow y = \\tfrac{4}{3} \\) ; \\( x = 2 \\Rightarrow y = 2 \\).',
  },
  {
    id: 'T3-D2-Q19',
    number: 19,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C5'],
    question:
      'Tracer la droite \\( \\Delta:\\ 2x - 3y + 2 = 0 \\) dans un repère orthonormé.',
    options: [],
    correctAnswer: null,
    isOpenEnded: true,
    expectedText:
      'Réponse attendue : droite de pente \\( \\tfrac{2}{3} \\), passant par \\( (-1,0) \\) et \\( (2,2) \\).',
  },
  {
    id: 'T3-D2-Q20',
    number: 20,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C5'],
    question:
      'Distance de \\( A(2,-3) \\) à \\( \\Delta:\\ 2x - 3y + 2 = 0 \\) (cocher toutes les bonnes réponses) :',
    options: [
      '\\( \\dfrac{15}{\\sqrt{13}} \\)',
      '\\( \\dfrac{13}{\\sqrt{15}} \\)',
      '\\( \\dfrac{15\\sqrt{13}}{13} \\)',
      'Je ne sais pas',
    ],
    correctAnswer: [0, 2],
  },
  {
    id: 'T3-D2-Q21',
    number: 21,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C5'],
    question:
      "Équation de la droite passant par l'origine et perpendiculaire à \\( \\Delta \\) :",
    options: [
      '\\( x + 2y = 0 \\)',
      '\\( 3x + 2y = 0 \\)',
      '\\( y = -\\tfrac{3}{2} \\)',
      'Je ne sais pas',
    ],
    correctAnswer: 1,
  },
  {
    id: 'T3-D2-Q22',
    number: 22,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C5'],
    question:
      'Représentation paramétrique de \\( \\Delta \\) passant par \\( (2,2) \\) :',
    options: [
      '\\( \\begin{cases}x = 2 + 3t \\\\ y = 3 + 2t\\end{cases} \\)',
      '\\( \\begin{cases}x = 2 + 3t \\\\ y = 2 + 2t\\end{cases} \\)',
      '\\( \\begin{cases}x = 3 + 3t \\\\ y = 2 + 2t\\end{cases} \\)',
      'Je ne sais pas',
    ],
    correctAnswer: 1,
  },
  {
    id: 'T3-D2-Q23',
    number: 23,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C5'],
    question:
      'Coordonnées du projeté orthogonal \\( H \\) de \\( A(2,-3) \\) sur \\( \\Delta \\) :',
    options: [
      '\\( (6/13,\\,-4/13) \\)',
      '\\( (-4/13,\\,-6/13) \\)',
      '\\( (-4/13,\\,6/13) \\)',
      'Je ne sais pas',
    ],
    correctAnswer: 2,
  },
  {
    id: 'T3-D2-Q24',
    number: 24,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C5'],
    question:
      "Déterminer le symétrique \\( A' \\) de \\( A \\) par rapport à \\( \\Delta \\).",
    options: [],
    correctAnswer: null,
    isOpenEnded: true,
    expectedText:
      "Réponse attendue : \\( A' = 2H - A \\) avec \\( H(-4/13,\\,6/13) \\), soit \\( A'(-34/13,\\,51/13) \\).",
  },
  {
    id: 'T3-D2-Q25',
    number: 25,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C4'],
    question:
      'Cercle de centre \\( \\Omega(2,-1) \\) et de rayon \\( 5 \\). Quelles équations le décrivent (cocher toutes les bonnes réponses) ?',
    options: [
      '\\( (x-2)^2 + (y+1)^2 = 25 \\)',
      '\\( x^2 + y^2 - 4x + 2y - 20 = 0 \\)',
      '\\( (x+2)^2 + (y-1)^2 = 25 \\)',
    ],
    correctAnswer: [0, 1],
  },
  {
    id: 'T3-D2-Q26',
    number: 26,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C4'],
    question:
      'Soit le cercle \\( x^2 + y^2 + 4x - 4y - 8 = 0 \\). Centre et rayon :',
    options: [
      'centre \\( (2,-2) \\), rayon \\( 4 \\)',
      'centre \\( (-2,2) \\), rayon \\( 4 \\)',
      'centre \\( (2,-2) \\), rayon \\( 16 \\)',
      'Je ne sais pas',
    ],
    correctAnswer: 1,
  },
  {
    id: 'T3-D2-Q27',
    number: 27,
    typeCode: 3,
    lessonCode: 2,
    competencies: ['C3'],
    question:
      'Cercle de diamètre \\( [AB] \\) avec \\( A(-3,2) \\) et \\( B(5,2) \\). Équation :',
    options: [
      '\\( x^2 + y^2 - 2x + 4y - 16 = 0 \\)',
      '\\( x^2 + y^2 - 2x + 2y - 21 = 0 \\)',
      '\\( x^2 + y^2 - 2x - 4y - 11 = 0 \\)',
      '\\( x^2 + y^2 - 2x + 4y - 21 = 0 \\)',
    ],
    correctAnswer: 2,
  },
]

export const PRODUIT_SCALAIRE_TYPE_LABELS: Record<number, string> = {
  1: 'Partie I — Questions du cours',
  2: 'Partie II — Visualisation et construction',
  3: 'Partie III — Raisonnement déductif',
}

export const PRODUIT_SCALAIRE_LESSON_LABELS: Record<number, string> = {
  1: 'Produit scalaire',
  2: 'Géométrie analytique',
}

// ─── Result persistence ─────────────────────────────────────────────────────

export function listProduitScalaireResults(): ProduitScalaireResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PRODUIT_SCALAIRE_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as ProduitScalaireResult[]) : []
  } catch {
    return []
  }
}

export function saveProduitScalaireResult(r: ProduitScalaireResult) {
  if (typeof window === 'undefined') return
  const all = listProduitScalaireResults()
  all.push(r)
  window.localStorage.setItem(PRODUIT_SCALAIRE_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('produit-scalaire-changed'))
}
