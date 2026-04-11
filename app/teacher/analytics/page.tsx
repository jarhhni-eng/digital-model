'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter,
} from 'recharts'
import {
  BarChart3, Users, TrendingUp, Brain, Layers, ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/i18n'
import {
  getGroupsForTeacher, getStudentProfile, getDomainScores, getGroupAnalytics,
} from '@/lib/data'
import type { CognitiveDomainScores } from '@/lib/types'

const DOMAIN_COLORS = {
  attentional: '#6366f1',
  reasoning: '#8b5cf6',
  spatial: '#a78bfa',
  visual: '#c084fc',
  memory: '#e879f9',
  executive: '#f0abfc',
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c084fc', '#e879f9', '#f0abfc']

export default function TeacherAnalyticsPage() {
  const { user } = useAuth()
  const { t, locale } = useTranslation()
  const [domainData, setDomainData] = useState<any[]>([])
  const [studentData, setStudentData] = useState<any[]>([])
  const [genderData, setGenderData] = useState<any[]>([])
  const [groupAnalytics, setGroupAnalytics] = useState<any>(null)

  const DOMAIN_LABELS = {
    attentional: locale === 'fr' ? 'Attentionnel' : 'انتباهي',
    reasoning: locale === 'fr' ? 'Raisonnement' : 'استدلالي',
    spatial: locale === 'fr' ? 'Spatial' : 'مكاني',
    visual: locale === 'fr' ? 'Visuel' : 'بصري',
    memory: locale === 'fr' ? 'Mémoire' : 'ذاكرة',
    executive: locale === 'fr' ? 'Exécutif' : 'تنفيذي',
  }

  useEffect(() => {
    if (!user) return

    const groups = getGroupsForTeacher(user.id)
    const allStudentIds = [...new Set(groups.flatMap((g) => g.studentIds))]

    const scores: Array<{ profile: any; ds: CognitiveDomainScores }> = allStudentIds
      .map((sid) => {
        const profile = getStudentProfile(sid)
        const ds = getDomainScores(sid)
        return profile && ds ? { profile, ds } : null
      })
      .filter(Boolean) as any[]

    if (scores.length === 0) {
      // Use seeded demo data
      const demoScores = [
        { attentional: 72, reasoning: 80, spatial: 75, visual: 68, memory: 71, executive: 77 },
        { attentional: 85, reasoning: 88, spatial: 82, visual: 79, memory: 84, executive: 86 },
        { attentional: 55, reasoning: 60, spatial: 58, visual: 52, memory: 57, executive: 53 },
      ]
      const domains = ['attentional', 'reasoning', 'spatial', 'visual', 'memory', 'executive'] as const
      const domainAvgs = domains.map((d) => ({
        domain: DOMAIN_LABELS[d],
        score: Math.round(demoScores.reduce((s, r) => s + (r as any)[d], 0) / demoScores.length),
      }))
      setDomainData(domainAvgs)
      setStudentData(demoScores.map((s, i) => ({
        name: ['Ahmed', 'Fatima', 'Youssef'][i],
        avg: Math.round(Object.values(s).reduce((a, b) => a + b, 0) / 6),
        spatial: s.spatial,
      })))
      setGenderData([
        { gender: locale === 'fr' ? 'Garçons' : 'ذكور', count: 2, avg: 72 },
        { gender: locale === 'fr' ? 'Filles' : 'إناث', count: 1, avg: 84 },
      ])
      return
    }

    const domains = ['attentional', 'reasoning', 'spatial', 'visual', 'memory', 'executive'] as const
    const domainAvgs = domains.map((d) => ({
      domain: DOMAIN_LABELS[d],
      score: Math.round(scores.reduce((s, r) => s + r.ds[d], 0) / scores.length),
    }))
    setDomainData(domainAvgs)

    const sData = scores.map((s) => ({
      name: s.profile.fullName.split(' ')[0],
      avg: Math.round(domains.reduce((sum, d) => sum + s.ds[d], 0) / 6),
      spatial: s.ds.spatial,
    }))
    setStudentData(sData)

    const males = scores.filter((s) => s.profile.gender === 'male')
    const females = scores.filter((s) => s.profile.gender === 'female')
    const avgOf = (arr: typeof scores) =>
      arr.length > 0
        ? Math.round(arr.reduce((s, r) => s + domains.reduce((sum, d) => sum + r.ds[d], 0) / 6, 0) / arr.length)
        : 0
    setGenderData([
      { gender: locale === 'fr' ? 'Garçons' : 'ذكور', count: males.length, avg: avgOf(males) },
      { gender: locale === 'fr' ? 'Filles' : 'إناث', count: females.length, avg: avgOf(females) },
    ])

    if (groups[0]) {
      setGroupAnalytics(getGroupAnalytics(groups[0].id))
    }
  }, [user, locale])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="teacher" />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t('teacher.analytics')}
            </h1>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
              <TabsTrigger value="individual">{t('analytics.individual')}</TabsTrigger>
              <TabsTrigger value="demographics">{t('analytics.demographics')}</TabsTrigger>
              <TabsTrigger value="psychometrics">{t('analytics.psychometrics')}</TabsTrigger>
              <TabsTrigger value="sem">{t('analytics.sem')}</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {groupAnalytics && (
                  <>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="text-2xl font-bold">{groupAnalytics.studentCount}</p>
                        <p className="text-sm text-muted-foreground">{t('teacher.total_students')}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="text-2xl font-bold">{groupAnalytics.averageScore}%</p>
                        <p className="text-sm text-muted-foreground">{t('teacher.class_avg')}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="text-2xl font-bold text-red-500">{groupAnalytics.atRiskCount}</p>
                        <p className="text-sm text-muted-foreground">{t('teacher.students_at_risk')}</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'fr' ? 'Scores moyens par domaine cognitif' : 'متوسط النتائج حسب المجال المعرفي'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={domainData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {domainData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Individual */}
            <TabsContent value="individual">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'fr' ? 'Performance individuelle' : 'الأداء الفردي'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={studentData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="avg" name={locale === 'fr' ? 'Score moyen' : 'متوسط النتيجة'} fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spatial" name={locale === 'fr' ? 'Spatial' : 'مكاني'} fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center">
                    <Button asChild variant="outline">
                      <Link href="/teacher/students">
                        <Users className="mr-2 h-4 w-4" />
                        {locale === 'fr' ? 'Voir tous les étudiants' : 'عرض جميع الطلاب'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Demographics */}
            <TabsContent value="demographics">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('analytics.demographics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={genderData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="gender" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avg" name={locale === 'fr' ? 'Score moyen' : 'متوسط النتيجة'} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Psychometrics */}
            <TabsContent value="psychometrics">
              <Card>
                <CardContent className="py-8 text-center space-y-4">
                  <Brain className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {locale === 'fr'
                      ? 'Le module psychométrique complet (IRT, PCA, indices de difficulté et discrimination) est disponible sur la page dédiée.'
                      : 'الوحدة الكاملة للقياس النفسي (IRT، PCA، مؤشرات الصعوبة والتمييز) متوفرة في الصفحة المخصصة.'}
                  </p>
                  <Button asChild>
                    <Link href="/teacher/analytics/psychometrics">
                      {t('analytics.psychometrics')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEM */}
            <TabsContent value="sem">
              <Card>
                <CardContent className="py-8 text-center space-y-4">
                  <TrendingUp className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {locale === 'fr'
                      ? 'Le modèle SEM (Modélisation par Équations Structurelles) avec diagramme de chemin, coefficients et indices d\'ajustement (RMSEA, CFI, TLI) est disponible sur la page dédiée.'
                      : 'نموذج SEM (نمذجة المعادلات البنائية) مع مخطط المسار والمعاملات ومؤشرات الملاءمة متوفر في الصفحة المخصصة.'}
                  </p>
                  <Button asChild>
                    <Link href="/teacher/analytics/sem">
                      {t('analytics.sem')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
