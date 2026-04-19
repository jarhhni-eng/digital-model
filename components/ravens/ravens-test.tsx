'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ravensQuestions,
  computeRavensScore,
  interpretScore,
  RAVENS_STORAGE_KEY,
  RAVENS_DURATION_SECONDS,
  type RavensAnswers,
  type RavensResult,
  type SeriesId,
} from '@/lib/ravens-test'
import { Brain, CheckCircle, Clock, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

// ─── Timer hook ───────────────────────────────────────────────────────────────
function useCountdown(seconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) { expiredRef.current = true; onExpire() }
      return
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [remaining, onExpire])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return { remaining, display: `${mm}:${ss}` }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SERIES_COLORS: Record<SeriesId, string> = {
  A: 'bg-blue-100 text-blue-700 border-blue-200',
  B: 'bg-violet-100 text-violet-700 border-violet-200',
  C: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  D: 'bg-amber-100 text-amber-700 border-amber-200',
  E: 'bg-rose-100 text-rose-700 border-rose-200',
}
const SERIES_BG: Record<SeriesId, string> = {
  A: 'bg-blue-600',
  B: 'bg-violet-600',
  C: 'bg-emerald-600',
  D: 'bg-amber-600',
  E: 'bg-rose-600',
}

// ─── Placeholder SVG when image not yet uploaded ──────────────────────────────
function MatrixPlaceholder({ code }: { code: string }) {
  return (
    <div className="w-full aspect-square max-w-[380px] mx-auto rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center gap-3 select-none">
      <div className="grid grid-cols-3 gap-2 opacity-30">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded border border-muted-foreground/40 flex items-center justify-center text-xs font-mono ${i === 8 ? 'border-dashed' : ''}`}
          >
            {i === 8 ? '?' : ''}
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-muted-foreground">{code}.png</p>
      <p className="text-xs text-muted-foreground/60">Déposez l&apos;image dans <code className="bg-muted px-1 rounded">public/ravens/</code></p>
    </div>
  )
}

// ─── Image wrapper with fallback ──────────────────────────────────────────────
function QuestionImage({ src, code }: { src: string; code: string }) {
  const [error, setError] = useState(false)
  if (error) return <MatrixPlaceholder code={code} />
  return (
    <div className="relative w-full max-w-[380px] mx-auto aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-white">
      <Image
        src={src}
        alt={`Matrice ${code}`}
        fill
        className="object-contain p-2"
        onError={() => setError(true)}
        priority
      />
    </div>
  )
}

// ─── Welcome screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Matrices Progressives de Raven</h1>
          <p className="text-muted-foreground text-sm">Raisonnement inductif — Intelligence fluide</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Ce test psychométrique mesure votre capacité de raisonnement abstrait par l'analyse de patterns
            visuels et d'analogies. Il est administré à des groupes ou des individus, de 5 ans aux personnes âgées.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">60</p>
              <p className="text-xs">questions</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">40 min</p>
              <p className="text-xs">durée</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">5</p>
              <p className="text-xs">séries (A→E)</p>
            </div>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-foreground">
            <p className="font-semibold text-primary mb-2">Instructions</p>
            <ul className="space-y-1.5 text-sm">
              <li>• Chaque question présente une matrice avec une case manquante.</li>
              <li>• Identifiez le motif logique et choisissez le bon élément (1 à 6 ou 1 à 8).</li>
              <li>• Séries A–B : 6 choix · Séries C–E : 8 choix.</li>
              <li>• Le chronomètre se déclenche au clic sur <strong>Commencer</strong>.</li>
              <li>• Le test est soumis automatiquement à la fin du temps.</li>
            </ul>
          </div>
        </div>

        <Button className="w-full h-12 text-base font-semibold" onClick={onBegin}>
          Commencer le test
        </Button>
      </div>
    </div>
  )
}

// ─── Score screen ─────────────────────────────────────────────────────────────
function ScoreScreen({ result }: { result: RavensResult }) {
  const router = useRouter()
  const { score } = result
  const interp = interpretScore(score.total)
  const pct = Math.round((score.total / 60) * 100)
  const mm = String(Math.floor(result.timeUsedSeconds / 60)).padStart(2, '0')
  const ss = String(result.timeUsedSeconds % 60).padStart(2, '0')

  const seriesOrder: SeriesId[] = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Test terminé !</h1>
          <p className="text-muted-foreground text-sm">Matrices Progressives de Raven</p>
        </div>

        {/* Main score */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
          <p className={`text-6xl font-bold ${interp.color}`}>
            {score.total}
            <span className="text-2xl text-muted-foreground">/60</span>
          </p>
          <p className={`text-xl font-semibold ${interp.color}`}>{interp.label}</p>
          <p className="text-sm text-muted-foreground">{pct}% de réussite</p>
        </div>

        {/* Per-series breakdown */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">Résultats par série</p>
          {seriesOrder.map((s) => {
            const d = score.bySeries[s]
            const spct = Math.round((d.correct / d.total) * 100)
            return (
              <div key={s} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Série {s}</span>
                  <span className="text-muted-foreground">{d.correct}/{d.total}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${SERIES_BG[s]}`}
                    style={{ width: `${spct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Time used */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Temps utilisé : {mm}:{ss}</span>
        </div>

        {/* Interpretation scale */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-1.5">
          <p className="font-semibold text-sm mb-2">Barème d'interprétation</p>
          {[
            { range: '0 – 15',  label: 'Très faible',  color: 'text-red-600' },
            { range: '16 – 30', label: 'Faible',        color: 'text-orange-500' },
            { range: '31 – 45', label: 'Moyen',         color: 'text-amber-500' },
            { range: '46 – 55', label: 'Bon',           color: 'text-blue-600' },
            { range: '56 – 60', label: 'Très élevé',   color: 'text-green-600' },
          ].map((row) => (
            <div key={row.range} className={`flex justify-between ${score.total >= parseInt(row.range) ? 'font-semibold' : ''} ${row.color}`}>
              <span>{row.range} points</span>
              <span>{row.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full" onClick={() => router.push('/results')}>
            Mes résultats
          </Button>
          <Button className="w-full" onClick={() => router.push('/tests')}>
            Retour aux tests
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main test UI ─────────────────────────────────────────────────────────────
export function RavensTest() {
  const [phase, setPhase] = useState<'welcome' | 'test' | 'done'>('welcome')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<RavensAnswers>({})
  const [startTime, setStartTime] = useState<number>(0)
  const [result, setResult] = useState<RavensResult | null>(null)

  const submit = useCallback((ans: RavensAnswers, elapsedSeconds: number) => {
    const score = computeRavensScore(ans)
    const res: RavensResult = {
      answers: ans,
      score,
      timeUsedSeconds: elapsedSeconds,
      completedAt: new Date().toISOString(),
    }
    sessionStorage.setItem(RAVENS_STORAGE_KEY, JSON.stringify(res))
    setResult(res)
    setPhase('done')
  }, [])

  const handleExpire = useCallback(() => {
    submit(answers, RAVENS_DURATION_SECONDS)
  }, [answers, submit])

  const { remaining, display: timeDisplay } = useCountdown(
    phase === 'test' ? RAVENS_DURATION_SECONDS : 99999,
    handleExpire
  )

  function handleBegin() {
    setStartTime(Date.now())
    setPhase('test')
  }

  function handleSelect(code: string, choice: number) {
    setAnswers((prev) => ({ ...prev, [code]: choice }))
  }

  function handleSubmit() {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    submit(answers, elapsed)
  }

  if (phase === 'welcome') return <WelcomeScreen onBegin={handleBegin} />
  if (phase === 'done' && result) return <ScoreScreen result={result} />

  const q = ravensQuestions[currentIndex]!
  const total = ravensQuestions.length
  const answered = Object.keys(answers).length
  const isLast = currentIndex === total - 1
  const isUrgent = remaining <= 300   // last 5 min

  // Series progress dots
  const seriesOrder: SeriesId[] = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Series badge */}
          <Badge className={`${SERIES_COLORS[q.series]} border text-xs font-bold px-3 py-1`}>
            Série {q.series} — {q.position}/12
          </Badge>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold tabular-nums ${isUrgent ? 'text-red-600 animate-pulse' : 'text-foreground'}`}>
            <Clock className="w-4 h-4" />
            {timeDisplay}
          </div>

          {/* Global progress */}
          <span className="text-xs text-muted-foreground hidden sm:block">
            {answered}/{total} répondues
          </span>
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-2">
          <Progress value={((currentIndex + 1) / total) * 100} className="h-1.5" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-6">

          {/* Question header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Question <span className="text-primary font-bold">{q.code}</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              {q.numChoices} choix possibles
            </span>
          </div>

          {/* Matrix image */}
          <QuestionImage src={q.imagePath} code={q.code} />

          {/* Choice buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">
              Quelle figure complète la matrice ?
            </p>
            <div className={`grid gap-3 ${q.numChoices === 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-4'}`}>
              {Array.from({ length: q.numChoices }, (_, i) => i + 1).map((n) => {
                const isSelected = answers[q.code] === n
                return (
                  <button
                    key={n}
                    onClick={() => handleSelect(q.code, n)}
                    className={[
                      'rounded-xl border-2 h-14 text-xl font-bold transition-all duration-150',
                      'flex items-center justify-center',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 text-foreground',
                    ].join(' ')}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Series navigator */}
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground mb-2 text-center">Navigation par série</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {seriesOrder.map((s) => {
                const start = seriesOrder.indexOf(s) * 12
                const answered_s = ravensQuestions
                  .slice(start, start + 12)
                  .filter((qq) => answers[qq.code] !== undefined).length
                return (
                  <button
                    key={s}
                    onClick={() => setCurrentIndex(start)}
                    className={[
                      'rounded-lg px-3 py-1.5 text-xs font-bold border transition-all',
                      q.series === s
                        ? `${SERIES_COLORS[s]} border-current`
                        : 'border-border text-muted-foreground hover:border-primary/30',
                    ].join(' ')}
                  >
                    {s} <span className="font-normal opacity-70">{answered_s}/12</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Item-level dots for current series */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {ravensQuestions
              .filter((qq) => qq.series === q.series)
              .map((qq) => (
                <button
                  key={qq.code}
                  onClick={() => setCurrentIndex(qq.index)}
                  title={qq.code}
                  className={[
                    'w-3 h-3 rounded-full transition-all',
                    qq.index === currentIndex
                      ? `${SERIES_BG[q.series]} scale-125`
                      : answers[qq.code] !== undefined
                        ? `${SERIES_BG[q.series]} opacity-50`
                        : 'bg-muted-foreground/30',
                  ].join(' ')}
                />
              ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4 pb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>

            {isLast ? (
              <Button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Soumettre
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Unanswered warning on last question */}
          {isLast && answered < total && (
            <div className="flex items-center gap-2 text-amber-600 text-xs justify-center pb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>{total - answered} question(s) sans réponse — vous pouvez tout de même soumettre.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
