import { NextResponse } from 'next/server'
import { readJsonFile, writeJsonFile } from '@/lib/server/json-store'
import type { StudentAcademicProfile } from '@/lib/student-profile-types'

const FILE = 'student-profiles.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }
  const all = await readJsonFile<Record<string, StudentAcademicProfile>>(FILE, {})
  return NextResponse.json({ profile: all[userId] ?? null })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const profile = body as StudentAcademicProfile
    if (!profile.userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    profile.updatedAt = new Date().toISOString()
    const all = await readJsonFile<Record<string, StudentAcademicProfile>>(FILE, {})
    all[profile.userId] = profile
    await writeJsonFile(FILE, all)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
