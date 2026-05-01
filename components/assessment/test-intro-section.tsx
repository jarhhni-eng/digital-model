'use client'

import { useState } from 'react'
import { ChevronDown, BookOpen, Info } from 'lucide-react'
import { getTestReferences } from '@/lib/test-references'

interface TestIntroSectionProps {
  testId: string
  /** Show only the introduction block (no references) */
  introOnly?: boolean
  /** Show only the references block (no intro) */
  referencesOnly?: boolean
  /** Optional override — if provided, replaces the lookup intro */
  introductionOverride?: string
}

/**
 * Drop-in section for the FIRST screen of any test.
 * Renders the test-specific introduction at the top and a collapsible
 * "Références scientifiques" panel at the bottom.
 *
 * Does not affect questions, scoring, timing, or any other screen.
 */
export function TestIntroSection({
  testId,
  introOnly,
  referencesOnly,
  introductionOverride,
}: TestIntroSectionProps) {
  const entry = getTestReferences(testId)
  const intro = introductionOverride ?? entry?.introduction
  const domainIntro = entry?.domainIntroduction
  const instructions = entry?.instructions
  const references = entry?.references ?? []

  if (!entry && !introductionOverride) return null

  return (
    <div className="space-y-4">
      {!referencesOnly && (domainIntro || intro || instructions) && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-semibold">À propos de ce test</p>
          </div>
          {domainIntro && (
            <p className="text-xs leading-relaxed text-muted-foreground italic">
              {domainIntro}
            </p>
          )}
          {intro && (
            <p className="text-sm leading-relaxed text-foreground">{intro}</p>
          )}
          {instructions && (
            <div className="rounded-lg bg-background/60 border border-border/60 p-3">
              <p className="text-xs font-semibold text-foreground mb-1">Instructions</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {instructions}
              </p>
            </div>
          )}
        </div>
      )}

      {!introOnly && references.length > 0 && (
        <ReferencesSheet references={references} />
      )}
    </div>
  )
}

function ReferencesSheet({ references }: { references: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="w-4 h-4 text-primary" />
          Références scientifiques
          <span className="text-xs font-normal text-muted-foreground">
            ({references.length})
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <ol className="border-t border-border bg-background px-4 py-3 max-h-72 overflow-y-auto space-y-2 text-[11px] leading-relaxed text-muted-foreground list-decimal list-inside">
          {references.map((ref, i) => (
            <li key={i} className="break-words">
              {ref}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
