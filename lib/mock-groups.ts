/** Demo groups: 20–30 students per teacher, multi-institution. */

export interface Institution {
  id: string
  name: string
}

export interface TeacherGroup {
  id: string
  institutionId: string
  teacherName: string
  name: string
  studentCount: number
  level: string
}

export const mockInstitutions: Institution[] = [
  { id: 'inst-ens-fes', name: 'ENS Fès' },
  { id: 'inst-lycee-x', name: 'Lycée Qualifiant — Démo' },
]

export const mockTeacherGroups: TeacherGroup[] = [
  {
    id: 'grp-1',
    institutionId: 'inst-ens-fes',
    teacherName: 'Prof. Démo',
    name: 'Groupe A — Tronc Commun',
    studentCount: 24,
    level: 'Tronc Commun',
  },
  {
    id: 'grp-2',
    institutionId: 'inst-ens-fes',
    teacherName: 'Prof. Démo',
    name: 'Groupe B — 1ère Bac Sciences',
    studentCount: 28,
    level: '1st Year Baccalaureate',
  },
]
