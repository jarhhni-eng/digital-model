/** Theoretical introduction & instructions per test — used by the generic test shell. */

export interface TestTheoreticalMeta {
  definition: string
  background: string
  author: string
  source: string
  objective: string
  instructions: string
}

const defaultMeta: TestTheoreticalMeta = {
  definition:
    'A standardized cognitive or academic task measuring specific capacities through structured items.',
  background:
    'Based on psychometric and educational measurement principles; adapted for digital administration.',
  author: 'Research platform (adaptation)',
  source: 'Internal documentation / published test manuals where applicable',
  objective:
    'Quantify performance for feedback, research, and instructional planning.',
  instructions:
    'Answer each item carefully. Use Next to move forward. You must accept the instructions before starting. Scores are computed after submission.',
}

const byTest: Record<string, Partial<TestTheoreticalMeta>> = {
  'test-selective-attention': {
    definition:
      'Selective attention is the ability to focus on task-relevant stimuli while ignoring distractors.',
    background:
      'Related to Stroop-like interference and executive control over automatic responses.',
    objective: 'Assess selective attention and inhibitory control under interference.',
  },
}

export function getTestMetadata(testId: string): TestTheoreticalMeta {
  const extra = byTest[testId] ?? {}
  return { ...defaultMeta, ...extra }
}
