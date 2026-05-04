'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  loadBeeryResult,
  BEERY_ERROR_CATEGORIES,
  type BeeryVMIResult,
  type BeeryErrorAnalysis,
} from '@/lib/beery-vmi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BeeryVMIResultsPage() {
  const [result, setResult] = useState<BeeryVMIResult | null>(null)
  const [errorAnalysis, setErrorAnalysis] = useState<BeeryErrorAnalysis[]>([])

  useEffect(() => {
    const r = loadBeeryResult()
    setResult(r)
    if (r) setErrorAnalysis(r.errorAnalysis)
  }, [])

  const handleExportPDF = () => {
    window.print()
  }

  if (!result) {
    return (
      <div className="bg-background min-h-screen">
        <div className="print:hidden">
          <Sidebar userRole="student" />
        </div>
        <div className="md:ml-64 print:ml-0">
          <Header title="Beery VMI Results" subtitle="Visual-Motor Integration assessment" />
          <main className="p-6 pt-24 max-w-4xl">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  No results found. Complete the Beery VMI test to see your report.
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

  const profileData = [
    { name: 'VMI', score: result.profile.vmi, fill: '#1e3a8a' },
    { name: 'Visual perception', score: result.profile.visualPerception, fill: '#0d9488' },
    { name: 'Motor coordination', score: result.profile.motorCoordination, fill: '#7c3aed' },
  ]

  const updateErrorAnalysis = (itemIndex: number, category: keyof BeeryErrorAnalysis, value: boolean) => {
    if (category === 'itemIndex' || category === 'notes') return
    setErrorAnalysis((prev) =>
      prev.map((e) =>
        e.itemIndex === itemIndex ? { ...e, [category]: value } : e
      )
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="print:hidden">
        <Sidebar userRole="student" />
      </div>
      <div className="ml-64 print:ml-0">
        <Header
          title="Beery VMI – Results"
          subtitle="Visual-Motor Integration assessment report"
        />
        <main className="p-6 pt-24 max-w-6xl">
          {/* Print-only header for PDF */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold">Beery VMI Assessment Report</h1>
            <p className="text-sm text-muted-foreground">
              Completed: {new Date(result.completedAt).toLocaleString()}
            </p>
          </div>

          {/* Participant info */}
          <Card className="mb-6 print:shadow-none">
            <CardHeader>
              <CardTitle>Participant</CardTitle>
              <CardDescription>Assessment information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{' '}
                {result.session.participantName || 'Participant'}
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{' '}
                {new Date(result.completedAt).toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Started:</span>{' '}
                {new Date(result.session.startedAt).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Raw score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{result.rawScore}</p>
                <p className="text-xs text-muted-foreground">Items with drawing completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Standard score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{result.standardScore}</p>
                <p className="text-xs text-muted-foreground">Mean 100, SD 15</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Percentile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{result.percentile}</p>
                <p className="text-xs text-muted-foreground">Percentile rank</p>
              </CardContent>
            </Card>
          </div>

          {/* Profile chart */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>VMI, Visual perception, and Motor coordination</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={profileData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 150]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {profileData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Saved drawings */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Saved drawings</CardTitle>
              <CardDescription>Participant reproductions by item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {result.session.responses
                  .filter((r) => r.drawingDataUrl)
                  .map((r) => (
                    <div key={r.itemIndex} className="flex flex-col gap-1">
                      <p className="text-xs font-medium text-muted-foreground">Item {r.itemIndex}</p>
                      <div className="border border-border rounded-lg overflow-hidden bg-white aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.drawingDataUrl!}
                          alt={`Drawing item ${r.itemIndex}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Error analysis (for examiner) */}
          <Card className="mb-6 print:break-inside-avoid">
            <CardHeader>
              <CardTitle>Error analysis</CardTitle>
              <CardDescription>
                Classify errors by type to support interpretation (examiner use)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-medium mb-2">Error categories</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {BEERY_ERROR_CATEGORIES.map((c) => (
                    <li key={c.id}>
                      <strong className="text-foreground">{c.label}:</strong> {c.examples}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4">Item</th>
                      {BEERY_ERROR_CATEGORIES.map((c) => (
                        <th key={c.id} className="text-left py-2 px-2">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {errorAnalysis.slice(0, 15).map((e) => (
                      <tr key={e.itemIndex} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-medium">{e.itemIndex}</td>
                        <td className="py-2 px-2">
                          <Checkbox
                            checked={e.visualPerception}
                            onCheckedChange={(v) =>
                              updateErrorAnalysis(e.itemIndex, 'visualPerception', !!v)
                            }
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Checkbox
                            checked={e.visualMotorIntegration}
                            onCheckedChange={(v) =>
                              updateErrorAnalysis(e.itemIndex, 'visualMotorIntegration', !!v)
                            }
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Checkbox
                            checked={e.motorCoordination}
                            onCheckedChange={(v) =>
                              updateErrorAnalysis(e.itemIndex, 'motorCoordination', !!v)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className={cn('flex gap-4 print:hidden')}>
            <Button onClick={handleExportPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Export to PDF
            </Button>
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
