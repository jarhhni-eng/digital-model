'use client'

/**
 * VectorsQuizTest — Vecteurs et Translations lesson quiz
 *
 * Phases: intro → quiz → submitting → results
 *
 * Rules enforced here:
 * - No correctness feedback is shown during the quiz.
 * - The "J'ai oublié" option is visually de-emphasised but still selectable.
 * - Q1 is a diagnostic question (not scored) — labelled accordingly.
 * - Final results show global score + per-competency breakdown only.
 */

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle2,
  BarChart3, ArrowLeft, Triangle,
} from 'lucide-react'
import {
  getPublicQuestions,
  VECTORS_LESSON_TITLE,
  VECTORS_TEST_ID,
  COMPETENCY_LABELS,
  type PublicQuestion,
  type LessonScoreResult,
} from '@/lib/geo-vectors-lesson'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'quiz' | 'submitting' | 'results'

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressHeader({
  current, total, lessonTitle,
}: { current: number; total: number; lessonTitle: string }) {
  const pct = Math.round(((current + 1) / total) * 100)
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate">{lessonTitle}</p>
          <p className="text-xs text-muted-foreground">Question {current + 1} / {total}</p>
        </div>
        <div className="flex-1 max-w-xs">
          <Progress value={pct} className="h-2" />
        </div>
        <span className="text-xs font-bold text-primary tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}

function ChoiceButton({
  text, selected, onSelect, isSkip,
}: { text: string; selected: boolean; onSelect: () => void; isSkip?: boolean }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left text-sm transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected
          ? 'border-primary bg-primary/8 text-primary font-medium'
          : isSkip
          ? 'border-dashed border-border text-muted-foreground hover:border-muted-foreground/40'
          : 'border-border bg-card hover:border-primary/40 hover:bg-primary/4',
      )}
    >
      {/* Radio dot */}
      <span
        className={cn(
          'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground/30',
        )}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
      </span>
      <span className="leading-snug">{text}</span>
    </button>
  )
}

// ─── Intro screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Domain badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
            <Triangle className="w-3 h-3" />
            Cognition et apprentissage de la géométrie
          </span>
        </div>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold text-foreground">
              {VECTORS_LESSON_TITLE}
            </CardTitle>
            <CardDescription className="text-sm">
              Leçon 1 — Mémorisation&nbsp;: prérequis &nbsp;|&nbsp; 1ère Bac Sciences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cette évaluation mesure vos compétences sur le produit scalaire et les
                théorèmes géométriques. Lisez attentivement chaque question et choisissez
                la réponse qui vous semble correcte.
              </p>
            </div>

            {/* Competency overview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Compétences évaluées
              </p>
              {Object.entries(COMPETENCY_LABELS).map(([code, label]) => (
                <div key={code} className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="text-indigo-700 border-indigo-300 bg-indigo-50 font-bold text-xs"
                  >
                    {code}
                  </Badge>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: 'Questions', value: '9' },
                { label: 'Durée estimée', value: '~10 min' },
                { label: 'Correction', value: 'Non affichée' },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-muted/40">
                  <p className="text-base font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
        >
          Commencer l&apos;évaluation
        </Button>
      </div>
    </div>
  )
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  result, onBack,
}: { result: LessonScoreResult; onBack: () => void }) {
  const router = useRouter()
  const pct = result.globalPercent

  const scoreColor =
    pct >= 75 ? 'text-green-600' :
    pct >= 50 ? 'text-amber-600' :
    'text-red-500'

  const scoreRing =
    pct >= 75 ? 'stroke-green-500' :
    pct >= 50 ? 'stroke-amber-500' :
    'stroke-red-400'

  // SVG circle progress
  const r = 38
  const circumference = 2 * Math.PI * r
  const dash = (pct / 100) * circumference

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-xl font-bold">Évaluation terminée</h1>
            <p className="text-sm text-muted-foreground">{VECTORS_LESSON_TITLE}</p>
          </div>
        </div>

        {/* Global score card */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="pt-6 flex items-center gap-6">
            {/* Circular progress */}
            <div className="relative flex-shrink-0">
              <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r={r} fill="none"
                  strokeWidth="8"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeLinecap="round"
                  className={cn('transition-all duration-700', scoreRing)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-2xl font-extrabold', scoreColor)}>{pct}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {result.globalCorrect}
                <span className="text-muted-foreground font-normal text-lg">
                  {' '}/ {result.globalTotal}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">Score global</p>
              {result.diagnosticAnswer && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Rappel déclaré&nbsp;: «&nbsp;{result.diagnosticAnswer}&nbsp;»
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Per-competency breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-base">Score par compétence</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.competencyScores.map((cs) => {
              const cp =
                cs.percent >= 75 ? 'bg-green-500' :
                cs.percent >= 50 ? 'bg-amber-500' : 'bg-red-400'
              const ct =
                cs.percent >= 75 ? 'text-green-700' :
                cs.percent >= 50 ? 'text-amber-700' : 'text-red-600'

              return (
                <div key={cs.competency} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-indigo-700 border-indigo-300 bg-indigo-50 font-bold text-xs"
                      >
                        {cs.competency}
                      </Badge>
                      <span className="text-muted-foreground text-xs">{cs.label}</span>
                    </div>
                    <span className={cn('font-bold tabular-nums text-sm', ct)}>
                      {cs.correct}/{cs.total} ({cs.percent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', cp)}
                      style={{ width: `${cs.percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
          <Button
            onClick={() => router.push('/results')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Voir tous mes résultats
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main quiz component ──────────────────────────────────────────────────────

export function VectorsQuizTest() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const questions = getPublicQuestions()

  const [phase, setPhase]           = useState<Phase>('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected]     = useState<Record<string, string>>({})
  const [result, setResult]         = useState<LessonScoreResult | null>(null)

  const startedAtRef = useRef<string>(new Date().toISOString())

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleSelect = useCallback((questionId: string, choiceId: string) => {
    setSelected((prev) => ({ ...prev, [questionId]: choiceId }))
  }, [])

  const goNext = useCallback(() => {
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1))
  }, [questions.length])

  const goPrev = useCallback(() => {
    setCurrentIdx((i) => Math.max(i - 1, 0))
  }, [])

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour enregistrer vos résultats.',
        variant: 'destructive',
      })
      return
    }

    setPhase('submitting')
    try {
      const res = await fetch('/api/lesson-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:          user.userId,
          testId:          VECTORS_TEST_ID,
          selectedChoices: selected,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { result: LessonScoreResult }
      setResult(data.result)
      setPhase('results')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erreur de soumission',
        description: 'Impossible d\'enregistrer les résultats. Réessayez.',
        variant: 'destructive',
      })
      setPhase('quiz')
    }
  }, [user, selected, toast])

  // ── Render phases ──────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <IntroScreen
        onStart={() => {
          startedAtRef.current = new Date().toISOString()
          setPhase('quiz')
        }}
      />
    )
  }

  if (phase === 'results' && result) {
    return <ResultsScreen result={result} onBack={() => router.push('/dashboard')} />
  }

  // ── Quiz phase (also covers 'submitting') ──────────────────────────────────

  const q: PublicQuestion = questions[currentIdx]
  const isFirst    = currentIdx === 0
  const isLast     = currentIdx === questions.length - 1
  const isAnswered = Boolean(selected[q.id])
  const answeredCount = Object.keys(selected).length

  const skipText = "J'ai oublié"
  const skipTextAlt = "J'ai tout oublié"

  return (
    <div className="min-h-screen bg-background pb-24">
      <ProgressHeader
        current={currentIdx}
        total={questions.length}
        lessonTitle={VECTORS_LESSON_TITLE}
      />

      <div className="max-w-2xl mx-auto px-4 pt-20 pb-8">

        {/* Question card */}
        <Card className="mt-4 border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="pb-3">
            {/* Labels row */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                {q.label}
              </span>
              {q.isDiagnostic && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                  Question diagnostique
                </span>
              )}
            </div>
            <CardTitle className="text-lg font-semibold leading-snug">
              {q.text}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2.5">
            {q.choices.map((choice) => {
              const isSkip = choice.text === skipText || choice.text === skipTextAlt
              return (
                <ChoiceButton
                  key={choice.id}
                  text={choice.text}
                  selected={selected[q.id] === choice.id}
                  isSkip={isSkip}
                  onSelect={() => handleSelect(q.id, choice.id)}
                />
              )
            })}
          </CardContent>
        </Card>

        {/* Question navigator dots */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          {questions.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-semibold border-2 transition-colors',
                idx === currentIdx
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : selected[questions[idx].id]
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                  : 'bg-card text-muted-foreground border-border hover:border-indigo-300',
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Progress note */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          {answeredCount} / {questions.length} réponses saisies
        </p>
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={isFirst}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={phase === 'submitting'}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
            >
              {phase === 'submitting' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Envoi…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Soumettre
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
