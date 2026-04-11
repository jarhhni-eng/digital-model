/**
 * Structural Equation Modeling (SEM) — Simplified OLS Path Models
 * Pure TypeScript — no external linear algebra library.
 * Designed for n ≤ 100 students, 6 cognitive domain predictors.
 */

import type { SEMResult, CognitiveDomainScores } from './types'

// ── Matrix math ───────────────────────────────────────────────

type Matrix = number[][]

function zeros(r: number, c: number): Matrix {
  return Array.from({ length: r }, () => new Array(c).fill(0))
}

function transpose(A: Matrix): Matrix {
  const m = A.length, n = A[0].length
  const T = zeros(n, m)
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++) T[j][i] = A[i][j]
  return T
}

function matMul(A: Matrix, B: Matrix): Matrix {
  const m = A.length, n = B[0].length, k = B.length
  const C = zeros(m, n)
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let l = 0; l < k; l++) C[i][j] += A[i][l] * B[l][j]
  return C
}

function matVec(A: Matrix, v: number[]): number[] {
  return A.map((row) => row.reduce((s, val, j) => s + val * v[j], 0))
}

/** Gaussian elimination with partial pivoting for Ax = b */
function gaussianElim(A: Matrix, b: number[]): number[] | null {
  const n = b.length
  const M: number[][] = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r
    }
    ;[M[col], M[maxRow]] = [M[maxRow], M[col]]
    if (Math.abs(M[col][col]) < 1e-12) return null  // singular

    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col]
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c]
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n]
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j]
    x[i] /= M[i][i]
  }
  return x
}

function invertMatrix(A: Matrix): Matrix | null {
  const n = A.length
  const identity = A.map((_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)))
  const augmented = A.map((row, i) => [...row, ...identity[i]])

  for (let col = 0; col < n; col++) {
    let maxRow = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(augmented[r][col]) > Math.abs(augmented[maxRow][col])) maxRow = r
    }
    ;[augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]]
    const pivot = augmented[col][col]
    if (Math.abs(pivot) < 1e-12) return null

    for (let c = 0; c < 2 * n; c++) augmented[col][c] /= pivot

    for (let r = 0; r < n; r++) {
      if (r !== col) {
        const factor = augmented[r][col]
        for (let c = 0; c < 2 * n; c++) augmented[r][c] -= factor * augmented[col][c]
      }
    }
  }

  return augmented.map((row) => row.slice(n))
}

// ── OLS Regression (β = (XᵀX)⁻¹ Xᵀy) ───────────────────────

interface OLSResult {
  coefficients: number[]   // [intercept, β₁…β₆]
  standardErrors: number[]
  tStats: number[]
  pValues: number[]
  rSquared: number
  residuals: number[]
  residualSE: number
  xTxInv: Matrix | null
}

function tToPValue(t: number, df: number): number {
  // Approximation of two-tailed p-value from t-distribution
  const x = df / (df + t * t)
  // Regularized incomplete beta (approximation)
  const a = 0.5, b = df / 2
  // Simple approximation: use normal distribution for large df
  if (df >= 30) {
    const z = Math.abs(t)
    return 2 * (1 / (1 + Math.exp(1.7075 * z + 0.0078 * z * z * z)))
  }
  // For small df, rough approximation
  const p = 1 / (1 + Math.abs(t) / Math.sqrt(df))
  return 2 * (1 - Math.min(0.999, p))
}

function computeOLS(X: Matrix, y: number[]): OLSResult {
  const n = X.length
  const p = X[0].length  // includes intercept column

  // XᵀX
  const Xt = transpose(X)
  const XtX = matMul(Xt, X)

  // XᵀX inverse
  const XtXInv = invertMatrix(XtX)
  if (!XtXInv) {
    // Fallback: return zeros
    return {
      coefficients: new Array(p).fill(0),
      standardErrors: new Array(p).fill(0),
      tStats: new Array(p).fill(0),
      pValues: new Array(p).fill(1),
      rSquared: 0,
      residuals: y.map(() => 0),
      residualSE: 0,
      xTxInv: null,
    }
  }

  // Xᵀy
  const Xty = matVec(Xt, y)

  // β = (XᵀX)⁻¹ Xᵀy
  const beta = matVec(XtXInv, Xty)

  // Predicted values and residuals
  const yhat = X.map((row) => row.reduce((s, val, j) => s + val * beta[j], 0))
  const residuals = y.map((yi, i) => yi - yhat[i])

  // SS
  const yMean = y.reduce((a, b) => a + b, 0) / n
  const ssTotal = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0)
  const ssRes = residuals.reduce((s, e) => s + e * e, 0)
  const rSquared = ssTotal > 0 ? Math.max(0, 1 - ssRes / ssTotal) : 0

  // Residual standard error
  const df = n - p
  const residualSE = df > 0 ? Math.sqrt(ssRes / df) : 0

  // Standard errors of coefficients
  const standardErrors = XtXInv.map(
    (_, i) => residualSE * Math.sqrt(XtXInv[i][i])
  )

  // t-statistics and p-values
  const tStats = beta.map((b, i) =>
    standardErrors[i] > 0 ? b / standardErrors[i] : 0
  )
  const pValues = tStats.map((t) => tToPValue(t, df))

  return {
    coefficients: beta,
    standardErrors,
    tStats,
    pValues,
    rSquared,
    residuals,
    residualSE,
    xTxInv: XtXInv,
  }
}

// ── SEM Fit Indices ───────────────────────────────────────────

/** Chi-square approximation from residuals */
function computeChiSquare(residuals: number[], n: number): number {
  const ssRes = residuals.reduce((s, e) => s + e * e, 0)
  return ssRes / (n > 0 ? n : 1)  // scaled approximation
}

export function computeRMSEA(chiSquare: number, df: number, n: number): number {
  // RMSEA = sqrt(max(χ²/df - 1, 0) / (n - 1))
  if (df <= 0 || n <= 1) return 0
  return Math.sqrt(Math.max((chiSquare / df - 1) / (n - 1), 0))
}

export function computeCFI(
  modelChiSq: number, modelDf: number,
  nullChiSq: number, nullDf: number
): number {
  const dNum = Math.max(modelChiSq - modelDf, 0)
  const dNull = Math.max(nullChiSq - nullDf, 0)
  const dMax = Math.max(dNull, dNum)
  return dMax > 0 ? 1 - dNum / dMax : 1
}

export function computeTLI(
  modelChiSq: number, modelDf: number,
  nullChiSq: number, nullDf: number
): number {
  if (nullDf <= 0 || modelDf <= 0) return 1
  const ratio = (nullChiSq / nullDf - modelChiSq / modelDf) / (nullChiSq / nullDf - 1)
  return Math.min(1, ratio)
}

// ── VIF (Variance Inflation Factor) ──────────────────────────

export function computeVIF(X: Matrix): number[] {
  const n = X.length
  const p = X[0].length  // includes intercept
  const vifs: number[] = []

  for (let j = 1; j < p; j++) {  // skip intercept
    const yj = X.map((row) => row[j])
    const Xj = X.map((row) => row.filter((_, k) => k !== j))
    const res = computeOLS(Xj, yj)
    const vif = res.rSquared < 1 ? 1 / (1 - res.rSquared) : 999
    vifs.push(Math.min(999, vif))
  }

  return vifs
}

// ── Domain predictor names ────────────────────────────────────

export const DOMAIN_PREDICTOR_NAMES = [
  'Attentional', 'Reasoning', 'Spatial', 'Visual', 'Memory', 'Executive',
]

export const DOMAIN_PREDICTOR_NAMES_FR = [
  'Attentionnel', 'Raisonnement', 'Spatial', 'Visuel', 'Mémoire', 'Exécutif',
]

export const DOMAIN_PREDICTOR_NAMES_AR = [
  'انتباهي', 'استدلالي', 'مكاني', 'بصري', 'ذاكرة', 'تنفيذي',
]

// ── Model 1: Individual domain predictors ─────────────────────

export function fitSEMModel1(
  competencyScores: number[],       // [students] outcome
  domainScores: CognitiveDomainScores[],  // [students]
  competencyId: string
): SEMResult {
  const n = competencyScores.length
  if (n < 8) {
    return emptySEMResult(competencyId)
  }

  const domains = ['attentional', 'reasoning', 'spatial', 'visual', 'memory', 'executive'] as const

  // Build X matrix: [1, attentional, reasoning, spatial, visual, memory, executive]
  const X: Matrix = domainScores.map((ds) => [
    1,
    ds.attentional,
    ds.reasoning,
    ds.spatial,
    ds.visual,
    ds.memory,
    ds.executive,
  ])

  const ols = computeOLS(X, competencyScores)

  // Null model chi-square (intercept only)
  const yMean = competencyScores.reduce((a, b) => a + b, 0) / n
  const nullResiduals = competencyScores.map((y) => y - yMean)
  const nullChiSq = computeChiSquare(nullResiduals, n) * n
  const nullDf = n - 1

  const modelChiSq = computeChiSquare(ols.residuals, n) * n
  const modelDf = n - 7  // n minus parameters

  const rmsea = computeRMSEA(modelChiSq, Math.max(1, modelDf), n)
  const cfi = computeCFI(modelChiSq, Math.max(1, modelDf), nullChiSq, nullDf)
  const tli = computeTLI(modelChiSq, Math.max(1, modelDf), nullChiSq, nullDf)

  const vifs = computeVIF(X)

  const significantPredictors = DOMAIN_PREDICTOR_NAMES.filter(
    (_, i) => ols.pValues[i + 1] < 0.05
  )

  return {
    competencyId,
    coefficients: ols.coefficients,
    standardErrors: ols.standardErrors,
    tStats: ols.tStats,
    pValues: ols.pValues,
    rSquared: ols.rSquared,
    rmsea: Math.min(rmsea, 0.999),
    cfi: Math.max(0, Math.min(1, cfi)),
    tli: Math.max(0, Math.min(1, tli)),
    residuals: ols.residuals,
    significantPredictors,
    vifValues: vifs,
  }
}

// ── Model 2: Aggregated predictors (mean domain scores) ───────

export function fitSEMModel2(
  competencyScores: number[],
  domainScores: CognitiveDomainScores[],
  competencyId: string
): SEMResult {
  // For model 2, use same OLS but the interpretation is:
  // Cₖ = a₁(mean attentional) + a₂(mean reasoning) + ...
  // In practice with student-level data it's identical to model 1
  // unless we aggregate by group; here we treat individual scores as proxies
  return fitSEMModel1(competencyScores, domainScores, competencyId)
}

function emptySEMResult(competencyId: string): SEMResult {
  return {
    competencyId,
    coefficients: new Array(7).fill(0),
    standardErrors: new Array(7).fill(0),
    tStats: new Array(7).fill(0),
    pValues: new Array(7).fill(1),
    rSquared: 0,
    rmsea: 0,
    cfi: 0,
    tli: 0,
    residuals: [],
    significantPredictors: [],
    vifValues: new Array(6).fill(1),
  }
}

// ── Fit index quality labels ──────────────────────────────────

export function rmseaQuality(rmsea: number): 'good' | 'acceptable' | 'poor' {
  if (rmsea <= 0.05) return 'good'
  if (rmsea <= 0.08) return 'acceptable'
  return 'poor'
}

export function cfiQuality(cfi: number): 'good' | 'acceptable' | 'poor' {
  if (cfi >= 0.95) return 'good'
  if (cfi >= 0.90) return 'acceptable'
  return 'poor'
}
