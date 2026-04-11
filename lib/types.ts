// ────────────────────────────────────────────────────────────
// CogniTest – Unified Type System
// ────────────────────────────────────────────────────────────

// ── Auth ────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  username: string
  role: 'student' | 'teacher' | 'admin'
  displayName: string
  createdAt: string
}

// ── Profile ─────────────────────────────────────────────────
export type Gender = 'male' | 'female'
export type GradeLevel = 'tronc-commun' | '1bac' | '2bac'
export type Filiere =
  | 'scientifique'
  | 'math-sciences'
  | 'experimental-sciences'

export interface StudentProfile {
  id: string
  userId: string
  fullName: string
  age: number
  gender: Gender
  teacherId: string
  teacherName: string
  institution: string
  gradeLevel: GradeLevel
  filiere: Filiere
  academicYear: string      // auto-filled e.g. "2025-2026"
  mathScorePreviousYear: number | null
  mathScoreCurrentYear: number
  groupId: string
}

// ── Group / Class ────────────────────────────────────────────
export interface Group {
  id: string
  name: string
  teacherId: string
  institutionId: string
  gradeLevel: GradeLevel
  academicYear: string
  studentIds: string[]
  assignedTestIds: string[]
}

// ── Domain hierarchy ─────────────────────────────────────────
export interface DomainCapacity {
  id: string
  name: string
  nameFr?: string
  nameAr?: string
  testId: string
  score?: number
  attempts?: number
}

export interface DomainSubdomain {
  id: string
  name: string
  nameFr?: string
  nameAr?: string
  capacities: DomainCapacity[]
}

export interface MainDomain {
  id: string
  name: string
  nameFr?: string
  nameAr?: string
  description: string
  icon?: string
  subdomains: DomainSubdomain[]
}

// ── Questions ────────────────────────────────────────────────
export interface Question {
  id: string
  type: 'mcq' | 'drawing' | 'text' | 'audio'
  question: string
  questionAr?: string
  options?: string[]
  optionsAr?: string[]
  instructions?: string
  timeLimit?: number
}

export interface MathQuestion extends Question {
  correctOptionIndex: number   // hidden from student UI
  competencyId: string
  difficultyLevel: 1 | 2 | 3  // 1=easy, 2=medium, 3=hard
  discriminationIndex?: number
  difficultyIndex?: number
}

// ── Tests ────────────────────────────────────────────────────
export interface Test {
  id: string
  title: string
  titleFr?: string
  titleAr?: string
  domain: string
  domainId?: string
  status: 'upcoming' | 'in-progress' | 'completed'
  dueDate?: string
  type: 'mcq' | 'drawing' | 'text' | 'audio'
  duration: number
  questions?: Question[]
}

// ── Test Session (with timing) ───────────────────────────────
export interface QuestionTiming {
  questionId: string
  shownAt: string          // ISO timestamp
  answeredAt: string | null
  timeSpentMs: number | null
}

export interface TestSession {
  sessionId: string
  testId: string
  studentId: string
  startedAt: string        // ISO timestamp
  submittedAt: string | null
  instructionsAcceptedAt: string | null
  questionTimings: QuestionTiming[]
  answers: Record<string, string | null>  // questionId → selected option
  status: 'in-progress' | 'submitted' | 'abandoned'
}

// ── Scoring ──────────────────────────────────────────────────
export interface TestScore {
  testId: string
  studentId: string
  sessionId: string
  rawScore: number
  maxScore: number
  standardScore: number    // mean 100, SD 15
  percentile: number
  subScores: Record<string, number>  // per subdomain
  computedAt: string
}

// ── Competency (Math domain) ─────────────────────────────────
export interface Competency {
  id: string
  lessonId: string
  domainId: string
  name: string
  nameFr: string
  nameAr?: string
  description: string
  questionIds: string[]
}

// ── Psychometric item analysis ───────────────────────────────
export interface ItemAnalysis {
  questionId: string
  difficultyIndex: number      // p-value: proportion correct (0–1)
  discriminationIndex: number  // point-biserial correlation (-1 to 1)
  irtParameters?: {
    b: number    // 1PL difficulty
    a?: number   // 2PL discrimination
  }
  isInformative: boolean  // discrimination > 0.2 threshold
}

export interface CompetencyScore {
  competencyId: string
  studentId: string
  rawScore: number
  weightedScore: number       // adjusted by discrimination weights
  standardizedScore: number   // 0-100
  itemCount: number
  informativeItemCount: number
}

// ── Cognitive domain aggregate scores ────────────────────────
export interface CognitiveDomainScores {
  studentId: string
  attentional: number    // 0-100, mean of attention subtest standard scores
  reasoning: number
  spatial: number
  visual: number
  memory: number
  executive: number
  computedAt: string
}

// ── SEM ──────────────────────────────────────────────────────
export interface SEMCoefficients {
  competencyId: string
  intercept: number
  attentionalCoef: number
  reasoningCoef: number
  spatialCoef: number
  visualCoef: number
  memoryCoef: number
  executiveCoef: number
  rmsea: number
  cfi: number
  tli: number
  rSquared: number
  modelVersion: string
}

export interface SEMResult {
  competencyId: string
  coefficients: number[]       // [intercept, a1…a6]
  standardErrors: number[]
  tStats: number[]
  pValues: number[]
  rSquared: number
  rmsea: number
  cfi: number
  tli: number
  residuals: number[]          // per student
  significantPredictors: string[]
  vifValues: number[]          // per predictor
}

// ── Recommendations ──────────────────────────────────────────
export type RecommendationType =
  | 'didactic'
  | 'psycho-pedagogical'
  | 'student-exercise'

export interface Recommendation {
  id: string
  studentId: string
  competencyId?: string
  domainId?: string
  type: RecommendationType
  audience: 'teacher' | 'student'
  priority: 'high' | 'medium' | 'low'
  titleFr: string
  titleAr: string
  bodyFr: string
  bodyAr: string
  generatedAt: string
}

// ── Analytics ────────────────────────────────────────────────
export interface StudentResult {
  id: string
  domain: string
  date: string
  score: number
  capacities: { name: string; score: number }[]
}

export interface TeacherStudent {
  id: string
  name: string
  email: string
  joinDate: string
  averageScore: number
  completedTests: number
  weakAreas: string[]
  gradeLevel?: GradeLevel
  filiere?: Filiere
  gender?: Gender
  age?: number
}

export interface GroupAnalytics {
  groupId: string
  studentCount: number
  averageScore: number
  completionRate: number
  domainAverages: Record<string, number>
  atRiskCount: number
}

export interface InstitutionAnalytics {
  institutionId: string
  teacherCount: number
  studentCount: number
  groupCount: number
  averageScore: number
  domainAverages: Record<string, number>
}

// ── i18n ─────────────────────────────────────────────────────
export type Locale = 'fr' | 'ar'

// ── Mock-data compat (keep for backwards compat) ─────────────
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
