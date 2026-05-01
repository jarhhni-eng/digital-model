/**
 * Deterministic mock data powering the isolated Admin dashboard.
 *
 * Uses ONLY predefined domains/tests from `lib/platform-domains.ts`.
 * No undefined domains or tests are introduced here.
 */
import { platformDomains } from './platform-domains'
import { mockInstitutions, mockTeacherGroups } from './mock-groups'

// Deterministic pseudo-random — seeded, same output every render.
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export interface AdminStudent {
  id: string
  name: string
  groupId: string
  level: string
  institutionId: string
  filiere: string
  testScores: Record<string, number> // testId → 0..100
}

const FILIERES = ['Sciences Mathématiques', 'Sciences Expérimentales', 'Sciences Humaines']

const allTestIds = platformDomains.flatMap((d) =>
  d.subdomains.flatMap((s) => s.capacities.map((c) => c.testId))
)

function scoreFor(rand: () => number, bias = 0): number {
  const v = Math.round(50 + bias + (rand() - 0.5) * 55)
  return Math.max(0, Math.min(100, v))
}

function firstNames(i: number) {
  const names = ['Youssef', 'Salma', 'Imane', 'Mehdi', 'Zineb', 'Karim', 'Nadia', 'Omar',
    'Sara', 'Hamza', 'Lina', 'Rayane', 'Aya', 'Anas', 'Yasmine', 'Ismail']
  return names[i % names.length]
}
function lastNames(i: number) {
  const names = ['El Amrani', 'Benali', 'Alaoui', 'Tazi', 'Fassi', 'Idrissi', 'Bennani',
    'Berrada', 'Kadiri', 'Saidi', 'Chraibi', 'Lamrani']
  return names[i % names.length]
}

export function buildAdminStudents(): AdminStudent[] {
  const rand = rng(42)
  const students: AdminStudent[] = []
  let counter = 0
  for (const grp of mockTeacherGroups) {
    for (let k = 0; k < grp.studentCount; k++) {
      counter++
      const filiere = FILIERES[counter % FILIERES.length]
      const groupBias = grp.level.includes('1st') ? 8 : -4
      const filiereBias = filiere === 'Sciences Mathématiques' ? 6 : 0
      const testScores: Record<string, number> = {}
      for (const tid of allTestIds) {
        testScores[tid] = scoreFor(rand, groupBias + filiereBias)
      }
      students.push({
        id: `stu-${counter}`,
        name: `${firstNames(counter)} ${lastNames(counter + 3)}`,
        groupId: grp.id,
        level: grp.level,
        institutionId: grp.institutionId,
        filiere,
        testScores,
      })
    }
  }
  return students
}

// ─── Aggregation helpers ─────────────────────────────────────────────────────

export function domainAverageForStudent(s: AdminStudent, domainId: string): number {
  const dom = platformDomains.find((d) => d.id === domainId)
  if (!dom) return 0
  const ids = dom.subdomains.flatMap((sd) => sd.capacities.map((c) => c.testId))
  const scores = ids.map((t) => s.testScores[t] ?? 0)
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
}

export function avg(arr: number[]): number {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
}

// ─── Geometry-only performance indicators ────────────────────────────────────

export interface LessonIndicator {
  lessonId: string
  lessonName: string
  pctCorrect: number          // % correct
  pctIDK: number              // % "je ne sais pas"
  pctMultiSelectOn1: number   // multi-selection where 1 correct expected
  pctSingleSelectOnMulti: number
  totalClicks: number
  clicksExceedCorrect: number
  avgResponseTimeSec: number
}

export function buildGeometryIndicators(): LessonIndicator[] {
  const rand = rng(7)
  const geo = platformDomains.find((d) => d.id === 'geometry-learning')
  if (!geo) return []
  return geo.subdomains.map((sd) => ({
    lessonId: sd.id,
    lessonName: sd.nameFr ?? sd.name,
    pctCorrect: Math.round(45 + rand() * 40),
    pctIDK: Math.round(5 + rand() * 20),
    pctMultiSelectOn1: Math.round(3 + rand() * 15),
    pctSingleSelectOnMulti: Math.round(5 + rand() * 20),
    totalClicks: Math.round(120 + rand() * 400),
    clicksExceedCorrect: Math.round(15 + rand() * 80),
    avgResponseTimeSec: Math.round(20 + rand() * 80),
  }))
}

// ─── SEM / Regression mock coefficients ──────────────────────────────────────

export interface ModelCoefficient {
  variable: string
  beta: number
  pValue: number
  ci: [number, number]
}
export interface SemModel {
  id: string
  title: string
  dependent: string
  description: string
  coefficients: ModelCoefficient[]
  r2: number
  rmsea: number
  cfi: number
  recommendations: {
    didactic: string
    psychoPedagogical: string
    student: string
  }
}

export function buildModels(): SemModel[] {
  return [
    {
      id: 'm1',
      title: 'Modèle 1 — Scores cognitifs',
      dependent: 'C1 (Produit scalaire) = f(scores cognitifs)',
      description: 'Régression du score de la compétence C1 sur les scores cognitifs des 6 domaines.',
      coefficients: [
        { variable: 'Attention',         beta: 0.12, pValue: 0.041, ci: [0.01, 0.23] },
        { variable: 'Raisonnement',      beta: 0.31, pValue: 0.001, ci: [0.18, 0.44] },
        { variable: 'Spatial',           beta: 0.27, pValue: 0.002, ci: [0.13, 0.41] },
        { variable: 'Visuel',            beta: 0.18, pValue: 0.014, ci: [0.05, 0.31] },
        { variable: 'Mémoire',           beta: 0.09, pValue: 0.112, ci: [-0.02, 0.20] },
        { variable: 'Fonctions exéc.',   beta: 0.22, pValue: 0.006, ci: [0.08, 0.36] },
      ],
      r2: 0.58, rmsea: 0.047, cfi: 0.96,
      recommendations: {
        didactic: 'Renforcer les activités mobilisant le raisonnement et la cognition spatiale avant d\'introduire la notion de produit scalaire.',
        psychoPedagogical: 'Accompagner les élèves à faible score en fonctions exécutives par un étayage progressif et un découpage de la tâche.',
        student: 'Travailler des exercices de rotation mentale et de raisonnement déductif en parallèle du cours de produit scalaire.',
      },
    },
    {
      id: 'm2',
      title: 'Modèle 2 — Moyennes des domaines',
      dependent: 'C2 (Produit scalaire) = f(moyennes des domaines)',
      description: 'Régression de C2 sur les moyennes agrégées par domaine cognitif.',
      coefficients: [
        { variable: 'Moy. Attention',     beta: 0.14, pValue: 0.028, ci: [0.02, 0.26] },
        { variable: 'Moy. Raisonnement',  beta: 0.34, pValue: 0.000, ci: [0.21, 0.47] },
        { variable: 'Moy. Spatial',       beta: 0.25, pValue: 0.003, ci: [0.11, 0.39] },
        { variable: 'Moy. Visuel',        beta: 0.16, pValue: 0.021, ci: [0.03, 0.29] },
      ],
      r2: 0.51, rmsea: 0.054, cfi: 0.94,
      recommendations: {
        didactic: 'Exploiter la transversalité : construire des séquences reliant explicitement géométrie et raisonnement déductif.',
        psychoPedagogical: 'Suivre les élèves dont la moyenne en raisonnement est < 50 % : corrélation forte avec la maîtrise du produit scalaire.',
        student: 'Reprendre les bases du raisonnement logique avant d\'aborder Al-Kashi et le théorème de la médiane.',
      },
    },
    {
      id: 'm3',
      title: 'Modèle 3 — Indicateurs de performance',
      dependent: 'C3 (Produit scalaire) = f(indicateurs comportementaux)',
      description: 'Régression de C3 sur les indicateurs comportementaux (clics, temps, « je ne sais pas »).',
      coefficients: [
        { variable: '% correct',            beta: 0.46, pValue: 0.000, ci: [0.32, 0.60] },
        { variable: '% je ne sais pas',     beta: -0.28, pValue: 0.001, ci: [-0.42, -0.14] },
        { variable: 'Temps de réponse',     beta: -0.12, pValue: 0.067, ci: [-0.25, 0.01] },
        { variable: 'Clics > réponses',     beta: -0.19, pValue: 0.011, ci: [-0.33, -0.05] },
      ],
      r2: 0.63, rmsea: 0.041, cfi: 0.97,
      recommendations: {
        didactic: 'Intégrer des temps courts de métacognition : faire expliciter le raisonnement après chaque item.',
        psychoPedagogical: 'Le nombre élevé de « je ne sais pas » signale un déficit de confiance ou de compréhension — prévoir un accompagnement individualisé.',
        student: 'Éviter la multi-sélection impulsive : relire la consigne et limiter les clics.',
      },
    },
  ]
}

export { mockInstitutions, mockTeacherGroups }
