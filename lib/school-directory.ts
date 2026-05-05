/** Active school row for public pickers (`GET /api/schools`). */
export type PublicSchool = {
  id: string
  name: string
  city: string | null
}
