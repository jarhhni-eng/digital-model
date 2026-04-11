/**
 * Structural equation modeling — simplified reporting layer.
 * Full SEM requires dedicated software (lavaan, Mplus); here we expose fit indices placeholders
 * and a linear composite for competency prediction.
 */

export interface SemFitIndices {
  rmsea: number
  cfi: number
  tli: number
}

/** Placeholder fit (replace with estimated values from a real model). */
export function placeholderFit(): SemFitIndices {
  return { rmsea: 0.06, cfi: 0.94, tli: 0.92 }
}

/** Model 2 style: weighted sum of domain means → competency score (0–100). */
export function aggregatedCompetencyScore(
  domainMeans: number[],
  weights: number[]
): number {
  if (domainMeans.length !== weights.length || domainMeans.length === 0) return 0
  const wsum = weights.reduce((a, b) => a + b, 0) || 1
  const raw = domainMeans.reduce((s, m, i) => s + m * (weights[i] ?? 0), 0) / wsum
  return Math.max(0, Math.min(100, raw))
}

/** Variance inflation factor for predictor j (diagnostic). */
export function varianceInflationFactor(rSquaredJ: number): number {
  if (rSquaredJ >= 1) return Infinity
  return 1 / (1 - rSquaredJ)
}
