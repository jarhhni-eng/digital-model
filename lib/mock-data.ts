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
    timeLimit: 30,
  },
  {
    id: 'q-002',
    type: 'mcq',
    question: 'Which shape has 4 equal sides?',
    options: ['Triangle', 'Square', 'Pentagon', 'Hexagon'],
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
