import { CORRECTIONS, VPSubtestId } from './corrections'

export { CORRECTIONS }
export type { VPSubtestId }

export const VP_TEST_ID_PREFIX = 'test-vp'
export const VP_HUB_TEST_ID = 'test-visuo-perceptive'

export interface VPSubtestMeta {
  id: VPSubtestId
  slug: string
  testId: string
  title: string
  description: string
  choices: 4 | 5
  memoryOddEven: boolean
  category: 'perception' | 'memory' | 'spatial' | 'reasoning'
}

export const VP_SUBTESTS: VPSubtestMeta[] = [
  {
    id: 'discrimination', slug: 'discrimination',
    testId: 'test-vp-discrimination',
    title: 'Discrimination visuelle',
    description: 'Distinguer deux formes très proches parmi 5 alternatives.',
    choices: 5, memoryOddEven: false, category: 'perception',
  },
  {
    id: 'memoire_sequentielle', slug: 'memoire-sequentielle',
    testId: 'test-vp-memoire-sequentielle',
    title: 'Mémoire séquentielle',
    description: 'Mémoriser la séquence stimulus (3s), puis la retrouver.',
    choices: 4, memoryOddEven: true, category: 'memory',
  },
  {
    id: 'memoire_perceptive', slug: 'memoire-perceptive',
    testId: 'test-vp-memoire-perceptive',
    title: 'Mémoire perceptive',
    description: 'Stimulus perceptif (3s) puis reconnaissance.',
    choices: 4, memoryOddEven: true, category: 'memory',
  },
  {
    id: 'cloture', slug: 'cloture',
    testId: 'test-vp-cloture',
    title: 'Clôture / Relations spatiales',
    description: 'Compléter mentalement une forme incomplète.',
    choices: 4, memoryOddEven: false, category: 'spatial',
  },
  {
    id: 'constance_forme', slug: 'constance-forme',
    testId: 'test-vp-constance-forme',
    title: 'Constance de la forme',
    description: 'Identifier la forme cible malgré rotation / taille.',
    choices: 5, memoryOddEven: false, category: 'perception',
  },
  {
    id: 'figure_fond', slug: 'figure-fond',
    testId: 'test-vp-figure-fond',
    title: 'Figure-fond',
    description: 'Extraire la figure cible d’un fond encombré.',
    choices: 4, memoryOddEven: false, category: 'perception',
  },
  {
    id: 'intrus', slug: 'intrus',
    testId: 'test-vp-intrus',
    title: 'Intrus',
    description: 'Identifier l’élément qui ne partage pas la propriété commune.',
    choices: 4, memoryOddEven: false, category: 'reasoning',
  },
  {
    id: 'fond_cache', slug: 'fond-cache',
    testId: 'test-vp-fond-cache',
    title: 'Fond caché',
    description: 'Retrouver la forme dissimulée dans un motif complexe.',
    choices: 4, memoryOddEven: false, category: 'reasoning',
  },
]

export function getSubtestByTestId(testId: string): VPSubtestMeta | undefined {
  return VP_SUBTESTS.find((s) => s.testId === testId)
}

export function getSubtestById(id: VPSubtestId): VPSubtestMeta {
  const s = VP_SUBTESTS.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown subtest: ${id}`)
  return s
}

export interface VPTrial {
  trialIndex: number     // 1-based in the user-facing flow
  stimulusFile?: string  // odd canonical filename for memory subtests
  questionFile: string   // canonical filename that carries the choices (or the sole file)
  stimulusCandidates?: string[] // filename variants the loader will try
  questionCandidates: string[]  // filename variants the loader will try
  questionNumber: number // matches CORRECTIONS key
  correct: number        // 1..choices
}

export function parseFilename(filename: string): { subtest: string; number: number } | null {
  // Accepts: discrimination_1.jpg, fond_cache_(1).jpg, fond_cache_ (1).jpg, fond_cache 1.jpg
  const m = filename.match(/^([a-z_]+?)[_\s]*\(?\s*(\d+)\s*\)?\.(?:jpg|jpeg|png|webp)$/i)
  if (!m) return null
  const sub = m[1].toLowerCase().replace(/_+$/, '')
  return { subtest: sub, number: parseInt(m[2], 10) }
}

/**
 * Candidate filenames the image loader will try in order when resolving a slot.
 * Supports underscore, parenthesized, and whitespace variants, plus common extensions.
 */
export function candidateFilenames(subtestId: VPSubtestId, n: number): string[] {
  const stems = [
    `${subtestId}_${n}`,
    `${subtestId}_(${n})`,
    `${subtestId} (${n})`,
    `${subtestId}-${n}`,
    `${subtestId}${n}`,
  ]
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP']
  const out: string[] = []
  for (const s of stems) for (const e of exts) out.push(`${s}.${e}`)
  return out
}

export function buildTrials(sub: VPSubtestMeta): VPTrial[] {
  const corr = CORRECTIONS[sub.id]
  const nums = Object.keys(corr).map((k) => parseInt(k, 10)).sort((a, b) => a - b)
  if (nums.length === 0) return []
  if (!sub.memoryOddEven) {
    return nums.map((n, i) => ({
      trialIndex: i + 1,
      questionFile: `${sub.id}_${n}.jpg`,
      questionCandidates: candidateFilenames(sub.id, n),
      questionNumber: n,
      correct: corr[n],
    }))
  }
  // odd/even pairing: (1,2), (3,4), ...
  const trials: VPTrial[] = []
  for (let i = 0; i < nums.length; i += 2) {
    const odd = nums[i]
    const even = nums[i + 1]
    if (even === undefined) break
    trials.push({
      trialIndex: trials.length + 1,
      stimulusFile: `${sub.id}_${odd}.jpg`,
      questionFile: `${sub.id}_${even}.jpg`,
      stimulusCandidates: candidateFilenames(sub.id, odd),
      questionCandidates: candidateFilenames(sub.id, even),
      questionNumber: even,
      correct: corr[even],
    })
  }
  return trials
}

export const VP_MEMORY_STIMULUS_MS = 3000
export const VP_RESULT_KEY_PREFIX = 'vp-result'
export const VP_IMAGE_STORE_KEY = 'vp-images-v1'

export function resultStorageKey(sub: VPSubtestId) {
  return `${VP_RESULT_KEY_PREFIX}:${sub}`
}
