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
