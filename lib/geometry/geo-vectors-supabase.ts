/**
 * Bridge between the existing Vectors quiz (in-memory `VectorsResult`) and the
 * generic test_sessions / trial_results tables in Supabase.
 *
 * This is the EXEMPLAR pattern. To migrate the other geometry quizzes:
 *
 *   1. import { startSession, finishSession } from '@/lib/results/results-service'
 *   2. call startSession({ testId: <YOUR_TEST_ID> }) when the student presses
 *      "Commencer les questions" and stash the returned id in component state
 *   3. on the final submit, call finishSession(sessionId, { trials, … })
 *      with the trials shaped like the Trial Insert rows below.
 *
 * The legacy localStorage helpers (saveVectorsResult / saveSymetrieAxialeResult
 * / etc.) can stay for now — they're harmless. They will be removed once every
 * caller has been migrated.
 */

import { startSession, finishSession } from '@/lib/results/results-service'
import {
  VECTORS_TEST_ID,
  VECTORS_QUESTIONS,
  type VectorsTrialResult,
} from '@/lib/geometry/geo-vectors-complete'

export async function persistVectorsAttempt(input: {
  trials: VectorsTrialResult[]
  totalMs: number
  scorePercent: number
  correctCount: number
}): Promise<{ sessionId: string | null; error: string | null }> {
  const total = VECTORS_QUESTIONS.length

  const start = await startSession({ testId: VECTORS_TEST_ID })
  if (!start.data) return { sessionId: null, error: start.error }

  const finish = await finishSession(start.data, {
    totalMs: input.totalMs,
    score: input.scorePercent,
    correctCount: input.correctCount,
    totalQuestions: total,
    trials: input.trials.map((t) => ({
      question_index: t.index,
      question_id: t.questionId,
      selected: (t.selectedList ?? (t.selected >= 0 ? [t.selected] : [])) as never,
      free_text: t.freeText ?? null,
      correct: t.correct,
      score: t.score ?? (t.correct ? 1 : 0),
      reaction_time_ms: t.reactionTimeMs,
    })),
  })

  return finish.ok
    ? { sessionId: start.data, error: null }
    : { sessionId: null, error: finish.error }
}
