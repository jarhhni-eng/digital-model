'use client'

/**
 * Longitudinal progression chart — example client component fed by the
 * server-side `getMyProgression()` query. Pass the rows from a parent
 * Server Component; this component only owns rendering.
 */

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProgressionPoint } from '@/lib/analytics/queries'

export function ProgressionChart({
  data,
  height = 260,
}: {
  data: ProgressionPoint[]
  height?: number
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
        Aucun résultat enregistré pour l&apos;instant.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number) => [`${value}%`, 'Score']}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#1e3a8a"
          strokeWidth={2}
          dot={{ r: 3, fill: '#1e3a8a' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
