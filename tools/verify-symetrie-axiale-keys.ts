import {
  SYMETRIE_AXIALE_QUESTIONS,
  isAxialeMulti,
  SYMETRIE_AXIALE_CORRECTION_REVIEW,
  SYMETRIE_AXIALE_TEST_ID,
  SYMETRIE_AXIALE_TEST_VERSION,
  scoreSymetrieAxialeQuestion,
} from '../lib/geometry/symetrie-axiale.ts'
import { scoreGeometryQuestion } from '../lib/geometry/scoring.ts'
import { questionsForSession, scoreQuestion } from '../lib/geometry/cka-question-stats.ts'

function expectOnly(id: string, good: number) {
  const x = q(id)
  if (isAxialeMulti(x)) throw new Error(`${id} must be single answer`)
  x.options.forEach((_, i) => {
    const s = scoreSymetrieAxialeQuestion(x, [i])
    if (s !== (i === good ? 1 : 0)) throw new Error(`${id} option ${i} scored ${s}`)
  })
  console.log(id, 'only option', 'ABCD'[good], 'scores')
}

function q(id: string) {
  const x = SYMETRIE_AXIALE_QUESTIONS.find((t) => t.id === id)
  if (!x) throw new Error('missing ' + id)
  return x
}

function expectAns(id: string, want: number | number[]) {
  if (JSON.stringify(q(id).correctAnswer) !== JSON.stringify(want)) {
    throw new Error(`${id} got ${JSON.stringify(q(id).correctAnswer)} want ${JSON.stringify(want)}`)
  }
  console.log(id, 'OK')
}

if (q('Q1').correctAnswer !== null) throw new Error('Q1 autoeval')
expectAns('Q2', 0)
expectOnly('Q2', 0)
expectAns('Q3', [0, 1, 2])
if (!isAxialeMulti(q('Q3'))) throw new Error('Q3 multi')
expectAns('Q4', [0, 1, 2])
expectAns('Q5', 0)
expectAns('Q6', 0)
if (JSON.stringify(q('Q6').options) !== JSON.stringify(['Un angle de même mesure', 'Un angle différent', 'Je ne sais pas'])) {
  throw new Error('Q6 options ' + JSON.stringify(q('Q6').options))
}
expectOnly('Q6', 0)
expectAns('Q7', 1)
if (!q('Q7').question.includes('(GH)')) throw new Error('Q7 GH')
if (q('Q7').options.some((o) => o.includes('(d)'))) throw new Error('Q7 still (d)')
expectAns('Q8', 0)
if (!q('Q8').question.includes('(GH)')) throw new Error('Q8 GH')
if (q('Q8').options.some((o) => o.includes('(d)'))) throw new Error('Q8 still (d)')
expectAns('Q9', 3)
if (q('Q9').options.length !== 4 || q('Q9').options[3] !== 'Aucune réponse') throw new Error('Q9 option D')
if (!/affirmation vraie/.test(q('Q9').question) || /vrai ou faux/.test(q('Q9').question)) throw new Error('Q9 wording')
expectOnly('Q9', 3)
expectAns('Q10', 1)
expectAns('Q11', [0, 2])
if (!isAxialeMulti(q('Q11'))) throw new Error('Q11 multi')
expectAns('Q12', 0)
expectAns('Q13', 2)
if (q('Q14').competencies.join() !== 'C2') throw new Error('Q14 C2')
expectAns('Q14', 0)
if (q('Q15').competencies.join() !== 'C2') throw new Error('Q15 C2')
expectAns('Q15', 3)
expectAns('Q16', 0)
expectAns('Q17', [0, 1])
if (!isAxialeMulti(q('Q17'))) throw new Error('Q17 multi')
expectAns('Q18', [0, 2])
if (!isAxialeMulti(q('Q18'))) throw new Error('Q18 multi')
if (!SYMETRIE_AXIALE_CORRECTION_REVIEW.find((r) => r.questionId === 'Q2')) {
  throw new Error('review Q2')
}

const q3 = q('Q3')
const full = scoreGeometryQuestion({
  options: q3.options,
  selected: [0, 1, 2],
  correctAnswer: q3.correctAnswer,
})
if (full !== 1) throw new Error('Q3 full ' + full)
const partial = scoreGeometryQuestion({
  options: q3.options,
  selected: [0, 1],
  correctAnswer: q3.correctAnswer,
})
if (partial !== 2 / 3) throw new Error('Q3 partial ' + partial)
const extra = scoreGeometryQuestion({
  options: q3.options,
  selected: [0, 1, 2, 3],
  correctAnswer: q3.correctAnswer,
})
if (extra !== 0) throw new Error('Q3 extra ' + extra)
const blank = scoreGeometryQuestion({
  options: q3.options,
  selected: [],
  correctAnswer: q3.correctAnswer,
})
if (blank !== 0) throw new Error('Q3 blank')
const q7 = q('Q7')
const q7ok = scoreGeometryQuestion({
  options: q7.options,
  selected: [1],
  correctAnswer: q7.correctAnswer,
})
if (q7ok !== 1) throw new Error('Q7 score')
const q7bad = scoreGeometryQuestion({
  options: q7.options,
  selected: [0],
  correctAnswer: q7.correctAnswer,
})
if (q7bad !== 0) throw new Error('Q7 wrong')
console.log('scoring OK')
console.log('all checks passed')

// Historical sessions (no metadata.testVersion) keep their original options and keys.
const legacy = questionsForSession(SYMETRIE_AXIALE_TEST_ID, { source: 'symetrie-axiale-quiz' })
const current = questionsForSession(SYMETRIE_AXIALE_TEST_ID, { testVersion: SYMETRIE_AXIALE_TEST_VERSION })
const byId = (list: typeof legacy, id: string) => list.find((x) => x.id === id)!
const oldQ6 = scoreQuestion(byId(legacy, 'Q6'), { score: 0, selected: [2], freeText: null })
if (oldQ6.selectedText !== 'Un angle différent') throw new Error('legacy Q6 label ' + oldQ6.selectedText)
if (byId(legacy, 'Q6').options.length !== 4 || byId(current, 'Q6').options.length !== 3) throw new Error('Q6 banks')
if (JSON.stringify(byId(legacy, 'Q2').correct) !== '[0,1,2]' || JSON.stringify(byId(current, 'Q2').correct) !== '[0]') {
  throw new Error('Q2 banks')
}
if (JSON.stringify(byId(legacy, 'Q9').correct) !== '[1]' || JSON.stringify(byId(current, 'Q9').correct) !== '[3]') {
  throw new Error('Q9 banks')
}
console.log('legacy sessions keep their original options and keys')
