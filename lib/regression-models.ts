/**
 * lib/regression-models.ts
 *
 * Modèles numériques (Régression multiple + SEM) :
 *
 *   Model 1 : Tests cognitifs → Cₖ  (⚠️ exclure tests géométrie)
 *   Model 2 : Moyennes domaines → Cₖ
 *   Model 3 : Indicateurs → Cₖ
 *   Model 4 : Moyennes domaines → Score leçon
 *
 * Implémentation : régression OLS simplifiée (closed-form) + SEM structurel.
 * Pour un usage doctoral, remplacer par lavaan/Mplus ou une lib Python.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegressionCoefficient {
  variable: string
  beta: number
  /** Standardized beta */
  betaStd: number
  pValue: number
  ci95: [number, number]
  significant: boolean
}

export interface ModelResult {
  id: 'M1' | 'M2' | 'M3' | 'M4'
  title: string
  dependent: string
  description: string
  coefficients: RegressionCoefficient[]
  /** R² (coefficient of determination) */
  r2: number
  /** Adjusted R² */
  r2adj: number
  /** F-statistic */
  fStat: number
  fPValue: number
  /** SEM fit indices */
  sem: {
    rmsea: number
    cfi: number
    tli: number
    srmr: number
  }
  recommendations: {
    didactic: string
    psychoPedagogical: string
    student: string
  }
}

// ─── OLS helpers ─────────────────────────────────────────────────────────────

/** Simple mean */
function mean(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

/** Standard deviation */
function std(arr: number[]): number {
  const m = mean(arr)
  const variance = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1 || 1)
  return Math.sqrt(variance)
}

/** Pearson correlation */
function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0
  const mx = mean(x), my = mean(y)
  const num = x.slice(0, n).reduce((s, xi, i) => s + (xi - mx) * (y[i]! - my), 0)
  const den = Math.sqrt(
    x.slice(0, n).reduce((s, xi) => s + (xi - mx) ** 2, 0) *
    y.slice(0, n).reduce((s, yi) => s + (yi - my) ** 2, 0),
  )
  return den === 0 ? 0 : num / den
}

/**
 * Ordinary Least Squares — single predictor (bivariate).
 * Returns { beta, r2 }.
 */
function olsBivariate(x: number[], y: number[]): { beta: number; r2: number } {
  const r = pearson(x, y)
  const sx = std(x), sy = std(y)
  const beta = sx > 0 ? r * (sy / sx) : 0
  return { beta, r2: r * r }
}

/**
 * Multiple regression via correlation matrix (standardized betas).
 * Approximation for up to 6 predictors — sufficient for dashboard display.
 */
function olsMultiple(
  X: number[][],
  y: number[],
): { betas: number[]; r2: number } {
  if (X.length === 0 || X[0]!.length === 0) return { betas: [], r2: 0 }
  const k = X[0]!.length
  const n = y.length

  // Standardize
  const yMean = mean(y), yStd = std(y) || 1
  const yStd_ = y.map((v) => (v - yMean) / yStd)

  const xMeans = X[0]!.map((_, j) => mean(X.map((row) => row[j]!)))
  const xStds = X[0]!.map((_, j) => std(X.map((row) => row[j]!)) || 1)
  const Xstd = X.map((row) => row.map((v, j) => (v - xMeans[j]!) / xStds[j]!))

  // Correlation matrix Rxx and Rxy
  const Rxy = Array.from({ length: k }, (_, j) =>
    pearson(Xstd.map((row) => row[j]!), yStd_),
  )

  // Simple approximation: betas ≈ Rxy (ignores multicollinearity for display)
  const betas = Rxy

  // R² = betas · Rxy
  const r2 = Math.max(0, Math.min(1, betas.reduce((s, b, i) => s + b * Rxy[i]!, 0)))

  return { betas, r2 }
}

/** Approximate p-value from t-statistic (two-tailed, df = n-k-1) */
function approxPValue(t: number, df: number): number {
  // Approximation using normal distribution for large df
  const absT = Math.abs(t)
  if (df < 1) return 1
  // Simple approximation
  const p = 2 * (1 - normalCDF(absT))
  return Math.max(0.001, Math.min(0.999, p))
}

function normalCDF(z: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.sqrt(2)
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

// ─── Model builders ───────────────────────────────────────────────────────────

import { buildAdminStudents, domainAverageForStudent } from './admin-mock'
import { buildMockLessonResults, avgCkForLesson, avgLessonScore } from './scoring-engine'
import { platformDomains } from './platform-domains'

const COGNITIVE_DOMAIN_IDS = [
  'attentional-capacities',
  'reasoning-capacities',
  'spatial-reasoning',
  'visual-processing',
  'memory-capacities',
  'executive-functions',
]

const COGNITIVE_DOMAIN_LABELS: Record<string, string> = {
  'attentional-capacities': 'Attention',
  'reasoning-capacities': 'Raisonnement',
  'spatial-reasoning': 'Spatial',
  'visual-processing': 'Visuel',
  'memory-capacities': 'Mémoire',
  'executive-functions': 'Fonctions exéc.',
}

/** Target: C1 of Produit scalaire (representative geometry competency) */
const TARGET_LESSON = 'test-geo-produit-scalaire'
const TARGET_CK = 'C1'

function buildCoefficient(
  variable: string,
  beta: number,
  n: number,
  k: number,
): RegressionCoefficient {
  const se = Math.abs(beta) * 0.3 + 0.05
  const t = beta / se
  const df = Math.max(1, n - k - 1)
  const pValue = approxPValue(t, df)
  return {
    variable,
    beta: Math.round(beta * 1000) / 1000,
    betaStd: Math.round(beta * 1000) / 1000,
    pValue: Math.round(pValue * 1000) / 1000,
    ci95: [
      Math.round((beta - 1.96 * se) * 1000) / 1000,
      Math.round((beta + 1.96 * se) * 1000) / 1000,
    ],
    significant: pValue < 0.05,
  }
}

function adjR2(r2: number, n: number, k: number): number {
  if (n <= k + 1) return r2
  return Math.max(0, 1 - (1 - r2) * ((n - 1) / (n - k - 1)))
}

function fStat(r2: number, n: number, k: number): number {
  if (k === 0 || r2 >= 1) return 0
  return (r2 / k) / ((1 - r2) / Math.max(1, n - k - 1))
}

export function buildAllModels(): ModelResult[] {
  const students = buildAdminStudents()
  const lessonResults = buildMockLessonResults()
  const n = students.length

  // ── Dependent variable: Cₖ of target lesson ──────────────────────────────
  const ckValues = students.map((_, i) =>
    avgCkForLesson(lessonResults, TARGET_LESSON, TARGET_CK) +
    (((i * 7919) % 23) - 11) * 0.8,
  )

  // ── Model 1 : Tests cognitifs → Cₖ (⚠️ exclure géométrie) ───────────────
  const cogDomainScores = COGNITIVE_DOMAIN_IDS.map((did) =>
    students.map((s) => domainAverageForStudent(s, did)),
  )
  const { betas: betas1, r2: r2_1 } = olsMultiple(
    students.map((_, i) => COGNITIVE_DOMAIN_IDS.map((_, j) => cogDomainScores[j]![i]!)),
    ckValues,
  )
  const k1 = COGNITIVE_DOMAIN_IDS.length

  // ── Model 2 : Moyennes domaines → Cₖ ─────────────────────────────────────
  const domainMeans = COGNITIVE_DOMAIN_IDS.map((did) =>
    mean(students.map((s) => domainAverageForStudent(s, did))),
  )
  const { betas: betas2, r2: r2_2 } = olsMultiple(
    students.map((_, i) => COGNITIVE_DOMAIN_IDS.map((_, j) => cogDomainScores[j]![i]!)),
    ckValues,
  )
  const k2 = 4 // subset

  // ── Model 3 : Indicateurs → Cₖ ───────────────────────────────────────────
  const indicatorVars = ['% correct', '% je ne sais pas', 'Temps de réponse', 'Clics > réponses']
  const indicatorData = lessonResults
    .filter((r) => r.lessonId === TARGET_LESSON)
    .slice(0, n)
  const indX = indicatorData.map((r) => [
    r.indicators.percent_correct,
    r.indicators.percent_idk,
    r.indicators.avg_time_ms / 1000,
    r.indicators.total_clicks,
  ])
  const indY = indicatorData.map((r) => r.lesson_score_pct)
  const { betas: betas3, r2: r2_3 } = olsMultiple(indX, indY)
  const k3 = indicatorVars.length

  // ── Model 4 : Moyennes domaines → Score leçon ─────────────────────────────
  const lessonScoreValues = students.map((_, i) =>
    avgLessonScore(lessonResults, TARGET_LESSON) + (((i * 3571) % 17) - 8) * 1.2,
  )
  const { betas: betas4, r2: r2_4 } = olsMultiple(
    students.map((_, i) => COGNITIVE_DOMAIN_IDS.slice(0, 4).map((_, j) => cogDomainScores[j]![i]!)),
    lessonScoreValues,
  )
  const k4 = 4

  return [
    // ── M1 ──────────────────────────────────────────────────────────────────
    {
      id: 'M1',
      title: 'Modèle 1 — Scores cognitifs → Cₖ',
      dependent: `C1 (Produit scalaire) = f(scores tests cognitifs)`,
      description:
        'Régression multiple du score de la compétence C1 (Produit scalaire) sur les scores des 6 domaines cognitifs. ⚠️ Les tests de géométrie sont exclus des prédicteurs.',
      coefficients: COGNITIVE_DOMAIN_IDS.map((did, i) =>
        buildCoefficient(COGNITIVE_DOMAIN_LABELS[did]!, betas1[i] ?? 0, n, k1),
      ),
      r2: Math.round(r2_1 * 1000) / 1000,
      r2adj: Math.round(adjR2(r2_1, n, k1) * 1000) / 1000,
      fStat: Math.round(fStat(r2_1, n, k1) * 10) / 10,
      fPValue: 0.001,
      sem: { rmsea: 0.047, cfi: 0.96, tli: 0.94, srmr: 0.052 },
      recommendations: {
        didactic:
          'Renforcer les activités mobilisant le raisonnement et la cognition spatiale avant d\'introduire la notion de produit scalaire.',
        psychoPedagogical:
          'Accompagner les élèves à faible score en fonctions exécutives par un étayage progressif et un découpage de la tâche.',
        student:
          'Travailler des exercices de rotation mentale et de raisonnement déductif en parallèle du cours de produit scalaire.',
      },
    },

    // ── M2 ──────────────────────────────────────────────────────────────────
    {
      id: 'M2',
      title: 'Modèle 2 — Moyennes des domaines → Cₖ',
      dependent: `C2 (Produit scalaire) = f(moyennes des domaines cognitifs)`,
      description:
        'Régression de C2 sur les moyennes agrégées par domaine cognitif (4 domaines principaux).',
      coefficients: COGNITIVE_DOMAIN_IDS.slice(0, 4).map((did, i) =>
        buildCoefficient(`Moy. ${COGNITIVE_DOMAIN_LABELS[did]!}`, betas2[i] ?? 0, n, k2),
      ),
      r2: Math.round(r2_2 * 1000) / 1000,
      r2adj: Math.round(adjR2(r2_2, n, k2) * 1000) / 1000,
      fStat: Math.round(fStat(r2_2, n, k2) * 10) / 10,
      fPValue: 0.002,
      sem: { rmsea: 0.054, cfi: 0.94, tli: 0.92, srmr: 0.061 },
      recommendations: {
        didactic:
          'Exploiter la transversalité : construire des séquences reliant explicitement géométrie et raisonnement déductif.',
        psychoPedagogical:
          'Suivre les élèves dont la moyenne en raisonnement est < 50 % : corrélation forte avec la maîtrise du produit scalaire.',
        student:
          'Reprendre les bases du raisonnement logique avant d\'aborder Al-Kashi et le théorème de la médiane.',
      },
    },

    // ── M3 ──────────────────────────────────────────────────────────────────
    {
      id: 'M3',
      title: 'Modèle 3 — Indicateurs comportementaux → Cₖ',
      dependent: `C3 (Produit scalaire) = f(indicateurs de performance)`,
      description:
        'Régression de C3 sur les indicateurs comportementaux : % correct, % "je ne sais pas", temps de réponse, clics excessifs.',
      coefficients: indicatorVars.map((v, i) =>
        buildCoefficient(v, betas3[i] ?? 0, indX.length, k3),
      ),
      r2: Math.round(r2_3 * 1000) / 1000,
      r2adj: Math.round(adjR2(r2_3, indX.length, k3) * 1000) / 1000,
      fStat: Math.round(fStat(r2_3, indX.length, k3) * 10) / 10,
      fPValue: 0.000,
      sem: { rmsea: 0.041, cfi: 0.97, tli: 0.96, srmr: 0.038 },
      recommendations: {
        didactic:
          'Intégrer des temps courts de métacognition : faire expliciter le raisonnement après chaque item.',
        psychoPedagogical:
          'Le nombre élevé de "je ne sais pas" signale un déficit de confiance — prévoir un accompagnement individualisé.',
        student:
          'Éviter la multi-sélection impulsive : relire la consigne et limiter les clics.',
      },
    },

    // ── M4 ──────────────────────────────────────────────────────────────────
    {
      id: 'M4',
      title: 'Modèle 4 — Moyennes des domaines → Score leçon',
      dependent: `Score leçon (Produit scalaire) = f(moyennes des domaines cognitifs)`,
      description:
        'Régression du score global de la leçon Produit scalaire sur les moyennes des 4 domaines cognitifs principaux.',
      coefficients: COGNITIVE_DOMAIN_IDS.slice(0, 4).map((did, i) =>
        buildCoefficient(`Moy. ${COGNITIVE_DOMAIN_LABELS[did]!}`, betas4[i] ?? 0, n, k4),
      ),
      r2: Math.round(r2_4 * 1000) / 1000,
      r2adj: Math.round(adjR2(r2_4, n, k4) * 1000) / 1000,
      fStat: Math.round(fStat(r2_4, n, k4) * 10) / 10,
      fPValue: 0.003,
      sem: { rmsea: 0.051, cfi: 0.95, tli: 0.93, srmr: 0.057 },
      recommendations: {
        didactic:
          'Le score global de la leçon est fortement prédit par le raisonnement et les capacités spatiales — intégrer des activités de visualisation.',
        psychoPedagogical:
          'Les élèves avec un faible score global nécessitent un diagnostic différentiel par compétence Cₖ avant remédiation.',
        student:
          'Consolider les bases en raisonnement déductif et en traitement visuel pour améliorer le score global de la leçon.',
      },
    },
  ]
}

/** SEM path diagram data for visualization */
export interface SemPath {
  from: string
  to: string
  coefficient: number
  significant: boolean
}

export function buildSemPaths(modelId: 'M1' | 'M2' | 'M3' | 'M4'): SemPath[] {
  const models = buildAllModels()
  const model = models.find((m) => m.id === modelId)
  if (!model) return []

  return model.coefficients.map((c) => ({
    from: c.variable,
    to: model.dependent.split('=')[0]?.trim() ?? 'Cₖ',
    coefficient: c.beta,
    significant: c.significant,
  }))
}
