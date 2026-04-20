'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts'
import { Brain, TrendingUp, TrendingDown, Lightbulb, GraduationCap, User2 } from 'lucide-react'
import {
  storageAllResults,
  buildProfile,
  buildRecommendations,
  SubtestResult,
} from '@/lib/visuo-perceptive/scoring'
import { VP_SUBTESTS, getSubtestById } from '@/lib/visuo-perceptive'

export default function VPResultsPage() {
  const [results, setResults] = useState<SubtestResult[]>([])
  useEffect(() => {
    setResults(storageAllResults())
  }, [])

  const profile = buildProfile(results)
  const recs = buildRecommendations(profile)

  const chartData = VP_SUBTESTS.map((s) => {
    const r = results.find((x) => x.subtest === s.id)
    return { name: s.title, value: r ? Math.round(r.percentage) : 0 }
  })

  const radarData = Object.keys(profile.category).map((k) => ({
    category: k,
    score: Math.round(profile.category[k]),
  }))

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="container mx-auto max-w-6xl py-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">
                <Brain className="h-7 w-7 text-primary" /> Profil visuo-perceptif
              </h1>
              <p className="mt-1 text-muted-foreground">
                Synthèse des sous-tests : performance, forces, faiblesses et recommandations.
              </p>
            </div>
            <Link href="/tests/test-visuo-perceptive">
              <Button variant="outline">Retour au hub</Button>
            </Link>
          </div>

          {results.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-muted-foreground">
                Aucun sous-test terminé. Démarrez une passation pour voir votre profil.
              </p>
              <Link href="/tests/test-visuo-perceptive">
                <Button className="mt-4">Commencer la passation</Button>
              </Link>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                  <div className="text-xs uppercase text-muted-foreground">Score global</div>
                  <div className="mt-1 text-3xl font-bold">{Math.round(profile.overallPercentage)} %</div>
                  <Progress value={profile.overallPercentage} className="mt-3" />
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-emerald-600" /> Forces
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {profile.strengths.length === 0 && <span className="text-sm">—</span>}
                    {profile.strengths.map((id) => (
                      <Badge key={id} className="bg-emerald-600 text-white">
                        {getSubtestById(id).title}
                      </Badge>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <TrendingDown className="h-4 w-4 text-red-600" /> Faiblesses
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {profile.weaknesses.length === 0 && <span className="text-sm">—</span>}
                    {profile.weaknesses.map((id) => (
                      <Badge key={id} variant="destructive">
                        {getSubtestById(id).title}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="mt-6 p-5">
                <h2 className="mb-4 text-lg font-semibold">Comparaison entre sous-tests</h2>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ left: 10, right: 10, bottom: 60 }}>
                      <XAxis dataKey="name" angle={-25} textAnchor="end" height={80} fontSize={11} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {radarData.length > 0 && (
                <Card className="mt-6 p-5">
                  <h2 className="mb-4 text-lg font-semibold">Profil par catégorie cognitive</h2>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <Card className="p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-4 w-4" /> Recommandations pédagogiques
                  </h3>
                  {recs.pedagogical.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun domaine fragile identifié.</p>
                  )}
                  <ul className="space-y-3 text-sm">
                    {recs.pedagogical.map((r) => (
                      <li key={r.subtest}>
                        <div className="font-medium">{r.title}</div>
                        <ul className="ml-4 list-disc text-muted-foreground">
                          {r.activities.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Lightbulb className="h-4 w-4" /> Exercices cognitifs
                  </h3>
                  {recs.cognitive.length === 0 && (
                    <p className="text-sm text-muted-foreground">Aucun exercice ciblé.</p>
                  )}
                  <ul className="space-y-3 text-sm">
                    {recs.cognitive.map((r) => (
                      <li key={r.subtest}>
                        <div className="font-medium">{r.title}</div>
                        <ul className="ml-4 list-disc text-muted-foreground">
                          {r.exercises.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <User2 className="h-4 w-4" /> Plan individualisé
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {recs.individual.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card className="mt-6 p-5">
                <h2 className="mb-3 text-lg font-semibold">Détail par sous-test</h2>
                <div className="overflow-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Sous-test</th>
                        <th className="px-3 py-2 text-left">Score</th>
                        <th className="px-3 py-2 text-left">%</th>
                        <th className="px-3 py-2 text-left">Temps moyen</th>
                        <th className="px-3 py-2 text-left">Clics</th>
                        <th className="px-3 py-2 text-left">Modifs</th>
                        <th className="px-3 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => {
                        const meta = getSubtestById(r.subtest)
                        const p = profile.perSubtest.find((x) => x.subtest === r.subtest)!
                        return (
                          <tr key={r.subtest} className="border-t">
                            <td className="px-3 py-2 font-medium">{meta.title}</td>
                            <td className="px-3 py-2">{r.totalCorrect} / {r.total}</td>
                            <td className="px-3 py-2">{Math.round(r.percentage)} %</td>
                            <td className="px-3 py-2">{(r.averageTimeMs / 1000).toFixed(1)} s</td>
                            <td className="px-3 py-2">{r.totalClicks}</td>
                            <td className="px-3 py-2">{r.totalModifications}</td>
                            <td className="px-3 py-2">
                              <Badge
                                variant={
                                  p.status === 'strength' ? 'default'
                                  : p.status === 'weakness' ? 'destructive'
                                  : 'outline'
                                }
                              >
                                {p.status === 'strength' ? 'Force' : p.status === 'weakness' ? 'Faiblesse' : 'Moyen'}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
