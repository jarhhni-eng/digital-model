export interface QuestionAnswerRecord {
  questionId: string
  selectedValue: string | null
  timeSpentMs: number | null
}

export interface TestSubmission {
  id: string
  userId: string
  testId: string
  startedAt: string
  submittedAt: string
  answers: QuestionAnswerRecord[]
  scorePercent: number | null
  domainId?: string
}

// ─── Lesson-based submission (competency-aware) ───────────────────────────────

export interface CompetencyScoreRecord {
  competency: string   // "C1", "C3", …
  label: string        // human-readable description
  correct: number
  total: number
  percent: number
}

export interface LessonResultRecord {
  id: string
  userId: string
  testId: string
  lessonTitle: string
  submittedAt: string
  /** One selected choiceId per questionId */
  selectedChoices: Record<string, string>
  globalCorrect: number
  globalTotal: number
  globalPercent: number
  competencyScores: CompetencyScoreRecord[]
  diagnosticAnswer: string | null
}
