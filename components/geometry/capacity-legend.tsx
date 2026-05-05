/**
 * UI block: lists official Cₖ definitions for a geometry lesson on the first screen.
 * Data lives in `@/lib/geometry/capacity-definitions`.
 */

import { GraduationCap } from 'lucide-react'
import KaTeX from 'katex'
import 'katex/dist/katex.min.css'
import {
  formatCapacityGlyph,
  getCapacitiesForTestId,
  type CapacityDef,
} from '@/lib/geometry/capacity-definitions'

export type { CapacityDef }
export {
  CAPACITIES_BY_TEST,
  getCapacitiesForTestId,
  getCapacityLabelMap,
  formatCapacityGlyph,
} from '@/lib/geometry/capacity-definitions'

function renderLabelHtml(label: string): string {
  return label.replace(/\\\(([^]+?)\\\)/g, (_, latex) => {
    try {
      return KaTeX.renderToString(latex, { throwOnError: false })
    } catch {
      return `\\(${latex}\\)`
    }
  })
}

interface CapacityLegendProps {
  testId: string
  title?: string
}

export function CapacityLegend({ testId, title }: CapacityLegendProps) {
  const capacities = getCapacitiesForTestId(testId)
  if (!capacities.length) return null

  const defaultTitle =
    testId === 'test-geo-produit-scalaire'
      ? 'Capacités (Cₖ) évaluées — Produit scalaire (1ère Bac)'
      : 'Capacités (Cₖ) évaluées'

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="mb-2 flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
        <GraduationCap className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-semibold">{title ?? defaultTitle}</p>
      </div>
      <ul className="space-y-1.5 text-xs leading-relaxed text-foreground">
        {capacities.map((c) => (
          <li key={c.code} className="flex gap-2">
            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
              {formatCapacityGlyph(c.code)}
            </span>
            <span
              className="text-muted-foreground [&_.katex]:text-xs"
              dangerouslySetInnerHTML={{ __html: renderLabelHtml(c.label) }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
