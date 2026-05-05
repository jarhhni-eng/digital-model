/** Row shape for `GET /api/teachers` (registered `profiles` with role `teacher`). */
export type TeacherDirectoryEntry = {
  id: string
  email: string
  full_name: string | null
  school_id: string | null
}
