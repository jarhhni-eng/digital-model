/**
 * lib/scoring-engine.ts
 *
 * Moteur de scoring conforme au prompt de recherche :
 *
 *   score_q  = 1 if réponse_correcte else 0
 *   Ck       = sum(scores_Ck) / len(questions_Ck)
 *   Ck_20    = Ck * 20
 *   Ck_pct   = Ck * 100
 *   lesson_score     = sum(scores_total) / total_questions
 *   lesson_score_20  = lesson_score * 20
 *
 * Indicateurs de performance (domaine géométrie uniquement) :
 *   percent_correct   = correct / total
 *   percent_idk       = idk / total
 *   percent_multiple  = (multi_wrong + single_when_multi_correct) / total
 *   clicks            = total_clicks
 *   time              = total_time / total
 */

import type { CompetencyDef, LessonDef } from './competency-definitions'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestionResult {
  questionId: string
  selectedValue: string | null
  correctValue: string | null
  isCorrect: boolean
  /** 1 if correct, 0 otherwise */
  score_q: number
  timeSpentMs: number | null
  /** true if student clicked "je ne sais pas" */
  isIDK: boolean
  /** Number of clicks made on this question */
  clickCount: number
}

export interface CompetencyScore {
  /** e.g. "C1" — specific to this lesson */
  code: string
  /** Full label for this lesson's Cₖ */
  label: string
  correct: number
  total: number
  /** 0–1 */
  Ck: number
  /** 0–20 */
  Ck_20: number
  /** 0–100 */
  Ck_pct: number
}

export interface LessonScore {
  lessonId: string
  lessonTitle: string
  /** Per-question results */
  questions: QuestionResult[]
  /** Per-competency scores (specific to this lesson) */
  competencyScores: CompetencyScore[]
  /** Global lesson score 0–1 */
  lesson_score: number
  /** Global lesson score 0–20 */
  lesson_score_20: number
  /** Global lesson score 0–100 */
  lesson_score_pct: number
  /** Behavioral indicators (geometry only) */
  indicators: PerformanceIndicators
}

export interface PerformanceIndicators {
  percent_correct: number
  percent_idk: number
  /** (multi_wrong + single_when_multi_correct) / total */
  percent_multiple: number
  total_clicks: number
  /** avg time per question in ms */
  avg_time_ms: number
}

// ─── Core scoring functions ───────────────────────────────────────────────────

/** score_q = 1 if correct else 0 */
export function scoreQuestion(
  selectedValue: string | null,
  correctValue: string | null,
): number {
  if (selectedValue === null || correctValue === null) return 0
  return selectedValue.trim() === correctValue.trim() ? 1 : 0
}

/**
 * Compute Cₖ for a single competency.
 * ⚠️ Cₖ codes are lesson-specific — never mix across lessons.
 */
export function computeCompetencyScore(
  competency: CompetencyDef,
  questionResults: QuestionResult[],
): CompetencyScore {
  const relevant = questionResults.filter((q) =>
    competency.questionIds.includes(q.questionId),
  )
  const correct = relevant.filter((q) => q.isCorrect).length
  const total = relevant.length || 1 // avoid division by zero
  const Ck = correct / total

  return {
    code: competency.code,
    label: competency.label,
    correct,
    total: relevant.length,
    Ck,
    Ck_20: Math.round(Ck * 20 * 100) / 100,
    Ck_pct: Math.round(Ck * 100 * 100) / 100,
  }
}

/**
 * Compute the full lesson score from question results.
 */
export function computeLessonScore(
  lesson: LessonDef,
  questionResults: QuestionResult[],
): LessonScore {
  const total = questionResults.length || 1
  const correctCount = questionResults.filter((q) => q.isCorrect).length
  const idkCount = questionResults.filter((q) => q.isIDK).length
  const multiCount = questionResults.filter(
    (q) => !q.isCorrect && q.clickCount > 1,
  ).length
  const totalClicks = questionResults.reduce((s, q) => s + q.clickCount, 0)
  const totalTimeMs = questionResults.reduce(
    (s, q) => s + (q.timeSpentMs ?? 0),
    0,
  )

  const lesson_score = correctCount / total

  const competencyScores = lesson.competencies.map((c) =>
    computeCompetencyScore(c, questionResults),
  )

  const indicators: PerformanceIndicators = {
    percent_correct: Math.round((correctCount / total) * 100 * 10) / 10,
    percent_idk: Math.round((idkCount / total) * 100 * 10) / 10,
    percent_multiple: Math.round((multiCount / total) * 100 * 10) / 10,
    total_clicks: totalClicks,
    avg_time_ms: Math.round(totalTimeMs / total),
  }

  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    questions: questionResults,
    competencyScores,
    lesson_score,
    lesson_score_20: Math.round(lesson_score * 20 * 100) / 100,
    lesson_score_pct: Math.round(lesson_score * 100 * 10) / 10,
    indicators,
  }
}

// ─── Mock data generator for admin dashboard ─────────────────────────────────

import { LESSON_DEFINITIONS } from './competency-definitions'

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export interface StudentLessonResult {
  studentId: string
  studentName: string
  lessonId: string
  lessonTitle: string
  competencyScores: CompetencyScore[]
  lesson_score_pct: number
  lesson_score_20: number
  indicators: PerformanceIndicators
  submittedAt: string
}

const STUDENT_NAMES = [
  'Youssef El Amrani', 'Salma Benali', 'Imane Alaoui', 'Mehdi Tazi',
  'Zineb Fassi', 'Karim Idrissi', 'Nadia Bennani', 'Omar Berrada',
  'Sara Kadiri', 'Hamza Saidi', 'Lina Chraibi', 'Rayane Lamrani',
]

/** Generate deterministic mock lesson results for all students × all geometry lessons */
export function buildMockLessonResults(): StudentLessonResult[] {
  const rand = rng(99)
  const results: StudentLessonResult[] = []

  STUDENT_NAMES.forEach((name, si) => {
    const studentId = `mock-student-${si + 1}`
    const bias = (si % 4) * 5 - 7 // spread scores

    Object.values(LESSON_DEFINITIONS).forEach((lesson) => {
      const competencyScores: CompetencyScore[] = lesson.competencies.map((c) => {
        const total = c.questionIds.length
        const correct = Math.max(0, Math.min(total, Math.round(rand() * total + bias * 0.1)))
        const Ck = total > 0 ? correct / total : 0
        return {
          code: c.code,
          label: c.label,
          correct,
          total,
          Ck,
          Ck_20: Math.round(Ck * 20 * 10) / 10,
          Ck_pct: Math.round(Ck * 100 * 10) / 10,
        }
      })

      const totalQ = lesson.competencies.reduce((s, c) => s + c.questionIds.length, 0) || 1
      const totalCorrect = competencyScores.reduce((s, c) => s + c.correct, 0)
      const lesson_score = totalCorrect / totalQ

      results.push({
        studentId,
        studentName: name,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        competencyScores,
        lesson_score_pct: Math.round(lesson_score * 100 * 10) / 10,
        lesson_score_20: Math.round(lesson_score * 20 * 10) / 10,
        indicators: {
          percent_correct: Math.round(lesson_score * 100 * 10) / 10,
          percent_idk: Math.round(rand() * 20 * 10) / 10,
          percent_multiple: Math.round(rand() * 15 * 10) / 10,
          total_clicks: Math.round(50 + rand() * 200),
          avg_time_ms: Math.round(8000 + rand() * 25000),
        },
        submittedAt: new Date(Date.now() - Math.round(rand() * 30 * 86400000)).toISOString(),
      })
    })
  })

  return results
}

/** Average Cₖ across all students for a given lesson + competency code */
export function avgCkForLesson(
  results: StudentLessonResult[],
  lessonId: string,
  ckCode: string,
): number {
  const relevant = results
    .filter((r) => r.lessonId === lessonId)
    .map((r) => r.competencyScores.find((c) => c.code === ckCode)?.Ck_pct ?? 0)
  if (!relevant.length) return 0
  return Math.round(relevant.reduce((a, b) => a + b, 0) / relevant.length * 10) / 10
}

/** Average lesson score across all students for a given lesson */
export function avgLessonScore(
  results: StudentLessonResult[],
  lessonId: string,
): number {
  const relevant = results
    .filter((r) => r.lessonId === lessonId)
    .map((r) => r.lesson_score_pct)
  if (!relevant.length) return 0
  return Math.round(relevant.reduce((a, b) => a + b, 0) / relevant.length * 10) / 10
}
