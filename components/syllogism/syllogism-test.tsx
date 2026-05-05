'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  syllogismQuestions,
  computeSyllogismScore,
  SYLLOGISM_STORAGE_KEY,
  SYLLOGISM_TEST_ID,
  type SyllogismAnswer,
  type SyllogismResult,
} from '@/lib/syllogism-test'
import { persistCompletedTestSessionBestEffort } from '@/lib/results/submit-completed-session-api'
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const OPTIONS: { value: SyllogismAnswer; label: string; description: string }[] = [
  { value: 'V', label: 'V — Vraie', description: 'La conclusion découle nécessairement des deux prémisses.' },
  { value: 'F', label: 'F — Fausse', description: 'La conclusion ne peut pas être déduite des prémisses.' },
  { value: 'I', label: 'I — Indéterminée', description: 'On ne peut pas conclure avec certitude à partir des prémisses.' },
]

export function SyllogismTest() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, SyllogismAnswer>>({})
  const [submitted, setSubmitted] = useState(false)

  const question = syllogismQuestions[currentIndex]!
  const total = syllogismQuestions.length
  const progress = ((currentIndex + 1) / total) * 100
  const selectedAnswer = answers[question.id]
  const isLast = currentIndex === total - 1
  const allAnswered = syllogismQuestions.every((q) => answers[q.id] !== undefined)

  function handleSelect(value: SyllogismAnswer) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  function handleNext() {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1)
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  function handleSubmit() {
    const score = computeSyllogismScore(answers)
    const result: SyllogismResult = {
      answers,
      score,
      maxScore: total,
      completedAt: new Date().toISOString(),
    }
    sessionStorage.setItem(SYLLOGISM_STORAGE_KEY, JSON.stringify(result))
    const trials = syllogismQuestions.map((q, i) => {
      const sel = answers[q.id]
      const correct = sel === q.correct
      return {
        question_index: i,
        question_id: `syllogism-${q.id}`,
        selected: sel != null ? [sel] : [],
        correct,
        score: correct ? 1 : 0,
        reaction_time_ms: null,
      }
    })
    persistCompletedTestSessionBestEffort({
      testId: SYLLOGISM_TEST_ID,
      completedAt: result.completedAt,
      totalMs: null,
      score: Math.round((score / total) * 100),
      correctCount: score,
      totalQuestions: total,
      trials,
      metadata: { source: 'syllogism-test' },
    })
    setSubmitted(true)
  }

  // ── Score screen ──────────────────────────────────────────────────────────
  if (submitted) {
    const score = computeSyllogismScore(answers)
    const pct = Math.round((score / total) * 100)
    const color = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Test terminé !</h1>
          <p className="text-muted-foreground">Votre score pour le test de raisonnement déductif :</p>

          <div className="rounded-2xl border border-border p-8 space-y-2">
            <p className={`text-6xl font-bold ${color}`}>{score}<span className="text-2xl text-muted-foreground">/{total}</span></p>
            <p className={`text-xl font-semibold ${color}`}>{pct}%</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="font-bold text-green-700">{score}</p>
              <p className="text-green-600 text-xs">Correctes</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="font-bold text-red-700">{total - score}</p>
              <p className="text-red-600 text-xs">Incorrectes</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-bold">{total}</p>
              <p className="text-muted-foreground text-xs">Total</p>
            </div>
          </div>

          <Button className="w-full" onClick={() => router.push('/results')}>
            Voir mes résultats
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/tests')}>
            Retour aux tests
          </Button>
        </div>
      </div>
    )
  }

  // ── Question screen ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Raisonnement déductif</span>
            <Badge variant="outline" className="text-xs">
              Question {currentIndex + 1} / {total}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-2xl space-y-8">

          {/* Instructions (only on first question) */}
          {currentIndex === 0 && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm text-muted-foreground leading-relaxed">
              <p className="font-semibold text-primary mb-1">Instructions</p>
              Lisez attentivement les deux prémisses, puis évaluez si la conclusion qui en découle est :
              <ul className="mt-2 space-y-1 list-none pl-2">
                <li><strong>V (Vraie)</strong> — la conclusion suit nécessairement des prémisses.</li>
                <li><strong>F (Fausse)</strong> — la conclusion ne peut pas être déduite.</li>
                <li><strong>I (Indéterminée)</strong> — on ne peut pas conclure avec certitude.</li>
              </ul>
            </div>
          )}

          {/* Question card */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Premises */}
            <div className="p-6 space-y-3 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Syllogisme {question.id}
              </p>
              <div className="space-y-2">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">P1</span>
                  <p className="text-base leading-relaxed">{question.premise1}</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">P2</span>
                  <p className="text-base leading-relaxed">{question.premise2}</p>
                </div>
              </div>
            </div>

            {/* Conclusion */}
            <div className="px-6 py-4 bg-muted/30 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Conclusion</p>
              <p className="text-base font-medium leading-relaxed">{question.conclusion}</p>
            </div>

            {/* Answer options */}
            <div className="p-6 space-y-3">
              <p className="text-sm font-semibold text-muted-foreground mb-4">Cette conclusion est :</p>
              {OPTIONS.map((opt) => {
                const isSelected = selectedAnswer === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={[
                      'w-full text-left rounded-xl border-2 p-4 transition-all duration-150',
                      'flex items-start gap-3 min-h-[64px]',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30',
                    ].join(' ')}
                  >
                    <span className={[
                      'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/40 text-muted-foreground',
                    ].join(' ')}>
                      {opt.value}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pb-8">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            {/* Answered dots */}
            <div className="flex gap-1.5 flex-wrap justify-center">
              {syllogismQuestions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={[
                    'w-2.5 h-2.5 rounded-full transition-all',
                    i === currentIndex
                      ? 'bg-primary scale-125'
                      : answers[q.id]
                        ? 'bg-primary/50'
                        : 'bg-muted-foreground/30',
                  ].join(' ')}
                  title={`Question ${i + 1}`}
                />
              ))}
            </div>

            {isLast ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Soumettre
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isLast && !allAnswered && (
            <p className="text-center text-xs text-muted-foreground pb-4">
              Répondez à toutes les questions pour soumettre le test.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
