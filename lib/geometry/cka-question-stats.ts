/**
 * Question-level scores for the geometry cognition tests.
 * Reads the live banks. Does not change questions, keys, or scoring.
 */
import { DROITE_PLAN_QUESTIONS } from '@/lib/geometry/droite-plan'
import { GEO_SPACE_QUESTIONS } from '@/lib/geometry/geo-space'
import { VECTORS_QUESTIONS } from '@/lib/geometry/geo-vectors-complete'
import { PRODUIT_SCALAIRE_QUESTIONS } from '@/lib/geometry/produit-scalaire'
import { PRODUIT_SCALAIRE_TC_QUESTIONS } from '@/lib/geometry/produit-scalaire-tronc-commun'
import { SPACE_VOLUMES_LIVE_QUESTIONS } from '@/lib/geometry/space-volumes'
import { SYMETRIE_AXIALE_QUESTIONS } from '@/lib/geometry/symetrie-axiale'
import { SYMETRIE_CENTRALE_QUESTIONS } from '@/lib/geometry/symetrie-centrale'
import { TRIG_CIRCLE_QUESTIONS } from '@/lib/geometry/trig-unit-circle'
import { isExcludedFromGeometryScoreAndAverage } from '@/lib/geometry/geometry-scoring-exclusions'
import { geometryCognitionTestIds, platformDomains } from '@/lib/platform-domains'

export type AutoevalSlot = 1 | 2 | 3

export type CkaQuestionDef = {
  id: string
  number: number
  prompt: string
  options: string[]
  correct: number[]
  multi: boolean
  autoSlot: AutoevalSlot | null
  scorable: boolean
}

type LooseQuestion = {
  id?: string
  number?: number
  question?: string
  options?: string[]
  correctAnswer?: number | number[] | null
  allowMultiple?: boolean
  isDiagnostic?: boolean
  isAutoeval?: boolean
  isOpenEnded?: boolean
  part?: string | number
  points?: number
  interactiveLine?: unknown
  pointPlacement?: unknown
  sequentialPlacement?: boolean
  fillIn?: unknown
  keyVerified?: boolean
  isDiagnosticQuestion?: boolean
}

const BANKS: Record<string, LooseQuestion[]> = {
  'test-geo-symetrie-axiale': SYMETRIE_AXIALE_QUESTIONS as LooseQuestion[],
  'test-geo-central-sym': SYMETRIE_CENTRALE_QUESTIONS as LooseQuestion[],
  'test-geo-produit-scalaire': PRODUIT_SCALAIRE_QUESTIONS as LooseQuestion[],
  'test-geo-produit-scalaire-tc': PRODUIT_SCALAIRE_TC_QUESTIONS as LooseQuestion[],
  'test-geo-space-volumes': SPACE_VOLUMES_LIVE_QUESTIONS as LooseQuestion[],
  'test-geo-vectors-complete': VECTORS_QUESTIONS as LooseQuestion[],
  'test-geo-line-plane': DROITE_PLAN_QUESTIONS as LooseQuestion[],
  'test-geo-space': GEO_SPACE_QUESTIONS as LooseQuestion[],
  'test-geo-trig-circle': TRIG_CIRCLE_QUESTIONS as LooseQuestion[],
}

const MEMORY_CODES: Record<string, number> = {
  "j'ai completement oublie la lecon": 1,
  'je me rappelle de quelques notions seulement': 2,
  'je me rappelle globalement la lecon': 3,
  'je maitrise bien la lecon': 4,
}

const DEMO_CODES: Record<string, number> = {
  'tres facile': 1,
  facile: 2,
  difficile: 3,
  'tres difficile': 4,
}

export function plainText(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\\((.+?)\\\)/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeAnswer(value: string): string {
  return plainText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, "'")
    .toLowerCase()
    .trim()
}

function autoSlotOf(question: LooseQuestion): AutoevalSlot | null {
  const id = String(question.id ?? '')
  const part = String(question.part ?? '')
  if (id === 'AE3' || part === 'autoeval3') return 3
  if (id === 'AE2' || part === 'autoeval2') return 2
  if (
    question.isDiagnostic === true ||
    question.isAutoeval === true ||
    id === 'AE1' ||
    part === 'preQuestion' ||
    part === 'autoeval'
  ) {
    return 1
  }
  return null
}

function correctIndices(answer: LooseQuestion['correctAnswer']): number[] {
  if (typeof answer === 'number' && Number.isInteger(answer) && answer >= 0) return [answer]
  if (!Array.isArray(answer)) return []
  return answer.filter((index): index is number => Number.isInteger(index) && index >= 0)
}

function fromLoose(question: LooseQuestion, index: number): CkaQuestionDef {
  const correct = correctIndices(question.correctAnswer)
  const excluded = isExcludedFromGeometryScoreAndAverage(question as never)
  const autoSlot = autoSlotOf(question)
  return {
    id: String(question.id ?? `Q${index + 1}`),
    number: index + 1,
    prompt: plainText(String(question.question ?? '')),
    options: (question.options ?? []).map((option) => plainText(String(option))),
    correct,
    multi: question.allowMultiple === true || correct.length > 1,
    autoSlot,
    scorable: !excluded && autoSlot == null,
  }
}

export function questionsForTest(testId: string): CkaQuestionDef[] {
  if (testId === 'test-geo-trig-circle') {
    let number = 0
    return TRIG_CIRCLE_QUESTIONS.flatMap((question) =>
      question.subs.map((sub) => {
        number += 1
        const options = (sub.choices ?? []).map((choice) => plainText(choice.tex || choice.id))
        const correct = (sub.choices ?? []).flatMap((choice, index) => (choice.correct ? [index] : []))
        return {
          id: sub.id,
          number,
          prompt: plainText(`${question.stemTex} ${sub.labelTex || sub.label}`),
          options,
          correct,
          multi: false,
          autoSlot: null,
          scorable: true,
        }
      }),
    )
  }
  const bank = BANKS[testId] ?? []
  return bank.map((question, index) => {
    return fromLoose(question, index)
  })
}

export function lessonNameForTest(testId: string): string {
  const domain = platformDomains.find((item) => item.id === 'geometry-learning')
  for (const subdomain of domain?.subdomains ?? []) {
    if (subdomain.capacities.some((capacity) => capacity.testId === testId)) {
      return subdomain.nameFr ?? subdomain.name
    }
  }
  return ''
}

export function testNameFor(testId: string): string {
  const domain = platformDomains.find((item) => item.id === 'geometry-learning')
  for (const subdomain of domain?.subdomains ?? []) {
    const capacity = subdomain.capacities.find((item) => item.testId === testId)
    if (capacity) return capacity.nameFr ?? capacity.name
  }
  return testId
}

export function geometryTestOrder(): string[] {
  return geometryCognitionTestIds().filter((id) => (BANKS[id]?.length ?? 0) > 0)
}

export function letterOf(index: number): string {
  return Number.isInteger(index) && index >= 0 && index < 26 ? String.fromCharCode(65 + index) : String(index)
}

export function hasAnswer(selected: unknown, freeText: string | null): boolean {
  if (freeText && freeText.trim()) return true
  if (typeof selected === 'number' || (typeof selected === 'string' && selected.trim() !== '')) return true
  return Array.isArray(selected) && selected.length > 0
}

export function selectedIndices(selected: unknown): number[] {
  if (typeof selected === 'number' && Number.isInteger(selected) && selected >= 0) return [selected]
  if (!Array.isArray(selected)) return []
  return selected
    .map((item) => (typeof item === 'number' ? item : Number(item)))
    .filter((item) => Number.isInteger(item) && item >= 0)
}

export function formatScore(score: number): string {
  const rounded = Math.round(score * 100) / 100
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return text.replace('.', ',')
}

export function autoevalCode(slot: AutoevalSlot, answer: string): number | null {
  const key = normalizeAnswer(answer)
  if (slot === 2) {
    if (key === 'oui') return 1
    if (key === 'non') return 0
    return null
  }
  if (slot === 3) return DEMO_CODES[key] ?? null
  return MEMORY_CODES[key] ?? null
}

export function isForgotOption(label: string): boolean {
  return normalizeAnswer(label).includes("j'ai oublie")
}

export function isUnknownOption(label: string): boolean {
  return normalizeAnswer(label).includes('je ne sais pas')
}

export type QuestionCell = {
  score: number | null
  display: string
  status: 'correcte' | 'partielle' | 'incorrecte' | 'sans-reponse' | 'non-presentee' | 'hors-notation'
  selectedLetters: string
  selectedText: string
  expectedLetters: string
  missedLetters: string
}

export type LineStats = {
  correctN: number
  correctP: number | null
  partialN: number
  partialP: number | null
  incorrectN: number
  incorrectP: number | null
  forgot: number
  unknown: number
  multiPresented: number
  multiPartial: number
  multiPartialP: number | null
  unanswered: number
  notPresented: number
}

function percent(count: number, total: number): number | null {
  if (total <= 0) return null
  return Math.round((count / total) * 1000) / 10
}

export function scoreQuestion(question: CkaQuestionDef, trial: { score: number | null; selected: unknown; freeText: string | null } | null): QuestionCell {
  const expectedLetters = question.correct.map(letterOf).join(', ')
  if (!trial) {
    return {
      score: null,
      display: '',
      status: 'non-presentee',
      selectedLetters: '',
      selectedText: '',
      expectedLetters,
      missedLetters: '',
    }
  }
  const picked = selectedIndices(trial.selected)
  const selectedLetters = picked.map(letterOf).join(', ')
  const selectedText =
    picked.length > 0
      ? picked.map((index) => question.options[index]).filter(Boolean).join(' | ')
      : Array.isArray(trial.selected)
        ? trial.selected.map((item) => String(item)).join(' | ')
        : trial.selected == null
          ? ''
          : String(trial.selected)
  if (!question.scorable) {
    return {
      score: null,
      display: '',
      status: 'hors-notation',
      selectedLetters,
      selectedText: selectedText || trial.freeText || '',
      expectedLetters,
      missedLetters: '',
    }
  }
  const answered = hasAnswer(trial.selected, trial.freeText)
  if (!answered || trial.score == null) {
    return {
      score: null,
      display: '',
      status: 'sans-reponse',
      selectedLetters,
      selectedText,
      expectedLetters,
      missedLetters: '',
    }
  }
  const score = trial.score
  const missed = question.multi ? question.correct.filter((index) => !picked.includes(index)).map(letterOf) : []
  const partial = score > 0 && score < 0.999
  let display = formatScore(score)
  if (partial && missed.length > 0) {
    const label = missed.length > 1 ? 'Bonnes options non cochées' : 'Bonne option non cochée'
    display = `${display} — ${label} : ${missed.join(', ')}`
  }
  const status = score >= 0.999 ? 'correcte' : partial ? 'partielle' : 'incorrecte'
  return {
    score,
    display,
    status,
    selectedLetters,
    selectedText: selectedText || trial.freeText || '',
    expectedLetters,
    missedLetters: missed.join(', '),
  }
}

export function summarizeLine(questions: CkaQuestionDef[], cells: QuestionCell[]): LineStats {
  let correctN = 0
  let partialN = 0
  let incorrectN = 0
  let forgot = 0
  let unknown = 0
  let multiPresented = 0
  let multiPartial = 0
  let unanswered = 0
  let notPresented = 0
  questions.forEach((question, index) => {
    const cell = cells[index]
    if (!question.scorable) return
    if (cell.status === 'non-presentee') {
      notPresented += 1
      return
    }
    if (cell.status === 'sans-reponse') {
      unanswered += 1
      if (question.multi) multiPresented += 1
      return
    }
    if (cell.status === 'correcte') correctN += 1
    else if (cell.status === 'partielle') partialN += 1
    else if (cell.status === 'incorrecte') incorrectN += 1
    const labels = cell.selectedText.split(' | ')
    if (labels.some(isForgotOption)) forgot += 1
    if (labels.some(isUnknownOption)) unknown += 1
    if (question.multi) {
      multiPresented += 1
      if (cell.status === 'partielle') multiPartial += 1
    }
  })
  const evaluated = correctN + partialN + incorrectN
  return {
    correctN,
    correctP: percent(correctN, evaluated),
    partialN,
    partialP: percent(partialN, evaluated),
    incorrectN,
    incorrectP: percent(incorrectN, evaluated),
    forgot,
    unknown,
    multiPresented,
    multiPartial,
    multiPartialP: percent(multiPartial, multiPresented),
    unanswered,
    notPresented,
  }
}
