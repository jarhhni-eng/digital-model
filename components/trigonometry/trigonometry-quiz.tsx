'use client'

/**
 * Trigonometry quiz — Q1, Q2, Q3.
 *
 * Core didactic requirement: every screen shows a unit circle. Even Q3,
 * a pure computation, keeps the circle visible as cognitive support.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ArrowLeft, RotateCcw, CheckCircle2 } from 'lucide-react'
import { Tex } from './tex'
import { UnitCircle, normalizeAngle } from './unit-circle'
import {
  trigQuestions,
  TRIG_LESSON_TITLE,
  PLACE_POINT_TOLERANCE,
  scoreTrig,
  type TrigAnswer,
  type TrigQuestion,
} from '@/lib/trigonometry-lesson'

// ─── Reference angles the student may select for Q1 ─────────────────────────
const SNAP_OPTIONS: { rad: number; latex: string }[] = [
  { rad: 0,                  latex: String.raw`0` },
  { rad: Math.PI / 6,        latex: String.raw`\dfrac{\pi}{6}` },
  { rad: Math.PI / 4,        latex: String.raw`\dfrac{\pi}{4}` },
  { rad: Math.PI / 3,        latex: String.raw`\dfrac{\pi}{3}` },
  { rad: Math.PI / 2,        latex: String.raw`\dfrac{\pi}{2}` },
  { rad: 2 * Math.PI / 3,    latex: String.raw`\dfrac{2\pi}{3}` },
  { rad: 3 * Math.PI / 4,    latex: String.raw`\dfrac{3\pi}{4}` },
  { rad: 5 * Math.PI / 6,    latex: String.raw`\dfrac{5\pi}{6}` },
  { rad: Math.PI,            latex: String.raw`\pi` },
  { rad: 7 * Math.PI / 6,    latex: String.raw`\dfrac{7\pi}{6}` },
  { rad: 5 * Math.PI / 4,    latex: String.raw`\dfrac{5\pi}{4}` },
  { rad: 4 * Math.PI / 3,    latex: String.raw`\dfrac{4\pi}{3}` },
  { rad: 3 * Math.PI / 2,    latex: String.raw`\dfrac{3\pi}{2}` },
  { rad: 5 * Math.PI / 3,    latex: String.raw`\dfrac{5\pi}{3}` },
  { rad: 7 * Math.PI / 4,    latex: String.raw`\dfrac{7\pi}{4}` },
  { rad: 11 * Math.PI / 6,   latex: String.raw`\dfrac{11\pi}{6}` },
]

// ─── Split a mixed "latex + $...$ + latex" stem for rendering ───────────────
function TexStem({ src }: { src: string }) {
  const parts = src.split(/(\$[^$]*\$)/g)
  return (
    <p className="text-[15px] leading-relaxed text-slate-800">
      {parts.map((p, i) =>
        p.startsWith('$') && p.endsWith('$')
          ? <Tex key={i}>{p.slice(1, -1)}</Tex>
          : <span key={i}>{p}</span>
      )}
    </p>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Question panels
// ═══════════════════════════════════════════════════════════════════════════

function Q1Panel({
  q, answer, onAnswer,
}: {
  q: TrigQuestion
  answer: TrigAnswer | undefined
  onAnswer: (a: TrigAnswer) => void
}) {
  const [theta, setTheta] = useState<number>(answer?.angle ?? 0)
  const handleChange = (t: number) => {
    setTheta(t)
    onAnswer({ questionId: q.id, angle: t })
  }
  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
      <UnitCircle
        theta={theta}
        onChange={handleChange}
        interactive
        showAngleTicks
        showReadout
        size={360}
      />
      <div>
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          Ou choisissez un angle de référence
        </p>
        <div className="grid grid-cols-4 gap-2">
          {SNAP_OPTIONS.map((o, i) => {
            const active = Math.abs(normalizeAngle(theta) - o.rad) < 1e-3
            return (
              <button
                key={i}
                onClick={() => handleChange(o.rad)}
                className={cn(
                  'px-2 py-2 rounded-lg border text-sm transition-colors',
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white border-slate-200 hover:border-indigo-400'
                )}
              >
                <Tex>{o.latex}</Tex>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Astuce — vous pouvez aussi faire glisser le point <strong>M</strong> directement sur le cercle.
        </p>
      </div>
    </div>
  )
}

function Q2Panel({
  q, answer, onAnswer,
}: {
  q: TrigQuestion
  answer: TrigAnswer | undefined
  onAnswer: (a: TrigAnswer) => void
}) {
  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
      <UnitCircle
        theta={q.target ?? 0}
        interactive={false}
        showCosProjection={q.project === 'cos'}
        showSinProjection={q.project === 'sin'}
        showReadout
        size={360}
      />
      <div className="space-y-2">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          Projection géométrique
        </p>
        <p className="text-sm text-slate-600 mb-3">
          La projection du point <Tex>M</Tex> sur l&apos;axe des abscisses donne{' '}
          <Tex>{String.raw`\cos\theta`}</Tex>.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {q.choices!.map((c) => {
            const selected = answer?.choiceId === c.id
            return (
              <button
                key={c.id}
                onClick={() => onAnswer({ questionId: q.id, choiceId: c.id })}
                className={cn(
                  'px-4 py-3 rounded-lg border text-base transition-colors text-left',
                  selected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white border-slate-200 hover:border-indigo-400'
                )}
              >
                <span className="text-xs opacity-70 mr-2">{c.id.toUpperCase()}.</span>
                <Tex>{c.tex}</Tex>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Q3Panel({
  q, answer, onAnswer,
}: {
  q: TrigQuestion
  answer: TrigAnswer | undefined
  onAnswer: (a: TrigAnswer) => void
}) {
  // User may pilot the circle to visualize each term.
  const [theta, setTheta] = useState<number>(Math.PI / 3)
  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
      <UnitCircle
        theta={theta}
        onChange={setTheta}
        interactive
        showCosProjection
        showSinProjection
        showReadout
        size={360}
      />
      <div className="space-y-3">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          Support cognitif
        </p>
        <p className="text-sm text-slate-600">
          Visualisez <Tex>{String.raw`\cos(\pi/3)`}</Tex> puis{' '}
          <Tex>{String.raw`\sin(\pi/6)`}</Tex> en plaçant le point <Tex>M</Tex> sur les angles
          correspondants, puis additionnez les deux projections.
        </p>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setTheta(Math.PI / 3)}
            className="px-2 py-1.5 rounded border bg-white hover:border-indigo-400"
          >
            Voir <Tex>{String.raw`\pi/3`}</Tex>
          </button>
          <button
            onClick={() => setTheta(Math.PI / 6)}
            className="px-2 py-1.5 rounded border bg-white hover:border-indigo-400"
          >
            Voir <Tex>{String.raw`\pi/6`}</Tex>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {q.choices!.map((c) => {
            const selected = answer?.choiceId === c.id
            return (
              <button
                key={c.id}
                onClick={() => onAnswer({ questionId: q.id, choiceId: c.id })}
                className={cn(
                  'px-4 py-3 rounded-lg border text-base transition-colors text-left',
                  selected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white border-slate-200 hover:border-indigo-400'
                )}
              >
                <span className="text-xs opacity-70 mr-2">{c.id.toUpperCase()}.</span>
                <Tex>{c.tex}</Tex>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main quiz component
// ═══════════════════════════════════════════════════════════════════════════

export function TrigonometryQuizTest() {
  const router = useRouter()
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, TrigAnswer>>({})
  const [submitted, setSubmitted] = useState(false)

  const q = trigQuestions[idx]
  const isLast = idx === trigQuestions.length - 1
  const answer = answers[q.id]
  const canAdvance = q.kind === 'place-point' ? answer?.angle != null : !!answer?.choiceId

  const setAnswer = (a: TrigAnswer) => setAnswers((s) => ({ ...s, [a.questionId]: a }))

  if (submitted) {
    const score = scoreTrig(answers)
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-2xl">Évaluation terminée</CardTitle>
              <p className="text-slate-500">{TRIG_LESSON_TITLE}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-indigo-600 tabular-nums">
                  {score.global.percent}%
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {score.global.correct} / {score.global.total} correctes
                </p>
              </div>
              <div className="space-y-3">
                {score.perCompetency.map((c) => (
                  <div key={c.competency}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        <Badge variant="outline" className="mr-2">{c.competency}</Badge>
                        {c.label}
                      </span>
                      <span className="font-bold tabular-nums">{c.correct}/{c.total}</span>
                    </div>
                    <Progress value={c.percent} className="h-2" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setAnswers({}); setSubmitted(false); setIdx(0) }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Recommencer
                </Button>
                <Button className="flex-1" onClick={() => router.push('/tests')}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-600 truncate">{TRIG_LESSON_TITLE}</p>
            <p className="text-xs text-slate-500">Question {idx + 1} / {trigQuestions.length}</p>
          </div>
          <div className="flex-1 max-w-xs">
            <Progress value={((idx + 1) / trigQuestions.length) * 100} className="h-2" />
          </div>
          <Badge variant="outline">{q.competency}</Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question {idx + 1}</CardTitle>
            <div className="pt-1">
              <TexStem src={q.stemTex} />
            </div>
          </CardHeader>
          <CardContent>
            {q.kind === 'place-point' && <Q1Panel q={q} answer={answer} onAnswer={setAnswer} />}
            {q.kind === 'read-projection' && <Q2Panel q={q} answer={answer} onAnswer={setAnswer} />}
            {q.kind === 'computation' && <Q3Panel q={q} answer={answer} onAnswer={setAnswer} />}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
          </Button>
          {isLast ? (
            <Button disabled={!canAdvance} onClick={() => setSubmitted(true)}>
              Terminer <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button disabled={!canAdvance} onClick={() => setIdx((i) => i + 1)}>
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-slate-400 mt-6">
          Le cercle trigonométrique reste présent sur chaque écran : les angles sont des positions,
          et <Tex>{String.raw`\cos\theta,\; \sin\theta`}</Tex> sont des projections géométriques.
        </p>
      </div>
    </div>
  )
}
