'use client'

/**
 * Interactive trigonometric unit-circle quiz — STRICT validation.
 *
 * Rules enforced:
 *   • Each sub-question must be answered (click / MCQ) before advancing.
 *   • One attempt per sub-question, immediate feedback.
 *   • "Next" is disabled while any sub-question remains unanswered.
 *   • On incorrect answer, the correct position is revealed briefly.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertTriangle, RotateCcw,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Tex } from '@/components/trigonometry/tex'
import {
  TRIG_CIRCLE_QUESTIONS,
  TRIG_CIRCLE_TEST_ID,
  anglesMatch,
  valuesMatch,
  saveTrigCircleResult,
  AXIS_TICK_VALUES,
  type TrigMainQuestion,
  type TrigSubTask,
  type TrigSubAnswer,
  type TrigCircleResult,
} from '@/lib/geometry/trig-unit-circle'
import { persistCompletedTestSessionBestEffort } from '@/lib/results/submit-completed-session-api'

type Phase = 'intro' | 'running' | 'done'

const SIZE = 380
const R = SIZE * 0.4
const CX = SIZE / 2
const CY = SIZE / 2

// ─── Reference angles for display ───────────────────────────────────────────
const REF_ANGLES: { rad: number; latex: string }[] = [
  { rad: 0, latex: '0' },
  { rad: Math.PI / 6, latex: String.raw`\tfrac{\pi}{6}` },
  { rad: Math.PI / 4, latex: String.raw`\tfrac{\pi}{4}` },
  { rad: Math.PI / 3, latex: String.raw`\tfrac{\pi}{3}` },
  { rad: Math.PI / 2, latex: String.raw`\tfrac{\pi}{2}` },
  { rad: (2 * Math.PI) / 3, latex: String.raw`\tfrac{2\pi}{3}` },
  { rad: (3 * Math.PI) / 4, latex: String.raw`\tfrac{3\pi}{4}` },
  { rad: (5 * Math.PI) / 6, latex: String.raw`\tfrac{5\pi}{6}` },
  { rad: Math.PI, latex: String.raw`\pi` },
  { rad: (7 * Math.PI) / 6, latex: String.raw`\tfrac{7\pi}{6}` },
  { rad: (5 * Math.PI) / 4, latex: String.raw`\tfrac{5\pi}{4}` },
  { rad: (4 * Math.PI) / 3, latex: String.raw`\tfrac{4\pi}{3}` },
  { rad: (3 * Math.PI) / 2, latex: String.raw`\tfrac{3\pi}{2}` },
  { rad: (5 * Math.PI) / 3, latex: String.raw`\tfrac{5\pi}{3}` },
  { rad: (7 * Math.PI) / 4, latex: String.raw`\tfrac{7\pi}{4}` },
  { rad: (11 * Math.PI) / 6, latex: String.raw`\tfrac{11\pi}{6}` },
]

function angleToXY(a: number) {
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) }
}

// ═══════════════════════════════════════════════════════════════════════════
// Interactive Circle (SVG)
// ═══════════════════════════════════════════════════════════════════════════

interface PlacedPoint {
  subId: string
  label: string
  angle: number
  correct: boolean
}

interface InteractiveCircleProps {
  onClick?: (angle: number) => void        // undefined = locked
  placed: PlacedPoint[]
  /** Target point to reveal (only shown after wrong answer for short time). */
  reveal?: { subId: string; angle: number; label: string } | null
  /** Projection highlight for the last placed point. */
  projection?: { kind: 'cos' | 'sin'; angle: number } | null
  /** Mode for clickable axis ticks (Q2). */
  axisMode?: 'cos' | 'sin' | null
  /** Click handler for axis tick values. */
  onAxisClick?: (value: number) => void
  /** Highlight a clicked axis tick (post-validation). */
  axisHighlight?: { kind: 'cos' | 'sin'; value: number; correct: boolean } | null
  /** Reveal correct axis value after a wrong answer. */
  axisReveal?: { kind: 'cos' | 'sin'; value: number } | null
}

function InteractiveCircle({
  onClick, placed, reveal, projection,
  axisMode, onAxisClick, axisHighlight, axisReveal,
}: InteractiveCircleProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onClick || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (SIZE / rect.width) - CX
    const y = (e.clientY - rect.top) * (SIZE / rect.height) - CY
    // ignore clicks away from circle (> 30px band)
    const d = Math.sqrt(x * x + y * y)
    if (Math.abs(d - R) > 40) return
    const ang = Math.atan2(-y, x) // math-convention counter-clockwise
    onClick(ang)
  }

  const projXY = projection ? angleToXY(projection.angle) : null
  const cosLocked = !axisMode || axisMode !== 'cos' || !onAxisClick
  const sinLocked = !axisMode || axisMode !== 'sin' || !onAxisClick

  return (
    <svg
      ref={svgRef}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'crosshair' : 'default', touchAction: 'none' }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm"
    >
      {/* axes — emphasised when in axis mode */}
      <line
        x1={0} y1={CY} x2={SIZE} y2={CY}
        stroke={axisMode === 'cos' ? '#ef4444' : '#cbd5e1'}
        strokeWidth={axisMode === 'cos' ? 2 : 1}
      />
      <line
        x1={CX} y1={0} x2={CX} y2={SIZE}
        stroke={axisMode === 'sin' ? '#2563eb' : '#cbd5e1'}
        strokeWidth={axisMode === 'sin' ? 2 : 1}
      />
      {/* Axis labels */}
      <text x={SIZE - 22} y={CY - 8} fontSize="12" fontWeight="bold"
            fill={axisMode === 'cos' ? '#ef4444' : '#64748b'}>cos</text>
      <text x={CX + 8} y={14} fontSize="12" fontWeight="bold"
            fill={axisMode === 'sin' ? '#2563eb' : '#64748b'}>sin</text>

      {/* unit circle */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#6366f1" strokeWidth={1.5} />

      {/* ── Axis tick markers (Q2) ── horizontal = cos, vertical = sin ─── */}
      {AXIS_TICK_VALUES.map((t) => {
        const cosX = CX + R * t.value
        const sinY = CY - R * t.value
        const isCosTarget = axisMode === 'cos'
        const isSinTarget = axisMode === 'sin'
        return (
          <g key={`tick-${t.value}`}>
            {/* COS tick on horizontal axis */}
            <g
              onClick={(e) => {
                if (cosLocked) return
                e.stopPropagation()
                onAxisClick?.(t.value)
              }}
              style={{ cursor: cosLocked ? 'default' : 'pointer' }}
            >
              <circle
                cx={cosX} cy={CY}
                r={isCosTarget ? 7 : 3}
                fill={isCosTarget ? '#fff' : '#94a3b8'}
                stroke={isCosTarget ? '#ef4444' : 'transparent'}
                strokeWidth={1.5}
              />
              {isCosTarget && (
                <foreignObject x={cosX - 24} y={CY + 8} width={48} height={20}
                               style={{ overflow: 'visible' }}>
                  <div style={{ display: 'flex', justifyContent: 'center',
                                fontSize: 10, color: '#b91c1c', lineHeight: 1 }}>
                    <Tex>{t.latex}</Tex>
                  </div>
                </foreignObject>
              )}
            </g>
            {/* SIN tick on vertical axis (skip duplicate at 0) */}
            {t.value !== 0 && (
              <g
                onClick={(e) => {
                  if (sinLocked) return
                  e.stopPropagation()
                  onAxisClick?.(t.value)
                }}
                style={{ cursor: sinLocked ? 'default' : 'pointer' }}
              >
                <circle
                  cx={CX} cy={sinY}
                  r={isSinTarget ? 7 : 3}
                  fill={isSinTarget ? '#fff' : '#94a3b8'}
                  stroke={isSinTarget ? '#2563eb' : 'transparent'}
                  strokeWidth={1.5}
                />
                {isSinTarget && (
                  <foreignObject x={CX + 10} y={sinY - 10} width={48} height={20}
                                 style={{ overflow: 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start',
                                  fontSize: 10, color: '#1d4ed8', lineHeight: 1 }}>
                      <Tex>{t.latex}</Tex>
                    </div>
                  </foreignObject>
                )}
              </g>
            )}
          </g>
        )
      })}

      {/* Axis click highlight (after submit) */}
      {axisHighlight && (
        axisHighlight.kind === 'cos' ? (
          <circle
            cx={CX + R * axisHighlight.value} cy={CY} r={9}
            fill="none"
            stroke={axisHighlight.correct ? '#16a34a' : '#dc2626'}
            strokeWidth={2.5}
          />
        ) : (
          <circle
            cx={CX} cy={CY - R * axisHighlight.value} r={9}
            fill="none"
            stroke={axisHighlight.correct ? '#16a34a' : '#dc2626'}
            strokeWidth={2.5}
          />
        )
      )}
      {axisReveal && (
        axisReveal.kind === 'cos' ? (
          <circle
            cx={CX + R * axisReveal.value} cy={CY} r={11}
            fill="none" stroke="#16a34a" strokeWidth={2}
            strokeDasharray="4 3"
          />
        ) : (
          <circle
            cx={CX} cy={CY - R * axisReveal.value} r={11}
            fill="none" stroke="#16a34a" strokeWidth={2}
            strokeDasharray="4 3"
          />
        )
      )}

      {/* reference ticks */}
      {REF_ANGLES.map((a, i) => {
        const p = angleToXY(a.rad)
        const lp = { x: CX + (R + 16) * Math.cos(a.rad), y: CY - (R + 16) * Math.sin(a.rad) }
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={2.5} fill="#94a3b8" />
            <foreignObject x={lp.x - 22} y={lp.y - 11} width={44} height={22}
                           style={{ overflow: 'visible' }}>
              <div style={{ display: 'flex', justifyContent: 'center',
                            fontSize: 11, color: '#475569', lineHeight: 1 }}>
                <Tex>{a.latex}</Tex>
              </div>
            </foreignObject>
          </g>
        )
      })}

      {/* projection highlight (after a correct answer) */}
      {projection && projXY && (
        <>
          {projection.kind === 'cos' ? (
            <>
              <line x1={projXY.x} y1={projXY.y} x2={projXY.x} y2={CY}
                    stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" />
              <line x1={CX} y1={CY} x2={projXY.x} y2={CY}
                    stroke="#ef4444" strokeWidth={3} />
              <circle cx={projXY.x} cy={CY} r={4} fill="#ef4444" />
            </>
          ) : (
            <>
              <line x1={projXY.x} y1={projXY.y} x2={CX} y2={projXY.y}
                    stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 3" />
              <line x1={CX} y1={CY} x2={CX} y2={projXY.y}
                    stroke="#2563eb" strokeWidth={3} />
              <circle cx={CX} cy={projXY.y} r={4} fill="#2563eb" />
            </>
          )}
        </>
      )}

      {/* student-placed points */}
      {placed.map((pp) => {
        const p = angleToXY(pp.angle)
        const color = pp.correct ? '#16a34a' : '#dc2626'
        return (
          <g key={pp.subId}>
            <line x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={color} strokeWidth={1} opacity={0.5} />
            <circle cx={p.x} cy={p.y} r={7} fill={color} stroke="white" strokeWidth={2} />
            <text x={p.x + 10} y={p.y - 8} fontSize="13" fontWeight="bold" fill="#1e293b">
              {pp.label}
            </text>
          </g>
        )
      })}

      {/* correct-answer reveal (on wrong answer) */}
      {reveal && (() => {
        const p = angleToXY(reveal.angle)
        return (
          <g>
            <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#16a34a"
                    strokeWidth={2.5} strokeDasharray="4 3" />
            <text x={p.x + 12} y={p.y - 10} fontSize="12" fill="#16a34a">
              {reveal.label} (correct)
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main quiz
// ═══════════════════════════════════════════════════════════════════════════

export function TrigCircleQuiz() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [qIdx, setQIdx] = useState(0)
  /** answers keyed by subId */
  const [answers, setAnswers] = useState<Record<string, TrigSubAnswer>>({})
  /** current active sub-question index within the main question */
  const [subIdx, setSubIdx] = useState(0)
  const [warning, setWarning] = useState<string | null>(null)
  const [reveal, setReveal] = useState<
    { subId: string; angle: number; label: string } | null
  >(null)
  const [startedAt, setStartedAt] = useState<number>(0)
  const subStart = useRef<number>(0)

  const question: TrigMainQuestion = TRIG_CIRCLE_QUESTIONS[qIdx]
  const subs = question.subs
  const currentSub: TrigSubTask = subs[subIdx]
  const currentAnswer = answers[currentSub?.id]
  const allSubsAnswered = subs.every((s) => answers[s.id] !== undefined)

  // Clear the reveal when we move to another sub.
  useEffect(() => {
    setReveal(null)
    setWarning(null)
    subStart.current = Date.now()
  }, [qIdx, subIdx])

  // ── Validation ───────────────────────────────────────────────────────────
  const submitCircleAnswer = useCallback(
    (clickedAngle: number) => {
      if (currentAnswer) return // single attempt already used
      const target = currentSub.targetAngle ?? 0
      const correct = anglesMatch(clickedAngle, target)
      const ans: TrigSubAnswer = {
        subId: currentSub.id,
        clickedAngle,
        correct,
        reactionTimeMs: Date.now() - subStart.current,
      }
      setAnswers((m) => ({ ...m, [currentSub.id]: ans }))
      if (!correct) {
        setReveal({
          subId: currentSub.id,
          angle: target,
          label: currentSub.label,
        })
      }
    },
    [currentAnswer, currentSub],
  )

  const submitAxisAnswer = useCallback(
    (value: number) => {
      if (currentAnswer) return
      const angle = currentSub.targetAngle ?? 0
      const target =
        currentSub.kind === 'project-cos' ? Math.cos(angle) : Math.sin(angle)
      const correct = valuesMatch(value, target)
      const ans: TrigSubAnswer = {
        subId: currentSub.id,
        clickedValue: value,
        correct,
        reactionTimeMs: Date.now() - subStart.current,
      }
      setAnswers((m) => ({ ...m, [currentSub.id]: ans }))
    },
    [currentAnswer, currentSub],
  )

  const submitMCQ = useCallback(
    (choiceId: string) => {
      if (currentAnswer) return
      const choice = currentSub.choices?.find((c) => c.id === choiceId)
      const correct = choice?.correct === true
      const ans: TrigSubAnswer = {
        subId: currentSub.id,
        choiceId,
        correct,
        reactionTimeMs: Date.now() - subStart.current,
      }
      setAnswers((m) => ({ ...m, [currentSub.id]: ans }))
    },
    [currentAnswer, currentSub],
  )

  // ── Navigation ───────────────────────────────────────────────────────────
  const nextSub = () => {
    if (!currentAnswer) {
      setWarning('Réponse obligatoire')
      return
    }
    if (subIdx + 1 < subs.length) {
      setSubIdx((i) => i + 1)
    }
  }

  const nextQuestion = () => {
    if (!allSubsAnswered) {
      setWarning('Veuillez répondre avant de continuer')
      return
    }
    if (qIdx + 1 < TRIG_CIRCLE_QUESTIONS.length) {
      setQIdx((i) => i + 1)
      setSubIdx(0)
    } else {
      setPhase('done')
    }
  }

  // ── Save result when finished ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'done') return
    const all = Object.values(answers)
    const correct = all.filter((a) => a.correct).length
    const total = TRIG_CIRCLE_QUESTIONS.reduce((n, q) => n + q.subs.length, 0)
    const r: TrigCircleResult = {
      id: `trig-${Date.now()}`,
      userName: user?.username,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      answers: all,
      totalMs: Date.now() - startedAt,
      correctCount: correct,
      score: total > 0 ? Math.round((correct / total) * 100) : 0,
    }
    saveTrigCircleResult(r)
    const totalSubs = TRIG_CIRCLE_QUESTIONS.reduce((n, q) => n + q.subs.length, 0)
    persistCompletedTestSessionBestEffort({
      testId: TRIG_CIRCLE_TEST_ID,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      totalMs: r.totalMs,
      score: r.score,
      correctCount: r.correctCount,
      totalQuestions: totalSubs,
      trials: r.answers.map((a, i) => ({
        question_index: i,
        question_id: a.subId,
        selected: [a.choiceId ?? a.clickedAngle ?? a.clickedValue].filter((x): x is string | number => x != null),
        correct: a.correct,
        score: a.correct ? 1 : 0,
        reaction_time_ms: a.reactionTimeMs,
      })),
      metadata: { source: 'trig-circle-quiz' },
    })
  }, [phase, answers, startedAt, user])

  // ── Placed points collected from answers of current question ─────────────
  // Only `place` (Q1) kind contributes points on the circle; project-* now
  // operate on the cos/sin axis ticks.
  const placed: PlacedPoint[] = useMemo(() => {
    return subs
      .filter((s) => s.kind === 'place')
      .map((s) => {
        const a = answers[s.id]
        if (!a || a.clickedAngle == null) return null
        return {
          subId: s.id,
          label: s.label,
          angle: a.clickedAngle,
          correct: a.correct,
        }
      })
      .filter((x): x is PlacedPoint => x !== null)
  }, [answers, subs])

  // Projection shown after a correct answer for Q2 sub-question
  const projection = useMemo(() => {
    if (!currentAnswer?.correct) return null
    if (currentSub.kind === 'project-cos') {
      return { kind: 'cos' as const, angle: currentSub.targetAngle! }
    }
    if (currentSub.kind === 'project-sin') {
      return { kind: 'sin' as const, angle: currentSub.targetAngle! }
    }
    return null
  }, [currentAnswer, currentSub])

  // Axis mode (Q2 — clickable cos/sin ticks)
  const axisMode: 'cos' | 'sin' | null =
    currentSub?.kind === 'project-cos'
      ? 'cos'
      : currentSub?.kind === 'project-sin'
        ? 'sin'
        : null

  const axisHighlight = useMemo(() => {
    if (!currentAnswer || currentAnswer.clickedValue == null || !axisMode) return null
    return {
      kind: axisMode,
      value: currentAnswer.clickedValue,
      correct: currentAnswer.correct,
    }
  }, [currentAnswer, axisMode])

  const axisReveal = useMemo(() => {
    if (!currentAnswer || currentAnswer.correct || !axisMode) return null
    const angle = currentSub.targetAngle ?? 0
    const target = axisMode === 'cos' ? Math.cos(angle) : Math.sin(angle)
    return { kind: axisMode, value: target }
  }, [currentAnswer, axisMode, currentSub])

  // ── Intro / Done screens ─────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <IntroScreen
        onStart={() => {
          setStartedAt(Date.now())
          subStart.current = Date.now()
          setPhase('running')
        }}
        onQuit={() => router.push('/dashboard')}
      />
    )
  }

  if (phase === 'done') {
    return <ResultsScreen
      answers={Object.values(answers)}
      onExit={() => router.push('/dashboard')}
    />
  }

  // ── Running view ─────────────────────────────────────────────────────────
  const globalSubCount = TRIG_CIRCLE_QUESTIONS.reduce((n, q) => n + q.subs.length, 0)
  const answeredCount = Object.keys(answers).length

  return (
    <main className="container mx-auto max-w-5xl py-6 px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {question.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cercle trigonométrique — {question.competency}
          </p>
        </div>
        <Badge variant="outline" className="text-indigo-700 border-indigo-300 bg-indigo-50">
          {answeredCount} / {globalSubCount}
        </Badge>
      </div>
      <Progress value={(answeredCount / globalSubCount) * 100} className="mb-5" />

      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            <Tex>{question.stemTex}</Tex>
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">{question.stemTex}</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
            {/* Circle (hidden for MCQ-only questions) */}
            {currentSub.kind !== 'mcq' || qIdx < 2 ? (
              <div className="flex justify-center">
                <InteractiveCircle
                  onClick={
                    currentSub.kind === 'place' && !currentAnswer
                      ? submitCircleAnswer
                      : undefined
                  }
                  placed={placed}
                  reveal={reveal}
                  projection={projection}
                  axisMode={axisMode}
                  onAxisClick={
                    axisMode && !currentAnswer ? submitAxisAnswer : undefined
                  }
                  axisHighlight={axisHighlight}
                  axisReveal={axisReveal}
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <InteractiveCircle
                  placed={[]}
                  reveal={null}
                  projection={null}
                />
              </div>
            )}

            {/* Sub-question list + current prompt */}
            <div className="space-y-4">
              {/* Sub-question tabs / chips */}
              <div className="flex flex-wrap gap-2">
                {subs.map((s, i) => {
                  const ans = answers[s.id]
                  const isCurrent = i === subIdx
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSubIdx(i)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors',
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : ans
                            ? ans.correct
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400',
                      )}
                    >
                      {s.label}
                      {ans && (
                        <span className="ml-1">
                          {ans.correct ? '✓' : '✗'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Current sub prompt */}
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
                <p className="text-xs font-semibold text-indigo-700 mb-2">
                  Sous-question {subIdx + 1} / {subs.length}
                </p>
                <div className="text-lg font-semibold text-slate-900">
                  <Tex>{currentSub.labelTex}</Tex>
                </div>
                {currentSub.kind === 'place' && (
                  <p className="text-xs text-slate-600 mt-2">
                    Cliquez à la position correspondante sur le cercle.
                  </p>
                )}
                {currentSub.kind === 'project-cos' && (
                  <p className="text-xs text-slate-600 mt-2">
                    Cliquez sur la graduation correcte de l&apos;axe{' '}
                    <strong className="text-rose-600">cos</strong> (horizontal).
                  </p>
                )}
                {currentSub.kind === 'project-sin' && (
                  <p className="text-xs text-slate-600 mt-2">
                    Cliquez sur la graduation correcte de l&apos;axe{' '}
                    <strong className="text-blue-600">sin</strong> (vertical).
                  </p>
                )}
              </div>

              {/* MCQ choices */}
              {currentSub.kind === 'mcq' && currentSub.choices && (
                <div className="space-y-2">
                  {currentSub.choices.map((c) => {
                    const picked = currentAnswer?.choiceId === c.id
                    const showCorrect = Boolean(currentAnswer) && c.correct
                    return (
                      <button
                        key={c.id}
                        disabled={Boolean(currentAnswer)}
                        onClick={() => submitMCQ(c.id)}
                        className={cn(
                          'w-full rounded-lg border-2 p-3 text-left transition-all',
                          showCorrect
                            ? 'border-green-500 bg-green-50'
                            : picked && !currentAnswer?.correct
                              ? 'border-red-500 bg-red-50'
                              : 'border-slate-200 bg-white hover:border-indigo-400',
                          currentAnswer && 'cursor-default',
                        )}
                      >
                        <span className="font-semibold mr-2">
                          {c.id.toUpperCase()}.
                        </span>
                        <Tex>{c.tex}</Tex>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Feedback */}
              {currentAnswer && (
                <div
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-3 text-sm',
                    currentAnswer.correct
                      ? 'border-green-300 bg-green-50 text-green-900'
                      : 'border-red-300 bg-red-50 text-red-900',
                  )}
                >
                  {currentAnswer.correct ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4" />
                  )}
                  <div>
                    {currentAnswer.correct
                      ? 'Correct !'
                      : 'Incorrect. La bonne position est affichée en vert.'}
                  </div>
                </div>
              )}

              {/* Warning */}
              {warning && !currentAnswer && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle className="h-4 w-4" />
                  {warning}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubIdx((i) => Math.max(0, i - 1))}
                  disabled={subIdx === 0}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Préc.
                </Button>

                {subIdx + 1 < subs.length ? (
                  <Button
                    onClick={nextSub}
                    disabled={!currentAnswer}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Sous-question suivante <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!allSubsAnswered}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {qIdx + 1 < TRIG_CIRCLE_QUESTIONS.length
                      ? 'Question suivante'
                      : 'Terminer'}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

// ─── Intro screen ───────────────────────────────────────────────────────────

function IntroScreen({ onStart, onQuit }: { onStart: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10 px-4">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8 border-l-4 border-l-indigo-500">
        <h1 className="mb-3 text-3xl font-bold">Cercle trigonométrique interactif</h1>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Apprentissage interactif du cercle trigonométrique à travers trois
          questions successives. Chaque sous-question est obligatoire : le
          passage à la suivante est bloqué tant que vous n&apos;avez pas répondu.
          Une seule tentative par sous-question, avec feedback immédiat.
        </p>
        <ul className="mb-6 space-y-1.5 text-sm text-slate-700">
          <li>• <strong>Q1 (C1)</strong> — placer 2 points (M, N) sur le cercle.</li>
          <li>• <strong>Q2 (C1)</strong> — cliquer la graduation correcte sur l&apos;axe <span className="text-rose-600 font-semibold">cos</span> (horizontal) ou <span className="text-blue-600 font-semibold">sin</span> (vertical).</li>
          <li>• <strong>Q3 (C2)</strong> — calculer 4 valeurs exactes (QCM).</li>
        </ul>
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          ⚠️ Règle stricte : aucune question ne peut être sautée. Répondez avec
          attention — une seule chance par item.
        </div>
        <Button onClick={onStart} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

// ─── Results screen ─────────────────────────────────────────────────────────

function ResultsScreen({
  answers, onExit,
}: {
  answers: TrigSubAnswer[]
  onExit: () => void
}) {
  const correct = answers.filter((a) => a.correct).length
  const total = TRIG_CIRCLE_QUESTIONS.reduce((n, q) => n + q.subs.length, 0)
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <main className="container mx-auto max-w-2xl py-10 px-4">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-6 text-2xl font-bold">Évaluation terminée</h1>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-bold">{correct} / {total}</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Pourcentage</p>
            <p className="text-2xl font-bold">{pct}%</p>
          </div>
        </div>

        <div className="mb-6 max-h-72 overflow-auto rounded-md border bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground text-left">
            Détail par sous-question :
          </p>
          {TRIG_CIRCLE_QUESTIONS.map((q) => (
            <div key={q.id} className="mb-2 text-left">
              <p className="text-xs font-bold text-slate-800">
                {q.title} ({q.competency})
              </p>
              {q.subs.map((s) => {
                const a = answers.find((x) => x.subId === s.id)
                return (
                  <div key={s.id} className="ml-2 text-xs py-0.5">
                    <span className="font-semibold">{s.label}:</span>{' '}
                    {a ? (
                      <span className={a.correct ? 'text-green-600' : 'text-red-600'}>
                        {a.correct ? '✓ correct' : '✗ incorrect'}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 h-4 w-4" /> Recommencer
          </Button>
          <Button onClick={onExit}>
            Retour au tableau de bord
          </Button>
        </div>
      </Card>
    </main>
  )
}
