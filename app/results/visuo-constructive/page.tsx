'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockStudentProfile } from '@/lib/mock-data'
import {
  loadVisuoConstructiveResult,
  type VisuoConstructiveResult,
} from '@/lib/visuo-constructive'
import { ArrowLeft, List } from 'lucide-react'

export default function VisuoConstructiveResultsPage() {
  const [result, setResult] = useState<VisuoConstructiveResult | null>(null)

  useEffect(() => {
    setResult(loadVisuoConstructiveResult())
  }, [])

  if (!result) {
    return (
      <div className="bg-background min-h-screen">
        <Sidebar userRole="student" userName={mockStudentProfile.name} />
        <div className="md:ml-64 print:ml-0">
          <Header
            title="WAIS Visual Puzzles – Results"
            subtitle="Visuo-Constructive Capacity"
          />
          <main className="p-6 pt-24 max-w-4xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  No results found. Complete the Visual Puzzles test to see your
                  report.
                </p>
                <Button asChild>
                  <Link href="/tests">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to tests
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="print:hidden">
        <Sidebar userRole="student" userName={mockStudentProfile.name} />
      </div>
      <div className="ml-64 print:ml-0">
        <Header
          title="WAIS Visual Puzzles – Results"
          subtitle="Visuo-Constructive Capacity assessment report"
        />
        <main className="p-6 pt-24 max-w-4xl">
          <Card className="mb-6 print:shadow-none">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                Completed {new Date(result.completedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Questions answered</p>
                  <p className="text-2xl font-bold text-foreground">
                    {result.answeredCount} / {result.totalQuestions}
                  </p>
                </div>
                {result.correctCount !== null && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Correct answers</p>
                    <p className="text-2xl font-bold text-primary">
                      {result.correctCount} / {result.totalQuestions}
                    </p>
                  </div>
                )}
                {result.scorePercent !== null && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold text-primary">
                      {result.scorePercent}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Selected responses
              </CardTitle>
              <CardDescription>
                Your chosen option for each question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {result.session.responses.map((r) => (
                  <div
                    key={r.questionNumber}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      Q{r.questionNumber}
                    </span>
                    <span className="font-medium">
                      {r.selectedOption ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="print:hidden flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/results">Back to results</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tests">Back to tests</Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
