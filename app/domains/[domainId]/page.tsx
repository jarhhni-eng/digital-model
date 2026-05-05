'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { platformDomains } from '@/lib/platform-domains'
import type { DomainCapacity } from '@/lib/mock-data'
import { listMySessions } from '@/lib/results/results-service'
import { useTestsCatalog } from '@/hooks/use-tests-catalog'
import { mergeCatalogWithSessions, type TestWithProgress } from '@/lib/student-test-progress'
import { useAuth } from '@/lib/auth-context'
import type { Database } from '@/lib/types/database'
import { ArrowLeft, ClipboardList, ChevronRight, Brain, Calculator, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DomainDetailPageProps {
  params: Promise<{ domainId: string }>
}

type SessionRow = Database['public']['Tables']['test_sessions']['Row']

export default function DomainDetailPage({ params }: DomainDetailPageProps) {
  const { domainId } = use(params)
  const domain = platformDomains.find((d) => d.id === domainId)
  const isMobile = useIsMobile()
  const { user, loading: authLoading } = useAuth()
  const { catalog, fromDatabase } = useTestsCatalog()

  const [sessionRows, setSessionRows] = useState<SessionRow[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const byTestId = useMemo(
    () => new Map(mergeCatalogWithSessions(catalog, sessionRows).map((t) => [t.id, t])),
    [catalog, sessionRows],
  )

  const capacityIds = useMemo(() => {
    if (!domain) return [] as string[]
    return domain.subdomains.flatMap((s) => s.capacities.map((c) => c.testId))
  }, [domain])

  useEffect(() => {
    if (!user) {
      setSessionRows([])
      setFetchError(null)
      setSessionsLoading(false)
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
          setSessionRows([])
        } else {
          setSessionRows(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError('Could not load progress.')
          setSessionRows([])
        }
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, fromDatabase])

  const domainStats = useMemo(() => {
    if (!domain) return null
    const totalCap = domain.subdomains.reduce((n, s) => n + s.capacities.length, 0)
    let completed = 0
    let inProg = 0
    const scores: number[] = []
    for (const tid of capacityIds) {
      const t = byTestId.get(tid)
      if (!t) continue
      if (t.status === 'completed') {
        completed++
        if (t.latestScore != null) scores.push(t.latestScore)
      } else if (t.status === 'in-progress') inProg++
    }
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    const completionPct = totalCap ? Math.round((completed / totalCap) * 100) : 0
    return { totalCap, completed, inProg, avg, completionPct }
  }, [domain, byTestId, capacityIds])

  if (!domain) {
    return (
      <div className="bg-background min-h-screen">
        <Sidebar userRole="student" />
        <div className={cn('p-4 md:p-6 pt-24 transition-all', isMobile ? 'ml-0' : 'ml-64')}>
          <div className="max-w-2xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Domain not found</h1>
            <p className="text-muted-foreground mb-6">
              The domain you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Button variant="outline" asChild>
              <Link href="/domains">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Domains
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const DomainIcon = domain.id === 'geometry-learning' ? Calculator : Brain

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" />

      <div className={cn('transition-all duration-200', isMobile ? 'ml-0' : 'ml-64')}>
        <Header title={domain.name} subtitle={domain.description} />

        <main className={cn('p-4 md:p-6 pt-24 max-w-5xl', isMobile && 'pb-20')}>
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <Link
              href="/domains"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Domains
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{domain.name}</span>
          </nav>

          {fetchError && (
            <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {fetchError} Progress below shows the catalogue only until sync works.
            </p>
          )}
          {(authLoading || sessionsLoading) && user && (
            <p className="mb-4 text-xs text-muted-foreground">Loading your progress from the server…</p>
          )}

          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="py-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <DomainIcon className="w-7 h-7 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-foreground">{domain.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {domain.subdomains.length} subdomains · {domainStats?.totalCap ?? 0} tests in this domain
                  </p>
                </div>
              </div>

              {user && domainStats && (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border bg-background/80 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-primary tabular-nums">
                        {domainStats.avg != null ? `${domainStats.avg}%` : '—'}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">Avg score (done + scored)</p>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-green-600 tabular-nums">{domainStats.completed}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </p>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-amber-600 tabular-nums">{domainStats.inProg}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" /> In progress
                      </p>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-3 py-2 text-center">
                      <p className="text-lg font-bold tabular-nums">{domainStats.totalCap}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">Total tests</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Domain completion</span>
                      <span className="tabular-nums">{domainStats.completionPct}%</span>
                    </div>
                    <Progress value={domainStats.completionPct} className="h-2" />
                  </div>
                </>
              )}

              {!user && (
                <p className="text-xs text-muted-foreground">
                  Sign in to see completion and scores for this domain on these cards.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {domain.subdomains.map((subdomain, idx) => (
              <Card key={subdomain.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-muted-foreground font-normal tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    {subdomain.name}
                  </CardTitle>
                  <CardDescription>
                    {subdomain.capacities.length} capacity {subdomain.capacities.length === 1 ? 'test' : 'tests'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subdomain.capacities.map((capacity) => (
                      <CapacityCard
                        key={capacity.id}
                        capacity={capacity}
                        progress={byTestId.get(capacity.testId)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function CapacityCard({
  capacity,
  progress,
}: {
  capacity: DomainCapacity
  progress?: TestWithProgress
}) {
  return (
    <Link
      href={`/tests/${capacity.testId}`}
      className={cn(
        'flex items-center justify-between gap-3 p-4 rounded-lg border border-border',
        'bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group',
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {capacity.name}
          </p>
          {capacity.nameFr && (
            <p className="text-xs text-muted-foreground truncate">{capacity.nameFr}</p>
          )}
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {progress?.status === 'completed' && progress.latestScore != null && (
          <span className="text-sm font-bold tabular-nums text-green-600">{progress.latestScore}%</span>
        )}
        {progress?.status === 'completed' && progress.latestScore == null && (
          <Badge variant="secondary" className="text-[10px] shrink-0">
            Done
          </Badge>
        )}
        {progress?.status === 'in-progress' && (
          <Badge variant="outline" className="text-[10px] shrink-0 border-amber-300 text-amber-800">
            In progress
          </Badge>
        )}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}
