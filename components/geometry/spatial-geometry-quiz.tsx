'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import KaTeX from 'katex'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, BarChart3 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  SPATIAL_GEOMETRY_QUESTIONS,
  SPATIAL_GEOMETRY_TEST_ID,
  SpatialGeometryResult,
  SpatialGeometryTrialResult,
  saveSpatialGeometryResult,
} from '@/lib/geometry/spatial-geometry'

type Phase = 'intro' | 'instructions' | 'running' | 'done'

export function SpatialGeometryQuiz() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [trials, setTrials] = useState<SpatialGeometryTrialResult[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)

  const submit = useCallback(() => {
    if (selected === null) return

    const question = SPATIAL_GEOMETRY_QUESTIONS[current]
    const correct = selected === question.correctAnswer
    const trial: SpatialGeometryTrialResult = {
      index: current,
      questionId: question.id,
      selected,
      correct,
      reactionTimeMs: Date.now() - trialStart.current,
    }
    setTrials((t) => [...t, trial])
    setSelected(null)

    if (current + 1 >= SPATIAL_GEOMETRY_QUESTIONS.length) {
      setPhase('done')
    } else {
      setCurrent((n) => n + 1)
      setTimeout(() => {
        trialStart.current = Date.now()
      }, 100)
    }
  }, [current, selected])

  useEffect(() => {
    if (phase === 'done' && trials.length > 0) {
      const correct = trials.filter((t) => t.correct).length
      const r: SpatialGeometryResult = {
        id: `sg-${Date.now()}`,
        userName: user?.username,
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        trials,
        totalMs: Date.now() - startedAt,
        correctCount: correct,
        score: Math.round((correct / SPATIAL_GEOMETRY_QUESTIONS.length) * 100),
      }
      saveSpatialGeometryResult(r)
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
        }}
        onBack={() => setPhase('intro')}
      />
    )
  }

  if (phase === 'done') {
    return <Results trials={trials} onExit={() => router.push('/dashboard')} />
  }

  const question = SPATIAL_GEOMETRY_QUESTIONS[current]

  return (
    <TrialView
      index={current}
      total={SPATIAL_GEOMETRY_QUESTIONS.length}
      question={question}
      selected={selected}
      onSelectOption={setSelected}
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
          <BarChart3 className="h-4 w-4" /> Géométrie spatiale
        </div>
        <h1 className="mb-3 text-3xl font-bold">Géométrie dans l'espace</h1>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Ce test évalue votre compréhension des concepts fondamentaux de la géométrie tridimensionnelle.
          Vous verrez 21 questions portant sur les plans, les droites, les relations spatiales,
          les intersections, l'orthogonalité et les sections géométriques.
        </p>
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <strong>Durée estimée :</strong> ~15 minutes. Répondez avec soin à chaque question.
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
            <strong>1.</strong> Lisez attentivement chaque question. Certaines incluent des illustrations
            pour vous aider.
          </li>
          <li>
            <strong>2.</strong> Sélectionnez la réponse que vous jugez correcte parmi les quatre options
            (A, B, C, ou D).
          </li>
          <li>
            <strong>3.</strong> Cliquez « Valider » pour passer à la question suivante.
          </li>
          <li>
            <strong>4.</strong> Vous recevez 1 point pour chaque réponse correcte.
          </li>
          <li>
            <strong>5.</strong> À la fin, vous verrez votre score total et les détails de vos réponses.
          </li>
        </ol>
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30">
          💡 Les questions couvrent des concepts de géométrie spatiale. Prenez le temps de bien
          comprendre chaque question avant de répondre.
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
  question: {
    id: string
    question: string
    options: string[]
    requiresImage: boolean
    imagePath?: string
    imageOptions?: string[]
  }
  selected: number | null
  onSelectOption: (index: number) => void
  onSubmit: () => void
}

function TrialView({
  index,
  total,
  question,
  selected,
  onSelectOption,
  onSubmit,
}: TrialViewProps) {
  const questionRef = useRef<HTMLDivElement>(null)

  // Render LaTeX in question text
  useEffect(() => {
    if (questionRef.current) {
      const content = questionRef.current.innerHTML
      try {
        // Replace LaTeX patterns with rendered content
        const rendered = content.replace(
          /\\\((.*?)\\\)/g,
          (match, latex) => {
            try {
              return `<span class="inline-math">${KaTeX.renderToString(latex, {
                throwOnError: false,
              })}</span>`
            } catch {
              return match
            }
          }
        )
        questionRef.current.innerHTML = rendered
      } catch (e) {
        console.error('KaTeX rendering error:', e)
      }
    }
  }, [question.question])

  // Render LaTeX in options
  const optionsRef = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    optionsRef.current.forEach((el) => {
      if (el) {
        const content = el.innerHTML
        try {
          const rendered = content.replace(
            /\\\((.*?)\\\)/g,
            (match, latex) => {
              try {
                return `<span class="inline-math">${KaTeX.renderToString(latex, {
                  throwOnError: false,
                })}</span>`
              } catch {
                return match
              }
            }
          )
          el.innerHTML = rendered
        } catch (e) {
          console.error('KaTeX rendering error in options:', e)
        }
      }
    })
  }, [question.options])

  return (
    <main className="container mx-auto max-w-2xl py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Question {index + 1} / {total}
        </h2>
        <span className="text-sm text-muted-foreground">{question.id}</span>
      </div>
      <Progress value={((index + 1) / total) * 100} className="mb-6" />

      <Card className="space-y-6 p-6">
        {/* Question text with LaTeX */}
        <div
          ref={questionRef}
          className="text-base leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: question.question,
          }}
        />

        {/* Image placeholder if needed */}
        {question.requiresImage && (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:bg-gray-900">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Illustration géométrique</p>
              {question.imagePath && (
                <p className="mt-1 text-xs text-gray-400">{question.imagePath}</p>
              )}
            </div>
          </div>
        )}

        {/* Answer options */}
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const answerLabel = String.fromCharCode(65 + idx) // A, B, C, D
            const isSelected = selected === idx
            const hasImageForThisOption = question.imageOptions && idx < question.imageOptions.length

            return (
              <button
                key={idx}
                onClick={() => onSelectOption(idx)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <span className="text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex-1">
                    {hasImageForThisOption ? (
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-2">
                          {answerLabel}.
                        </div>
                        <div className="rounded-lg border border-gray-300 overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={question.imageOptions![idx]}
                            alt={`Option ${answerLabel}`}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = `<div class="flex items-center justify-center p-6"><BarChart3 className="h-8 w-8 text-gray-400" /></div>`
                              }
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="font-semibold text-gray-900 dark:text-white"
                        ref={(el) => {
                          if (el) optionsRef.current[idx] = el
                        }}
                        dangerouslySetInnerHTML={{
                          __html: `${answerLabel}. ${option}`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Submit button */}
        <Button
          onClick={onSubmit}
          disabled={selected === null}
          className="w-full"
          size="lg"
        >
          Valider <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

interface ResultsProps {
  trials: SpatialGeometryTrialResult[]
  onExit: () => void
}

function Results({ trials, onExit }: ResultsProps) {
  const correct = trials.filter((t) => t.correct).length
  const percentage = Math.round((correct / trials.length) * 100)

  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-6 text-2xl font-bold">Test terminé</h1>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-bold">
              {correct} / {trials.length}
            </p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Pourcentage</p>
            <p className="text-2xl font-bold">{percentage}%</p>
          </div>
        </div>
        <div className="mb-6 max-h-64 overflow-auto rounded-md border bg-slate-50 p-3 dark:bg-slate-900">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Détails :</p>
          {trials.map((t) => (
            <div key={t.index} className="text-left text-xs">
              <span className={t.correct ? 'text-green-600' : 'text-red-600'}>
                {t.questionId}: {t.correct ? '✓ Correct' : '✗ Incorrect'} (Sélection: {String.fromCharCode(65 + t.selected)})
              </span>
            </div>
          ))}
        </div>
        <Button onClick={onExit}>Retour au tableau de bord</Button>
      </Card>
    </main>
  )
}
