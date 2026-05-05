'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  rotation2dQuestions,
  computeRotation2DResult,
  SIDES,
  MENTAL_ROTATION_2D_STORAGE_KEY,
  MENTAL_ROTATION_2D_DURATION_SECONDS,
  MENTAL_ROTATION_2D_TEST_ID,
  TOTAL_QUESTIONS_2D,
  type Side,
  type Rotation2DResult,
} from '@/lib/mental-rotation-2d-test'
import { persistCompletedTestSessionBestEffort } from '@/lib/results/submit-completed-session-api'
import { TestIntroSection } from '@/components/assessment/test-intro-section'
import {
  Brain,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(totalSeconds: number, active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const firedRef = useRef(false)

  useEffect(() => {
    if (!active) return
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        onExpire()
      }
      return
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [active, remaining, onExpire])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return { remaining, display: `${mm}:${ss}` }
}

// ─── Image with fallback ──────────────────────────────────────────────────────
function Rotation2DImage({ src, questionNumber }: { src: string; questionNumber: number }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className="w-full aspect-video max-w-2xl mx-auto rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center gap-2">
        <Brain className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Rotation ({questionNumber}).png</p>
        <p className="text-xs text-muted-foreground/60">
          Déposez l&apos;image dans <code className="bg-muted px-1 rounded">public/rotation-2d/</code>
        </p>
      </div>
    )
  }
  return (
    <div className="relative w-full aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden border border-border bg-white shadow-md">
      <Image
        src={src}
        alt={`Question ${questionNumber}`}
        fill
        className="object-contain p-3"
        onError={() => setError(true)}
        priority
      />
    </div>
  )
}

// ─── Intro screen ─────────────────────────────────────────────────────────────
function IntroScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold leading-tight">2D Mental Rotation Test</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Left / Right Selection · 19 questions · 15 minutes
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Pour chaque écran, observez la figure de référence en haut. Deux figures candidates
            sont présentées sur l&apos;image : l&apos;une à <strong>gauche (LEFT)</strong>, l&apos;autre à
            <strong> droite (RIGHT)</strong>.
          </p>
          <p>
            Sélectionnez le côté qui correspond à la figure de référence après une rotation 2D.
            <strong> Choisissez aussi rapidement et précisément que possible.</strong>
          </p>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">19</p>
              <p className="text-xs">questions</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">15 min</p>
              <p className="text-xs">durée</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">19 pts</p>
              <p className="text-xs">score max</p>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-foreground">
            <p className="font-semibold text-primary mb-2">Instructions</p>
            <ul className="space-y-1.5 text-sm">
              <li>• Une seule réponse par question : <strong>LEFT</strong> ou <strong>RIGHT</strong>.</li>
              <li>• Aucun retour en arrière n&apos;est possible.</li>
              <li>• Aucune correction ne sera affichée pendant le test.</li>
              <li>• Le test se soumet automatiquement à la fin des 15 minutes.</li>
            </ul>
            <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-amber-700 text-xs font-medium">
              Barème : +1 pt par bonne réponse · 0 pt sinon
            </div>
          </div>
        </div>

        <TestIntroSection testId={MENTAL_ROTATION_2D_TEST_ID} introOnly />
        <TestIntroSection testId={MENTAL_ROTATION_2D_TEST_ID} referencesOnly />

        <Button className="w-full h-12 text-base font-semibold" onClick={onBegin}>
          Commencer le test
        </Button>
      </div>
    </div>
  )
}

// ─── Score screen ─────────────────────────────────────────────────────────────
function ScoreScreen({ result }: { result: Rotation2DResult }) {
  const router = useRouter()
  const pct = Math.round((result.totalScore / result.maxScore) * 100)
  const color =
    pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-amber-500' : 'text-red-600'
  const mm = String(Math.floor(result.timeUsedSeconds / 60)).padStart(2, '0')
  const ss = String(result.timeUsedSeconds % 60).padStart(2, '0')
  const correct = result.responses.filter((r) => r.isCorrect).length
  const wrong = result.responses.filter((r) => r.selected !== null && !r.isCorrect).length
  const skipped = result.responses.filter((r) => r.selected === null).length

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Test terminé !</h1>
          <p className="text-sm text-muted-foreground">2D Mental Rotation Test</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
          <p className={`text-6xl font-bold tabular-nums ${color}`}>
            {result.totalScore}
            <span className="text-2xl text-muted-foreground">/{result.maxScore}</span>
          </p>
          <p className={`text-lg font-semibold ${color}`}>Your score: {result.totalScore} / {result.maxScore}</p>
          <p className="text-sm text-muted-foreground">{pct}% de réussite</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-2xl font-bold text-green-700">{correct}</p>
            <p className="text-xs text-green-600">correctes</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-2xl font-bold text-red-700">{wrong}</p>
            <p className="text-xs text-red-600">incorrectes</p>
          </div>
          <div className="rounded-lg bg-muted/30 border border-border p-3">
            <p className="text-2xl font-bold text-muted-foreground">{skipped}</p>
            <p className="text-xs text-muted-foreground">non répondues</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 max-h-64 overflow-y-auto">
          <p className="text-sm font-semibold mb-2">Détail par question</p>
          {result.responses.map((r) => (
            <div
              key={r.questionNumber}
              className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                r.isCorrect
                  ? 'bg-green-50 border border-green-100'
                  : r.selected === null
                    ? 'bg-muted/30 border border-border'
                    : 'bg-red-50 border border-red-100'
              }`}
            >
              <span className="font-medium">Q{r.questionNumber}</span>
              <span className="text-muted-foreground">{r.selected ?? '—'}</span>
              <span
                className={`font-bold ${
                  r.isCorrect
                    ? 'text-green-600'
                    : r.selected === null
                      ? 'text-muted-foreground'
                      : 'text-red-500'
                }`}
              >
                {r.isCorrect ? '+1 pt' : '0 pt'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            Temps utilisé : {mm}:{ss}
          </span>
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

// ─── Main test ────────────────────────────────────────────────────────────────
export function MentalRotation2DTest() {
  const total = rotation2dQuestions.length
  const [phase, setPhase] = useState<'intro' | 'test' | 'done'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Side>>({})
  const [timings, setTimings] = useState<Record<number, number>>({})
  const [startTime, setStartTime] = useState(0)
  const [result, setResult] = useState<Rotation2DResult | null>(null)
  const questionStartRef = useRef<number>(Date.now())

  const submit = useCallback(
    (ans: Record<number, Side>, elapsedSeconds: number) => {
      const raw = rotation2dQuestions.map((q) => ({
        questionNumber: q.number,
        selected: ans[q.number] ?? null,
        responseTimeMs: timings[q.number] ?? 0,
      }))
      const r = computeRotation2DResult(raw, elapsedSeconds)
      try {
        sessionStorage.setItem(MENTAL_ROTATION_2D_STORAGE_KEY, JSON.stringify(r))
      } catch {
        /* ignore */
      }
      const trials = r.responses.map((resp, i) => ({
        question_index: i,
        question_id: `mr2d-${resp.questionNumber}`,
        selected: resp.selected != null ? [resp.selected] : [],
        correct: resp.isCorrect,
        score: resp.isCorrect ? 1 : 0,
        reaction_time_ms: resp.responseTimeMs,
      }))
      persistCompletedTestSessionBestEffort({
        testId: MENTAL_ROTATION_2D_TEST_ID,
        completedAt: r.completedAt,
        totalMs: elapsedSeconds * 1000,
        score: Math.round((r.totalScore / r.maxScore) * 100),
        correctCount: r.totalScore,
        totalQuestions: r.maxScore,
        trials,
        metadata: { source: 'mental-rotation-2d' },
      })
      setResult(r)
      setPhase('done')
    },
    [timings],
  )

  const handleExpire = useCallback(() => {
    submit(answers, MENTAL_ROTATION_2D_DURATION_SECONDS)
  }, [answers, submit])

  const { remaining, display: timeDisplay } = useCountdown(
    MENTAL_ROTATION_2D_DURATION_SECONDS,
    phase === 'test',
    handleExpire,
  )

  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [currentIndex])

  function handleBegin() {
    setStartTime(Date.now())
    setPhase('test')
  }

  function recordTime(qNumber: number) {
    const elapsed = Date.now() - questionStartRef.current
    setTimings((prev) => ({ ...prev, [qNumber]: (prev[qNumber] ?? 0) + elapsed }))
  }

  if (phase === 'intro') return <IntroScreen onBegin={handleBegin} />
  if (phase === 'done' && result) return <ScoreScreen result={result} />

  const q = rotation2dQuestions[currentIndex]!
  const isLast = currentIndex === total - 1
  const selected = answers[q.number] ?? null
  const isUrgent = remaining <= 300
  const progress = ((currentIndex + 1) / total) * 100

  function chooseSide(side: Side) {
    setAnswers((prev) => ({ ...prev, [q.number]: side }))
  }

  function handleNext() {
    recordTime(q.number)
    setCurrentIndex((i) => i + 1)
  }

  function handleSubmit() {
    recordTime(q.number)
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    submit(answers, elapsed)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Rotation Mentale 2D</span>
          </div>

          <div
            className={`flex items-center gap-1.5 font-mono font-bold text-sm tabular-nums px-3 py-1 rounded-lg border ${
              isUrgent
                ? 'text-red-600 border-red-200 bg-red-50 animate-pulse'
                : 'text-foreground border-border bg-muted/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {timeDisplay}
          </div>

          <Badge variant="outline" className="text-xs">
            {currentIndex + 1} / {total}
          </Badge>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Question <span className="text-primary font-bold">{q.number}</span>
              <span className="text-muted-foreground font-normal"> / {TOTAL_QUESTIONS_2D}</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              {selected ? `Sélectionné : ${selected}` : 'Choisissez LEFT ou RIGHT'}
            </span>
          </div>

          {/* Reference + candidates image */}
          <Rotation2DImage src={q.imagePath} questionNumber={q.number} />

          {/* Instruction */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 text-center text-sm text-primary font-medium">
            Quelle figure correspond à la figure de référence ?
          </div>

          {/* LEFT / RIGHT buttons */}
          <div className="grid grid-cols-2 gap-4">
            {SIDES.map((side) => {
              const isChecked = selected === side
              const Icon = side === 'LEFT' ? ArrowLeft : ArrowRight
              return (
                <button
                  key={side}
                  onClick={() => chooseSide(side)}
                  className={[
                    'flex items-center justify-center gap-3 rounded-2xl border-2 px-6 py-6 transition-all duration-150',
                    'text-lg font-bold tracking-wide',
                    isChecked
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer text-foreground',
                  ].join(' ')}
                  aria-pressed={isChecked}
                >
                  {side === 'LEFT' && <Icon className="w-6 h-6" />}
                  <span>{side}</span>
                  {side === 'RIGHT' && <Icon className="w-6 h-6" />}
                </button>
              )
            })}
          </div>

          {isUrgent && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              Moins de 5 minutes restantes !
            </div>
          )}

          <div className="flex justify-end pb-8">
            {isLast ? (
              <Button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-8"
              >
                <CheckCircle className="w-4 h-4" />
                Soumettre le test
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex items-center gap-2 px-8">
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground pb-2">
            Navigation uniquement vers l&apos;avant · Pas de retour possible
          </p>
        </div>
      </div>
    </div>
  )
}
