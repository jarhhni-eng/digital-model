import { PRODUIT_SCALAIRE_QUESTIONS } from '../lib/geometry/produit-scalaire.ts'
import { PRODUIT_SCALAIRE_TC_QUESTIONS } from '../lib/geometry/produit-scalaire-tronc-commun.ts'
import { VECTORS_QUESTIONS } from '../lib/geometry/geo-vectors-complete.ts'
import { checkVectorsSequentialPlacement } from '../lib/geometry/vectors-placement-keys.ts'

const full = PRODUIT_SCALAIRE_QUESTIONS.find((q) => q.number === 3)
const tc = PRODUIT_SCALAIRE_TC_QUESTIONS.find((q) => q.number === 3)
if (!full || !tc) throw new Error('Q3 missing')
if (PRODUIT_SCALAIRE_QUESTIONS.length !== 26) throw new Error('26-question bank changed size')
if (PRODUIT_SCALAIRE_TC_QUESTIONS.length !== 15) throw new Error('15-question bank changed size')

function assertQ3(label: string, options: string[], answer: number | number[] | null) {
  if (options.length !== 3) throw new Error(`${label} option count ${options.length}`)
  if (options.some((option) => option.includes('\\cdot \\vec{V} = 0'))) throw new Error(`${label} still has option B`)
  if (!options[0].includes('\\vec{0}')) throw new Error(`${label} A moved`)
  if (!options[1].includes('orthogonaux')) throw new Error(`${label} C lost`)
  if (options[2] !== "J'ai oublié") throw new Error(`${label} forgot option lost`)
  if (answer !== 0) throw new Error(`${label} answer ${JSON.stringify(answer)}`)
}

assertQ3('full', full.options, full.correctAnswer)
assertQ3('tc', tc.options, tc.correctAnswer)
if (full.question !== tc.question) throw new Error('Q3 stem diverged')

const q4 = PRODUIT_SCALAIRE_QUESTIONS.find((q) => q.number === 4)
if (q4?.correctAnswer !== 1) throw new Error('Q4 changed')

const q10 = VECTORS_QUESTIONS.find((q) => q.id === 'Q10')
const q11 = VECTORS_QUESTIONS.find((q) => q.id === 'Q11')
const q12 = VECTORS_QUESTIONS.find((q) => q.id === 'Q12')
const q13 = VECTORS_QUESTIONS.find((q) => q.id === 'Q13')
if (q10?.pointPlacement?.labels.join() !== 'Q,M') throw new Error('Q10 labels')
if (q11?.pointPlacement?.labels.join() !== 'P,N') throw new Error('Q11 labels')
if (q12?.correctAnswer !== 1 || q12.options.length !== 4) throw new Error('Q12 changed')
if (q13?.correctAnswer !== 0) throw new Error('Q13 changed')
const key = checkVectorsSequentialPlacement({ questionId: 'Q10', name: 'Q', x: 7, y: -3 })
if (!key?.correct || key.score !== 1) throw new Error('Q10 score changed')
console.log('q3 and placement config ok')
