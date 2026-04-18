'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { aggregatedCompetencyScore } from '@/lib/sem-model'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SemModel {
  id: string
  name: string
  pathDescription: string
  variables: string[]
  weights: number[]
  rmsea: number
  cfi: number
  tli: number
  interpretation: string
}

const semModels: SemModel[] = [
  {
    id: 'M1',
    name: 'Modèle 1 — Effet direct',
    pathDescription: 'Traitement visuel → Performance mathématique',
    variables: ['Traitement visuel'],
    weights: [1.0],
    rmsea: 0.071,
    cfi: 0.91,
    tli: 0.89,
    interpretation:
      "Le modèle 1 postule un effet direct du traitement visuel sur la performance mathématique. Les indices d'ajustement sont acceptables (RMSEA < 0.08, CFI > 0.90), mais ce modèle parcelle la réalité.",
  },
  {
    id: 'M2',
    name: 'Modèle 2 — Médiation par la mémoire de travail',
    pathDescription: 'Traitement visuel → Mémoire de travail → Performance mathématique',
    variables: ['Traitement visuel', 'Mémoire de travail'],
    weights: [0.6, 0.4],
    rmsea: 0.058,
    cfi: 0.94,
    tli: 0.93,
    interpretation:
      "Le modèle 2 introduit la mémoire de travail comme médiateur. L'amélioration des indices (RMSEA −0.013, CFI +0.03) confirme le rôle médiateur de la mémoire de travail entre le traitement visuel et la performance en géométrie.",
  },
  {
    id: 'M3',
    name: 'Modèle 3 — Modèle complet',
    pathDescription:
      'Traitement visuel + Attention + Fonctions exécutives → (via Mémoire de travail) → Performance mathématique',
    variables: ['Traitement visuel', 'Attention', 'Fonctions exécutives', 'Mémoire de travail'],
    weights: [0.4, 0.2, 0.2, 0.2],
    rmsea: 0.048,
    cfi: 0.96,
    tli: 0.95,
    interpretation:
      "Le modèle 3 (modèle complet) atteint les meilleurs indices d'ajustement. Il capture la contribution conjointe du traitement visuel, de l'attention et des fonctions exécutives, médiatisées par la mémoire de travail, sur la performance mathématique en géométrie.",
  },
]

const comparisonData = semModels.map((m) => ({
  model: m.id,
  RMSEA: m.rmsea,
  CFI: m.cfi,
  TLI: m.tli,
}))

function FitBadge({ value, type }: { value: number; type: 'rmsea' | 'cfi' | 'tli' }) {
  const ok = type === 'rmsea' ? value < 0.08 : value > 0.90
  return (
    <Badge variant={ok ? 'default' : 'secondary'} className="text-xs">
      {value.toFixed(3)} {ok ? '✓' : '~'}
    </Badge>
  )
}

export function SemModelsPanel() {
  const [openModel, setOpenModel] = useState<string | null>('M1')
  const mockScores = [75, 68, 72, 74, 78, 65]  // avg domain scores

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Les modèles d'équations structurelles (MES / SEM) permettent de tester des hypothèses sur les relations entre variables latentes. Les valeurs d'ajustement présentées sont des estimations théoriques (RMSEA : Hu &amp; Bentler 1999 ; CFI/TLI : Bentler 1990).
        </p>
        <Badge variant="outline" className="text-xs flex-shrink-0">Données simulées</Badge>
      </div>

      {/* Individual model cards */}
      {semModels.map((model) => {
        const isOpen = openModel === model.id
        const predictedScore = aggregatedCompetencyScore(
          mockScores.slice(0, model.weights.length),
          model.weights
        )

        return (
          <Card key={model.id} className={isOpen ? 'border-primary/30' : ''}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setOpenModel(isOpen ? null : model.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {model.id}
                  </span>
                  <div>
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{model.pathDescription}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </div>
            </CardHeader>

            {isOpen && (
              <CardContent className="space-y-4 pt-0">
                {/* Fit indices */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Indices d'ajustement</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">RMSEA</p>
                      <FitBadge value={model.rmsea} type="rmsea" />
                      <p className="text-xs text-muted-foreground mt-1">seuil &lt; 0.08</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">CFI</p>
                      <FitBadge value={model.cfi} type="cfi" />
                      <p className="text-xs text-muted-foreground mt-1">seuil &gt; 0.90</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">TLI</p>
                      <FitBadge value={model.tli} type="tli" />
                      <p className="text-xs text-muted-foreground mt-1">seuil &gt; 0.90</p>
                    </div>
                  </div>
                </div>

                {/* Variables & weights */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Pondérations des prédicteurs</h4>
                  <div className="space-y-2">
                    {model.variables.map((v, i) => (
                      <div key={v} className="flex items-center gap-3 text-sm">
                        <span className="w-40 text-muted-foreground">{v}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${model.weights[i]! * 100}%` }} />
                        </div>
                        <span className="w-10 text-right font-mono text-xs">{model.weights[i]?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predicted score */}
                <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div>
                    <p className="text-xs text-muted-foreground">Score prédit (données de démonstration)</p>
                    <p className="text-2xl font-bold text-secondary">{Math.round(predictedScore)}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{model.interpretation}</p>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparaison des 3 modèles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 px-2 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-6 font-medium">Modèle</th>
                  <th className="pb-3 pr-6 font-medium">RMSEA</th>
                  <th className="pb-3 pr-6 font-medium">CFI</th>
                  <th className="pb-3 pr-6 font-medium">TLI</th>
                  <th className="pb-3 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {semModels.map((m) => (
                  <tr key={m.id} className="border-b border-border/50">
                    <td className="py-2.5 pr-6 font-semibold text-primary">{m.id}</td>
                    <td className="py-2.5 pr-6"><FitBadge value={m.rmsea} type="rmsea" /></td>
                    <td className="py-2.5 pr-6"><FitBadge value={m.cfi} type="cfi" /></td>
                    <td className="py-2.5 pr-6"><FitBadge value={m.tli} type="tli" /></td>
                    <td className="py-2.5">
                      {m.id === 'M3' ? (
                        <Badge className="text-xs bg-green-600">Optimal</Badge>
                      ) : m.id === 'M2' ? (
                        <Badge variant="secondary" className="text-xs">Bon</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Acceptable</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={comparisonData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="model" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 1.1]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, name) => [Number(v).toFixed(3), name as string]} />
              <Bar dataKey="CFI" fill="#1e3a8a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="TLI" fill="#0d9488" radius={[3, 3, 0, 0]} />
              <Bar dataKey="RMSEA" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
