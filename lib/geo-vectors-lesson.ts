/**
 * Vecteurs et Translations — lesson module
 *
 * Architecture note
 * ─────────────────
 * `getPublicQuestions()` → safe for client components (no isCorrect)
 * `scoreLesson()`        → server-only (API routes), computes per-competency scores
 * `COMPETENCY_LABELS`    → displayed to student in results screen only
 *
 * Data schema (data/lesson-results.json):
 * {
 *   id, userId, testId, lessonTitle, submittedAt,
 *   selectedChoices: Record<questionId, choiceId>,
 *   globalCorrect, globalTotal, globalPercent,
 *   competencyScores: [{ competency, correct, total, percent }],
 *   diagnosticAnswer: string | null
 * }
 */

export const VECTORS_TEST_ID    = 'test-geo-vectors'
export const VECTORS_DOMAIN_ID  = 'geometry-learning'
export const VECTORS_LESSON_TITLE = 'Vecteurs et Translations'

// ─── Competency metadata (shown in results only) ──────────────────────────────

export const COMPETENCY_LABELS: Record<string, string> = {
  C1: 'Définitions et propriétés du produit scalaire',
  C3: 'Théorèmes géométriques (Al-Kashi, médiane)',
}

// ─── Public types (no correctness — safe for client bundle) ──────────────────

export interface PublicChoice {
  id: string
  text: string
}

export interface PublicQuestion {
  id: string
  label: string              // "Q1", "Q2", …
  competency: string | null  // "C1" | "C3" | null (null = diagnostic, not scored)
  text: string
  choices: PublicChoice[]
  isDiagnostic?: boolean
}

export interface CompetencyScore {
  competency: string
  label: string    // human-readable label from COMPETENCY_LABELS
  correct: number
  total: number
  percent: number
}

export interface LessonScoreResult {
  testId: string
  globalCorrect: number
  globalTotal: number      // excludes diagnostic Q1
  globalPercent: number
  competencyScores: CompetencyScore[]
  diagnosticAnswer: string | null
}

// ─── Private question data (isCorrect — server-side only) ────────────────────

interface PrivateChoice extends PublicChoice {
  isCorrect: boolean
}

interface PrivateQuestion extends Omit<PublicQuestion, 'choices'> {
  choices: PrivateChoice[]
}

const PRIVATE_QUESTIONS: PrivateQuestion[] = [
  // ── Q1 — Diagnostic (not scored) ──────────────────────────────────────────
  {
    id: 'vt-q1',
    label: 'Q1',
    competency: null,
    isDiagnostic: true,
    text: 'À quel degré te rappelles-tu la leçon du produit scalaire ?',
    choices: [
      { id: 'vt-q1-a', text: "J'ai tout oublié",                 isCorrect: false },
      { id: 'vt-q1-b', text: 'Je me rappelle quelques parties',   isCorrect: false },
      { id: 'vt-q1-c', text: 'Je me rappelle bien',               isCorrect: false },
      { id: 'vt-q1-d', text: 'Je me rappelle tout',               isCorrect: false },
    ],
  },

  // ── Q2 — C1 ───────────────────────────────────────────────────────────────
  {
    id: 'vt-q2',
    label: 'Q2',
    competency: 'C1',
    text: 'Le produit scalaire des vecteurs U⃗(a, c) et V⃗(b, d) est :',
    choices: [
      { id: 'vt-q2-a', text: '‖U⃗‖ · ‖V⃗‖ · cos(U⃗, V⃗)',     isCorrect: true  },
      { id: 'vt-q2-b', text: '‖U⃗‖ · ‖V⃗‖ · sin(U⃗, V⃗)',     isCorrect: false },
      { id: 'vt-q2-c', text: 'ab + cd',                          isCorrect: true  },
      { id: 'vt-q2-d', text: "J'ai tout oublié",                 isCorrect: false },
    ],
  },

  // ── Q3 — C1 ───────────────────────────────────────────────────────────────
  {
    id: 'vt-q3',
    label: 'Q3',
    competency: 'C1',
    text: "Si l'un des vecteurs U⃗ ou V⃗ est nul, alors :",
    choices: [
      { id: 'vt-q3-a', text: 'U⃗ · V⃗ = 0',                     isCorrect: true  },
      { id: 'vt-q3-b', text: 'U⃗ · V⃗ = vecteur nul',            isCorrect: false },
      { id: 'vt-q3-c', text: 'U⃗ et V⃗ sont orthogonaux',         isCorrect: false },
      { id: 'vt-q3-d', text: "J'ai oublié",                      isCorrect: false },
    ],
  },

  // ── Q4 — C1 ───────────────────────────────────────────────────────────────
  {
    id: 'vt-q4',
    label: 'Q4',
    competency: 'C1',
    text: 'Si U⃗ et V⃗ sont perpendiculaires :',
    choices: [
      { id: 'vt-q4-a', text: 'U⃗ · V⃗ = 0',                     isCorrect: true  },
      { id: 'vt-q4-b', text: 'U⃗ · V⃗ = vecteur nul',            isCorrect: false },
      { id: 'vt-q4-c', text: 'U⃗ ou V⃗ est nul',                  isCorrect: false },
      { id: 'vt-q4-d', text: "J'ai oublié",                      isCorrect: false },
    ],
  },

  // ── Q5 — C3 (two correct answers — any one gives full credit) ─────────────
  {
    id: 'vt-q5',
    label: 'Q5',
    competency: 'C3',
    text: "Théorème d'Al-Kashi — sélectionner une expression correcte :",
    choices: [
      { id: 'vt-q5-a', text: 'BC² = AB² + AC² − 2 · AB⃗ · AC⃗', isCorrect: true  },
      { id: 'vt-q5-b', text: 'AB² = CB² + CA² − 2 · CB⃗ · CA⃗', isCorrect: true  },
      { id: 'vt-q5-c', text: "J'ai oublié",                      isCorrect: false },
    ],
  },

  // ── Q6 — C3 ───────────────────────────────────────────────────────────────
  {
    id: 'vt-q6',
    label: 'Q6',
    competency: 'C3',
    text: 'Théorème de la médiane — I milieu de BC :',
    choices: [
      { id: 'vt-q6-a', text: 'AB² + AC² = ½ BC² + 2 AI²',       isCorrect: true  },
      { id: 'vt-q6-b', text: 'AC² + BC² = ½ AB² + 2 BI²',       isCorrect: false },
      { id: 'vt-q6-c', text: "J'ai oublié",                      isCorrect: false },
    ],
  },

  // ── Q7 — C1 ───────────────────────────────────────────────────────────────
  {
    id: 'vt-q7',
    label: 'Q7',
    competency: 'C1',
    text: 'Déterminant det(U⃗, V⃗) avec U⃗(a, b) et V⃗(c, d) :',
    choices: [
      { id: 'vt-q7-a', text: 'ac − bd',                          isCorrect: false },
      { id: 'vt-q7-b', text: 'ab − bc',                          isCorrect: false },
      { id: 'vt-q7-c', text: 'ad − bc',                          isCorrect: true  },
    ],
  },

  // ── Q8 — C1 ───────────────────────────────────────────────────────────────
  {
    id: 'vt-q8',
    label: 'Q8',
    competency: 'C1',
    text: 'Équation du cercle de centre Ω(x₀, y₀) et de rayon 3 :',
    choices: [
      { id: 'vt-q8-a', text: '(x − x₀)² + (y − y₀)² = 3',      isCorrect: false },
      { id: 'vt-q8-b', text: '(x − x₀)² + (y − y₀)² = 9',      isCorrect: true  },
      { id: 'vt-q8-c', text: 'x² + y² = 2x + 2y + 9',           isCorrect: false },
      { id: 'vt-q8-d', text: "J'ai oublié",                      isCorrect: false },
    ],
  },

  // ── Q9 — C1 ───────────────────────────────────────────────────────────────
  {
    id: 'vt-q9',
    label: 'Q9',
    competency: 'C1',
    text: 'Distance entre Ω(3, 4) et la droite (D) : ax + by + c = 0 :',
    choices: [
      { id: 'vt-q9-a', text: '|4a + 3b + c| / √(a² + b²)',      isCorrect: false },
      { id: 'vt-q9-b', text: '|3a + 4b + c| / √(a² + c²)',      isCorrect: false },
      { id: 'vt-q9-c', text: '|3a + 4b + c| / √(a² + b²)',      isCorrect: true  },
      { id: 'vt-q9-d', text: "J'ai oublié",                      isCorrect: false },
    ],
  },
]

// ─── Public API ───────────────────────────────────────────────────────────────

/** Questions without isCorrect — import this in client components. */
export function getPublicQuestions(): PublicQuestion[] {
  return PRIVATE_QUESTIONS.map(({ choices, ...rest }) => ({
    ...rest,
    choices: choices.map(({ id, text }) => ({ id, text })),
  }))
}

/**
 * Score a lesson attempt.
 * @param selectedChoiceIds  Map of questionId → choiceId (one answer per question)
 *
 * Scoring rules:
 * - Q1 is diagnostic and not scored.
 * - Any question with at least one correct choice: selecting a correct choice = +1.
 * - No answer = 0. Wrong answer = 0.
 * - Score per competency = (correct / total) × 100.
 *
 * Call this ONLY in server-side code (API routes).
 */
export function scoreLesson(
  selectedChoiceIds: Record<string, string>,
): LessonScoreResult {
  const compMap: Record<string, { correct: number; total: number }> = {}
  let globalCorrect = 0
  let globalTotal   = 0
  let diagnosticAnswer: string | null = null

  for (const q of PRIVATE_QUESTIONS) {
    if (q.isDiagnostic) {
      const c = q.choices.find((x) => x.id === selectedChoiceIds[q.id])
      diagnosticAnswer = c?.text ?? null
      continue
    }

    globalTotal++
    const comp = q.competency!
    if (!compMap[comp]) compMap[comp] = { correct: 0, total: 0 }
    compMap[comp].total++

    const selectedId = selectedChoiceIds[q.id]
    if (!selectedId) continue

    if (q.choices.find((c) => c.id === selectedId)?.isCorrect) {
      globalCorrect++
      compMap[comp].correct++
    }
  }

  const competencyScores: CompetencyScore[] = Object.entries(compMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([competency, { correct, total }]) => ({
      competency,
      label: COMPETENCY_LABELS[competency] ?? competency,
      correct,
      total,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))

  return {
    testId: VECTORS_TEST_ID,
    globalCorrect,
    globalTotal,
    globalPercent:
      globalTotal > 0 ? Math.round((globalCorrect / globalTotal) * 100) : 0,
    competencyScores,
    diagnosticAnswer,
  }
}
