'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts'
import { raschDifficulty } from '@/lib/psychometrics'
import { mathCompetencies } from '@/lib/competency-mapping'
import { simulatePcaResult } from '@/lib/pca'

// Generate mock IRT item stats from competency list
const irtItems = mathCompetencies.map((comp, i) => {
  const pCorrect = 0.38 + (i * 0.11) % 0.48   // 0.38 – 0.86, varied
  const aParam = parseFloat((0.75 + (i * 0.18) % 0.85).toFixed(2))
  const bParam = parseFloat(raschDifficulty(pCorrect).toFixed(2))
  return {
    item: comp.code,
    name: comp.nameFr,
    gradeLevel: comp.gradeLevel,
    pCorrect: parseFloat(pCorrect.toFixed(2)),
    a: aParam,
    b: bParam,
  }
})

function difficultyColor(b: number): string {
  if (b < -1) return 'text-green-600'
  if (b > 1) return 'text-red-600'
  return 'text-blue-600'
}

function difficultyLabel(b: number): string {
  if (b < -1) return 'Facile'
  if (b > 1) return 'Difficile'
  return 'Modéré'
}

export function PsychometricModule() {
  const pca = simulatePcaResult()

  return (
    <div className="space-y-8">
      {/* IRT Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Théorie de la Réponse à l'Item (TRI — Modèle 2PL)</h2>
          <Badge variant="outline" className="text-xs">Données simulées — à calibrer</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Le modèle 2 paramètres (2PL) caractérise chaque item par sa <strong>difficulté</strong> (b — logit Rasch)
          et sa <strong>discrimination</strong> (a). Les valeurs ci-dessous sont des estimations théoriques basées
          sur les proportions de bonnes réponses attendues pour chaque compétence.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paramètres IRT par compétence Cₖ</CardTitle>
            <CardDescription>
              b &lt; −1 : facile (vert) · −1 ≤ b ≤ 1 : modéré (bleu) · b &gt; 1 : difficile (rouge)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 pr-4 font-medium">Item</th>
                    <th className="pb-3 pr-4 font-medium">Compétence</th>
                    <th className="pb-3 pr-4 font-medium whitespace-nowrap">Niveau</th>
                    <th className="pb-3 pr-4 font-medium whitespace-nowrap">p (correcte)</th>
                    <th className="pb-3 pr-4 font-medium whitespace-nowrap">b (difficulté)</th>
                    <th className="pb-3 pr-4 font-medium whitespace-nowrap">a (discrim.)</th>
                    <th className="pb-3 font-medium">Interprétation</th>
                  </tr>
                </thead>
                <tbody>
                  {irtItems.map((item) => (
                    <tr key={item.item} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-bold text-primary">{item.item}</td>
                      <td className="py-2.5 pr-4 text-xs">{item.name}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">{item.gradeLevel}</Badge>
                      </td>
                      <td className="py-2.5 pr-4">{item.pCorrect}</td>
                      <td className={`py-2.5 pr-4 font-semibold ${difficultyColor(item.b)}`}>{item.b}</td>
                      <td className="py-2.5 pr-4">{item.a}</td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium ${difficultyColor(item.b)}`}>
                          {difficultyLabel(item.b)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* IRT Scatter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nuage discrimination (a) vs difficulté (b)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="a" name="Discrimination (a)" type="number" domain={[0.5, 1.8]} tick={{ fontSize: 11 }} label={{ value: 'a (discrimination)', position: 'insideBottom', offset: -4, fontSize: 11 }} />
                <YAxis dataKey="b" name="Difficulté (b)" type="number" domain={[-2, 2]} tick={{ fontSize: 11 }} label={{ value: 'b (difficulté)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null
                    const d = payload[0]?.payload as typeof irtItems[0]
                    return (
                      <div className="bg-background border border-border rounded-lg p-2 text-xs shadow-lg">
                        <p className="font-bold">{d.item} — {d.name}</p>
                        <p>a = {d.a} · b = {d.b}</p>
                        <p>p = {d.pCorrect}</p>
                      </div>
                    )
                  }}
                />
                <Scatter
                  data={irtItems}
                  fill="var(--color-primary)"
                  name="Items"
                >
                  {irtItems.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.b < -1 ? '#16a34a' : entry.b > 1 ? '#ef4444' : '#1e3a8a'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* PCA Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Analyse en Composantes Principales (ACP)</h2>
          <Badge variant="outline" className="text-xs">Données simulées — à calibrer</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          L'ACP permet d'identifier les dimensions latentes sous-jacentes aux scores cognitifs.
          Les valeurs sont basées sur des données théoriques issues de la littérature en cognition spatiale
          (Lohman, 1996 ; Carroll, 1993). Elles seront remplacées par les valeurs empiriques après la
          collecte complète des données.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Scree plot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diagramme des éboulis (Scree plot)</CardTitle>
              <CardDescription>Variance expliquée par composante</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pca.components} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 40]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Variance expliquée']} />
                  <Bar dataKey="varianceExplained" fill="var(--color-primary)" radius={[3, 3, 0, 0]}>
                    {pca.components.map((entry, i) => (
                      <Cell key={i} fill={entry.eigenvalue >= 1 ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Variance totale expliquée par CP1+CP2+CP3 : <strong>{pca.totalVarianceExplained}%</strong>
              </p>
            </CardContent>
          </Card>

          {/* Component summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Composantes retenues (eigenvalue ≥ 1)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pca.components.filter((c) => c.eigenvalue >= 1).map((c) => (
                  <div key={c.componentNumber} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm font-medium text-foreground">{c.label}</p>
                      <p className="text-xs text-muted-foreground">λ = {c.eigenvalue}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${c.varianceExplained / 0.4}%` }} />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{c.varianceExplained}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Cumul : {c.cumulativeVariance}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loadings matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matrice des saturations (loadings)</CardTitle>
            <CardDescription>
              Corrélations entre les variables et les composantes principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 pr-4 font-medium">Variable</th>
                    <th className="pb-3 pr-4 font-medium text-right">CP1</th>
                    <th className="pb-3 pr-4 font-medium text-right">CP2</th>
                    <th className="pb-3 font-medium text-right">CP3</th>
                  </tr>
                </thead>
                <tbody>
                  {pca.loadings.map((l) => (
                    <tr key={l.variable} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">{l.variableFr}</td>
                      {[l.pc1Loading, l.pc2Loading, l.pc3Loading].map((v, i) => (
                        <td key={i} className={`py-2 pr-4 text-right font-mono text-xs ${Math.abs(v) >= 0.5 ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {v.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-3">
                * Valeurs en gras (≥ 0.50) indiquent une saturation substantielle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
