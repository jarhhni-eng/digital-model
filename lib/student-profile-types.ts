/** Moroccan secondary education — profile stored per student user. */

export type MoroccanGradeLevel =
  | 'Tronc Commun'
  | '1st Year Baccalaureate'
  | '2nd Year Baccalaureate'
  | 'Other'

export type AcademicTrack =
  | 'Scientific'
  | 'Mathematical Sciences'
  | 'Experimental Sciences'
  | ''

export interface StudentAcademicProfile {
  userId: string
  fullName: string
  age: number
  gender: 'Male' | 'Female' | ''
  teacherName: string
  schoolName: string
  gradeLevel: MoroccanGradeLevel
  /** Required when grade is Tronc Commun or 1st Year Bac per rules */
  academicTrack: AcademicTrack
  academicYear: string
  mathScoreCurrent: number | null
  mathScorePrevious: number | null
  institutionId: string
  groupId: string
  updatedAt: string
}

export function resolveDefaultTrack(grade: MoroccanGradeLevel): AcademicTrack {
  if (grade === 'Tronc Commun') return 'Scientific'
  return ''
}

export function trackRequired(grade: MoroccanGradeLevel): boolean {
  return grade === '1st Year Baccalaureate'
}
