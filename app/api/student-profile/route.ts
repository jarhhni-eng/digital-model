/**
 * /api/student-profile
 *
 *   GET  ?userId=…   → fetch a student profile from data/student-profiles.json
 *                      If userId is omitted, returns the caller's own profile.
 *   PUT              → upsert the caller's profile (userId taken from session cookie).
 *
 * Auth: reads the local session cookie (no Supabase).
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { decodeSession, COOKIE_NAME } from '@/lib/local-auth/session'
import type { StudentAcademicProfile } from '@/lib/student-profile-types'

const PROFILES_FILE = path.join(process.cwd(), 'data', 'student-profiles.json')

function readProfiles(): Record<string, StudentAcademicProfile> {
  try {
    return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function writeProfiles(profiles: Record<string, StudentAcademicProfile>): void {
  fs.mkdirSync(path.dirname(PROFILES_FILE), { recursive: true })
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8')
}

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return decodeSession(token)
}

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const targetId = searchParams.get('userId') ?? session.userId

  const profiles = readProfiles()
  const profile = profiles[targetId] ?? null
  return NextResponse.json({ profile })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const body = (await request.json()) as Partial<StudentAcademicProfile>

    const profiles = readProfiles()
    const existing = profiles[session.userId] ?? {}

    const updated: StudentAcademicProfile = {
      ...existing,
      userId: session.userId, // always force caller's own id
      fullName: body.fullName ?? (existing as StudentAcademicProfile).fullName ?? '',
      age: typeof body.age === 'number' ? body.age : (existing as StudentAcademicProfile).age ?? 0,
      gender: body.gender ?? (existing as StudentAcademicProfile).gender ?? '',
      teacherName: body.teacherName ?? (existing as StudentAcademicProfile).teacherName ?? '',
      schoolName: body.schoolName ?? (existing as StudentAcademicProfile).schoolName ?? '',
      gradeLevel: body.gradeLevel ?? (existing as StudentAcademicProfile).gradeLevel ?? '3ème année collège',
      academicTrack: body.academicTrack ?? (existing as StudentAcademicProfile).academicTrack ?? '',
      academicYear: body.academicYear ?? (existing as StudentAcademicProfile).academicYear ?? '',
      mathAverage2025_2026: body.mathAverage2025_2026 !== undefined
        ? body.mathAverage2025_2026
        : (existing as StudentAcademicProfile).mathAverage2025_2026 ?? null,
      mathAverage2024_2025: body.mathAverage2024_2025 !== undefined
        ? body.mathAverage2024_2025
        : (existing as StudentAcademicProfile).mathAverage2024_2025 ?? null,
      updatedAt: new Date().toISOString(),
    }

    profiles[session.userId] = updated
    writeProfiles(profiles)

    return NextResponse.json({ ok: true, profile: updated })
  } catch (err) {
    console.error('[student-profile PUT]', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
