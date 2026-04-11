'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Layers,
  Plus,
  Users,
  ClipboardList,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/i18n'
import { getGroupsForTeacher, saveGroup } from '@/lib/data'
import { MOROCCAN_INSTITUTIONS } from '@/lib/mock-users'
import type { Group, GradeLevel } from '@/lib/types'

export default function TeacherGroupsPage() {
  const { user } = useAuth()
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupGrade, setNewGroupGrade] = useState<GradeLevel>('1bac')
  const [newGroupInstitution, setNewGroupInstitution] = useState('')

  useEffect(() => {
    if (!user) return
    setGroups(getGroupsForTeacher(user.id))
  }, [user])

  const handleCreate = () => {
    if (!user || !newGroupName.trim() || !newGroupInstitution) return
    const group: Group = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      teacherId: user.id,
      institutionId: newGroupInstitution.replace(/\s+/g, '-').toLowerCase(),
      gradeLevel: newGroupGrade,
      academicYear: '2025-2026',
      studentIds: [],
      assignedTestIds: [],
    }
    saveGroup(group)
    setGroups((prev) => [...prev, group])
    setShowCreate(false)
    setNewGroupName('')
    setNewGroupInstitution('')
  }

  const gradeLabel: Record<GradeLevel, string> = {
    'tronc-commun': t('profile.grade.tronc-commun'),
    '1bac': t('profile.grade.1bac'),
    '2bac': t('profile.grade.2bac'),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="teacher" />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                {t('nav.groups')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {groups.length} {locale === 'fr' ? 'groupe(s)' : 'مجموعة'}
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('btn.create_group')}
            </Button>
          </div>

          {/* Create form */}
          {showCreate && (
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">{t('group.create')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t('group.name')}</label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder={locale === 'fr' ? 'ex: 1BAC SM Groupe A' : 'مثال: أولى بك عم مج أ'}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t('group.level')}</label>
                    <select
                      value={newGroupGrade}
                      onChange={(e) => setNewGroupGrade(e.target.value as GradeLevel)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {(['tronc-commun', '1bac', '2bac'] as GradeLevel[]).map((g) => (
                        <option key={g} value={g}>{gradeLabel[g]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('group.institution')}</label>
                  <select
                    value={newGroupInstitution}
                    onChange={(e) => setNewGroupInstitution(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">{locale === 'fr' ? '-- Choisir --' : '-- اختر --'}</option>
                    {MOROCCAN_INSTITUTIONS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreate}
                    disabled={!newGroupName.trim() || !newGroupInstitution}
                  >
                    {t('btn.save')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    {t('btn.cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Groups list */}
          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">
                  {locale === 'fr' ? 'Aucun groupe créé.' : 'لم تُنشأ مجموعات بعد.'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreate(true)}
                >
                  {t('btn.create_group')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/teacher/groups/${group.id}`}
                  className="block"
                >
                  <Card className="hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{group.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{group.institutionId}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {gradeLabel[group.gradeLevel]}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {group.studentIds.length} {locale === 'fr' ? 'étudiants' : 'طالب'}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {group.assignedTestIds.length} {locale === 'fr' ? 'tests' : 'اختبار'}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {group.academicYear}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-end text-xs text-primary font-medium">
                        {locale === 'fr' ? 'Voir le groupe' : 'عرض المجموعة'}
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
