'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateMockBehavioralData, type BehavioralSummary } from '@/lib/behavioral-indicators'

const patternConfig: Record<BehavioralSummary['patternLabel'], { label: string; color: string; badge: string }> = {
  impulsif: { label: 'Impulsif', color: 'text-red-600', badge: 'destructive' },
  réflexif: { label: 'Réflexif', color: 'text-green-600', badge: 'default' },
  incertain: { label: 'Incertain', color: 'text-amber-600', badge: 'secondary' },
  normal: { label: 'Normal', color: 'text-blue-600', badge: 'outline' },
}

const studentNames: Record<string, string> = {
  'student-1': 'Ahmed Benali',
  'student-2': 'Fatima Zahra',
  'student-3': 'Youssef Mansour',
  'student-4': 'Salma Alaoui',
}

const testNames: Record<string, string> = {
  'test-vectors': 'C1 — Vecteurs',
  'test-dot-product': 'C3 — Produit scalaire',
  'test-trigonometry': 'C4 — Trigonométrie',
  'test-line-plane': 'C5 — Droite',
}

function formatMs(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function PerformanceIndicatorsPanel() {
  const data = generateMockBehavioralData()

  // Chart: hesitation rate per student per test
  const chartData = Object.keys(studentNames).map((studentId) => {
    const row: Record<string, string | number> = { student: studentNames[studentId]!.split(' ')[0]! }
    data
      .filter((d) => d.userId === studentId)
      .forEach((d) => {
        row[testNames[d.testId] ?? d.testId] = Math.round(d.hesitationRate * 100)
      })
    return row
  })

  const testKeys = Object.values(testNames)
  const colors = ['#1e3a8a', '#0d9488', '#7c3aed', '#f59e0b']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
        <span className="text-lg">⚠️</span>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Domaine mathématique uniquement.</strong> Les indicateurs comportementaux sont calculés à partir du temps passé par question lors des tests Cₖ. Les patterns identifiés sont indicatifs et doivent être interprétés par un professionnel.
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Indicateurs comportementaux par élève et par test</CardTitle>
          <CardDescription>Basés sur l'analyse du temps de réponse (timeSpentMs)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-4 font-medium">Élève</th>
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Test (Cₖ)</th>
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Tps moy./question</th>
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Taux d'hésitation</th>
                  <th className="pb-3 font-medium">Profil</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => {
                  const config = patternConfig[d.patternLabel]
                  return (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-medium">{studentNames[d.userId] ?? d.userId}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground text-xs">{testNames[d.testId] ?? d.testId}</td>
                      <td className="py-2.5 pr-4">{formatMs(d.avgTimePerQuestion)}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${Math.round(d.hesitationRate * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs">{Math.round(d.hesitationRate * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant={config.badge as 'default' | 'secondary' | 'outline' | 'destructive'}
                          className="text-xs"
                        >
                          {config.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Hesitation rate chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Taux d'hésitation par élève et test (en %)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="student" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v, name) => [`${v}%`, name]} />
              {testKeys.map((key, i) => (
                <Bar key={key} dataKey={key} name={key} fill={colors[i % colors.length]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pattern legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interprétation des profils comportementaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(patternConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Badge variant={cfg.badge as 'default' | 'secondary' | 'outline' | 'destructive'} className="text-xs flex-shrink-0 mt-0.5">
                  {cfg.label}
                </Badge>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {key === 'impulsif' && 'Temps moyen très court et faible taux d\'hésitation. Risque de réponses précipitées sans réflexion suffisante.'}
                  {key === 'réflexif' && 'Temps moyen élevé mais faible hésitation. L\'élève prend le temps de réfléchir avant de répondre — bon indicateur de confiance cognitive.'}
                  {key === 'incertain' && 'Temps élevé et fort taux d\'hésitation. L\'élève a du mal à trouver la réponse et hésite fréquemment, suggérant des lacunes conceptuelles.'}
                  {key === 'normal' && 'Profil équilibré. Temps et taux d\'hésitation dans les normes attendues pour le niveau.'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
