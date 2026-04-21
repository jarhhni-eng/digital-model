export interface Domain {
  id: string
  name: string
  description: string
  progress: number
  capacities: Capacity[]
  isLocked: boolean
}

export interface Capacity {
  id: string
  name: string
  score: number
  attempts: number
}

// Domain Pages hierarchy: Domain → Subdomain → Capacity (Test)
export interface DomainCapacity {
  id: string
  name: string
  nameFr?: string
  testId: string
  score?: number
  attempts?: number
  competencyCode?: string   // Cₖ — only for Mathematics domain
  gradeLevel?: string       // e.g. 'Tronc Commun' | '1ère Bac Sciences'
}

export interface DomainSubdomain {
  id: string
  name: string
  nameFr?: string
  capacities: DomainCapacity[]
}

export interface MainDomain {
  id: string
  name: string
  description: string
  subdomains: DomainSubdomain[]
}

export interface Test {
  id: string
  title: string
  domain: string
  status: 'upcoming' | 'in-progress' | 'completed'
  dueDate?: string
  type: 'mcq' | 'drawing' | 'text' | 'audio'
  duration: number
  questions?: Question[]
}

export interface Question {
  id: string
  type: 'mcq' | 'drawing' | 'text' | 'audio'
  question: string
  options?: string[]
  /** Zero-based index of correct option (MCQ); stored server-side for scoring only. */
  correctOptionIndex?: number
  instructions?: string
  timeLimit?: number
  /** Display label shown to student, e.g. "Q1", "Q2" */
  label?: string
  /** Competency code this question targets, e.g. "C₁", "C₂" */
  competencyCode?: string
}

export interface StudentResult {
  id: string
  domain: string
  date: string
  score: number
  capacities: {
    name: string
    score: number
  }[]
}

export interface StudentProfile {
  id: string
  name: string
  email: string
  age: number
  scholarLevel: string
  lastYearMathScore: number
  currentMathScore: number
  teacher: string
  joinDate: string
}

export interface TeacherStudent {
  id: string
  name: string
  email: string
  joinDate: string
  averageScore: number
  completedTests: number
  weakAreas: string[]
}

// Mock data
export const mockDomains: Domain[] = [
  {
    id: 'num-reasoning',
    name: 'Numerical Reasoning',
    description: 'Basic arithmetic and number operations',
    progress: 75,
    isLocked: false,
    capacities: [
      { id: 'count', name: 'Counting', score: 85, attempts: 3 },
      { id: 'arithmetic', name: 'Arithmetic Operations', score: 72, attempts: 2 },
      { id: 'comparison', name: 'Number Comparison', score: 80, attempts: 2 },
    ],
  },
  {
    id: 'spatial-viz',
    name: 'Spatial Visualization',
    description: 'Understanding spatial relationships and geometry',
    progress: 62,
    isLocked: false,
    capacities: [
      { id: 'rotation', name: 'Mental Rotation', score: 65, attempts: 2 },
      { id: 'geometry', name: 'Geometric Shapes', score: 60, attempts: 1 },
      { id: 'perspective', name: 'Spatial Perspective', score: 60, attempts: 1 },
    ],
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Logical reasoning and problem-solving skills',
    progress: 58,
    isLocked: false,
    capacities: [
      { id: 'logic', name: 'Logical Reasoning', score: 55, attempts: 1 },
      { id: 'patterns', name: 'Pattern Recognition', score: 62, attempts: 1 },
      { id: 'inference', name: 'Inference', score: 58, attempts: 1 },
    ],
  },
  {
    id: 'algebra',
    name: 'Algebraic Thinking',
    description: 'Algebraic expressions and equations',
    progress: 0,
    isLocked: true,
    capacities: [
      { id: 'variables', name: 'Variables and Expressions', score: 0, attempts: 0 },
      { id: 'equations', name: 'Equations', score: 0, attempts: 0 },
      { id: 'functions', name: 'Functions', score: 0, attempts: 0 },
    ],
  },
]

// Main domains for Domain Pages (hierarchy: Domain → Subdomain → Capacity)
export const mainDomains: MainDomain[] = [
  {
    id: 'cognitive',
    name: 'Cognitive Capacity Domain',
    description: 'Evaluate reasoning, visual treatment, memory, and attentional capacities',
    subdomains: [
      {
        id: 'reasoning',
        name: 'Reasoning Domain',
        capacities: [
          { id: 'deductive', name: 'Deductive Reasoning', nameFr: 'Raisonnement déductif', testId: 'test-deductive-reasoning' },
          { id: 'inductive', name: 'Inductive Reasoning', nameFr: 'Raisonnement inductif', testId: 'test-inductive-reasoning' },
          { id: 'abstract', name: 'Abstract Reasoning', nameFr: 'Raisonnement abstrait', testId: 'test-abstract-reasoning' },
        ],
      },
      {
        id: 'visual-treatment',
        name: 'Visual Treatment',
        capacities: [
          { id: 'visuo-motor', name: 'Visuo-Motor Capacity', nameFr: 'Capacité visuo-motrice', testId: 'test-visuo-motor' },
          { id: 'visuo-constructive', name: 'Visuo-Constructive Capacity', nameFr: 'Capacité visuo-constructive', testId: 'test-visuo-constructive' },
          { id: 'visuo-perceptive', name: 'Visuo-Perceptive Capacity', nameFr: 'Capacité visuo-perceptive', testId: 'test-visuo-perceptive' },
        ],
      },
      {
        id: 'visual-reasoning',
        name: 'Visual Reasoning',
        capacities: [
          { id: 'mental-rotation', name: 'Mental Rotation', testId: 'test-mental-rotation' },
          { id: 'spatial-orientation', name: 'Spatial Orientation', testId: 'test-spatial-orientation' },
          { id: 'spatial-transformation', name: 'Spatial Transformation', testId: 'test-spatial-transformation' },
        ],
      },
      {
        id: 'memory',
        name: 'Memory Capacities',
        capacities: [
          { id: 'working-memory', name: 'Working Memory', nameFr: 'Mémoire du travail', testId: 'test-working-memory' },
          { id: 'long-term-memory', name: 'Long-Term Memory', nameFr: 'Mémoire à long terme', testId: 'test-long-term-memory' },
          { id: 'visuo-spatial-memory', name: 'Visuo-Spatial Memory', nameFr: 'Mémoire visuo-spatiale', testId: 'test-visuo-spatial-memory' },
        ],
      },
      {
        id: 'attentional-executive',
        name: 'Attentional & Executive Capacities',
        capacities: [
          { id: 'sustained-attention', name: 'Sustained Attention', nameFr: 'Attention soutenue', testId: 'test-sustained-attention' },
          { id: 'divided-attention', name: 'Divided Attention', nameFr: 'Attention divisée', testId: 'test-divided-attention' },
          { id: 'selective-attention', name: 'Selective Attention', nameFr: 'Attention sélective', testId: 'test-selective-attention' },
          { id: 'visuo-spatial-attention', name: 'Visuo-Spatial Attention', nameFr: 'Attention visuo-spatiale', testId: 'test-visuo-spatial-attention' },
          { id: 'inhibition', name: 'Inhibition', testId: 'test-inhibition' },
          { id: 'cognitive-flexibility', name: 'Cognitive Flexibility', testId: 'test-cognitive-flexibility' },
          { id: 'planning', name: 'Planning', testId: 'test-planning' },
        ],
      },
    ],
  },
  {
    id: 'mathematical',
    name: 'Mathematical Capacities Domain',
    description: 'Evaluate geometric and analytic mathematical skills',
    subdomains: [
      {
        id: 'plane-geometry',
        name: 'Plane Geometry',
        capacities: [
          { id: 'vectors', name: 'Vectors', testId: 'test-vectors' },
          { id: 'dot-product', name: 'Dot Product', testId: 'test-dot-product' },
          { id: 'transformations-plane', name: 'Transformations in the Plane', testId: 'test-transformations-plane' },
        ],
      },
      {
        id: 'analytic-geometry',
        name: 'Analytic Geometry',
        capacities: [
          { id: 'line-plane', name: 'Line in the Plane', testId: 'test-line-plane' },
        ],
      },
      {
        id: '3d-geometry',
        name: '3D Geometry',
        capacities: [
          { id: 'dot-product-space', name: 'Dot Product in Space', testId: 'test-dot-product-space' },
        ],
      },
    ],
  },
  {
    id: 'geometry-learning',
    name: 'Cognition et apprentissage de la géométrie',
    description: "Évaluer les capacités cognitives mobilisées dans l'apprentissage de la géométrie du secondaire qualifiant",
    subdomains: [
      {
        id: 'geo-vectors',
        name: 'Vecteurs et translation',
        nameFr: 'Vecteurs et translation',
        capacities: [
          { id: 'geo-vectors-cap', name: 'Vectors and translation', nameFr: 'Vecteurs et translation', testId: 'test-geo-vectors', competencyCode: 'C₁–C₅' },
        ],
      },
      {
        id: 'geo-central-sym',
        name: 'Symétrie centrale',
        nameFr: 'Symétrie centrale',
        capacities: [
          { id: 'geo-central-sym-cap', name: 'Central symmetry', nameFr: 'Symétrie centrale', testId: 'test-geo-central-sym', competencyCode: 'C₁–C₅' },
        ],
      },
      {
        id: 'geo-axial-sym',
        name: 'Symétrie axiale',
        nameFr: 'Symétrie axiale',
        capacities: [
          { id: 'geo-axial-sym-cap', name: 'Axial symmetry', nameFr: 'Symétrie axiale', testId: 'test-geo-axial-sym', competencyCode: 'C₁–C₅' },
        ],
      },
      {
        id: 'geo-dot-product',
        name: 'Produit scalaire',
        nameFr: 'Produit scalaire',
        capacities: [
          { id: 'geo-dot-product-cap', name: 'Dot product', nameFr: 'Produit scalaire', testId: 'test-geo-dot-product', competencyCode: 'C₁–C₅' },
        ],
      },
      {
        id: 'geo-trigonometry',
        name: 'Trigonométrie',
        nameFr: 'Trigonométrie',
        capacities: [
          { id: 'geo-trig-cap', name: 'Trigonometry', nameFr: 'Trigonométrie', testId: 'test-geo-trigonometry', competencyCode: 'C₁–C₅' },
        ],
      },
      {
        id: 'geo-line-plane',
        name: 'Droite dans le plan',
        nameFr: 'Droite dans le plan',
        capacities: [
          { id: 'geo-line-plane-cap', name: 'Line in the plane', nameFr: 'Droite dans le plan', testId: 'test-geo-line-plane', competencyCode: 'C₁–C₅' },
        ],
      },
      {
        id: 'geo-3d-geometry',
        name: 'Géométrie dans l\'espace',
        nameFr: 'Géométrie dans l\'espace',
        capacities: [
          { id: 'geo-3d-geometry-cap', name: 'Spatial Geometry', nameFr: 'Géométrie dans l\'espace', testId: 'test-geo-3d-geometry', competencyCode: 'C₁–C₅' },
        ],
      },
    ],
  },
]

export const mockTests: Test[] = [
  {
    id: 'test-001',
    title: 'Arithmetic Fundamentals',
    domain: 'Numerical Reasoning',
    status: 'completed',
    type: 'mcq',
    duration: 1800,
  },
  {
    id: 'test-002',
    title: 'Mental Rotation Challenge',
    domain: 'Spatial Visualization',
    status: 'in-progress',
    type: 'drawing',
    duration: 2400,
  },
  {
    id: 'test-003',
    title: 'Logic Puzzles',
    domain: 'Problem Solving',
    status: 'upcoming',
    dueDate: '2025-03-15',
    type: 'mcq',
    duration: 1800,
  },
  {
    id: 'test-004',
    title: 'Number Patterns',
    domain: 'Numerical Reasoning',
    status: 'completed',
    type: 'mcq',
    duration: 1200,
  },
  // Cognitive Domain tests
  { id: 'test-deductive-reasoning', title: 'Deductive Reasoning', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-inductive-reasoning', title: 'Inductive Reasoning', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-abstract-reasoning', title: 'Abstract Reasoning', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-visuo-motor', title: 'Visuo-Motor Capacity', domain: 'Cognitive Capacity', status: 'upcoming', type: 'drawing', duration: 2400 },
  { id: 'test-visuo-constructive', title: 'Visuo-Constructive Capacity', domain: 'Cognitive Capacity', status: 'upcoming', type: 'drawing', duration: 2400 },
  { id: 'test-visuo-perceptive', title: 'Visuo-Perceptive Capacity (hub)', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-vp-discrimination', title: 'VP · Discrimination visuelle', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-vp-memoire-sequentielle', title: 'VP · Mémoire séquentielle', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-vp-memoire-perceptive', title: 'VP · Mémoire perceptive', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-vp-cloture', title: 'VP · Clôture / Relations spatiales', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-vp-constance-forme', title: 'VP · Constance de la forme', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-vp-figure-fond', title: 'VP · Figure-fond', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-vp-intrus', title: 'VP · Intrus', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-vp-fond-cache', title: 'VP · Fond caché', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },
  { id: 'test-mental-rotation', title: 'Mental Rotation', domain: 'Cognitive Capacity', status: 'upcoming', type: 'drawing', duration: 2400 },
  { id: 'test-spatial-orientation', title: 'Spatial Orientation', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-spatial-transformation', title: 'Spatial Transformation', domain: 'Cognitive Capacity', status: 'upcoming', type: 'drawing', duration: 2400 },
  { id: 'test-working-memory', title: 'Working Memory', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1500 },
  { id: 'test-long-term-memory', title: 'Long-Term Memory', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-visuo-spatial-memory', title: 'Visuo-Spatial Memory', domain: 'Cognitive Capacity', status: 'upcoming', type: 'drawing', duration: 2100 },
  { id: 'test-sustained-attention', title: 'Sustained Attention', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1200 },
  { id: 'test-divided-attention', title: 'Divided Attention', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1500 },
  { id: 'test-selective-attention', title: 'Selective Attention', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1200 },
  { id: 'test-visuo-spatial-attention', title: 'Visuo-Spatial Attention', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1500 },
  { id: 'test-inhibition', title: 'Inhibition', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1200 },
  { id: 'test-cognitive-flexibility', title: 'Cognitive Flexibility', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-planning', title: 'Planning', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-processing-speed', title: 'Processing Speed', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 900 },

  // ── Cognition et apprentissage de la géométrie ────────────────────────────
  {
    id: 'test-geo-vectors',
    title: 'Vecteurs et translation',
    domain: 'Cognition et apprentissage de la géométrie',
    status: 'upcoming',
    type: 'mcq',
    duration: 1200,
    questions: [
      { id: 'geo-vec-q1', label: 'Q1', competencyCode: 'C₁', type: 'mcq', question: 'Un vecteur est caractérisé par :', options: ['Sa direction uniquement', 'Sa direction, son sens et sa norme', 'Sa longueur uniquement', 'Son point de départ et sa direction'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-vec-q2', label: 'Q2', competencyCode: 'C₂', type: 'mcq', question: 'Si u⃗ = (3, 2) et v⃗ = (−1, 4), alors u⃗ + v⃗ est égal à :', options: ['(2, 6)', '(4, −2)', '(3, −2)', '(−3, 8)'], correctOptionIndex: 0, timeLimit: 45 },
      { id: 'geo-vec-q3', label: 'Q3', competencyCode: 'C₃', type: 'mcq', question: 'La translation de vecteur v⃗ = (2, −3) envoie le point A(1, 5) sur le point :', options: ['A\'(3, 2)', 'A\'(−1, 8)', 'A\'(2, 3)', 'A\'(3, 8)'], correctOptionIndex: 0, timeLimit: 45 },
      { id: 'geo-vec-q4', label: 'Q4', competencyCode: 'C₄', type: 'mcq', question: 'Si u⃗ = (4, −2), alors 3u⃗ est égal à :', options: ['(7, 1)', '(12, −6)', '(1, −5)', '(4, −6)'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-vec-q5', label: 'Q5', competencyCode: 'C₅', type: 'mcq', question: 'Les vecteurs u⃗ = (2, 4) et v⃗ = (1, 2) sont :', options: ['Perpendiculaires', 'De même norme', 'Colinéaires', 'Opposés'], correctOptionIndex: 2, timeLimit: 45 },
    ],
  },
  {
    id: 'test-geo-central-sym',
    title: 'Symétrie centrale',
    domain: 'Cognition et apprentissage de la géométrie',
    status: 'upcoming',
    type: 'mcq',
    duration: 1200,
    questions: [
      { id: 'geo-cs-q1', label: 'Q1', competencyCode: 'C₁', type: 'mcq', question: 'L\'image du point A par la symétrie centrale de centre O est le point A\' tel que :', options: ['OA = OA\'', 'O est le milieu de [AA\']', 'AA\' est perpendiculaire à (OA)', 'OA = 2·OA\''], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-cs-q2', label: 'Q2', competencyCode: 'C₂', type: 'mcq', question: 'L\'image de A(3, 1) par la symétrie centrale de centre O(0, 0) est :', options: ['A\'(3, −1)', 'A\'(−3, −1)', 'A\'(1, 3)', 'A\'(−3, 1)'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-cs-q3', label: 'Q3', competencyCode: 'C₃', type: 'mcq', question: 'La symétrie centrale conserve :', options: ['La position des points', 'Les distances et les angles', 'La direction des vecteurs', 'L\'orientation des figures'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-cs-q4', label: 'Q4', competencyCode: 'C₄', type: 'mcq', question: 'Quelle figure possède une symétrie centrale ?', options: ['Un triangle quelconque', 'Un rectangle', 'Un triangle rectangle', 'Un triangle isocèle quelconque'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-cs-q5', label: 'Q5', competencyCode: 'C₅', type: 'mcq', question: 'Si O est le milieu de [AB], alors B est l\'image de A par :', options: ['La symétrie axiale d\'axe (OA)', 'La symétrie centrale de centre O', 'La translation de vecteur OA⃗', 'La symétrie axiale d\'axe ⊥ à AB'], correctOptionIndex: 1, timeLimit: 45 },
    ],
  },
  {
    id: 'test-geo-axial-sym',
    title: 'Symétrie axiale',
    domain: 'Cognition et apprentissage de la géométrie',
    status: 'upcoming',
    type: 'mcq',
    duration: 1200,
    questions: [
      { id: 'geo-as-q1', label: 'Q1', competencyCode: 'C₁', type: 'mcq', question: 'La symétrie axiale d\'axe d envoie tout point M sur M\' tel que :', options: ['d est parallèle à [MM\']', 'd est la médiatrice de [MM\']', 'd contient le milieu de [MM\']', 'M et M\' sont à égale distance de d'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-as-q2', label: 'Q2', competencyCode: 'C₂', type: 'mcq', question: 'L\'image de A(4, 2) par la symétrie axiale d\'axe des ordonnées (x = 0) est :', options: ['A\'(4, −2)', 'A\'(−4, −2)', 'A\'(−4, 2)', 'A\'(2, 4)'], correctOptionIndex: 2, timeLimit: 45 },
      { id: 'geo-as-q3', label: 'Q3', competencyCode: 'C₃', type: 'mcq', question: 'La symétrie axiale est :', options: ['Une isométrie directe', 'Une isométrie indirecte', 'Une rotation', 'Une translation'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-as-q4', label: 'Q4', competencyCode: 'C₄', type: 'mcq', question: 'Parmi ces figures, laquelle possède un axe de symétrie ?', options: ['Un parallélogramme quelconque', 'Un triangle scalène', 'Un losange', 'Un quadrilatère quelconque'], correctOptionIndex: 2, timeLimit: 45 },
      { id: 'geo-as-q5', label: 'Q5', competencyCode: 'C₅', type: 'mcq', question: 'La composée de deux symétries axiales d\'axes parallèles est :', options: ['Une rotation', 'Une symétrie centrale', 'Une translation', 'Une symétrie axiale'], correctOptionIndex: 2, timeLimit: 45 },
    ],
  },
  {
    id: 'test-geo-dot-product',
    title: 'Produit scalaire',
    domain: 'Cognition et apprentissage de la géométrie',
    status: 'upcoming',
    type: 'mcq',
    duration: 1200,
    questions: [
      { id: 'geo-dp-q1', label: 'Q1', competencyCode: 'C₁', type: 'mcq', question: 'Le produit scalaire u⃗·v⃗ avec u⃗ = (x₁, y₁) et v⃗ = (x₂, y₂) est :', options: ['x₁·y₂ + x₂·y₁', 'x₁·x₂ − y₁·y₂', 'x₁·x₂ + y₁·y₂', 'x₁·y₁ + x₂·y₂'], correctOptionIndex: 2, timeLimit: 45 },
      { id: 'geo-dp-q2', label: 'Q2', competencyCode: 'C₂', type: 'mcq', question: 'Si u⃗ = (3, 4) et v⃗ = (2, −1), alors u⃗·v⃗ est égal à :', options: ['2', '6', '10', '−4'], correctOptionIndex: 0, timeLimit: 45 },
      { id: 'geo-dp-q3', label: 'Q3', competencyCode: 'C₃', type: 'mcq', question: 'Deux vecteurs sont perpendiculaires si et seulement si leur produit scalaire est :', options: ['1', '−1', '0', 'Égal à la norme'], correctOptionIndex: 2, timeLimit: 45 },
      { id: 'geo-dp-q4', label: 'Q4', competencyCode: 'C₄', type: 'mcq', question: 'La norme ‖u⃗‖ du vecteur u⃗ = (3, 4) est :', options: ['7', '5', '√7', '12'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-dp-q5', label: 'Q5', competencyCode: 'C₅', type: 'mcq', question: 'Si u⃗ et v⃗ sont unitaires et u⃗·v⃗ = 1/2, alors l\'angle entre eux est :', options: ['30°', '45°', '60°', '90°'], correctOptionIndex: 2, timeLimit: 45 },
    ],
  },
  {
    id: 'test-geo-trigonometry',
    title: 'Trigonométrie',
    domain: 'Cognition et apprentissage de la géométrie',
    status: 'upcoming',
    type: 'mcq',
    duration: 1200,
    questions: [
      { id: 'geo-trig-q1', label: 'Q1', competencyCode: 'C₁', type: 'mcq', question: 'Quelle est la valeur de sin(30°) ?', options: ['√3/2', '1/2', '√2/2', '1'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-trig-q2', label: 'Q2', competencyCode: 'C₂', type: 'mcq', question: 'Laquelle de ces expressions est une identité trigonométrique ?', options: ['sin²x + cos²x = 2', 'sin²x − cos²x = 1', 'sin²x + cos²x = 1', 'sin x + cos x = 1'], correctOptionIndex: 2, timeLimit: 45 },
      { id: 'geo-trig-q3', label: 'Q3', competencyCode: 'C₃', type: 'mcq', question: 'Les solutions de sin(x) = 0 dans [0, 2π] sont :', options: ['x = π/2 et x = 3π/2', 'x = 0 et x = π', 'x = 0, x = π et x = 2π', 'x = π/6 et x = 5π/6'], correctOptionIndex: 2, timeLimit: 45 },
      { id: 'geo-trig-q4', label: 'Q4', competencyCode: 'C₄', type: 'mcq', question: 'Dans un triangle rectangle d\'hypoténuse 10 et d\'angle 30°, le côté opposé mesure :', options: ['5√3', '5', '10√3', '5√2'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-trig-q5', label: 'Q5', competencyCode: 'C₅', type: 'mcq', question: 'Avec a² = b² + c² − 2bc·cos(A), si b = 5, c = 7 et A = 60°, alors a² vaut :', options: ['39', '25', '74', '11'], correctOptionIndex: 0, timeLimit: 45 },
    ],
  },
  {
    id: 'test-geo-line-plane',
    title: 'Droite dans le plan',
    domain: 'Cognition et apprentissage de la géométrie',
    status: 'upcoming',
    type: 'mcq',
    duration: 1200,
    questions: [
      { id: 'geo-lp-q1', label: 'Q1', competencyCode: 'C₁', type: 'mcq', question: 'L\'équation de la droite passant par (0, 3) avec une pente de 2 est :', options: ['y = 2x − 3', 'y = 3x + 2', 'y = 2x + 3', 'y = −2x + 3'], correctOptionIndex: 2, timeLimit: 45 },
      { id: 'geo-lp-q2', label: 'Q2', competencyCode: 'C₂', type: 'mcq', question: 'Les droites y = 3x + 1 et y = 3x − 5 sont :', options: ['Sécantes', 'Perpendiculaires', 'Confondues', 'Parallèles'], correctOptionIndex: 3, timeLimit: 45 },
      { id: 'geo-lp-q3', label: 'Q3', competencyCode: 'C₃', type: 'mcq', question: 'La pente d\'une droite perpendiculaire à y = 2x + 1 est :', options: ['2', '−1/2', '1/2', '−2'], correctOptionIndex: 1, timeLimit: 45 },
      { id: 'geo-lp-q4', label: 'Q4', competencyCode: 'C₄', type: 'mcq', question: 'La distance du point (1, 2) à la droite d\'équation x − y = 0 est :', options: ['1/√2', '√2', '1', '2/√2'], correctOptionIndex: 0, timeLimit: 45 },
      { id: 'geo-lp-q5', label: 'Q5', competencyCode: 'C₅', type: 'mcq', question: 'Les droites y = 2x + 1 et y = −x + 4 se coupent en :', options: ['(1, 3)', '(2, 5)', '(3, 7)', '(0, 1)'], correctOptionIndex: 0, timeLimit: 45 },
    ],
  },
  {
    id: 'test-geo-3d-geometry',
    title: 'Géométrie dans l\'espace',
    domain: 'Cognition et apprentissage de la géométrie',
    status: 'upcoming',
    type: 'mcq',
    duration: 900,
  },
]

export const mockStudentResults: StudentResult[] = [
  {
    id: 'result-001',
    domain: 'Numerical Reasoning',
    date: '2025-02-20',
    score: 78,
    capacities: [
      { name: 'Counting', score: 85 },
      { name: 'Arithmetic Operations', score: 72 },
      { name: 'Number Comparison', score: 80 },
    ],
  },
  {
    id: 'result-002',
    domain: 'Spatial Visualization',
    date: '2025-02-18',
    score: 68,
    capacities: [
      { name: 'Mental Rotation', score: 65 },
      { name: 'Geometric Shapes', score: 72 },
    ],
  },
  {
    id: 'result-003',
    domain: 'Problem Solving',
    date: '2025-02-15',
    score: 62,
    capacities: [
      { name: 'Logical Reasoning', score: 60 },
      { name: 'Pattern Recognition', score: 65 },
    ],
  },
]

export const mockStudentProfile: StudentProfile = {
  id: 'student-001',
  name: 'Emma Johnson',
  email: 'emma.johnson@university.edu',
  age: 16,
  scholarLevel: 'Grade 10',
  lastYearMathScore: 72,
  currentMathScore: 78,
  teacher: 'Dr. Richard Smith',
  joinDate: '2025-01-15',
}

export const mockTeacherStudents: TeacherStudent[] = [
  {
    id: 's-001',
    name: 'Emma Johnson',
    email: 'emma@university.edu',
    joinDate: '2025-01-15',
    averageScore: 75.3,
    completedTests: 8,
    weakAreas: ['Algebra', 'Advanced Geometry'],
  },
  {
    id: 's-002',
    name: 'James Chen',
    email: 'james@university.edu',
    joinDate: '2025-01-15',
    averageScore: 82.1,
    completedTests: 9,
    weakAreas: ['Spatial Visualization'],
  },
  {
    id: 's-003',
    name: 'Sofia Rodriguez',
    email: 'sofia@university.edu',
    joinDate: '2025-01-20',
    averageScore: 68.5,
    completedTests: 5,
    weakAreas: ['Problem Solving', 'Logical Reasoning'],
  },
  {
    id: 's-004',
    name: 'Marcus Davis',
    email: 'marcus@university.edu',
    joinDate: '2025-01-18',
    averageScore: 79.8,
    completedTests: 8,
    weakAreas: ['Numerical Reasoning'],
  },
]

export const mockTestQuestions: Question[] = [
  {
    id: 'q-001',
    type: 'mcq',
    question: 'What is 15 + 27?',
    options: ['32', '42', '52', '62'],
    correctOptionIndex: 1,
    timeLimit: 30,
  },
  {
    id: 'q-002',
    type: 'mcq',
    question: 'Which shape has 4 equal sides?',
    options: ['Triangle', 'Square', 'Pentagon', 'Hexagon'],
    correctOptionIndex: 1,
    timeLimit: 45,
  },
  {
    id: 'q-003',
    type: 'text',
    question: 'Explain your reasoning for the previous answer',
    timeLimit: 120,
  },
  {
    id: 'q-004',
    type: 'drawing',
    question: 'Draw a triangle rotated 45 degrees clockwise',
    instructions: 'Use the drawing tools to complete this task',
    timeLimit: 180,
  },
  {
    id: 'q-005',
    type: 'audio',
    question: 'Record your explanation of how you solved the problem',
    instructions: 'Speak clearly for 60-120 seconds',
    timeLimit: 180,
  },
]
