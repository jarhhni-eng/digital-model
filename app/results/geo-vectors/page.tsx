'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BarChart3, Calendar, ChevronRight, Triangle, BookOpen } from 'lucide-react'
import type { LessonResultRecord } from '@/lib/submissions-types'
import { VECTORS_LESSON_TITLE, COMPETENCY_LABELS } from '@/lib/geo-vectors-lesson'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(pct: number) {
  if (pct >= 75) return 'text-green-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-500'
}

function scoreBarColor(pct: number) {
  if (pct >= 75) return 'bg-green-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-400'
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Aucun résultat pour le moment</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Vous n&apos;avez pas encore passé l&apos;évaluation «&nbsp;{VECTORS_LESSON_TITLE}&nbsp;».
      </p>
      <Button onClick={onStart} className="bg-indigo-600 hover:bg-indigo-700 text-white">
        Passer l&apos;évaluation
      </Button>
    </div>
  )
}

// ─── Attempt card ─────────────────────────────────────────────────────────────

function AttemptCard({ record, attempt }: { record: LessonResultRecord; attempt: number }) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-indigo-400">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Tentative {attempt}
            </span>
            {record.diagnosticAnswer && (
              <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">
                {record.diagnosticAnswer}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(record.submittedAt)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Global score */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className={cn('text-3xl font-extrabold', scoreColor(record.globalPercent))}>
              {record.globalPercent}%
            </p>
            <p className="text-xs text-muted-foreground">
              {record.globalCorrect}/{record.globalTotal} correctes
            </p>
          </div>
          <div className="flex-1">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', scoreBarColor(record.globalPercent))}
                style={{ width: `${record.globalPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Per-competency */}
        {record.competencyScores.length > 0 && (
          <div className="space-y-2.5 pt-1 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Par compétence
            </p>
            {record.competencyScores.map((cs) => (
              <div key={cs.competency} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-indigo-700 border-indigo-300 bg-indigo-50 font-bold text-xs px-1.5 py-0"
                    >
                      {cs.competency}
                    </Badge>
                    <span className="text-muted-foreground truncate max-w-[160px]">
                      {COMPETENCY_LABELS[cs.competency] ?? cs.competency}
                    </span>
                  </div>
                  <span className={cn('font-bold tabular-nums', scoreColor(cs.percent))}>
                    {cs.correct}/{cs.total} ({cs.percent}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', scoreBarColor(cs.percent))}
                    style={{ width: `${cs.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeoVectorsResultsPage() {
  const router   = useRouter()
  const { user, loading } = useAuth()
  const isMobile = useIsMobile()

  const [records, setRecords]     = useState<LessonResultRecord[]>([])
  const [fetching, setFetching]   = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.userId) return
    fetch(`/api/lesson-results?userId=${encodeURIComponent(user.userId)}&testId=test-geo-vectors`)
      .then((r) => r.json())
      .then((d) => setRecords(d.results ?? []))
      .catch(() => setRecords([]))
      .finally(() => setFetching(false))
  }, [user?.userId])

  // ── Aggregated stats (across all attempts) ─────────────────────────────────
  const latestRecord = records[0] ?? null

  const avgGlobal = records.length
    ? Math.round(records.reduce((s, r) => s + r.globalPercent, 0) / records.length)
    : 0

  const compAvg: Record<string, { total: number; sum: number; label: string }> = {}
  for (const rec of records) {
    for (const cs of rec.competencyScores) {
      if (!compAvg[cs.competency]) compAvg[cs.competency] = { total: 0, sum: 0, label: cs.label }
      compAvg[cs.competency].total++
      compAvg[cs.competency].sum += cs.percent
    }
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Chargement…</p>
    </div>
  )

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" userName={user.username} />

      <div className={cn('transition-all duration-200', isMobile ? 'ml-0' : 'ml-64')}>
        <Header
          title="Résultats — Vecteurs et Translations"
          subtitle="Historique de vos tentatives et scores par compétence"
        />

        <main className={cn('p-4 md:p-6 pt-24 max-w-3xl', isMobile && 'pb-20')}>

          {/* Domain breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Triangle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cognition et apprentissage de la géométrie</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-foreground">{VECTORS_LESSON_TITLE}</span>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <EmptyState onStart={() => router.push('/tests/test-geo-vectors')} />
          ) : (
            <div className="space-y-6">

              {/* Summary strip */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <p className={cn('text-3xl font-bold', scoreColor(avgGlobal))}>{avgGlobal}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Moyenne globale</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-3xl font-bold text-foreground">{records.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tentative{records.length > 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <p className={cn('text-3xl font-bold', scoreColor(latestRecord?.globalPercent ?? 0))}>
                      {latestRecord?.globalPercent ?? 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Dernière tentative</p>
                  </CardContent>
                </Card>
              </div>

              {/* Competency averages */}
              {Object.keys(compAvg).length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Moyenne par compétence (toutes tentatives)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(compAvg)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([comp, { total, sum, label }]) => {
                        const avg = Math.round(sum / total)
                        return (
                          <div key={comp} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-indigo-700 border-indigo-300 bg-indigo-50 font-bold text-xs">
                                  {comp}
                                </Badge>
                                <span className="text-muted-foreground text-xs truncate max-w-[200px]">{label}</span>
                              </div>
                              <span className={cn('font-bold tabular-nums', scoreColor(avg))}>{avg}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div className={cn('h-full rounded-full', scoreBarColor(avg))} style={{ width: `${avg}%` }} />
                            </div>
                          </div>
                        )
                      })}
                  </CardContent>
                </Card>
              )}

              {/* All attempts */}
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Historique des tentatives
                </h2>
                <div className="space-y-4">
                  {records.map((rec, idx) => (
                    <AttemptCard
                      key={rec.id}
                      record={rec}
                      attempt={records.length - idx}
                    />
                  ))}
                </div>
              </div>

              {/* Retake button */}
              <Button
                onClick={() => router.push('/tests/test-geo-vectors')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Repasser l&apos;évaluation
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
