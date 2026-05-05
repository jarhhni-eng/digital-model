'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Test } from '@/lib/mock-data'
import type { Database } from '@/lib/types/database'
import { listMySessions } from '@/lib/results/results-service'
import { useTestsCatalog } from '@/hooks/use-tests-catalog'
import {
  mergeCatalogWithSessions,
  averageCompletedScore,
  type TestWithProgress,
} from '@/lib/student-test-progress'
import { useAuth } from '@/lib/auth-context'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Calendar,
  Timer,
  FileQuestion,
  Pencil,
  Type,
  Mic,
  ArrowRight,
  Info,
} from 'lucide-react'
import { ChartAreaSkeleton, ValueTextSkeleton } from '@/components/ui/value-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

type SessionRow = Database['public']['Tables']['test_sessions']['Row']

const testTypeConfig: Record<Test['type'], { label: string; icon: React.ReactNode }> = {
  mcq: { label: 'MCQ', icon: <FileQuestion className="w-4 h-4" /> },
  drawing: { label: 'Drawing', icon: <Pencil className="w-4 h-4" /> },
  text: { label: 'Text', icon: <Type className="w-4 h-4" /> },
  audio: { label: 'Audio', icon: <Mic className="w-4 h-4" /> },
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export default function TestsPage() {
  const isMobile = useIsMobile()
  const { user, loading: authLoading } = useAuth()
  const { catalog, fromDatabase, loading: catalogLoading } = useTestsCatalog()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const tests = useMemo(
    () => mergeCatalogWithSessions(catalog, user ? sessions : []),
    [catalog, sessions, user],
  )

  useEffect(() => {
    if (!user) {
      setSessions([])
      setSessionsLoading(false)
      setFetchError(null)
      return
    }
    let cancelled = false
    setSessionsLoading(true)
    setFetchError(null)
    listMySessions({ limit: 500 })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setFetchError(error)
          setSessions([])
          return
        }
        setSessions(data)
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError('Could not load your sessions.')
          setSessions([])
        }
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, fromDatabase])

  const completed = tests.filter((t) => t.status === 'completed')
  const inProgress = tests.filter((t) => t.status === 'in-progress')
  const upcoming = tests.filter((t) => t.status === 'upcoming')
  const total = tests.length
  const completedPercent = total ? Math.round((completed.length / total) * 100) : 0
  const overallAvg = useMemo(() => {
    const hasScored = tests.some((t) => t.status === 'completed' && t.latestScore != null)
    if (!hasScored) return null
    return averageCompletedScore(tests)
  }, [tests])

  if (authLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Sidebar userRole="student" />
        <div className={cn('transition-all duration-200', isMobile ? 'ml-0' : 'ml-64')}>
          <Header
            title="Évaluations"
            subtitle="Consultez les tests, suivez votre progression et commencez les évaluations"
          />
          <main className={cn('p-4 md:p-6 pt-24 max-w-7xl space-y-6', isMobile && 'pb-20')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6 pb-4 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <ValueTextSkeleton className="h-9 w-14" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Overall progress</CardTitle>
                <CardDescription>Chargement…</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartAreaSkeleton height={80} />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const listReady = !user || (!catalogLoading && !sessionsLoading)

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" />

      <div className={cn('transition-all duration-200', isMobile ? 'ml-0' : 'ml-64')}>
        <Header
          title="Évaluations"
          subtitle="Consultez les tests, suivez votre progression et commencez les évaluations"
        />

        <main className={cn('p-4 md:p-6 pt-24 max-w-7xl', isMobile && 'pb-20')}>
          {fetchError && (
            <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {fetchError} Showing catalog only — scores update after you complete tests.
            </p>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total tests
                </CardTitle>
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {listReady ? (
                  <div className="text-2xl font-bold">{total}</div>
                ) : (
                  <ValueTextSkeleton className="h-9 w-14" />
                )}
                <p className="text-xs text-muted-foreground">In the catalog</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                {listReady ? (
                  <div className="text-2xl font-bold text-green-600">{completed.length}</div>
                ) : (
                  <ValueTextSkeleton className="h-9 w-14" />
                )}
                <p className="text-xs text-muted-foreground">
                  {listReady ? `${completedPercent}% of total` : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In progress
                </CardTitle>
                <Clock className="h-5 w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                {listReady ? (
                  <div className="text-2xl font-bold text-amber-600">{inProgress.length}</div>
                ) : (
                  <ValueTextSkeleton className="h-9 w-14" />
                )}
                <p className="text-xs text-muted-foreground">Resume anytime</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </CardTitle>
                <Calendar className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                {listReady ? (
                  <div className="text-2xl font-bold text-blue-600">{upcoming.length}</div>
                ) : (
                  <ValueTextSkeleton className="h-9 w-14" />
                )}
                <p className="text-xs text-muted-foreground">Not started yet</p>
              </CardContent>
            </Card>
          </div>

          {listReady && user && overallAvg != null && (
            <p className="mb-4 text-sm text-muted-foreground">
              Average score (completed tests with a score):{' '}
              <span className="font-semibold text-foreground">{overallAvg}%</span>
            </p>
          )}

          {/* Progress overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Overall progress</CardTitle>
              <CardDescription>
                How many assessments you&apos;ve completed so far (saved to your account)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {listReady ? (
                <>
              <div className="flex items-center gap-4">
                <Progress value={completedPercent} className="h-3 flex-1" />
                <span className="text-sm font-medium tabular-nums">{completedPercent}%</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  Completed {completed.length}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  In progress {inProgress.length}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Upcoming {upcoming.length}
                </span>
              </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full rounded-full" />
                  <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simple info callout */}
          <div className="mb-8 flex gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">About assessments</p>
              <p>
                Each test is timed. You can start or continue a test from the list below. Completed
                tests are stored in your CogniTest account and appear here and on the Results page.
              </p>
            </div>
          </div>

          {/* All tests list */}
          <div>
            <h2 className="mb-2 text-xl font-bold text-foreground">All assessments</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Click a test to start, continue, or review (results on Results page).
            </p>
            <div className="space-y-4">
              {tests.map((test) => {
                const typeInfo = testTypeConfig[test.type]
                const statusVariant =
                  test.status === 'completed'
                    ? 'default'
                    : test.status === 'in-progress'
                      ? 'secondary'
                      : 'outline'
                const actionLabel =
                  test.status === 'completed'
                    ? 'View results'
                    : test.status === 'in-progress'
                      ? 'Continue'
                      : 'Start test'
                const actionHref =
                  listReady && test.status === 'completed' ? '/results' : `/tests/${test.id}`

                return (
                  <Card
                    key={test.id}
                    className="overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{test.title}</h3>
                          {listReady ? (
                            <Badge variant={statusVariant} className="shrink-0">
                              {test.status === 'completed'
                                ? 'Completed'
                                : test.status === 'in-progress'
                                  ? 'In progress'
                                  : 'Upcoming'}
                            </Badge>
                          ) : (
                            <Skeleton className="h-6 w-24 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{test.domain}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            {typeInfo.icon}
                            {typeInfo.label}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Timer className="h-3.5 w-3.5" />
                            {formatDuration(test.duration)}
                          </span>
                          {listReady &&
                            test.status === 'completed' &&
                            test.latestScore != null && (
                            <span className="font-medium text-foreground">
                              Score: {test.latestScore}%
                            </span>
                          )}
                          {!listReady && user && (
                            <Skeleton className="h-4 w-24 rounded inline-block" />
                          )}
                          {test.dueDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              Due {test.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 self-start sm:self-center"
                        asChild
                      >
                        <Link href={actionHref}>
                          {listReady ? actionLabel : 'Open'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
