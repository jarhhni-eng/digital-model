import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'
import { tryGetSupabaseAdmin } from '@/lib/supabase/server'
import { unpackSchoolYear } from '@/lib/student-profile-notes'
import {
  fetchCompletedSessions,
  geometryCellsFromSession,
  latestCompletedByStudentTest,
} from '@/lib/admin/completed-sessions'
import { fetchArchivedUserIds, withoutArchived } from '@/lib/admin/archived-accounts'
import {
  geometryCognitionTestIds,
  platformDomains,
} from '@/lib/platform-domains'
import { getCapacitiesForTestId } from '@/lib/geometry/capacity-definitions'
import { configuredCanonicalParts } from '@/lib/geometry/geometry-partition'
import {
  isExternalTest,
  isInternalExceptionTest,
} from '@/lib/assessment/administration'
import type { Json } from '@/lib/types/database'

type ScoreCell = { earned: number | null; max: number | null; percent: number | null }
type ExternalRow = {
  student_id: string
  test_id: string
  raw_score: number | null
  max_score: number | null
  normalized_score: number | null
  validation_status: string
  source: string | null
}

function plain(label: string): string {
  return label.replace(/\\[()[\]]/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim()
}

function splitName(full: string | null): { firstName: string; lastName: string } {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { firstName: '', lastName: parts[0] ?? '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function genderLabel(value: unknown): string | null {
  if (value === 'Male') return 'Homme'
  if (value === 'Female') return 'Femme'
  if (typeof value === 'string' && value.trim() !== '') return value.trim()
  return null
}

function clicksFrom(metadata: Json): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const row = metadata as Record<string, unknown>
  return numberOrNull(row.totalClicks) ?? numberOrNull(row.clickCount) ?? numberOrNull(row.clicks)
}

export async function GET() {
  const gate = await requireAdmin()
  if ('response' in gate) return gate.response
  const { sb } = gate

  const geometryIds = geometryCognitionTestIds()
  const catalogue = platformDomains.flatMap((domain) =>
    domain.subdomains.flatMap((sub) =>
      sub.capacities.map((capacity) => ({
        id: capacity.testId,
        name: capacity.nameFr ?? capacity.name,
        domainId: domain.id,
        domainName: domain.name,
      })),
    ),
  )
  const byId = new Map(catalogue.map((test) => [test.id, test]))

  const reader = tryGetSupabaseAdmin() ?? sb
  const [
    { data: rawProfiles, error: profilesError },
    { data: rawStudentProfiles, error: schoolError },
    sessionsResult,
    archivedResult,
  ] = await Promise.all([
    reader.from('profiles').select('id, full_name, email').eq('role', 'student').is('archived_at', null),
    reader.from('student_profiles').select('*'),
    fetchCompletedSessions(reader),
    fetchArchivedUserIds(reader),
  ])
  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 })
  if (schoolError) return NextResponse.json({ error: schoolError.message }, { status: 500 })
  if (sessionsResult.error) return NextResponse.json({ error: sessionsResult.error }, { status: 500 })
  if (archivedResult.error) {
    // Fail closed: never risk returning archived accounts' data.
    return NextResponse.json({ error: archivedResult.error }, { status: 500 })
  }
  const archived = archivedResult.ids
  const profiles = withoutArchived(rawProfiles, archived, (row) => row.id)
  const studentProfiles = withoutArchived(rawStudentProfiles, archived, (row) => row.user_id)
  const sessionRows = withoutArchived(sessionsResult.rows, archived, (row) => row.user_id)

  const schoolByStudent = new Map((studentProfiles ?? []).map((row) => [row.user_id, row]))
  const latest = latestCompletedByStudentTest(sessionRows)

  let external: ExternalRow[] = []
  const loose = sb as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, value: string) => Promise<{ data: ExternalRow[] | null; error: { message: string } | null }>
      }
    }
  }
  const externalQuery = await loose
    .from('external_results')
    .select('student_id, test_id, raw_score, max_score, normalized_score, validation_status, source')
    .eq('validation_status', 'validated')
  if (!externalQuery.error) external = withoutArchived(externalQuery.data, archived, (row) => row.student_id)

  const ckaTests = geometryIds.map((id) => ({
    id,
    name: byId.get(id)?.name ?? id,
    capacities: getCapacitiesForTestId(id).map((capacity) => ({
      code: capacity.code,
      label: plain(capacity.label),
    })),
    parts: configuredCanonicalParts(id).map((part) => ({
      key: String(part.part),
      label: part.label,
    })),
  }))
  const otherTests = catalogue
    .filter((test) => !geometryIds.includes(test.id))
    .map((test) => ({
      id: test.id,
      name: test.name,
      domainName: test.domainName,
      mode: isExternalTest(test.id) ? 'external' : isInternalExceptionTest(test.id) ? 'internal' : 'external',
    }))

  const students = (profiles ?? []).map((profile) => {
    const school = schoolByStudent.get(profile.id) as {
      grade_level?: string | null
      teacher_name?: string | null
      school_name?: string | null
      academic_year?: string | null
      class_name?: string | null
      supervised_test_score?: number | null
      supervised_test_max?: number | null
      previous_semester_average?: number | null
      math_control_2026_score?: number | string | null
      math_s2_2025_score?: number | string | null
      math_regional_2025_score?: number | string | null
      age?: number | string | null
      gender?: string | null
    } | undefined
    const names = splitName(profile.full_name)
    const cka: Record<string, {
      global: ScoreCell
      capacities: Record<string, ScoreCell>
      parts: Record<string, ScoreCell>
      durationMs: number | null
      clicks: number | null
    }> = {}
    const other: Record<string, ScoreCell & { source: string | null }> = {}

    for (const session of latest.values()) {
      if (session.user_id !== profile.id) continue
      const scored = geometryCellsFromSession(session.test_id, session)
      const durationMs =
        session.total_ms ??
        (session.completed_at
          ? Math.max(0, new Date(session.completed_at).getTime() - new Date(session.started_at).getTime())
          : null)
      if (geometryIds.includes(session.test_id)) {
        cka[session.test_id] = {
          global: scored.global,
          capacities: scored.capacities,
          parts: scored.parts,
          durationMs,
          clicks: clicksFrom(session.metadata),
        }
      } else {
        other[session.test_id] = { ...scored.global, source: 'internal' }
      }
    }

    for (const row of external) {
      if (row.student_id !== profile.id || geometryIds.includes(row.test_id) || other[row.test_id]) continue
      const percent =
        row.normalized_score != null
          ? Number(row.normalized_score)
          : row.raw_score != null && row.max_score != null && Number(row.max_score) > 0
            ? (Number(row.raw_score) / Number(row.max_score)) * 100
            : null
      other[row.test_id] = {
        earned: row.raw_score == null ? null : Number(row.raw_score),
        max: row.max_score == null ? null : Number(row.max_score),
        percent,
        source: row.source ?? 'external',
      }
    }

    return {
      studentId: profile.id,
      firstName: names.firstName,
      lastName: names.lastName,
      level: school?.grade_level ?? null,
      className: school?.class_name ?? null,
      teacher: school?.teacher_name ?? null,
      school: school?.school_name ?? null,
      year: unpackSchoolYear(school?.academic_year).year,
      supervisedScore: school?.supervised_test_score ?? null,
      supervisedMax: school?.supervised_test_max ?? null,
      previousAverage: school?.previous_semester_average ?? null,
      controlScore: numberOrNull(school?.math_control_2026_score) ?? unpackSchoolYear(school?.academic_year).control,
      semesterScore: numberOrNull(school?.math_s2_2025_score) ?? unpackSchoolYear(school?.academic_year).semester,
      regionalScore: numberOrNull(school?.math_regional_2025_score) ?? unpackSchoolYear(school?.academic_year).regional,
      gender: genderLabel(school?.gender),
      age: (() => {
        const age = numberOrNull(school?.age)
        return age != null && age > 0 ? age : null
      })(),
      cka,
      other,
    }
  })

  return NextResponse.json({ students, ckaTests, otherTests })
}
