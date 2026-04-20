/**
 * Trail Making Test (TMT)
 * - Part A: connect numbers 1 → N in ascending order
 * - Part B: alternate numbers and letters: 1 → A → 2 → B → 3 → C → ...
 * - Training (6-8 nodes), then test (20-25 nodes)
 */

export const TRAIL_MAKING_TEST_ID = 'test-visuo-spatial-attention'
export const TRAIL_MAKING_RESULTS_KEY = 'trail-making:results'

export type TMTPart = 'A' | 'B'

export const TMT_TRAINING_COUNT_A = 7
export const TMT_TRAINING_COUNT_B = 8 // 4 numbers + 4 letters
export const TMT_TEST_COUNT_A = 20
export const TMT_TEST_COUNT_B = 20 // 10 numbers + 10 letters

export interface TMTNode {
  id: string
  label: string
  x: number // 0..1
  y: number // 0..1
  order: number // 0-based expected click order
}

export interface TMTClick {
  nodeId: string
  label: string
  correct: boolean
  timeMs: number // from start
}

export interface TMTPhaseResult {
  phase: 'training' | 'test'
  part: TMTPart
  totalMs: number
  errors: number
  clicks: TMTClick[]
  nodes: TMTNode[]
}

export interface TMTResult {
  id: string
  userName?: string
  startedAt: string
  completedAt: string
  phases: TMTPhaseResult[]
  testAtime: number
  testBtime: number
  switchCost: number // testB - testA
  totalErrors: number
  score: number // inverse of errors + time efficiency
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Spread nodes non-overlapping in a 0..1 grid using jittered cells. */
function scatterPositions(n: number): { x: number; y: number }[] {
  const cols = Math.ceil(Math.sqrt(n * 1.6))
  const rows = Math.ceil(n / cols)
  const cells: { x: number; y: number }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells.length >= n) break
      const cx = (c + 0.5) / cols
      const cy = (r + 0.5) / rows
      const jx = (Math.random() - 0.5) * (0.6 / cols)
      const jy = (Math.random() - 0.5) * (0.6 / rows)
      cells.push({
        x: Math.max(0.06, Math.min(0.94, cx + jx)),
        y: Math.max(0.08, Math.min(0.92, cy + jy)),
      })
    }
  }
  return shuffle(cells)
}

export function buildNodes(part: TMTPart, count: number): TMTNode[] {
  const positions = scatterPositions(count)
  const labels: string[] = []
  if (part === 'A') {
    for (let i = 1; i <= count; i++) labels.push(String(i))
  } else {
    const numbers = Math.ceil(count / 2)
    const letters = Math.floor(count / 2)
    for (let i = 0; i < Math.max(numbers, letters); i++) {
      if (i < numbers) labels.push(String(i + 1))
      if (i < letters) labels.push(String.fromCharCode(65 + i))
    }
    labels.length = count
  }
  return labels.map((label, i) => ({
    id: `n-${label}-${i}`,
    label,
    x: positions[i].x,
    y: positions[i].y,
    order: i,
  }))
}

export function listTMTResults(): TMTResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TRAIL_MAKING_RESULTS_KEY)
    return raw ? (JSON.parse(raw) as TMTResult[]) : []
  } catch {
    return []
  }
}

export function saveTMTResult(r: TMTResult) {
  if (typeof window === 'undefined') return
  const all = listTMTResults()
  all.push(r)
  window.localStorage.setItem(TRAIL_MAKING_RESULTS_KEY, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('attentional-changed'))
}

export function getLatestTMTResult(userName?: string): TMTResult | undefined {
  const all = listTMTResults()
    .filter((r) => !userName || r.userName === userName)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  return all[0]
}
