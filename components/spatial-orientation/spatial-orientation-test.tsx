'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  spatialQuestions,
  computeSpatialResult,
  ANSWER_CHOICES,
  SPATIAL_ORIENTATION_STORAGE_KEY,
  SPATIAL_ORIENTATION_TEST_ID,
  type AnswerValue,
  type SpatialResult,
} from '@/lib/spatial-orientation-test'
import { TestIntroSection } from '@/components/assessment/test-intro-section'
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Compass,
  Clock,
} from 'lucide-react'

// ─── Image with fallback placeholder ─────────────────────────────────────────
function TestImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 gap-2 ${className}`}
      >
        <Compass className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground/60 text-center px-2">{src}</p>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border bg-white shadow-sm ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2"
        onError={() => setError(true)}
        priority
      />
    </div>
  )
}

// ─── Score screen ─────────────────────────────────────────────────────────────
function ScoreScreen({ result }: { result: SpatialResult }) {
  const router = useRouter()
  const pct = Math.round((result.totalCorrect / result.totalQuestions) * 100)
  const color =
    pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-red-600'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Test terminé !</h1>
          <p className="text-muted-foreground text-sm">Orientation Spatiale</p>
        </div>

        {/* Score */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
          <p className={`text-6xl font-bold ${color}`}>
            {result.totalCorrect}
            <span className="text-2xl text-muted-foreground">/{result.totalQuestions}</span>
          </p>
          <p className={`text-xl font-semibold ${color}`}>{pct}% de réussite</p>
        </div>

        {/* Per-question breakdown */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-semibold mb-3">Détail par question</p>
          <div className="grid grid-cols-3 gap-2">
            {result.responses.map((r) => (
              <div
                key={r.questionNumber}
                className={`rounded-lg border p-2.5 text-xs flex items-start gap-2 ${
                  r.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                {r.isCorrect ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold">Q{r.questionNumber}</p>
                  <p
                    className={`truncate ${
                      r.isCorrect ? 'text-green-700' : 'text-red-600'
                    }`}
                  >
                    {r.selected ?? '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="font-bold text-green-700">{result.totalCorrect}</p>
            <p className="text-green-600 text-xs">Correctes</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="font-bold text-red-700">
              {result.totalQuestions - result.totalCorrect}
            </p>
            <p className="text-red-600 text-xs">Incorrectes</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="font-bold">{result.totalQuestions}</p>
            <p className="text-muted-foreground text-xs">Total</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => router.push('/results')}>
            Mes résultats
          </Button>
          <Button onClick={() => router.push('/tests')}>Retour aux tests</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Intro screen (FIRST screen, shown before Q1) ───────────────────────────
function SpatialIntroScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold leading-tight">
            Test d&apos;Orientation Spatiale
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Hegarty &amp; Waller (2004) — adapté par Achraf Jarhni (2026)
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm font-semibold">Consigne principale</p>
          <p className="text-sm mt-1">
            Imagine que tu te trouves au centre du cercle et détermine l&apos;objet
            indiqué par la flèche.
          </p>
        </div>

        <TestIntroSection testId={SPATIAL_ORIENTATION_TEST_ID} />

        <Button className="w-full h-12 text-base font-semibold" onClick={onBegin}>
          Commencer le test
        </Button>
      </div>
    </div>
  )
}

// ─── Main test component ──────────────────────────────────────────────────────
export function SpatialOrientationTest() {
  const total = spatialQuestions.length
  const [phase, setPhase] = useState<'intro' | 'test'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({})
  const [timings, setTimings] = useState<Record<number, number>>({})   // ms per question
  const [result, setResult] = useState<SpatialResult | null>(null)
  const questionStartRef = useRef<number>(Date.now())

  // Reset timer when question changes
  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [currentIndex])

  const q = spatialQuestions[currentIndex]!
  const isLast = currentIndex === total - 1
  const answered = Object.keys(answers).length

  function recordTime(qNumber: number) {
    const elapsed = Date.now() - questionStartRef.current
    setTimings((prev) => ({ ...prev, [qNumber]: (prev[qNumber] ?? 0) + elapsed }))
  }

  function handleSelect(value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [q.number]: value }))
  }

  function handleNext() {
    recordTime(q.number)
    setCurrentIndex((i) => i + 1)
  }


  function handleSubmit() {
    recordTime(q.number)
    const responses = spatialQuestions.map((sq) => ({
      questionNumber: sq.number,
      selected: answers[sq.number] ?? null,
      responseTimeMs: timings[sq.number] ?? 0,
    }))
    const r = computeSpatialResult(responses)
    sessionStorage.setItem(SPATIAL_ORIENTATION_STORAGE_KEY, JSON.stringify(r))
    setResult(r)
  }

  if (result) return <ScoreScreen result={result} />
  if (phase === 'intro') return <SpatialIntroScreen onBegin={() => setPhase('test')} />

  const progress = ((currentIndex + 1) / total) * 100
  const selectedAnswer = answers[q.number]

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Orientation Spatiale</span>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            Question {currentIndex + 1} / {total}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {answered}/{total} répondues
          </span>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-3xl space-y-6">

          {/* Question label */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Question <span className="text-primary font-bold">{q.number}</span>
            </h2>
            <span className="text-xs text-muted-foreground italic">
              Which object is here?
            </span>
          </div>

          {/* Persistent instruction reminder (per requirement) */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-center text-sm text-amber-900 font-medium">
            Imagine que tu te trouves au centre du cercle et détermine l&apos;objet
            indiqué par la flèche.
          </div>

          {/* Images — main left, zoomed direction indicator on right */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {/* Main image — left, narrower */}
            <div className="space-y-1.5 sm:col-span-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Main image
              </p>
              <TestImage
                src={q.mainImage}
                alt="Main scene"
                className="w-full aspect-square"
              />
            </div>

            {/* Orientation image — right, ZOOMED (larger) */}
            <div className="space-y-1.5 sm:col-span-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Direction indicator (zoom)
              </p>
              <div className="rounded-xl overflow-hidden ring-2 ring-primary/30 bg-white">
                <TestImage
                  src={q.orientationImage}
                  alt={`Orientation for question ${q.number}`}
                  className="w-full aspect-square scale-110 origin-center"
                />
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 px-5 py-3 text-center">
            <p className="text-base font-semibold text-primary">
              Which object is located in the indicated direction?
            </p>
          </div>

          {/* Answer choices */}
          <div className="space-y-2">
            {ANSWER_CHOICES.map((choice) => {
              const isSelected = selectedAnswer === choice.value
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice.value)}
                  className={[
                    'w-full text-left rounded-xl border-2 px-4 py-3 transition-all duration-150',
                    'flex items-center gap-3',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/30',
                  ].join(' ')}
                >
                  {/* Radio indicator */}
                  <span
                    className={[
                      'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/40',
                    ].join(' ')}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </span>

                  {/* Letter badge */}
                  <span
                    className={[
                      'flex-shrink-0 w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                  >
                    {choice.id}
                  </span>

                  {/* Label */}
                  <span
                    className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}
                  >
                    {choice.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Navigation — forward-only (no back) */}
          <div className="flex items-center justify-end gap-4 pb-8">
            {isLast ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Valider et soumettre
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="flex items-center gap-2 px-8"
              >
                Valider
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground pb-2">
            Navigation uniquement vers l&apos;avant · Pas de retour possible
          </p>

          {isLast && answered < total && (
            <p className="text-center text-xs text-muted-foreground pb-4">
              {total - answered} question(s) unanswered — you can still submit.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
