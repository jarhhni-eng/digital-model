'use client'

import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockTests } from '@/lib/mock-data'
import type { Test } from '@/lib/mock-data'
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
  const completed = mockTests.filter((t) => t.status === 'completed')
  const inProgress = mockTests.filter((t) => t.status === 'in-progress')
  const upcoming = mockTests.filter((t) => t.status === 'upcoming')
  const total = mockTests.length
  const completedPercent = total ? Math.round((completed.length / total) * 100) : 0

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" />

      <div className={cn("transition-all duration-200", isMobile ? "ml-0" : "ml-64")}>
        <Header
          title="Évaluations"
          subtitle="Consultez les tests, suivez votre progression et commencez les évaluations"
        />

        <main className={cn("p-4 md:p-6 pt-24 max-w-7xl", isMobile && "pb-20")}>
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total tests
                </CardTitle>
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
                <p className="text-xs text-muted-foreground">Assigned to you</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completed.length}</div>
                <p className="text-xs text-muted-foreground">{completedPercent}% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In progress
                </CardTitle>
                <Clock className="w-5 h-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{inProgress.length}</div>
                <p className="text-xs text-muted-foreground">Resume anytime</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </CardTitle>
                <Calendar className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{upcoming.length}</div>
                <p className="text-xs text-muted-foreground">Not started yet</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Overall progress</CardTitle>
              <CardDescription>
                How many assessments you&apos;ve completed so far
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Progress value={completedPercent} className="flex-1 h-3" />
                <span className="text-sm font-medium tabular-nums">{completedPercent}%</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Completed {completed.length}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  In progress {inProgress.length}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Upcoming {upcoming.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Simple info callout */}
          <div className="flex gap-3 p-4 mb-8 rounded-lg bg-muted/50 border border-border">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">About assessments</p>
              <p>
                Each test is timed. You can start or continue a test from the list below. Completed
                tests can be reviewed from the Results page. Upcoming tests show a due date when set
                by your teacher.
              </p>
            </div>
          </div>

          {/* All tests list */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">All assessments</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Click a test to start, continue, or review (results on Results page).
            </p>
            <div className="space-y-4">
              {mockTests.map((test) => {
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
                  test.status === 'completed' ? '/results' : `/tests/${test.id}`

                return (
                  <Card
                    key={test.id}
                    className="overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {test.title}
                          </h3>
                          <Badge variant={statusVariant} className="shrink-0">
                            {test.status === 'completed'
                              ? 'Completed'
                              : test.status === 'in-progress'
                                ? 'In progress'
                                : 'Upcoming'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{test.domain}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            {typeInfo.icon}
                            {typeInfo.label}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5" />
                            {formatDuration(test.duration)}
                          </span>
                          {test.dueDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              Due {test.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-center" asChild>
                        <Link href={actionHref}>
                          {actionLabel}
                          <ArrowRight className="w-4 h-4 ml-2" />
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
