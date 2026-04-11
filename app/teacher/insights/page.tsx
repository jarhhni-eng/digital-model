'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Lightbulb, AlertCircle, TrendingUp, Users, ArrowUpRight, Printer,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/i18n'
import {
  getGroupsForTeacher, getStudentProfile, getDomainScores,
  getSEMResult, getCompetencyScores,
} from '@/lib/data'
import { computeLeveragePoints } from '@/lib/recommendations'
import type { CognitiveDomainScores } from '@/lib/types'

const DOMAIN_LABELS_FR = {
  attentional: 'Attentionnel', reasoning: 'Raisonnement', spatial: 'Spatial',
  visual: 'Visuel', memory: 'Mémoire', executive: 'Exécutif',
}
const DOMAIN_LABELS_AR = {
  attentional: 'انتباهي', reasoning: 'استدلالي', spatial: 'مكاني',
  visual: 'بصري', memory: 'ذاكرة', executive: 'تنفيذي',
}

export default function TeacherInsightsPage() {
  const { user } = useAuth()
  const { t, locale } = useTranslation()
  const [bottlenecks, setBottlenecks] = useState<{ domain: string; label: string; avg: number }[]>([])
  const [atRiskStudents, setAtRiskStudents] = useState<{ name: string; score: number; userId: string }[]>([])
  const [leveragePoints, setLeveragePoints] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const groups = getGroupsForTeacher(user.id)
    const allStudentIds = [...new Set(groups.flatMap((g) => g.studentIds))]

    // Demo data fallback
    const demoAvgs = { attentional: 70, reasoning: 76, spatial: 72, visual: 66, memory: 71, executive: 72 }
    const demoPts = computeLeveragePoints([])

    const domainKeys = ['attentional', 'reasoning', 'spatial', 'visual', 'memory', 'executive'] as const
    const labels = locale === 'fr' ? DOMAIN_LABELS_FR : DOMAIN_LABELS_AR

    if (allStudentIds.length === 0) {
      const sorted = domainKeys
        .map((d) => ({ domain: d, label: labels[d], avg: demoAvgs[d] }))
        .sort((a, b) => a.avg - b.avg)
      setBottlenecks(sorted.slice(0, 3))
      setAtRiskStudents([
        { name: 'Youssef Khalil', score: 56, userId: 'student-003' },
      ])
      setLeveragePoints(demoPts)
      return
    }

    const scores: Array<{ profile: any; ds: CognitiveDomainScores }> = allStudentIds
      .map((sid) => {
        const profile = getStudentProfile(sid)
        const ds = getDomainScores(sid)
        return profile && ds ? { profile, ds } : null
      })
      .filter(Boolean) as any[]

    const domainAvgs = domainKeys.map((d) => ({
      domain: d,
      label: labels[d],
      avg: Math.round(scores.reduce((s, r) => s + r.ds[d], 0) / scores.length),
    })).sort((a, b) => a.avg - b.avg)

    setBottlenecks(domainAvgs.slice(0, 3))

    const atRisk = scores
      .map((s) => {
        const avg = Math.round(domainKeys.reduce((sum, d) => sum + s.ds[d], 0) / 6)
        return { name: s.profile.fullName, score: avg, userId: s.profile.userId }
      })
      .filter((s) => s.score < 60)
      .sort((a, b) => a.score - b.score)

    setAtRiskStudents(atRisk)
    setLeveragePoints(demoPts)
  }, [user, locale])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="teacher" />
      <main className="flex-1 ml-64 p-8 print:ml-0">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                {t('nav.insights')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {locale === 'fr'
                  ? 'Synthèse stratégique — aide à la décision pédagogique'
                  : 'ملخص استراتيجي — دعم اتخاذ القرار التربوي'}
              </p>
            </div>
            <Button variant="outline" onClick={() => window.print()} className="gap-2 print:hidden">
              <Printer className="h-4 w-4" />
              {t('btn.print')}
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Bottlenecks */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  {locale === 'fr' ? 'Top 3 goulots d\'étranglement cognitifs' : 'أعلى 3 عقبات معرفية'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bottlenecks.map(({ domain, label, avg }, i) => (
                  <div key={domain} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm font-semibold text-amber-600">{avg}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-amber-400"
                          style={{ width: `${avg}%` }}
                        />
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={avg < 50 ? 'border-red-200 text-red-600' : 'border-amber-200 text-amber-600'}
                    >
                      {avg < 50
                        ? (locale === 'fr' ? 'Critique' : 'حرج')
                        : (locale === 'fr' ? 'Faible' : 'ضعيف')}
                    </Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  {locale === 'fr'
                    ? 'Ces domaines présentent les scores moyens les plus faibles et requièrent une attention pédagogique prioritaire.'
                    : 'تُظهر هذه المجالات أدنى متوسطات النتائج وتتطلب اهتمامًا تربويًا ذا أولوية.'}
                </p>
              </CardContent>
            </Card>

            {/* At-Risk Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-red-500" />
                  {locale === 'fr' ? 'Étudiants à risque' : 'طلاب في خطر'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {atRiskStudents.length === 0 ? (
                  <p className="text-sm text-emerald-600">
                    {locale === 'fr' ? 'Aucun étudiant à risque.' : 'لا يوجد طلاب في خطر.'}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {atRiskStudents.map((s) => (
                      <li key={s.userId} className="flex items-center justify-between text-sm">
                        <span className="truncate">{s.name}</span>
                        <Badge variant="destructive" className="text-xs shrink-0">{s.score}%</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Leverage Points */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {locale === 'fr'
                    ? 'Points de levier pédagogiques (basés sur les coefficients SEM)'
                    : 'نقاط الرفع التربوية (بناءً على معاملات SEM)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  {locale === 'fr'
                    ? 'Ces domaines ont le plus fort impact prédit sur les compétences mathématiques selon les modèles SEM. Les améliorer aurait le plus grand effet sur la maîtrise en géométrie.'
                    : 'هذه المجالات لها أقوى تأثير متوقع على الكفاءات الرياضية وفق نماذج SEM. تحسينها سيحقق أكبر أثر على إتقان الهندسة.'}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {leveragePoints.slice(0, 6).map((lp, i) => (
                    <div
                      key={lp.domain}
                      className={`rounded-lg border p-3 ${
                        lp.priority === 'high'
                          ? 'border-primary/30 bg-primary/5'
                          : lp.priority === 'medium'
                          ? 'border-border bg-muted/30'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          {locale === 'fr' ? lp.domainFr : lp.domainAr}
                        </span>
                        <span className="text-xs text-muted-foreground">#{i + 1}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`mt-2 text-[10px] ${
                          lp.priority === 'high'
                            ? 'border-primary/30 text-primary'
                            : 'border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {locale === 'fr'
                          ? lp.priority === 'high' ? 'Haute priorité' : lp.priority === 'medium' ? 'Priorité moyenne' : 'Faible priorité'
                          : lp.priority === 'high' ? 'أولوية عالية' : lp.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
