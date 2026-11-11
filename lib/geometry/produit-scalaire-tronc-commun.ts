/**
 * Produit scalaire — Tronc commun scientifique.
 * Built from the 1ère Bac bank without mutating it.
 * Old numbers stay in `sourceNumber` for traceability and are not shown to students.
 */
import {
  PRODUIT_SCALAIRE_QUESTIONS,
  type ProduitScalaireQuestion,
  type ProduitScalaireResult,
} from '@/lib/geometry/produit-scalaire'

export const PRODUIT_SCALAIRE_TC_TEST_ID = 'test-geo-produit-scalaire-tc'
export const PRODUIT_SCALAIRE_TC_RESULTS_KEY = 'geo-produit-scalaire-tc:results'

export const PRODUIT_SCALAIRE_TC_CAPACITIES = [
  { code: 'C1', label: "Exprimer la distance et la perpendicularité à l'aide du produit scalaire." },
  { code: 'C2', label: "Utilisation de la démonstration d'alkachy et la démonstration de la médiane dans la résolution des problèmes géométriques." },
  { code: 'C3', label: 'Traduire les notions et les propriétés de la géométrie affine et de la géométrie vectorielle à travers les coordonnées.' },
  { code: 'C4', label: "Utiliser l'outil analytique dans la résolution des problèmes géométriques." },
] as const

type Spec = { source: number; capacity: string | null; dropOption?: number }

/** Order is the original order, after the cancelled deletions of old Q10 and Q16. */
const KEEP: Spec[] = [
  { source: 1, capacity: null },
  { source: 2, capacity: 'C1', dropOption: 2 },
  { source: 3, capacity: 'C1' },
  { source: 4, capacity: 'C1' },
  { source: 5, capacity: 'C2' },
  { source: 6, capacity: 'C2' },
  { source: 9, capacity: 'C3' },
  { source: 10, capacity: 'C3' },
  { source: 14, capacity: 'C3' },
  { source: 16, capacity: 'C3' },
  { source: 17, capacity: 'C3' },
  { source: 18, capacity: 'C3' },
  { source: 19, capacity: 'C3' },
  { source: 21, capacity: 'C4' },
  { source: 22, capacity: 'C3' },
]

export interface ProduitScalaireTcQuestion extends ProduitScalaireQuestion {
  sourceId: string
  sourceNumber: number
}

function remapAnswer(answer: number | number[] | null, drop: number): number | number[] | null {
  const shift = (index: number) => (index > drop ? index - 1 : index)
  if (Array.isArray(answer)) {
    const next = answer.filter((index) => index !== drop).map(shift)
    return next.length === 1 ? next[0] : next
  }
  if (typeof answer === 'number') {
    if (answer === drop) return null
    return shift(answer)
  }
  return answer
}

function cloneQuestion(source: ProduitScalaireQuestion, spec: Spec, number: number): ProduitScalaireTcQuestion {
  const copy = structuredClone(source)
  if (spec.dropOption != null) {
    copy.options = copy.options.filter((_, index) => index !== spec.dropOption)
    copy.correctAnswer = remapAnswer(copy.correctAnswer, spec.dropOption)
  }
  return {
    ...copy,
    id: `TC-Q${number}`,
    number,
    competencies: spec.capacity ? [spec.capacity] : [],
    isDiagnostic: spec.capacity == null,
    sourceId: source.id,
    sourceNumber: source.number,
  }
}

export const PRODUIT_SCALAIRE_TC_QUESTIONS: ProduitScalaireTcQuestion[] = KEEP.map((spec, index) => {
  const source = PRODUIT_SCALAIRE_QUESTIONS.find((question) => question.number === spec.source)
  if (!source) throw new Error(`Question source ${spec.source} introuvable`)
  return cloneQuestion(source, spec, index + 1)
})

export function tcCapacityLabel(code: string | undefined): string {
  return PRODUIT_SCALAIRE_TC_CAPACITIES.find((capacity) => capacity.code === code)?.label ?? ''
}

export function masteryLabel(percent: number | null): string {
  if (percent == null) return 'Non disponible'
  if (percent >= 75) return 'Capacité maîtrisée'
  if (percent >= 50) return 'Capacité partiellement maîtrisée'
  return 'Difficultés'
}

export function saveProduitScalaireTcResult(result: ProduitScalaireResult) {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(PRODUIT_SCALAIRE_TC_RESULTS_KEY)
  const all = raw ? (JSON.parse(raw) as ProduitScalaireResult[]) : []
  all.push(result)
  window.localStorage.setItem(PRODUIT_SCALAIRE_TC_RESULTS_KEY, JSON.stringify(all))
}
