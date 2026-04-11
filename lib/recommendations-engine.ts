/**
 * Rule-based recommendations from competency gaps and predictor strengths.
 */

export interface Recommendation {
  audience: 'teacher' | 'student' | 'psycho'
  title: string
  detail: string
}

export function buildRecommendations(params: {
  weakestDomain: string
  strongestDomain: string
  competencyScore: number
}): Recommendation[] {
  const out: Recommendation[] = []
  if (params.competencyScore < 50) {
    out.push({
      audience: 'teacher',
      title: 'Didactic: scaffold geometry tasks',
      detail:
        'Low competency score suggests breaking proofs into smaller steps and using multiple representations.',
    })
    out.push({
      audience: 'student',
      title: 'Personalized practice',
      detail:
        'Focus on targeted exercises linked to weak sub-skills; use spaced repetition.',
    })
  }
  out.push({
    audience: 'psycho',
    title: 'Cognitive load',
    detail:
      'If attention scores are low, shorten task length and reduce simultaneous distractors.',
  })
  out.push({
    audience: 'teacher',
    title: 'Leverage strength',
    detail: `Strong area (${params.strongestDomain}) can be used to bridge into weaker domains via analogies.`,
  })
  return out
}
