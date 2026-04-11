/**
 * Psychometric utilities: difficulty, discrimination, IRT-style transforms.
 * Full calibration requires large samples; these are deterministic helpers for the platform layer.
 */

/** Proportion correct (classical difficulty). */
export function itemDifficulty(correctCount: number, n: number): number {
  if (n <= 0) return 0
  return correctCount / n
}

/** High-low group discrimination (27% rule approximation). */
export function discriminationIndex(
  highGroupCorrect: number,
  highN: number,
  lowGroupCorrect: number,
  lowN: number
): number {
  const pHigh = highN > 0 ? highGroupCorrect / highN : 0
  const pLow = lowN > 0 ? lowGroupCorrect / lowN : 0
  return pHigh - pLow
}

/** 1PL (Rasch) difficulty from logit of p (stabilized). */
export function raschDifficulty(p: number): number {
  const eps = 0.01
  const pp = Math.min(1 - eps, Math.max(eps, p))
  return Math.log(pp / (1 - pp))
}

/** 2PL probability of correct response (1D). */
export function twoPlProbability(theta: number, a: number, b: number): number {
  const x = a * (theta - b)
  return 1 / (1 + Math.exp(-x))
}

/** Pearson correlation coefficient (item scores vs total score). */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0
  let sx = 0,
    sy = 0,
    sxx = 0,
    syy = 0,
    sxy = 0
  for (let i = 0; i < n; i++) {
    sx += x[i]
    sy += y[i]
    sxx += x[i] * x[i]
    syy += y[i] * y[i]
    sxy += x[i] * y[i]
  }
  const num = n * sxy - sx * sy
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy))
  return den === 0 ? 0 : num / den
}
