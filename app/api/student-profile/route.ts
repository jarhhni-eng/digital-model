/**
 * /api/student-profile
 *
 *   GET  ?userId=…   → fetch a student profile (RLS scopes the read).
 *                      If userId is omitted, returns the caller's profile.
 *   PUT              → upsert the caller's profile (auth user id is taken
 *                      from the session; the request body cannot pretend
 *                      to be someone else).
 *
 * Backed by public.student_profiles. NO local student-profiles.json.
 */
import { NextResponse } from 'next/server'
import { getSupabaseServer, tryGetSupabaseAdmin } from '@/lib/supabase/server'
import type { StudentAcademicProfile } from '@/lib/student-profile-types'
import type { Database } from '@/lib/types/database'

type Row = Database['public']['Tables']['student_profiles']['Row']

function rowToProfile(row: Row | null): StudentAcademicProfile | null {
  if (!row) return null
  return {
    userId: row.user_id,
    fullName: row.full_name ?? '',
    age: row.age ?? 0,
    gender: row.gender ?? '',
    teacherId: row.teacher_id ?? null,
    teacherName: row.teacher_name ?? '',
    schoolName: row.school_name ?? '',
    gradeLevel: (row.grade_level ?? '3ème année collège') as StudentAcademicProfile['gradeLevel'],
    academicTrack: (row.academic_track ?? '') as StudentAcademicProfile['academicTrack'],
    academicYear: row.academic_year ?? '',
    mathAverage2024_2025: row.math_average_2024_2025 ?? null,
    mathAverage2025_2026: row.math_average_2025_2026 ?? null,
    updatedAt: row.updated_at,
  }
}

export async function GET(request: Request) {
  const sb = await getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const requested = searchParams.get('userId')

  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const targetId = requested ?? user.id
  const { data, error } = await sb
    .from('student_profiles')
    .select('*')
    .eq('user_id', targetId)
    .maybeSingle()

  if (error) {
    console.error('[student-profile GET]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ profile: rowToProfile(data) })
}

export async function PUT(request: Request) {
  const sb = await getSupabaseServer()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const body = (await request.json()) as Partial<StudentAcademicProfile> & {
      teacherId?: string | null
      schoolId?: string | null
    }

    const rawSid =
      typeof body.schoolId === 'string' && body.schoolId.trim() !== '' ? body.schoolId.trim() : null
    if (!rawSid) {
      return NextResponse.json(
        { error: 'Veuillez sélectionner l’établissement scolaire.' },
        { status: 400 },
      )
    }

    const rawTid = body.teacherId
    const teacherId =
      typeof rawTid === 'string' && rawTid.trim() !== '' ? rawTid.trim() : null

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Veuillez sélectionner un enseignant dans la liste.' },
        { status: 400 },
      )
    }

    const { data: schoolRow, error: schoolErr } = await sb
      .from('schools')
      .select('id, name')
      .eq('id', rawSid)
      .eq('is_active', true)
      .maybeSingle()

    if (schoolErr || !schoolRow) {
      return NextResponse.json({ error: 'Établissement introuvable ou inactif.' }, { status: 400 })
    }

    const reader = tryGetSupabaseAdmin() ?? sb
    const { data: teacherRow, error: teacherErr } = await reader
      .from('profiles')
      .select('id, full_name, email, school_id')
      .eq('id', teacherId)
      .eq('role', 'teacher')
      .maybeSingle()

    if (teacherErr || !teacherRow) {
      return NextResponse.json({ error: 'Enseignant introuvable ou invalide.' }, { status: 400 })
    }

    if (teacherRow.school_id !== rawSid) {
      return NextResponse.json(
        { error: 'Cet enseignant n’appartient pas à l’établissement sélectionné.' },
        { status: 400 },
      )
    }

    const teacherLabel =
      (typeof teacherRow.full_name === 'string' && teacherRow.full_name.trim() !== ''
        ? teacherRow.full_name.trim()
        : null) ?? teacherRow.email

    const age = typeof body.age === 'number' && body.age >= 5 && body.age <= 100 ? body.age : null
    if (age == null) {
      return NextResponse.json({ error: 'L’âge doit être compris entre 5 et 100 ans.' }, { status: 400 })
    }

    const legacyGrade: Record<string, Row['grade_level']> = {
      'Tronc commun': 'Tronc commun scientifique',
      '1ère Bac Sciences expérimentales': '1ère année Baccalauréat – Sciences expérimentales',
      '1ere Bac Sciences mathématiques': '1ère année Baccalauréat – Sciences mathématiques',
      '2ème Bac Sciences Sciences expérimentales': '1ère année Baccalauréat – Sciences expérimentales',
    }
    const requestedGrade = (body.gradeLevel ?? null) as Row['grade_level']
    const baseProfile = {
      user_id: user.id,
      full_name: body.fullName ?? null,
      age,
      gender: (body.gender ?? '') as Row['gender'],
      teacher_id: teacherId,
      teacher_name: teacherLabel,
      school_name: schoolRow.name,
      academic_track: body.academicTrack ?? null,
      academic_year: body.academicYear ?? null,
      ...(typeof body.mathAverage2024_2025 === 'number' ? { math_average_2024_2025: body.mathAverage2024_2025 } : {}),
      ...(typeof body.mathAverage2025_2026 === 'number' ? { math_average_2025_2026: body.mathAverage2025_2026 } : {}),
    }
    const saveGrade = (grade: Row['grade_level']) =>
      sb.from('student_profiles').upsert(
        { ...baseProfile, grade_level: grade },
        { onConflict: 'user_id' },
      )

    let savedProfile = await saveGrade(requestedGrade)
    const gradeRejected =
      savedProfile.error != null &&
      requestedGrade != null &&
      legacyGrade[requestedGrade] != null &&
      /grade_level|enum|invalid input/i.test(savedProfile.error.message)
    if (gradeRejected) savedProfile = await saveGrade(legacyGrade[requestedGrade] ?? requestedGrade)

    if (savedProfile.error) {
      console.error('[student-profile PUT]', savedProfile.error.message)
      return NextResponse.json({ error: savedProfile.error.message }, { status: 500 })
    }

    const className = typeof body.className === 'string' ? body.className.trim() : ''
    const note = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null)
    const loose = (tryGetSupabaseAdmin() ?? sb) as unknown as {
      from: (table: string) => {
        update: (value: Record<string, string | number | null>) => {
          eq: (col: string, value: string) => Promise<{ error: { message: string } | null }>
        }
      }
    }
    const extra: Record<string, string | number | null> = {
      math_control_2026_score: note(body.mathControl2026Score),
      math_s2_2025_score: note(body.mathSemester2025Score),
      math_regional_2025_score: note(body.mathRegional2025Score),
    }
    if (typeof body.mathControl2026Max === 'number') extra.math_control_2026_max = note(body.mathControl2026Max)
    if (typeof body.mathSemester2025Max === 'number') extra.math_s2_2025_max = note(body.mathSemester2025Max)
    if (typeof body.mathRegional2025Max === 'number') extra.math_regional_2025_max = note(body.mathRegional2025Max)
    if (className) extra.class_name = className
    const saved = await loose.from('student_profiles').update(extra).eq('user_id', user.id)
    if (saved.error) console.error('[student-profile extra]', saved.error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[student-profile PUT]', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
