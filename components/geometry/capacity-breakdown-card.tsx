import {
  formatCapacityGlyph,
  getCapacityLabelMap,
} from '@/lib/geometry/capacity-definitions'
import type { CapacityBreakdownEntry } from '@/lib/geometry/capacity-results'

export function CapacityBreakdownCard({
  testId,
  breakdown,
  unit,
}: {
  testId: string
  breakdown: Record<string, CapacityBreakdownEntry>
  unit: 'fraction' | 'points'
}) {
  const labels = getCapacityLabelMap(testId)
  const entries = Object.entries(breakdown).sort(([a], [b]) => a.localeCompare(b))
  if (!entries.length) return null

  return (
    <div className="mb-6 text-left">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        Résultats par capacité (Cₖ)
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([code, v]) => (
          <div key={code} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="font-mono font-semibold text-emerald-800 dark:text-emerald-200">
              {formatCapacityGlyph(code)}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
              {labels[code] ?? '—'}
            </p>
            <p className="mt-2 text-lg font-semibold tabular-nums">
              {unit === 'points'
                ? `${v.earned} / ${v.max} pts`
                : v.max > 0
                  ? `${v.percent ?? Math.round((v.earned / v.max) * 100)}%`
                  : '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
