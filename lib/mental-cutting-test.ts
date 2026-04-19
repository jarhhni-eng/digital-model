// ─── Mental Cutting Test (MCT) ────────────────────────────────────────────────

export const MENTAL_CUTTING_TEST_ID   = 'test-spatial-transformation'
export const MENTAL_CUTTING_STORAGE_KEY = 'mentalCuttingResults'

// One correct answer per question (1-based choice number)
export const CORRECT_ANSWERS: number[] = [2, 3, 5, 5, 3, 1, 1, 1, 3, 3, 5, 3, 2, 4, 1]

export const TOTAL_QUESTIONS = 15
export const NUM_CHOICES     = 5

export interface CuttingQuestion {
  number: number       // 1–15
  imagePath: string    // /transformation/transformation N.jpg
  correct: number      // 1–5
}

export const cuttingQuestions: CuttingQuestion[] = Array.from(
  { length: TOTAL_QUESTIONS },
  (_, i) => ({
    number: i + 1,
    imagePath: `/transformation/trasnsformation ${i + 1}.png`,
    correct: CORRECT_ANSWERS[i],
  })
)

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface CuttingResponse {
  questionNumber: number
  selected: number | null   // 1–5 or null
  isCorrect: boolean
}

export interface CuttingResult {
  responses: CuttingResponse[]
  score: number          // 0–15
  total: number          // 15
  percentage: number     // 0–100
  mistakes: number[]     // 1-based question numbers that were wrong
  completedAt: string
}

export function computeCuttingResult(
  answers: Record<number, number | null>   // questionNumber → selected
): CuttingResult {
  let score = 0
  const mistakes: number[] = []
  const responses: CuttingResponse[] = []

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const qNum     = i + 1
    const selected = answers[qNum] ?? null
    const isCorrect = selected !== null && selected === CORRECT_ANSWERS[i]
    if (isCorrect) score++
    else mistakes.push(qNum)
    responses.push({ questionNumber: qNum, selected, isCorrect })
  }

  return {
    responses,
    score,
    total: TOTAL_QUESTIONS,
    percentage: Math.round((score / TOTAL_QUESTIONS) * 100),
    mistakes,
    completedAt: new Date().toISOString(),
  }
}
