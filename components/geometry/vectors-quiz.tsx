'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import KaTeX from 'katex'
import 'katex/dist/katex.min.css'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  VECTORS_QUESTIONS,
  VECTOR_POINTS,
  VectorsResult,
  VectorsTrialResult,
  saveVectorsResult,
} from '@/lib/geometry/geo-vectors-complete'

type Phase = 'intro' | 'instructions' | 'running' | 'done'

function arrayEquals(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  const as = [...a].sort()
  const bs = [...b].sort()
  return as.every((v, i) => v === bs[i])
}

export function VectorsQuizTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [trials, setTrials] = useState<VectorsTrialResult[]>([])
  const [selectedList, setSelectedList] = useState<number[]>([])
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)

  const question = VECTORS_QUESTIONS[current]
  const isMulti =
    Array.isArray(question?.correctAnswer) &&
    (question.correctAnswer as number[]).length > 1

  const toggleSelect = (idx: number) => {
    if (isMulti) {
      setSelectedList((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
      )
    } else {
      setSelectedList([idx])
    }
  }

  const submit = useCallback(() => {
    if (selectedList.length === 0) return
    const q = VECTORS_QUESTIONS[current]

    let correct = false
    if (q.correctAnswer === null) {
      correct = false
    } else if (Array.isArray(q.correctAnswer)) {
      correct = arrayEquals(selectedList, q.correctAnswer as number[])
    } else {
      correct = selectedList.length === 1 && selectedList[0] === q.correctAnswer
    }

    const trial: VectorsTrialResult = {
      index: current,
      questionId: q.id,
      selected: selectedList[0],
      correct,
      reactionTimeMs: Date.now() - trialStart.current,
    }
    setTrials((t) => [...t, trial])
    setSelectedList([])

    if (current + 1 >= VECTORS_QUESTIONS.length) {
      setPhase('done')
    } else {
      setCurrent((n) => n + 1)
      setTimeout(() => {
        trialStart.current = Date.now()
      }, 100)
    }
  }, [current, selectedList])

  useEffect(() => {
    if (phase === 'done' && trials.length > 0) {
      const scorable = trials.filter((t) => {
        const q = VECTORS_QUESTIONS[t.index]
        return q.correctAnswer !== null
      })
      const correct = scorable.filter((t) => t.correct).length
      const r: VectorsResult = {
        id: `vec-${Date.now()}`,
        userName: user?.username,
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        trials,
        totalMs: Date.now() - startedAt,
        correctCount: correct,
        score: scorable.length > 0 ? Math.round((correct / scorable.length) * 100) : 0,
      }
      saveVectorsResult(r)
    }
  }, [phase, trials, startedAt, user])

  if (phase === 'intro') {
    return (
      <Intro
        onQuit={() => router.push('/dashboard')}
        onStart={() => {
          setStartedAt(Date.now())
          trialStart.current = Date.now()
          setPhase('instructions')
        }}
      />
    )
  }

  if (phase === 'instructions') {
    return (
      <Instructions
        onBegin={() => {
          setPhase('running')
          setCurrent(0)
          trialStart.current = Date.now()
        }}
        onBack={() => setPhase('intro')}
      />
    )
  }

  if (phase === 'done') {
    return <Results trials={trials} onExit={() => router.push('/dashboard')} />
  }

  return (
    <TrialView
      index={current}
      total={VECTORS_QUESTIONS.length}
      question={question}
      selectedList={selectedList}
      isMulti={isMulti}
      onToggle={toggleSelect}
      onSubmit={submit}
    />
  )
}

function Intro({ onStart, onQuit }: { onStart: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600">
          <BarChart3 className="h-4 w-4" /> Vecteurs &amp; Translation
        </div>
        <h1 className="mb-3 text-3xl font-bold">Vecteurs &amp; Translation — Partie I</h1>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Ce test évalue votre compréhension des concepts de vecteurs et de translation à travers
          une auto-évaluation suivie de 8 questions de cours portant sur la colinéarité,
          la relation de Chasles, l&apos;égalité vectorielle et les propriétés de la translation.
          Compétences évaluées : C1, C2, C4.
        </p>
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <strong>Durée estimée :</strong> ~10 minutes. Certaines questions admettent plusieurs
          réponses correctes.
        </div>
        <Button onClick={onStart}>
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function Instructions({ onBegin, onBack }: { onBegin: () => void; onBack: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      <Card className="p-8">
        <h2 className="mb-3 text-2xl font-bold">Consignes</h2>
        <ol className="mb-6 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong>1.</strong> Commencez par l&apos;auto-évaluation sur votre rappel de la leçon.
          </li>
          <li>
            <strong>2.</strong> Lisez chaque question attentivement — les notations vectorielles
            sont affichées en LaTeX.
          </li>
          <li>
            <strong>3.</strong> Pour les questions à choix multiples, sélectionnez{' '}
            <em>toutes</em> les réponses correctes avant de valider.
          </li>
          <li>
            <strong>4.</strong> Cliquez « Valider » pour passer à la question suivante.
          </li>
          <li>
            <strong>5.</strong> Une réponse est correcte uniquement si toutes les bonnes options
            sont cochées (et aucune mauvaise).
          </li>
        </ol>
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30">
          💡 Prenez le temps de bien analyser chaque notation vectorielle avant de répondre.
        </div>
        <Button onClick={onBegin}>
          Commencer les questions <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

interface TrialViewProps {
  index: number
  total: number
  question: (typeof VECTORS_QUESTIONS)[number]
  selectedList: number[]
  isMulti: boolean
  onToggle: (idx: number) => void
  onSubmit: () => void
}

function renderInlineLatex(text: string): string {
  return text.replace(/\\\(([^]+?)\\\)/g, (match, latex) => {
    try {
      return `<span class="inline-math">${KaTeX.renderToString(latex, {
        throwOnError: false,
      })}</span>`
    } catch {
      return match
    }
  })
}

function TrialView({
  index,
  total,
  question,
  selectedList,
  isMulti,
  onToggle,
  onSubmit,
}: TrialViewProps) {
  const showPlane = question.showCoordPlane === true

  const questionPanel = (
    <div className="space-y-6">
      <div
        className="text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderInlineLatex(question.question) }}
      />

      {isMulti && (
        <div className="rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30">
          ℹ️ Plusieurs réponses correctes possibles — cochez toutes les bonnes réponses.
        </div>
      )}

      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const answerLabel = String.fromCharCode(65 + idx)
          const isSelected = selectedList.includes(idx)
          return (
            <button
              key={idx}
              onClick={() => onToggle(idx)}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center ${
                    isMulti ? 'rounded' : 'rounded-full'
                  } border-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className="text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <div
                    className="font-semibold text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{
                      __html: renderInlineLatex(`${answerLabel}. ${option}`),
                    }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Button
        onClick={onSubmit}
        disabled={selectedList.length === 0}
        className="w-full"
        size="lg"
      >
        Valider <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <main
      className={`container mx-auto py-8 ${showPlane ? 'max-w-7xl' : 'max-w-4xl'}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Question {index + 1} / {total}
        </h2>
        <div className="text-right">
          <span className="text-sm font-semibold text-blue-600">{question.id}</span>
          {question.competencies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Compétence: {question.competencies.join(', ')}
            </p>
          )}
        </div>
      </div>
      <Progress value={((index + 1) / total) * 100} className="mb-6" />

      {showPlane ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-4">
            <CoordPlane />
          </Card>
          <Card className="p-6">{questionPanel}</Card>
        </div>
      ) : (
        <Card className="p-6">{questionPanel}</Card>
      )}
    </main>
  )
}

// ─── Coordinate plane (LEFT panel for Q8 → Q18) ─────────────────────────────
//
// Plotly is heavy and only needed for one screen — we render a lightweight
// SVG grid with the labelled points instead. The viewBox spans
// x ∈ [-4, 10], y ∈ [-6, 3].

function CoordPlane() {
  const xMin = -4, xMax = 10
  const yMin = -6, yMax = 3
  const padX = 28
  const padY = 24
  const w = 520
  const h = 360
  const innerW = w - 2 * padX
  const innerH = h - 2 * padY
  const sx = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * innerW
  const sy = (y: number) => padY + ((yMax - y) / (yMax - yMin)) * innerH

  // Grid lines
  const xs: number[] = []
  for (let x = xMin; x <= xMax; x++) xs.push(x)
  const ys: number[] = []
  for (let y = yMin; y <= yMax; y++) ys.push(y)

  // Distinct colours per point so labels stay readable.
  const palette = [
    '#2563eb', '#16a34a', '#dc2626', '#ea580c',
    '#7c3aed', '#0891b2', '#db2777', '#a16207',
    '#0d9488', '#9333ea',
  ]

  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">
        Repère orthonormé — points labellés (cliquez pour zoomer si nécessaire).
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mx-auto block w-full bg-white"
        role="img"
      >
        {/* Background */}
        <rect width={w} height={h} fill="#fafafa" />

        {/* Grid */}
        {xs.map((x) => (
          <line
            key={`vx-${x}`}
            x1={sx(x)} y1={padY}
            x2={sx(x)} y2={h - padY}
            stroke={x === 0 ? '#94a3b8' : '#e5e7eb'}
            strokeWidth={x === 0 ? 1.4 : 0.7}
          />
        ))}
        {ys.map((y) => (
          <line
            key={`hy-${y}`}
            x1={padX} y1={sy(y)}
            x2={w - padX} y2={sy(y)}
            stroke={y === 0 ? '#94a3b8' : '#e5e7eb'}
            strokeWidth={y === 0 ? 1.4 : 0.7}
          />
        ))}

        {/* Axis tick labels (every 2 units to stay readable) */}
        {xs.filter((x) => x % 2 === 0).map((x) => (
          <text
            key={`xl-${x}`}
            x={sx(x)} y={sy(0) + 12}
            fontSize={10}
            textAnchor="middle"
            fill="#64748b"
          >
            {x}
          </text>
        ))}
        {ys.filter((y) => y % 2 === 0 && y !== 0).map((y) => (
          <text
            key={`yl-${y}`}
            x={sx(0) - 6} y={sy(y) + 3}
            fontSize={10}
            textAnchor="end"
            fill="#64748b"
          >
            {y}
          </text>
        ))}

        {/* Axis labels */}
        <text x={w - padX + 4} y={sy(0) + 4} fontSize={11} fill="#475569">x</text>
        <text x={sx(0) + 4} y={padY - 4} fontSize={11} fill="#475569">y</text>

        {/* Labelled points */}
        {VECTOR_POINTS.map((pt, i) => {
          const cx = sx(pt.x)
          const cy = sy(pt.y)
          const color = palette[i % palette.length]
          return (
            <g key={pt.name}>
              <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="white" strokeWidth={1.5} />
              <text
                x={cx + 7}
                y={cy - 7}
                fontSize={12}
                fontWeight={700}
                fill={color}
              >
                {pt.name}
              </text>
              <text
                x={cx + 7}
                y={cy + 6}
                fontSize={9.5}
                fill="#475569"
              >
                ({pt.x},{pt.y})
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

interface ResultsProps {
  trials: VectorsTrialResult[]
  onExit: () => void
}

function Results({ trials, onExit }: ResultsProps) {
  const scorable = trials.filter((t) => {
    const q = VECTORS_QUESTIONS[t.index]
    return q.correctAnswer !== null
  })
  const correct = scorable.filter((t) => t.correct).length
  const pct = scorable.length > 0 ? Math.round((correct / scorable.length) * 100) : 0

  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-6 text-2xl font-bold">Test terminé</h1>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-bold">
              {correct} / {scorable.length}
            </p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Pourcentage</p>
            <p className="text-2xl font-bold">{pct}%</p>
          </div>
        </div>
        <div className="mb-6 max-h-64 overflow-auto rounded-md border bg-slate-50 p-3 dark:bg-slate-900">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Détails :</p>
          {trials.map((t) => {
            const q = VECTORS_QUESTIONS[t.index]
            const isAutoEval = q.correctAnswer === null
            let correctText = ''
            if (!isAutoEval && q.correctAnswer !== null) {
              if (Array.isArray(q.correctAnswer)) {
                correctText = q.correctAnswer
                  .map((i) => String.fromCharCode(65 + i))
                  .join(', ')
              } else {
                correctText = String.fromCharCode(65 + q.correctAnswer)
              }
            }
            return (
              <div
                key={t.index}
                className="text-left text-xs border-b border-slate-200 dark:border-slate-700 py-2 last:border-b-0"
              >
                {isAutoEval ? (
                  <span className="text-slate-600 dark:text-slate-400">
                    {t.questionId}: Auto-évaluation
                  </span>
                ) : (
                  <span className={t.correct ? 'text-green-600' : 'text-red-600'}>
                    {t.questionId}: {t.correct ? '✓ Correct' : '✗ Incorrect'}
                    {correctText && ` (Correcte(s): ${correctText})`}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <Button onClick={onExit}>Retour au tableau de bord</Button>
      </Card>
    </main>
  )
}
