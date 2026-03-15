'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockStudentProfile } from '@/lib/mock-data'
import { loadTVPSResult, type TVPSResult } from '@/lib/tvps'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ArrowLeft } from 'lucide-react'

const PROFILE_COLORS = ['#1e3a8a', '#0d9488', '#7c3aed', '#16a34a', '#f59e0b', '#ef4444', '#6366f1']

export default function VisuoPerceptiveResultsPage() {
  const [result, setResult] = useState<TVPSResult | null>(null)

  useEffect(() => {
    setResult(loadTVPSResult())
  }, [])

  if (!result) {
    return (
      <div className="bg-background min-h-screen">
        <Sidebar userRole="student" userName={mockStudentProfile.name} />
        <div className="ml-64 print:ml-0">
          <Header
            title="TVPS-3 – Results"
            subtitle="Visuo-Perceptive Capacity"
          />
          <main className="p-6 pt-24 max-w-4xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  No results found. Complete the TVPS-3 test to see your report.
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

  const participant = result.session.participantInfo
  const profileData = result.subtestScores.map((s, i) => ({
    name: s.subtestName.replace(/\s+/g, '\n'),
    score: s.standardScore,
    fill: PROFILE_COLORS[i % PROFILE_COLORS.length],
  }))

  return (
    <div className="bg-background min-h-screen">
      <div className="print:hidden">
        <Sidebar userRole="student" userName={participant?.name || mockStudentProfile.name} />
      </div>
      <div className="ml-64 print:ml-0">
        <Header
          title="TVPS-3 – Results"
          subtitle="Visuo-Perceptive Capacity assessment report"
        />
        <main className="p-6 pt-24 max-w-5xl">
          {/* Participant information */}
          <Card className="mb-6 print:shadow-none">
            <CardHeader>
              <CardTitle>Participant information</CardTitle>
              <CardDescription>
                Completed {new Date(result.completedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {participant ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {participant.name}</div>
                  <div><span className="text-muted-foreground">Gender:</span> {participant.gender || '—'}</div>
                  <div><span className="text-muted-foreground">School:</span> {participant.school || '—'}</div>
                  <div><span className="text-muted-foreground">Examiner:</span> {participant.examiner || '—'}</div>
                  <div><span className="text-muted-foreground">Date of birth:</span> {participant.dateOfBirth || '—'}</div>
                  <div><span className="text-muted-foreground">Date of evaluation:</span> {participant.dateOfEvaluation || '—'}</div>
                  <div><span className="text-muted-foreground">Chronological age:</span> {participant.chronologicalAge || '—'}</div>
                  <div><span className="text-muted-foreground">Grade level:</span> {participant.gradeLevel || '—'}</div>
                  <div><span className="text-muted-foreground">Participant ID:</span> {participant.participantId || '—'}</div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No participant information recorded.</p>
              )}
            </CardContent>
          </Card>

          {/* Composite score */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overall visual perception composite</CardTitle>
              <CardDescription>
                Composite standard score and percentile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">Composite score</p>
                  <p className="text-3xl font-bold text-primary">{result.compositeScore}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentile</p>
                  <p className="text-3xl font-bold text-primary">{result.compositePercentile}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile chart */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Profile analysis</CardTitle>
              <CardDescription>
                Standard scores for each visual perceptual subtest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={profileData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={0}
                  />
                  <YAxis domain={[0, 150]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {profileData.map((_, i) => (
                      <Cell key={i} fill={profileData[i].fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subtest scores table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Subtest scores</CardTitle>
              <CardDescription>
                Raw score, standard score, and percentile for each subtest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 font-medium">Subtest</th>
                      <th className="text-right py-3 px-2 font-medium">Raw score</th>
                      <th className="text-right py-3 px-2 font-medium">Standard score</th>
                      <th className="text-right py-3 px-2 font-medium">Percentile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subtestScores.map((s) => (
                      <tr key={s.subtestId} className="border-b border-border/50">
                        <td className="py-3 pr-4">{s.subtestName}</td>
                        <td className="text-right py-3 px-2">{s.rawScore}</td>
                        <td className="text-right py-3 px-2 font-medium">{s.standardScore}</td>
                        <td className="text-right py-3 px-2">{s.percentile}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
