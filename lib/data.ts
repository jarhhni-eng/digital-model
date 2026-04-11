/**
 * Data Access Layer
 * All localStorage reads/writes go through this module.
 * Swap implementations here when a real backend is added.
 */

import type {
  StudentProfile,
  Group,
  TestSession,
  TestScore,
  CognitiveDomainScores,
  CompetencyScore,
  ItemAnalysis,
  SEMResult,
  Recommendation,
  GroupAnalytics,
} from './types'

// ── Helpers ──────────────────────────────────────────────────

function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore QuotaExceededError in demo
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

// ── Student Profile ──────────────────────────────────────────

export function getStudentProfile(userId: string): StudentProfile | null {
  return safeGet<StudentProfile>(`cognitest_profile_${userId}`)
}

export function saveStudentProfile(profile: StudentProfile): void {
  safeSet(`cognitest_profile_${profile.userId}`, profile)
}

export function hasProfile(userId: string): boolean {
  return getStudentProfile(userId) !== null
}

// ── Groups ───────────────────────────────────────────────────

export function getGroup(groupId: string): Group | null {
  return safeGet<Group>(`cognitest_group_${groupId}`)
}

export function saveGroup(group: Group): void {
  safeSet(`cognitest_group_${group.id}`, group)
  // Index by teacher
  const ids = safeGet<string[]>(`cognitest_groups_teacher_${group.teacherId}`) ?? []
  if (!ids.includes(group.id)) {
    safeSet(`cognitest_groups_teacher_${group.teacherId}`, [...ids, group.id])
  }
}

export function getGroupsForTeacher(teacherId: string): Group[] {
  const ids = safeGet<string[]>(`cognitest_groups_teacher_${teacherId}`) ?? []
  return ids.map((id) => getGroup(id)).filter(Boolean) as Group[]
}

export function getTestsForGroup(groupId: string): string[] {
  const group = getGroup(groupId)
  return group?.assignedTestIds ?? []
}

export function assignTestToGroup(groupId: string, testId: string): void {
  const group = getGroup(groupId)
  if (!group) return
  if (!group.assignedTestIds.includes(testId)) {
    group.assignedTestIds.push(testId)
    saveGroup(group)
  }
}

export function addStudentToGroup(groupId: string, studentId: string): void {
  const group = getGroup(groupId)
  if (!group) return
  if (!group.studentIds.includes(studentId)) {
    group.studentIds.push(studentId)
    saveGroup(group)
  }
}

// ── Test Sessions ─────────────────────────────────────────────

export function getTestSession(
  testId: string,
  studentId: string
): TestSession | null {
  return safeGet<TestSession>(`cognitest_test_session_${testId}_${studentId}`)
}

export function saveTestSession(session: TestSession): void {
  safeSet(
    `cognitest_test_session_${session.testId}_${session.studentId}`,
    session
  )
}

export function clearTestSession(testId: string, studentId: string): void {
  safeRemove(`cognitest_test_session_${testId}_${studentId}`)
}

// ── Test Scores (hidden from student) ────────────────────────

export function getTestScore(testId: string, studentId: string): TestScore | null {
  return safeGet<TestScore>(`cognitest_score_${testId}_${studentId}`)
}

export function saveTestScore(score: TestScore): void {
  safeSet(`cognitest_score_${score.testId}_${score.studentId}`, score)
  // Also store in completed test index for the student
  const completedKey = `cognitest_completed_${score.studentId}`
  const completed = safeGet<string[]>(completedKey) ?? []
  if (!completed.includes(score.testId)) {
    safeSet(completedKey, [...completed, score.testId])
  }
}

export function getCompletedTestIds(studentId: string): string[] {
  return safeGet<string[]>(`cognitest_completed_${studentId}`) ?? []
}

export function isTestCompleted(testId: string, studentId: string): boolean {
  return getTestScore(testId, studentId) !== null
}

// ── Cognitive Domain Scores ───────────────────────────────────

export function getDomainScores(
  studentId: string
): CognitiveDomainScores | null {
  return safeGet<CognitiveDomainScores>(`cognitest_domain_scores_${studentId}`)
}

export function saveDomainScores(scores: CognitiveDomainScores): void {
  safeSet(`cognitest_domain_scores_${scores.studentId}`, scores)
}

// ── Competency Scores ─────────────────────────────────────────

export function getCompetencyScores(studentId: string): CompetencyScore[] {
  return safeGet<CompetencyScore[]>(`cognitest_competency_${studentId}`) ?? []
}

export function saveCompetencyScores(
  studentId: string,
  scores: CompetencyScore[]
): void {
  safeSet(`cognitest_competency_${studentId}`, scores)
}

// ── Item Analysis ─────────────────────────────────────────────

export function getItemAnalyses(testId: string): ItemAnalysis[] {
  return safeGet<ItemAnalysis[]>(`cognitest_item_analyses_${testId}`) ?? []
}

export function saveItemAnalyses(testId: string, analyses: ItemAnalysis[]): void {
  safeSet(`cognitest_item_analyses_${testId}`, analyses)
}

// ── SEM Results ───────────────────────────────────────────────

export function getSEMResult(competencyId: string): SEMResult | null {
  return safeGet<SEMResult>(`cognitest_sem_${competencyId}`)
}

export function saveSEMResult(result: SEMResult): void {
  safeSet(`cognitest_sem_${result.competencyId}`, result)
}

// ── Recommendations ───────────────────────────────────────────

export function getRecommendations(studentId: string): Recommendation[] {
  return safeGet<Recommendation[]>(`cognitest_recommendations_${studentId}`) ?? []
}

export function saveRecommendations(
  studentId: string,
  recs: Recommendation[]
): void {
  safeSet(`cognitest_recommendations_${studentId}`, recs)
}

// ── Analytics Aggregation ─────────────────────────────────────

export function getGroupAnalytics(groupId: string): GroupAnalytics {
  const group = getGroup(groupId)
  if (!group) {
    return {
      groupId,
      studentCount: 0,
      averageScore: 0,
      completionRate: 0,
      domainAverages: {},
      atRiskCount: 0,
    }
  }

  const scores = group.studentIds
    .map((sid) => getDomainScores(sid))
    .filter(Boolean) as CognitiveDomainScores[]

  if (scores.length === 0) {
    return {
      groupId,
      studentCount: group.studentIds.length,
      averageScore: 0,
      completionRate: 0,
      domainAverages: {},
      atRiskCount: 0,
    }
  }

  const domains = [
    'attentional',
    'reasoning',
    'spatial',
    'visual',
    'memory',
    'executive',
  ] as const

  const domainAverages: Record<string, number> = {}
  for (const d of domains) {
    domainAverages[d] =
      scores.reduce((sum, s) => sum + s[d], 0) / scores.length
  }

  const overallAvg =
    Object.values(domainAverages).reduce((a, b) => a + b, 0) /
    domains.length

  const atRiskCount = scores.filter((s) => {
    const avg = domains.reduce((sum, d) => sum + s[d], 0) / domains.length
    return avg < 40
  }).length

  const totalTests = group.assignedTestIds.length
  const completedPerStudent =
    group.studentIds.map((sid) => getCompletedTestIds(sid).length)
  const avgCompleted =
    completedPerStudent.reduce((a, b) => a + b, 0) / group.studentIds.length
  const completionRate = totalTests > 0 ? avgCompleted / totalTests : 0

  return {
    groupId,
    studentCount: group.studentIds.length,
    averageScore: Math.round(overallAvg),
    completionRate: Math.round(completionRate * 100),
    domainAverages,
    atRiskCount,
  }
}

// ── Locale ────────────────────────────────────────────────────

export function getLocale(): 'fr' | 'ar' {
  return (safeGet<string>('cognitest_locale') as 'fr' | 'ar') ?? 'fr'
}

export function saveLocale(locale: 'fr' | 'ar'): void {
  safeSet('cognitest_locale', locale)
}

// ── Seed demo data ────────────────────────────────────────────

export function seedDemoDataIfNeeded(): void {
  const seeded = safeGet<boolean>('cognitest_seeded')
  if (seeded) return

  // Seed demo group for teacher-001
  const demoGroup: Group = {
    id: 'group-001',
    name: 'Classe 1BAC Sciences Math A',
    teacherId: 'teacher-001',
    institutionId: 'ens-fes',
    gradeLevel: '1bac',
    academicYear: '2025-2026',
    studentIds: ['student-001', 'student-002', 'student-003'],
    assignedTestIds: [
      'test-attention-divided',
      'test-attention-selective',
      'test-reasoning-abstract',
      'test-visuo-motor',
      'test-visuo-perceptive',
      'test-math-vectors',
    ],
  }
  saveGroup(demoGroup)

  // Seed student profiles
  const profiles: StudentProfile[] = [
    {
      id: 'profile-001',
      userId: 'student-001',
      fullName: 'Ahmed Benali',
      age: 17,
      gender: 'male',
      teacherId: 'teacher-001',
      teacherName: 'Prof. Jalal Asermouh',
      institution: 'ENS Fès',
      gradeLevel: '1bac',
      filiere: 'math-sciences',
      academicYear: '2025-2026',
      mathScorePreviousYear: 14.5,
      mathScoreCurrentYear: 15.2,
      groupId: 'group-001',
    },
    {
      id: 'profile-002',
      userId: 'student-002',
      fullName: 'Fatima Zahra Alaoui',
      age: 16,
      gender: 'female',
      teacherId: 'teacher-001',
      teacherName: 'Prof. Jalal Asermouh',
      institution: 'ENS Fès',
      gradeLevel: '1bac',
      filiere: 'math-sciences',
      academicYear: '2025-2026',
      mathScorePreviousYear: 16.0,
      mathScoreCurrentYear: 16.8,
      groupId: 'group-001',
    },
    {
      id: 'profile-003',
      userId: 'student-003',
      fullName: 'Youssef Khalil',
      age: 17,
      gender: 'male',
      teacherId: 'teacher-001',
      teacherName: 'Prof. Jalal Asermouh',
      institution: 'ENS Fès',
      gradeLevel: '1bac',
      filiere: 'experimental-sciences',
      academicYear: '2025-2026',
      mathScorePreviousYear: 12.0,
      mathScoreCurrentYear: 11.5,
      groupId: 'group-001',
    },
  ]
  for (const p of profiles) saveStudentProfile(p)

  // Seed domain scores for demo students
  const domainScoresSeed: CognitiveDomainScores[] = [
    {
      studentId: 'student-001',
      attentional: 72,
      reasoning: 80,
      spatial: 75,
      visual: 68,
      memory: 71,
      executive: 77,
      computedAt: new Date().toISOString(),
    },
    {
      studentId: 'student-002',
      attentional: 85,
      reasoning: 88,
      spatial: 82,
      visual: 79,
      memory: 84,
      executive: 86,
      computedAt: new Date().toISOString(),
    },
    {
      studentId: 'student-003',
      attentional: 55,
      reasoning: 60,
      spatial: 58,
      visual: 52,
      memory: 57,
      executive: 53,
      computedAt: new Date().toISOString(),
    },
  ]
  for (const ds of domainScoresSeed) saveDomainScores(ds)

  safeSet('cognitest_seeded', true)
}
