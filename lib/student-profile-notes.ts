const MARK = '#notes:'

export type SchoolNotes = {
  control: number | null
  semester: number | null
  regional: number | null
}

function numberOrBlank(value: string | undefined): number | null {
  if (value == null || value.trim() === '') return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function notePart(value: number | null): string {
  return value == null ? '' : String(value)
}

/** Keep the school year visible and attach the three Profile Setup marks. */
export function packSchoolYear(year: string | null, notes: SchoolNotes): string | null {
  const clean = (year ?? '').split(MARK)[0]
  const any = notes.control != null || notes.semester != null || notes.regional != null
  if (!any) return clean || null
  return `${clean}${MARK}${notePart(notes.control)}|${notePart(notes.semester)}|${notePart(notes.regional)}`
}

export function unpackSchoolYear(stored: string | null | undefined): SchoolNotes & { year: string | null } {
  if (!stored) return { year: null, control: null, semester: null, regional: null }
  const [yearPart, notePart] = stored.split(MARK)
  const year = yearPart || null
  if (notePart == null) return { year, control: null, semester: null, regional: null }
  const [control, semester, regional] = notePart.split('|')
  return {
    year,
    control: numberOrBlank(control),
    semester: numberOrBlank(semester),
    regional: numberOrBlank(regional),
  }
}
