'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/i18n'
import { getGroupsForTeacher, getStudentProfile, getDomainScores } from '@/lib/data'
import type { StudentProfile, CognitiveDomainScores } from '@/lib/types'

interface StudentEntry {
  profile: StudentProfile
  domainScores: CognitiveDomainScores | null
  averageScore: number
  riskLevel: 'low' | 'medium' | 'high'
}

export default function TeacherStudentsPage() {
  const { user } = useAuth()
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [students, setStudents] = useState<StudentEntry[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    const groups = getGroupsForTeacher(user.id)
    const allStudentIds = [...new Set(groups.flatMap((g) => g.studentIds))]

    const entries: StudentEntry[] = allStudentIds
      .map((sid) => {
        const profile = getStudentProfile(sid)
        if (!profile) return null
        const domainScores = getDomainScores(sid)
        const domains = domainScores
          ? [
              domainScores.attentional,
              domainScores.reasoning,
              domainScores.spatial,
              domainScores.visual,
              domainScores.memory,
              domainScores.executive,
            ]
          : []
        const averageScore =
          domains.length > 0
            ? Math.round(domains.reduce((a, b) => a + b, 0) / domains.length)
            : 0
        const riskLevel =
          averageScore < 40 ? 'high' : averageScore < 60 ? 'medium' : 'low'
        return { profile, domainScores, averageScore, riskLevel }
      })
      .filter(Boolean) as StudentEntry[]

    setStudents(entries)
  }, [user])

  const filtered = students.filter(
    (s) =>
      s.profile.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.profile.institution.toLowerCase().includes(search.toLowerCase())
  )

  const riskColor = {
    low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-red-600 bg-red-50 border-red-200',
  }
  const riskLabel = {
    low: locale === 'fr' ? 'Faible risque' : 'خطر منخفض',
    medium: locale === 'fr' ? 'À surveiller' : 'يحتاج متابعة',
    high: locale === 'fr' ? 'Intervention urgente' : 'تدخل عاجل',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="teacher" />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                {t('teacher.students')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {students.length} {locale === 'fr' ? 'étudiants dans vos groupes' : 'طالب في مجموعاتك'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={locale === 'fr' ? 'Rechercher un étudiant...' : 'البحث عن طالب...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(['low', 'medium', 'high'] as const).map((risk) => {
              const count = students.filter((s) => s.riskLevel === risk).length
              return (
                <Card key={risk} className={`border ${riskColor[risk]}`}>
                  <CardContent className="pt-4 pb-3">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs font-medium">{riskLabel[risk]}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Student table */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">
                  {locale === 'fr' ? 'Aucun étudiant trouvé.' : 'لم يُعثر على طلاب.'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/teacher/groups')}
                >
                  {locale === 'fr' ? 'Gérer les groupes' : 'إدارة المجموعات'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(({ profile, averageScore, riskLevel }) => (
                <Link
                  key={profile.userId}
                  href={`/teacher/students/${profile.userId}`}
                  className="block"
                >
                  <Card className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                            {profile.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{profile.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {profile.institution} · {profile.gradeLevel === 'tronc-commun'
                                ? t('profile.grade.tronc-commun')
                                : profile.gradeLevel === '1bac'
                                ? t('profile.grade.1bac')
                                : t('profile.grade.2bac')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold">{averageScore}%</p>
                            <p className="text-xs text-muted-foreground">
                              {locale === 'fr' ? 'Score moyen' : 'متوسط النتيجة'}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs border ${riskColor[riskLevel]}`}
                            variant="outline"
                          >
                            {riskLevel === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {riskLabel[riskLevel]}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
