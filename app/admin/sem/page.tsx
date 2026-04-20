'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buildAdminStudents, buildModels, domainAverageForStudent } from '@/lib/admin-mock'
import { platformDomains } from '@/lib/platform-domains'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import { GraduationCap, HeartHandshake, Lightbulb } from 'lucide-react'

function pct(v: number) { return Math.round(v * 100) + '%' }

// ─── Strengths / weaknesses (≥ 50 vs < 50) ──────────────────────────────────
function useStrengthsWeaknesses() {
  const students = useMemo(() => buildAdminStudents(), [])
  const levels = Array.from(new Set(students.map((s) => s.level)))
  return levels.map((lv) => {
    const cohort = students.filter((s) => s.level === lv)
    const rows = platformDomains.map((d) => {
      const avg = Math.round(cohort.reduce((a, s) => a + domainAverageForStudent(s, d.id), 0) / cohort.length)
      return { id: d.id, name: d.name, avg, strong: avg >= 50 }
    })
    return { level: lv, rows }
  })
}

export default function SemModelsPage() {
  const models = useMemo(() => buildModels(), [])
  const SW = useStrengthsWeaknesses()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Modèles statistiques (SEM / Régression)</h1>
        <p className="text-slate-500 mt-1">
          Variable dépendante : score de chaque compétence C<sub>k</sub> par leçon.
          Compétences spécifiques à chaque leçon (Q → C<sub>k</sub>).
        </p>
      </div>

      {models.map((m) => (
        <Card key={m.id}>
          <CardHeader>
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <CardTitle className="text-base">{m.title}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{m.dependent}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">R² = {m.r2}</Badge>
                <Badge variant="outline">CFI = {m.cfi}</Badge>
                <Badge variant="outline">RMSEA = {m.rmsea}</Badge>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">{m.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Coefficients table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="text-left py-2 pr-4">Variable</th>
                    <th className="text-right py-2 pr-4">β</th>
                    <th className="text-right py-2 pr-4">p</th>
                    <th className="text-right py-2">IC 95%</th>
                  </tr>
                </thead>
                <tbody>
                  {m.coefficients.map((c) => (
                    <tr key={c.variable} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{c.variable}</td>
                      <td className={cn('text-right pr-4 tabular-nums font-semibold', c.beta >= 0 ? 'text-indigo-700' : 'text-rose-600')}>
                        {c.beta.toFixed(2)}
                      </td>
                      <td className="text-right pr-4 tabular-nums">{c.pValue.toFixed(3)}</td>
                      <td className="text-right tabular-nums text-slate-500">
                        [{c.ci[0].toFixed(2)}, {c.ci[1].toFixed(2)}]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Coefficient chart */}
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={m.coefficients} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[-0.5, 0.6]} />
                  <YAxis type="category" dataKey="variable" fontSize={11} width={110} />
                  <Tooltip />
                  <ReferenceLine x={0} stroke="#94a3b8" />
                  <Bar dataKey="beta" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="grid md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-700 uppercase flex items-center gap-1 mb-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Didactique
                </p>
                <p className="text-sm text-slate-700">{m.recommendations.didactic}</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                <p className="text-xs font-semibold text-rose-700 uppercase flex items-center gap-1 mb-1">
                  <HeartHandshake className="w-3.5 h-3.5" /> Psycho-pédagogique
                </p>
                <p className="text-sm text-slate-700">{m.recommendations.psychoPedagogical}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 uppercase flex items-center gap-1 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Élève
                </p>
                <p className="text-sm text-slate-700">{m.recommendations.student}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Strengths / weaknesses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Points forts / points faibles (seuil 50%)</CardTitle>
          <p className="text-xs text-slate-500">Groupe → Domaine → Capacité → Résultat.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {SW.map((grp) => (
            <div key={grp.level}>
              <p className="text-sm font-semibold mb-2">{grp.level}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {grp.rows.map((r) => (
                  <div key={r.id} className={cn(
                    'flex justify-between items-center p-2 rounded-lg border text-sm',
                    r.strong ? 'bg-green-50 border-green-200' : 'bg-rose-50 border-rose-200'
                  )}>
                    <span className="truncate pr-2">{r.name}</span>
                    <Badge variant="outline" className={r.strong ? 'text-green-700 border-green-300' : 'text-rose-700 border-rose-300'}>
                      {r.avg}% {r.strong ? '· fort' : '· faible'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 text-center py-3">
        Ajustement du modèle : critères fit {pct(0.95)}+ pour CFI, RMSEA &lt; 0.06 (cf. Hu &amp; Bentler, 1999).
      </p>
    </div>
  )
}
