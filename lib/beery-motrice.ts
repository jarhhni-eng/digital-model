/**
 * Beery VMI (Visual-Motor Integration) — simplified 10-item version.
 * - User passation: copy 10 figures (motrice_1.jpg → motrice_10.jpg) on canvas,
 *   no back, no erase, autosave on each "Suivant", submit when done.
 * - Admin manual correction: view original + user drawing, enter raw score 0-10,
 *   auto-conversion to standard score + level, save result.
 * - Result integrated in global profile.
 */

export const BEERY_MOTRICE_TEST_ID = 'test-visuo-motor'
export const BEERY_MOTRICE_ITEM_COUNT = 16
export const BEERY_MOTRICE_IMAGE_DIR = '/images/motrice'
export const BEERY_MOTRICE_SESSIONS_KEY = 'beery-motrice:sessions'
export const BEERY_MOTRICE_RESULTS_KEY = 'beery-motrice:results'
export const BEERY_MOTRICE_CURRENT_SESSION_KEY = 'beery-motrice:current-session'

export interface BeeryMotriceDrawing {
  item: number // 1..10
  dataUrl: string
  timestamp: string
}

export type BeeryMotriceStatus = 'in-progress' | 'submitted' | 'corrected'

export interface BeeryMotriceSession {
  id: string
  userName: string
  userEmail?: string
  startedAt: string
  completedAt?: string
  drawings: BeeryMotriceDrawing[] // length up to 10
  status: BeeryMotriceStatus
}

export type BeeryMotriceLevel = 'Supérieur' | 'Moyen' | 'Limite' | 'Faible'

export interface BeeryMotriceResult {
  sessionId: string
  userName: string
  rawScore: number // 0-10
  standardScore: number
  niveau: BeeryMotriceLevel
  validatedAt: string
  validatedBy?: string
  domain: 'traitement_visuel'
  test: 'beery_vmi'
}

/** Conversion rule specified in the module brief. */
export function convertRawScore(raw: number): { standardScore: number; niveau: BeeryMotriceLevel } {
  const r = Math.max(0, Math.min(BEERY_MOTRICE_ITEM_COUNT, Math.round(raw)))
  // Scaled for a 16-item test (proportional to original 10-item barème).
  if (r >= 15) return { standardScore: 115, niveau: 'Supérieur' }
  if (r >= 12) return { standardScore: 100, niveau: 'Moyen' }
  if (r >= 8) return { standardScore: 85, niveau: 'Limite' }
  return { standardScore: 70, niveau: 'Faible' }
}

export function motriceImagePath(item: number): string {
  return `${BEERY_MOTRICE_IMAGE_DIR}/motrice_${item}.jpg`
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('beery-motrice-changed'))
  } catch (e) {
    console.warn('beery-motrice write failed', e)
  }
}

// ─────────── Sessions ───────────

export function listSessions(): BeeryMotriceSession[] {
  return readJSON<BeeryMotriceSession[]>(BEERY_MOTRICE_SESSIONS_KEY, [])
}

export function getSession(id: string): BeeryMotriceSession | undefined {
  return listSessions().find((s) => s.id === id)
}

export function upsertSession(session: BeeryMotriceSession) {
  const all = listSessions()
  const idx = all.findIndex((s) => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.push(session)
  writeJSON(BEERY_MOTRICE_SESSIONS_KEY, all)
}

export function startNewSession(userName: string, userEmail?: string): BeeryMotriceSession {
  const session: BeeryMotriceSession = {
    id: `bvmi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userName,
    userEmail,
    startedAt: new Date().toISOString(),
    drawings: [],
    status: 'in-progress',
  }
  upsertSession(session)
  window.localStorage.setItem(BEERY_MOTRICE_CURRENT_SESSION_KEY, session.id)
  return session
}

export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(BEERY_MOTRICE_CURRENT_SESSION_KEY)
}

export function clearCurrentSessionId() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(BEERY_MOTRICE_CURRENT_SESSION_KEY)
}

export function saveDrawing(sessionId: string, item: number, dataUrl: string) {
  const session = getSession(sessionId)
  if (!session) return
  const existingIdx = session.drawings.findIndex((d) => d.item === item)
  const drawing: BeeryMotriceDrawing = { item, dataUrl, timestamp: new Date().toISOString() }
  if (existingIdx >= 0) session.drawings[existingIdx] = drawing
  else session.drawings.push(drawing)
  upsertSession(session)
}

export function submitSession(sessionId: string) {
  const s = getSession(sessionId)
  if (!s) return
  s.status = 'submitted'
  s.completedAt = new Date().toISOString()
  upsertSession(s)
}

// ─────────── Results ───────────

export function listResults(): BeeryMotriceResult[] {
  return readJSON<BeeryMotriceResult[]>(BEERY_MOTRICE_RESULTS_KEY, [])
}

export function getResult(sessionId: string): BeeryMotriceResult | undefined {
  return listResults().find((r) => r.sessionId === sessionId)
}

export function getLatestResultForUser(userName: string): BeeryMotriceResult | undefined {
  const all = listResults()
    .filter((r) => r.userName === userName)
    .sort((a, b) => (a.validatedAt < b.validatedAt ? 1 : -1))
  return all[0]
}

export function saveResult(result: BeeryMotriceResult) {
  const all = listResults()
  const idx = all.findIndex((r) => r.sessionId === result.sessionId)
  if (idx >= 0) all[idx] = result
  else all.push(result)
  writeJSON(BEERY_MOTRICE_RESULTS_KEY, all)
  // also mark session corrected
  const session = getSession(result.sessionId)
  if (session) {
    session.status = 'corrected'
    upsertSession(session)
  }
}
