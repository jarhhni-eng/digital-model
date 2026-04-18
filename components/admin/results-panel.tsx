'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Search, Download, ChevronDown, ChevronUp } from 'lucide-react'

const mockStudentData = [
  { id: 's1', name: 'Ahmed Benali', level: 'Tronc Commun', group: 'Groupe A', cognitiveScore: 74, mathScore: 68, testsCompleted: 8, domains: { attention: 72, reasoning: 68, spatial: 78, visual: 75, memory: 70, executive: 74 } },
  { id: 's2', name: 'Fatima Zahra Alami', level: 'Tronc Commun', group: 'Groupe A', cognitiveScore: 82, mathScore: 85, testsCompleted: 10, domains: { attention: 80, reasoning: 85, spatial: 82, visual: 84, memory: 79, executive: 81 } },
  { id: 's3', name: 'Youssef Mansour', level: '1ère Bac Sciences', group: 'Groupe B', cognitiveScore: 65, mathScore: 58, testsCompleted: 6, domains: { attention: 62, reasoning: 60, spatial: 65, visual: 68, memory: 63, executive: 67 } },
  { id: 's4', name: 'Salma Alaoui', level: '1ère Bac Sciences', group: 'Groupe B', cognitiveScore: 78, mathScore: 76, testsCompleted: 9, domains: { attention: 76, reasoning: 78, spatial: 80, visual: 77, memory: 75, executive: 79 } },
  { id: 's5', name: 'Omar Tazi', level: 'Tronc Commun', group: 'Groupe A', cognitiveScore: 70, mathScore: 72, testsCompleted: 7, domains: { attention: 68, reasoning: 72, spatial: 70, visual: 71, memory: 69, executive: 70 } },
]

const domainChartData = [
  { domain: 'Attention', moyenne: 71.6 },
  { domain: 'Raisonnement', moyenne: 72.6 },
  { domain: 'Spatial', moyenne: 75.0 },
  { domain: 'Visuel', moyenne: 75.0 },
  { domain: 'Mémoire', moyenne: 71.2 },
  { domain: 'Exécutif', moyenne: 74.2 },
]

const mathChartData = [
  { competence: 'C1 Vecteurs', moyenne: 68 },
  { competence: 'C2 Symétrie', moyenne: 71 },
  { competence: 'C3 Prod. scal.', moyenne: 65 },
  { competence: 'C4 Trigo.', moyenne: 74 },
  { competence: 'C5 Droite', moyenne: 69 },
  { competence: 'C6 Prod. scal.+', moyenne: 62 },
]

function computeStats(values: number[]) {
  const n = values.length
  if (n === 0) return { mean: 0, std: 0, min: 0, max: 0 }
  const mean = values.reduce((s, v) => s + v, 0) / n
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  return {
    mean: Math.round(mean * 10) / 10,
    std: Math.round(Math.sqrt(variance) * 10) / 10,
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

export function ResultsPanel() {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      mockStudentData.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.level.toLowerCase().includes(search.toLowerCase()) ||
          s.group.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  )

  const cogStats = computeStats(mockStudentData.map((s) => s.cognitiveScore))
  const mathStats = computeStats(mockStudentData.map((s) => s.mathScore))

  const handleExportCSV = () => {
    const header = 'Nom,Niveau,Groupe,Score Cognitif,Score Math,Tests complétés'
    const rows = mockStudentData.map(
      (s) => `${s.name},${s.level},${s.group},${s.cognitiveScore},${s.mathScore},${s.testsCompleted}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resultats_cognitest.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Individual Results */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Résultats individuels</CardTitle>
              <CardDescription>Scores cognitifs et mathématiques par élève</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 self-start sm:self-auto">
              <Download className="w-4 h-4" />
              Exporter CSV
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, niveau ou groupe..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Nom</th>
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Niveau</th>
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Groupe</th>
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Score Cog.</th>
                  <th className="pb-3 pr-4 font-medium whitespace-nowrap">Score Math</th>
                  <th className="pb-3 font-medium whitespace-nowrap">Tests</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <>
                    <tr
                      key={s.id}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    >
                      <td className="py-3 pr-4 font-medium">{s.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{s.level}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">{s.group}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={s.cognitiveScore >= 75 ? 'text-green-600 font-semibold' : s.cognitiveScore >= 60 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {s.cognitiveScore}%
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={s.mathScore >= 75 ? 'text-green-600 font-semibold' : s.mathScore >= 60 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {s.mathScore}%
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span>{s.testsCompleted}</span>
                          {expandedId === s.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </td>
                    </tr>
                    {expandedId === s.id && (
                      <tr key={`${s.id}-detail`}>
                        <td colSpan={6} className="pb-4 pt-1">
                          <div className="bg-muted/20 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(s.domains).map(([domain, score]) => (
                              <div key={domain} className="text-sm">
                                <p className="text-muted-foreground capitalize text-xs mb-1">{domain}</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${score}%` }} />
                                  </div>
                                  <span className="font-medium text-xs">{score}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">Aucun résultat trouvé.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aggregated Results */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scores cognitifs agrégés par domaine</CardTitle>
            <CardDescription>Moyennes de classe</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={domainChartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Moyenne']} />
                <Bar dataKey="moyenne" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scores mathématiques par compétence Cₖ</CardTitle>
            <CardDescription>Moyennes de classe</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mathChartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="competence" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Moyenne']} />
                <Bar dataKey="moyenne" fill="var(--color-secondary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Moy. cognitive', value: `${cogStats.mean}%`, sub: `σ = ${cogStats.std}` },
          { label: 'Moy. math', value: `${mathStats.mean}%`, sub: `σ = ${mathStats.std}` },
          { label: 'Min / Max cog.', value: `${cogStats.min}% / ${cogStats.max}%`, sub: 'Étendue' },
          { label: 'Min / Max math', value: `${mathStats.min}% / ${mathStats.max}%`, sub: 'Étendue' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
