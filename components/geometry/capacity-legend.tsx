/**
 * Per-test capacity legend (C1..Cn) for the "Cognition et apprentissage de
 * la géométrie" domain. Displayed on the FIRST screen of each test so the
 * student sees what the assessment is measuring.
 *
 * Pure presentation — no scoring impact.
 */

import { GraduationCap } from 'lucide-react'

interface Capacity {
  code: string
  label: string
}

const CAPACITIES_BY_TEST: Record<string, Capacity[]> = {
  // Symétrie axiale & symétrie centrale share the same competency set.
  'test-symetrie-axiale': [
    {
      code: 'C1',
      label:
        'Reconnaître la similarité des formes géométriques à l\'aide de la translation et la symétrie.',
    },
    {
      code: 'C2',
      label:
        'L\'utilisation de la translation et la symétrie dans la résolution des problèmes géométriques.',
    },
  ],
  'test-symetrie-centrale': [
    {
      code: 'C1',
      label:
        'Reconnaître la similarité des formes géométriques à l\'aide de la translation et la symétrie.',
    },
    {
      code: 'C2',
      label:
        'L\'utilisation de la translation et la symétrie dans la résolution des problèmes géométriques.',
    },
  ],
  // Vectors & translation
  'test-geo-vectors-complete': [
    {
      code: 'C1',
      label: 'La construction d\'un vecteur sous la forme \\( A\\vec{u} + B\\vec{v} \\).',
    },
    {
      code: 'C2',
      label:
        'L\'expression des concepts et des propriétés géométriques affines en utilisant l\'outil vectoriel et l\'inverse.',
    },
    {
      code: 'C3',
      label: 'La résolution des problèmes géométriques à l\'aide de l\'outil vectoriel.',
    },
    {
      code: 'C4',
      label: 'Reconnaître la similarité des formes géométriques à l\'aide de la translation.',
    },
    {
      code: 'C5',
      label: 'L\'utilisation de la translation dans la résolution des problèmes géométriques.',
    },
  ],
}

interface CapacityLegendProps {
  testId: string
}

export function CapacityLegend({ testId }: CapacityLegendProps) {
  const capacities = CAPACITIES_BY_TEST[testId]
  if (!capacities || capacities.length === 0) return null

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="mb-2 flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
        <GraduationCap className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-semibold">Compétences évaluées</p>
      </div>
      <ul className="space-y-1.5 text-xs leading-relaxed text-foreground">
        {capacities.map((c) => (
          <li key={c.code} className="flex gap-2">
            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
              {c.code}
            </span>
            <span className="text-muted-foreground">{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
