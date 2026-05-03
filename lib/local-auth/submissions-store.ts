/**
 * submissions-store.ts
 * Read / write data/submissions.json — SERVER ONLY.
 */
import fs from 'fs'
import path from 'path'

export interface StoredSubmission {
  id: string
  userId: string
  testId: string
  startedAt: string
  submittedAt: string
  scorePercent: number | null
  correctCount: number
  totalQuestions: number
  totalMs?: number | null
  answers: unknown[]
  selectedChoices?: Record<string, string>
  metadata?: Record<string, unknown>
}

const FILE = path.join(process.cwd(), 'data', 'submissions.json')

export function readSubmissions(): StoredSubmission[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'))
  } catch {
    return []
  }
}

export function writeSubmissions(subs: StoredSubmission[]): void {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, JSON.stringify(subs, null, 2), 'utf-8')
}

export function addSubmission(sub: StoredSubmission): void {
  const subs = readSubmissions()
  writeSubmissions([...subs, sub])
}
