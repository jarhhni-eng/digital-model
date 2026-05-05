/**
 * Aggregates per-capacity scores and builds structured `test_sessions.metadata`
 * for geometry lessons (longitudinal analysis).
 */

export const GEOMETRY_SESSION_METADATA_VERSION = 1

export type CapacityBreakdownEntry = {
  earned: number
  max: number
  percent?: number
}

export type PerQuestionTrace = {
  questionId: string
  capacityCodes: string[]
  part: string | null
  score: number
  correct: boolean
}

export type GeometrySessionMetadataPayload = {
  schemaVersion: typeof GEOMETRY_SESSION_METADATA_VERSION
  lessonTestId: string
  capacityBreakdown: Record<string, CapacityBreakdownEntry>
  perQuestion: PerQuestionTrace[]
  totalPercent: number
  /** 'fraction' = earned/max in [0,1] per item; 'points' = lesson-specific points */
  breakdownUnit: 'fraction' | 'points'
}

function splitWeight(codes: string[]): number {
  const n = codes.filter(Boolean).length
  return n > 0 ? 1 / n : 1
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

/**
 * Distributes each item's score/max across its competency codes with equal weight.
 */
export function aggregateCompetenciesWeighted(
  items: {
    questionId: string
    capacityCodes: string[]
    part: string | null
    score: number
    max: number
    correct: boolean
  }[],
): {
  capacityBreakdown: Record<string, CapacityBreakdownEntry>
  perQuestion: PerQuestionTrace[]
  totalPercent: number
  totalEarned: number
  totalMax: number
} {
  const buckets: Record<string, { earned: number; max: number }> = {}
  const perQuestion: PerQuestionTrace[] = []
  let totalEarned = 0
  let totalMax = 0

  for (const it of items) {
    const codes = it.capacityCodes.length ? it.capacityCodes : []
    const w = splitWeight(codes)
    const score = it.score
    const max = it.max

    perQuestion.push({
      questionId: it.questionId,
      capacityCodes: it.capacityCodes,
      part: it.part,
      score,
      correct: it.correct,
    })

    totalEarned += score
    totalMax += max

    if (codes.length === 0) continue

    for (const c of codes) {
      if (!buckets[c]) buckets[c] = { earned: 0, max: 0 }
      buckets[c].earned += score * w
      buckets[c].max += max * w
    }
  }

  const capacityBreakdown: Record<string, CapacityBreakdownEntry> = {}
  for (const [code, v] of Object.entries(buckets)) {
    const percent = v.max > 0 ? Math.round((v.earned / v.max) * 10000) / 100 : undefined
    capacityBreakdown[code] = {
      earned: round3(v.earned),
      max: round3(v.max),
      percent,
    }
  }

  const totalPercent =
    totalMax > 0 ? Math.round((totalEarned / totalMax) * 10000) / 100 : 0

  return { capacityBreakdown, perQuestion, totalPercent, totalEarned, totalMax }
}

export function buildGeometrySessionMetadataFraction(opts: {
  lessonTestId: string
  questions: { id: string; competencies: string[]; part?: string }[]
  trials: { index: number; questionId: string; score: number; correct: boolean }[]
  isScorableIndex: (index: number) => boolean
}): GeometrySessionMetadataPayload {
  const items: {
    questionId: string
    capacityCodes: string[]
    part: string | null
    score: number
    max: number
    correct: boolean
  }[] = []

  for (const t of opts.trials) {
    if (!opts.isScorableIndex(t.index)) continue
    const q = opts.questions[t.index]
    if (!q) continue
    const score = Number.isFinite(t.score) ? Math.max(0, Math.min(1, t.score)) : t.correct ? 1 : 0
    items.push({
      questionId: q.id,
      capacityCodes: [...(q.competencies ?? [])],
      part: q.part ?? null,
      score,
      max: 1,
      correct: t.correct,
    })
  }

  const { capacityBreakdown, perQuestion, totalPercent } = aggregateCompetenciesWeighted(items)

  return {
    schemaVersion: GEOMETRY_SESSION_METADATA_VERSION,
    lessonTestId: opts.lessonTestId,
    capacityBreakdown,
    perQuestion,
    totalPercent,
    breakdownUnit: 'fraction',
  }
}

export function buildGeometrySessionMetadataPoints(opts: {
  lessonTestId: string
  perQuestion: PerQuestionTrace[]
  capacityBreakdown: Record<string, CapacityBreakdownEntry>
  totalPercent: number
}): GeometrySessionMetadataPayload {
  return {
    schemaVersion: GEOMETRY_SESSION_METADATA_VERSION,
    lessonTestId: opts.lessonTestId,
    capacityBreakdown: opts.capacityBreakdown,
    perQuestion: opts.perQuestion,
    totalPercent: opts.totalPercent,
    breakdownUnit: 'points',
  }
}
