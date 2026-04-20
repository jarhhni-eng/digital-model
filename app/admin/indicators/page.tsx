'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buildGeometryIndicators } from '@/lib/admin-mock'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts'
import { Triangle } from 'lucide-react'

export default function IndicatorsPage() {
  const rows = useMemo(() => buildGeometryIndicators(), [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Triangle className="w-6 h-6 text-indigo-600" />
          Indicateurs de performance
        </h1>
        <p className="text-slate-500 mt-1">
          Indicateurs restreints au domaine <strong>Cognition et apprentissage de la géométrie</strong>.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">% correct et % « je ne sais pas » par leçon</CardTitle></CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lessonName" fontSize={11} interval={0} angle={-12} dy={6} height={60} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="pctCorrect" name="% correct" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pctIDK" name="% je ne sais pas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Multi-sélection et clics</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="text-left py-2 pr-4">Leçon</th>
                <th className="text-right py-2 pr-4">% correct</th>
                <th className="text-right py-2 pr-4">% NSP</th>
                <th className="text-right py-2 pr-4">Multi-sel<br/>(1 attendu)</th>
                <th className="text-right py-2 pr-4">Sélection unique<br/>(plusieurs corrects)</th>
                <th className="text-right py-2 pr-4">Clics totaux</th>
                <th className="text-right py-2 pr-4">Clics &gt; réponses</th>
                <th className="text-right py-2">Temps moy.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.lessonId} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium">{r.lessonName}</td>
                  <td className="text-right pr-4 tabular-nums text-green-700 font-semibold">{r.pctCorrect}%</td>
                  <td className="text-right pr-4 tabular-nums">{r.pctIDK}%</td>
                  <td className="text-right pr-4 tabular-nums">{r.pctMultiSelectOn1}%</td>
                  <td className="text-right pr-4 tabular-nums">{r.pctSingleSelectOnMulti}%</td>
                  <td className="text-right pr-4 tabular-nums">{r.totalClicks}</td>
                  <td className="text-right pr-4 tabular-nums">
                    <Badge variant="outline" className="text-amber-700 border-amber-300">{r.clicksExceedCorrect}</Badge>
                  </td>
                  <td className="text-right tabular-nums">{r.avgResponseTimeSec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Temps de réponse moyen par leçon (s)</CardTitle></CardHeader>
        <CardContent style={{ height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lessonName" fontSize={11} interval={0} angle={-12} dy={6} height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgResponseTimeSec" name="Temps moyen (s)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
