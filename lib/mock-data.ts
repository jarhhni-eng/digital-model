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
  { id: 'test-visuo-perceptive', title: 'Visuo-Perceptive Capacity', domain: 'Cognitive Capacity', status: 'upcoming', type: 'mcq', duration: 1800 },
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
  // Mathematical Domain tests
  { id: 'test-vectors', title: 'Vectors', domain: 'Mathematical Capacities', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-dot-product', title: 'Dot Product', domain: 'Mathematical Capacities', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-transformations-plane', title: 'Transformations in the Plane', domain: 'Mathematical Capacities', status: 'upcoming', type: 'drawing', duration: 2400 },
  { id: 'test-line-plane', title: 'Line in the Plane', domain: 'Mathematical Capacities', status: 'upcoming', type: 'mcq', duration: 1800 },
  { id: 'test-dot-product-space', title: 'Dot Product in Space', domain: 'Mathematical Capacities', status: 'upcoming', type: 'mcq', duration: 1800 },
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
