/**
 * Psychometric Module
 * Pure TypeScript implementation — no external math libraries.
 * Designed for small datasets (n ≤ 100 students, ≤ 30 items).
 */

import type { ItemAnalysis } from './types'

// ── Item Difficulty Index ─────────────────────────────────────

/** p = proportion of students who answered correctly (0–1) */
export function computeDifficultyIndex(
  responses: Array<{ correct: boolean }>
): number {
  if (responses.length === 0) return 0
  return responses.filter((r) => r.correct).length / responses.length
}

// ── Discrimination Index (Point-Biserial Correlation) ─────────

/**
 * r_pb = (M_correct - M_total) / SD_total * sqrt(p * q)
 * Range: -1 to +1. Values > 0.2 are considered informative.
 */
export function computeDiscriminationIndex(
  responses: Array<{ correct: boolean; totalScore: number }>
): number {
  const n = responses.length
  if (n < 2) return 0

  const p = responses.filter((r) => r.correct).length / n
  const q = 1 - p
  if (p === 0 || p === 1) return 0

  const totalScores = responses.map((r) => r.totalScore)
  const meanTotal = totalScores.reduce((a, b) => a + b, 0) / n
  const variance = totalScores.reduce((sum, s) => sum + (s - meanTotal) ** 2, 0) / n
  const sdTotal = Math.sqrt(variance)
  if (sdTotal === 0) return 0

  const correctScores = responses.filter((r) => r.correct).map((r) => r.totalScore)
  const meanCorrect =
    correctScores.length > 0
      ? correctScores.reduce((a, b) => a + b, 0) / correctScores.length
      : 0

  return ((meanCorrect - meanTotal) / sdTotal) * Math.sqrt(p * q)
}

// ── Full Item Analysis ────────────────────────────────────────

export function analyzeItems(
  responseMatrix: Record<string, boolean[]>,  // questionId → per-student correct[]
  totalScores: number[]                        // per-student total raw score
): ItemAnalysis[] {
  return Object.entries(responseMatrix).map(([questionId, correctArr]) => {
    const responses = correctArr.map((correct, i) => ({
      correct,
      totalScore: totalScores[i] ?? 0,
    }))

    const difficultyIndex = computeDifficultyIndex(responses)
    const discriminationIndex = computeDiscriminationIndex(responses)

    return {
      questionId,
      difficultyIndex,
      discriminationIndex,
      isInformative: discriminationIndex >= 0.2,
    }
  })
}

// ── IRT 1PL (Rasch Model) ─────────────────────────────────────
// JMLE — Joint Maximum Likelihood Estimation

export interface IRT1PLResult {
  itemDifficulties: number[]    // b parameters, one per item
  personAbilities: number[]     // theta parameters, one per person
  convergenceIterations: number
}

/** P(correct | θ, b) = 1 / (1 + exp(-(θ - b))) */
function irt1PLProbability(theta: number, b: number): number {
  return 1 / (1 + Math.exp(-(theta - b)))
}

export function estimateIRT1PL(
  responseMatrix: boolean[][],  // [students × items]
  maxIter = 30,
  convergenceTol = 0.001
): IRT1PLResult {
  const nPersons = responseMatrix.length
  if (nPersons === 0) return { itemDifficulties: [], personAbilities: [], convergenceIterations: 0 }
  const nItems = responseMatrix[0].length

  // Initialize abilities and difficulties
  let theta = new Array(nPersons).fill(0.0)
  let b = new Array(nItems).fill(0.0)

  let iterations = 0

  for (let iter = 0; iter < maxIter; iter++) {
    const prevB = [...b]
    const prevTheta = [...theta]

    // Update person abilities
    for (let j = 0; j < nPersons; j++) {
      const totalCorrect = responseMatrix[j].filter(Boolean).length
      if (totalCorrect === 0) { theta[j] = -3; continue }
      if (totalCorrect === nItems) { theta[j] = 3; continue }

      let sum = 0
      for (let i = 0; i < nItems; i++) {
        const p = irt1PLProbability(theta[j], b[i])
        sum += (responseMatrix[j][i] ? 1 : 0) - p
      }
      theta[j] = theta[j] + 0.1 * sum
      theta[j] = Math.max(-4, Math.min(4, theta[j]))
    }

    // Update item difficulties
    for (let i = 0; i < nItems; i++) {
      const totalCorrect = responseMatrix.filter((row) => row[i]).length
      if (totalCorrect === 0) { b[i] = 3; continue }
      if (totalCorrect === nPersons) { b[i] = -3; continue }

      let sum = 0
      for (let j = 0; j < nPersons; j++) {
        const p = irt1PLProbability(theta[j], b[i])
        sum += (responseMatrix[j][i] ? 1 : 0) - p
      }
      b[i] = b[i] - 0.1 * sum
      b[i] = Math.max(-4, Math.min(4, b[i]))
    }

    // Center abilities to mean 0
    const meanTheta = theta.reduce((a, c) => a + c, 0) / nPersons
    theta = theta.map((t) => t - meanTheta)
    b = b.map((bi) => bi - meanTheta)

    // Check convergence
    const maxDeltaB = b.reduce((m, bi, i) => Math.max(m, Math.abs(bi - prevB[i])), 0)
    const maxDeltaTheta = theta.reduce((m, t, j) => Math.max(m, Math.abs(t - prevTheta[j])), 0)
    iterations = iter + 1
    if (maxDeltaB < convergenceTol && maxDeltaTheta < convergenceTol) break
  }

  return { itemDifficulties: b, personAbilities: theta, convergenceIterations: iterations }
}

// ── IRT 2PL ──────────────────────────────────────────────────

export interface IRT2PLResult {
  a: number[]   // discrimination parameters
  b: number[]   // difficulty parameters
  theta: number[]  // person abilities
}

/** P(correct | θ, a, b) = 1 / (1 + exp(-a*(θ - b))) */
function irt2PLProbability(theta: number, a: number, b: number): number {
  return 1 / (1 + Math.exp(-a * (theta - b)))
}

export function estimateIRT2PL(
  responseMatrix: boolean[][],
  maxIter = 30
): IRT2PLResult {
  // Start from 1PL estimates, then add discrimination
  const result1PL = estimateIRT1PL(responseMatrix, maxIter)
  const nItems = responseMatrix[0]?.length ?? 0
  const nPersons = responseMatrix.length

  let a = new Array(nItems).fill(1.0)
  let b = [...result1PL.itemDifficulties]
  let theta = [...result1PL.personAbilities]

  for (let iter = 0; iter < 15; iter++) {
    // Update discrimination parameters
    for (let i = 0; i < nItems; i++) {
      let gradA = 0
      for (let j = 0; j < nPersons; j++) {
        const p = irt2PLProbability(theta[j], a[i], b[i])
        const r = responseMatrix[j][i] ? 1 : 0
        gradA += (r - p) * (theta[j] - b[i])
      }
      a[i] = Math.max(0.2, Math.min(3, a[i] + 0.05 * gradA / nPersons))
    }

    // Update difficulty
    for (let i = 0; i < nItems; i++) {
      let gradB = 0
      for (let j = 0; j < nPersons; j++) {
        const p = irt2PLProbability(theta[j], a[i], b[i])
        const r = responseMatrix[j][i] ? 1 : 0
        gradB += -(r - p) * a[i]
      }
      b[i] = Math.max(-4, Math.min(4, b[i] - 0.05 * gradB / nPersons))
    }
  }

  return { a, b, theta }
}

// ── PCA (Power Iteration on correlation matrix) ───────────────

export interface PCAResult {
  eigenvalues: number[]
  explainedVariance: number[]   // percent
  cumulativeVariance: number[]  // percent
  loadings: number[][]          // [factor × variable]
  factorScores: number[][]      // [student × factor]
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length, n = B[0].length, k = B.length
  const C = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let l = 0; l < k; l++) C[i][j] += A[i][l] * B[l][j]
  return C
}

function vecNorm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0))
}

function normalize(v: number[]): number[] {
  const n = vecNorm(v)
  return n > 0 ? v.map((x) => x / n) : v
}

function powerIteration(
  matrix: number[][],
  maxIter = 200,
  tol = 1e-6
): { eigenvalue: number; eigenvector: number[] } {
  const n = matrix.length
  let vec = new Array(n).fill(1 / Math.sqrt(n))

  for (let iter = 0; iter < maxIter; iter++) {
    const newVec = matrix.map((row) =>
      row.reduce((sum, val, j) => sum + val * vec[j], 0)
    )
    const norm = vecNorm(newVec)
    const normalized = norm > 0 ? newVec.map((x) => x / norm) : newVec
    const delta = normalized.reduce((s, x, i) => s + Math.abs(x - vec[i]), 0)
    vec = normalized
    if (delta < tol) break
  }

  const eigenvalue = matrix.reduce(
    (sum, row, i) => sum + row.reduce((s, val, j) => s + val * vec[j], 0) * vec[i],
    0
  )
  return { eigenvalue, eigenvector: vec }
}

function deflate(matrix: number[][], eigenvalue: number, eigenvector: number[]): number[][] {
  const n = matrix.length
  return matrix.map((row, i) =>
    row.map((val, j) => val - eigenvalue * eigenvector[i] * eigenvector[j])
  )
}

function computeCorrelationMatrix(data: number[][]): number[][] {
  const n = data.length  // students
  const p = data[0].length  // variables

  // Standardize
  const means = Array.from({ length: p }, (_, j) =>
    data.reduce((s, row) => s + row[j], 0) / n
  )
  const sds = Array.from({ length: p }, (_, j) => {
    const variance = data.reduce((s, row) => s + (row[j] - means[j]) ** 2, 0) / n
    return Math.sqrt(variance)
  })

  const standardized = data.map((row) =>
    row.map((val, j) => (sds[j] > 0 ? (val - means[j]) / sds[j] : 0))
  )

  // Correlation matrix = (Xᵀ X) / (n - 1)
  const cor: number[][] = Array.from({ length: p }, () => new Array(p).fill(0))
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      cor[i][j] =
        standardized.reduce((s, row) => s + row[i] * row[j], 0) / (n - 1)
    }
  }
  return cor
}

export function runPCA(data: number[][]): PCAResult {
  const n = data.length
  if (n < 2) {
    return {
      eigenvalues: [],
      explainedVariance: [],
      cumulativeVariance: [],
      loadings: [],
      factorScores: [],
    }
  }
  const p = data[0].length

  let cor = computeCorrelationMatrix(data)
  const eigenvalues: number[] = []
  const eigenvectors: number[][] = []

  for (let f = 0; f < Math.min(p, 6); f++) {
    const { eigenvalue, eigenvector } = powerIteration(cor)
    eigenvalues.push(Math.max(0, eigenvalue))
    eigenvectors.push(eigenvector)
    cor = deflate(cor, eigenvalue, eigenvector)
  }

  const totalVariance = eigenvalues.reduce((a, b) => a + b, 0) || 1

  const explainedVariance = eigenvalues.map((e) =>
    Math.round((e / totalVariance) * 1000) / 10
  )

  const cumulativeVariance = explainedVariance.reduce<number[]>((acc, val) => {
    acc.push((acc[acc.length - 1] ?? 0) + val)
    return acc
  }, [])

  // Factor loadings: loading[f][j] = eigenvector[j] * sqrt(eigenvalue)
  const loadings = eigenvectors.map((vec, f) =>
    vec.map((v) => v * Math.sqrt(eigenvalues[f]))
  )

  // Factor scores: project standardized data onto eigenvectors
  const means = Array.from({ length: p }, (_, j) =>
    data.reduce((s, row) => s + row[j], 0) / n
  )
  const sds = Array.from({ length: p }, (_, j) => {
    const v = data.reduce((s, row) => s + (row[j] - means[j]) ** 2, 0) / n
    return Math.sqrt(v)
  })
  const std = data.map((row) =>
    row.map((val, j) => (sds[j] > 0 ? (val - means[j]) / sds[j] : 0))
  )

  const factorScores = std.map((row) =>
    eigenvectors.map((vec) => row.reduce((s, val, j) => s + val * vec[j], 0))
  )

  return { eigenvalues, explainedVariance, cumulativeVariance, loadings, factorScores }
}

// ── IRT characteristic curve points (for chart) ───────────────

export function irtCurvePoints(
  a: number,
  b: number,
  steps = 30
): Array<{ theta: number; probability: number }> {
  const points: Array<{ theta: number; probability: number }> = []
  for (let i = 0; i <= steps; i++) {
    const theta = -3 + (6 * i) / steps
    points.push({ theta, probability: irt2PLProbability(theta, a, b) })
  }
  return points
}

// Reuse irt2PLProbability for curve
function irt2PLProb(theta: number, a: number, b: number): number {
  return 1 / (1 + Math.exp(-a * (theta - b)))
}
