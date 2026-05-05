'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  PROC_SPEED_DISPLAY_MS,
  PROC_SPEED_GRID_COLS,
  PROC_SPEED_GRID_ROWS,
  PROC_SPEED_ISI_MS,
  buildProcSpeedTrials,
  saveProcSpeedResult,
  scoreProcSpeed,
  type ProcSpeedResult,
  type ProcSpeedTrial,
  type ProcSpeedTrialResult,
  type RectStim,
  PROCESSING_SPEED_TEST_ID,
  PROC_SPEED_TRIAL_COUNT,
} from '@/lib/attentional/processing-speed'
import { persistCompletedTestSessionBestEffort } from '@/lib/results/submit-completed-session-api'
import { TestIntroSection } from '@/components/assessment/test-intro-section'

type Phase = 'intro' | 'instructions' | 'fixation' | 'stimulus' | 'isi' | 'done'

// SVG layout
const CELL = 80     // px par cellule
const PAD = 16      // marge
const RECT_LONG = 60
const RECT_SHORT = 18

export function ProcessingSpeedTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [trials, setTrials] = useState<ProcSpeedTrial[]>([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState<ProcSpeedTrialResult[]>([])
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)
  const clickedRef = useRef<{ id: string; rt: number } | null>(null)
  const supabaseSynced = useRef(false)

  const begin = () => {
    supabaseSynced.current = false
    setTrials(buildProcSpeedTrials())
    setCurrent(0)
    setResponses([])
    setStartedAt(Date.now())
    setPhase('fixation')
  }

  const finishTrial = useCallback(() => {
    const trial = trials[current]
    if (!trial) return
    const click = clickedRef.current
    const clickedRect = click
      ? trial.rects.find((r) => r.id === click.id) ?? null
      : null
    const clickedTarget = !!(clickedRect && clickedRect.isTarget)

    let errorType: ProcSpeedTrialResult['errorType'] = 'none'
    let correct = false
    if (trial.hasTarget && clickedTarget) {
      correct = true
    } else if (!trial.hasTarget && !click) {
      correct = true
    } else if (!trial.hasTarget && click) {
      errorType = 'commission'
    } else if (trial.hasTarget && !click) {
      errorType = 'omission'
    } else {
      errorType = 'wrong-click'
    }

    const res: ProcSpeedTrialResult = {
      ...trial,
      clickedId: click?.id ?? null,
      clickedTarget,
      reactionTimeMs: click?.rt ?? null,
      correct,
      errorType,
    }
    setResponses((r) => [...r, res])
    clickedRef.current = null

    if (current + 1 >= trials.length) {
      setPhase('done')
    } else {
      setCurrent((n) => n + 1)
      setPhase('isi')
    }
  }, [current, trials])

  const onRectClick = (rect: RectStim) => {
    if (phase !== 'stimulus' || clickedRef.current) return
    clickedRef.current = { id: rect.id, rt: Date.now() - trialStart.current }
    finishTrial()
  }

  // fixation → stimulus
  useEffect(() => {
    if (phase !== 'fixation') return
    const t = setTimeout(() => setPhase('stimulus'), 500)
    return () => clearTimeout(t)
  }, [phase])

  // ISI → stimulus
  useEffect(() => {
    if (phase !== 'isi') return
    const t = setTimeout(() => setPhase('stimulus'), PROC_SPEED_ISI_MS)
    return () => clearTimeout(t)
  }, [phase])

  // Stimulus timeout
  useEffect(() => {
    if (phase !== 'stimulus') return
    trialStart.current = Date.now()
    const t = setTimeout(() => {
      if (!clickedRef.current) finishTrial()
    }, PROC_SPEED_DISPLAY_MS)
    return () => clearTimeout(t)
  }, [phase, finishTrial])

  // Save
  useEffect(() => {
    if (phase !== 'done' || responses.length === 0) return
    if (supabaseSynced.current) return
    supabaseSynced.current = true
    const stats = scoreProcSpeed(responses)
    const r: ProcSpeedResult = {
      id: `procspeed-${Date.now()}`,
      userName: user?.username,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      trials: responses,
      totalMs: Date.now() - startedAt,
      ...stats,
    }
    saveProcSpeedResult(r)
    persistCompletedTestSessionBestEffort({
      testId: PROCESSING_SPEED_TEST_ID,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      totalMs: r.totalMs,
      score: r.score,
      correctCount: r.correctCount,
      totalQuestions: PROC_SPEED_TRIAL_COUNT,
      trials: r.trials.map((t, i) => ({
        question_index: i,
        question_id: `ps-${t.index}`,
        selected: [t.hasTarget, t.clickedId ?? 'none', t.errorType],
        correct: t.correct,
        score: t.correct ? 1 : 0,
        reaction_time_ms: t.reactionTimeMs,
      })),
      metadata: {
        source: 'processing-speed',
        resultId: r.id,
        meanRT: r.meanRT,
        accuracy: r.accuracy,
      },
    })
  }, [phase, responses, startedAt, user])

  if (phase === 'intro')
    return <Intro onNext={() => setPhase('instructions')} onQuit={() => router.push('/dashboard')} />
  if (phase === 'instructions')
    return <Instructions onStart={begin} onBack={() => setPhase('intro')} />
  if (phase === 'done')
    return <Results responses={responses} onExit={() => router.push('/dashboard')} />

  return (
    <StimulusView
      phase={phase}
      trial={trials[current]}
      index={current}
      total={trials.length}
      onRectClick={onRectClick}
    />
  )
}

// ─── Intro ────────────────────────────────────────────────────────────────────
function Intro({ onNext, onQuit }: { onNext: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-amber-600">
          <Eye className="h-4 w-4" /> Fonctions exécutives · Vitesse de traitement
        </div>
        <h1 className="mb-3 text-3xl font-bold">Test de vitesse de traitement</h1>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Ce test mesure votre vitesse de traitement de l'information visuelle ainsi que
          votre capacité d'attention sélective.
        </p>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Une tâche de recherche visuelle (Chesham et al., 2019 ; Wickens, 2023)
          présente une cible parmi des distracteurs. Les éléments fondamentaux sont :
        </p>
        <ul className="mb-4 ml-6 list-disc space-y-1 text-sm text-muted-foreground">
          <li><strong>Cible</strong> : un stimulus à identifier ou localiser.</li>
          <li><strong>Distracteurs</strong> : éléments non-cibles qui augmentent la difficulté.</li>
          <li><strong>Champ de recherche</strong> : la zone visuelle à explorer.</li>
        </ul>

        <div className="mb-6">
          <TestIntroSection testId={PROCESSING_SPEED_TEST_ID} />
        </div>

        <Button className="mt-2" onClick={onNext}>
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

// ─── Instructions ────────────────────────────────────────────────────────────
function Instructions({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      <Card className="p-8">
        <h2 className="mb-3 text-2xl font-bold">Consignes</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Une série d'images va apparaître, une par une. Chaque image contient plusieurs
          rectangles de différentes couleurs (rouges, verts) et orientations (verticale,
          horizontale).
        </p>
        <div className="mb-4 flex items-center gap-4 rounded-md border bg-muted/30 p-4">
          <div className="flex flex-col items-center gap-1">
            <svg width="40" height="60">
              <rect x="11" y="0" width="18" height="60" fill="#dc2626" rx="2" />
            </svg>
            <span className="text-xs font-semibold text-rose-600">CIBLE</span>
          </div>
          <p className="text-sm">
            Cliquez <strong>uniquement</strong> sur le rectangle{' '}
            <span className="font-semibold text-rose-600">rouge et vertical</span>.
          </p>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Si la cible n'est pas présente sur l'écran, ne cliquez sur rien. Soyez le plus
          rapide et précis possible.
        </p>
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          50 essais · ~4 secondes par image · le test dure environ 4 minutes.
        </div>
        <Button onClick={onStart}>
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

// ─── Stimulus ────────────────────────────────────────────────────────────────
const COLOR_HEX: Record<string, string> = {
  red: '#dc2626',
  green: '#16a34a',
  blue: '#2563eb',
  yellow: '#eab308',
  orange: '#ea580c',
  purple: '#9333ea',
  cyan: '#0891b2',
}

function RectGlyph({
  rect,
  cx,
  cy,
  onClick,
}: {
  rect: RectStim
  cx: number
  cy: number
  onClick: () => void
}) {
  const w = rect.orient === 'vertical' ? RECT_SHORT : RECT_LONG
  const h = rect.orient === 'vertical' ? RECT_LONG : RECT_SHORT
  const fill = COLOR_HEX[rect.color] ?? '#16a34a'
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }
  const cls = 'cursor-pointer transition-opacity hover:opacity-80'

  // Distractors can take various shapes. Target is always 'rect'.
  if (rect.shape === 'rect') {
    return (
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        fill={fill}
        rx={2}
        className={cls}
        onClick={handleClick}
      />
    )
  }
  if (rect.shape === 'circle') {
    const r = Math.min(w, h) / 2
    return (
      <circle cx={cx} cy={cy} r={r} fill={fill} className={cls} onClick={handleClick} />
    )
  }
  if (rect.shape === 'diamond') {
    const dx = w / 2
    const dy = h / 2
    const points = `${cx},${cy - dy} ${cx + dx},${cy} ${cx},${cy + dy} ${cx - dx},${cy}`
    return <polygon points={points} fill={fill} className={cls} onClick={handleClick} />
  }
  // triangle (orientation flips it)
  const flip = rect.orient === 'horizontal'
  const points = flip
    ? `${cx - w / 2},${cy} ${cx + w / 2},${cy - h / 2} ${cx + w / 2},${cy + h / 2}`
    : `${cx},${cy - h / 2} ${cx + w / 2},${cy + h / 2} ${cx - w / 2},${cy + h / 2}`
  return <polygon points={points} fill={fill} className={cls} onClick={handleClick} />
}

function StimulusView({
  phase,
  trial,
  index,
  total,
  onRectClick,
}: {
  phase: Phase
  trial: ProcSpeedTrial | undefined
  index: number
  total: number
  onRectClick: (r: RectStim) => void
}) {
  const width = PROC_SPEED_GRID_COLS * CELL + PAD * 2
  const height = PROC_SPEED_GRID_ROWS * CELL + PAD * 2

  return (
    <main className="container mx-auto max-w-5xl py-8">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Essai {index + 1} / {total}
        </span>
        <span>
          Cliquez le rectangle <strong className="text-rose-600">rouge vertical</strong>
        </span>
      </div>
      <Progress value={(index / total) * 100} className="mb-6" />
      <Card className="flex items-center justify-center bg-slate-50 p-6">
        {phase === 'fixation' || phase === 'isi' ? (
          <div
            className="flex items-center justify-center"
            style={{ width, height }}
          >
            <span className="text-6xl text-slate-700">+</span>
          </div>
        ) : phase === 'stimulus' && trial ? (
          <svg width={width} height={height} className="select-none">
            {trial.rects.map((r) => {
              const cx = PAD + r.col * CELL + CELL / 2
              const cy = PAD + r.row * CELL + CELL / 2
              return (
                <RectGlyph
                  key={r.id}
                  rect={r}
                  cx={cx}
                  cy={cy}
                  onClick={() => onRectClick(r)}
                />
              )
            })}
          </svg>
        ) : null}
      </Card>
    </main>
  )
}

// ─── Results ─────────────────────────────────────────────────────────────────
function Results({
  responses,
  onExit,
}: {
  responses: ProcSpeedTrialResult[]
  onExit: () => void
}) {
  const stats = scoreProcSpeed(responses)
  const interpretation =
    stats.score >= 85
      ? 'Vitesse de traitement excellente'
      : stats.score >= 70
        ? 'Vitesse de traitement correcte'
        : stats.score >= 50
          ? 'Vitesse de traitement modérée'
          : 'Vitesse / précision à améliorer'

  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-1 text-2xl font-bold">Test terminé</h1>
        <p className="mb-6 text-sm text-muted-foreground">{interpretation}</p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <Stat label="Score global" value={`${stats.score} / 100`} />
          <Stat label="Précision" value={`${stats.accuracy}%`} />
          <Stat label="Hits (cible cliquée)" value={String(stats.hits)} />
          <Stat label="Commissions" value={String(stats.commissions)} />
          <Stat label="Omissions" value={String(stats.omissions)} />
          <Stat label="Mauvais clics" value={String(stats.wrongClicks)} />
          <Stat label="TR moyen" value={`${stats.meanRT} ms`} />
          <Stat label="Variabilité TR (σ)" value={`${stats.rtStdDev} ms`} />
        </div>
        <Button className="mt-6" onClick={onExit}>
          Retour au tableau de bord
        </Button>
      </Card>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}
