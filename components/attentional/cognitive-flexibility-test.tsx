'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Brain, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  NBACK_DISPLAY_MS,
  NBACK_FIXATION_MS,
  NBACK_ISI_MS,
  NBACK_LEVEL,
  buildNBackTrials,
  saveNBackResult,
  scoreNBack,
  type NBackResponse,
  type NBackResult,
  type NBackTrial,
  type NBackTrialResult,
  COGNITIVE_FLEXIBILITY_TEST_ID,
} from '@/lib/attentional/cognitive-flexibility'
import { persistCompletedTestSessionBestEffort } from '@/lib/results/submit-completed-session-api'
import { TestIntroSection } from '@/components/assessment/test-intro-section'

type Phase = 'intro' | 'instructions' | 'fixation' | 'stimulus' | 'isi' | 'done'

export function CognitiveFlexibilityTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [trials] = useState<NBackTrial[]>(() => buildNBackTrials())
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState<NBackTrialResult[]>([])
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)
  const responseRef = useRef<{ key: NBackResponse; rt: number } | null>(null)
  const supabaseSynced = useRef(false)

  const begin = () => {
    supabaseSynced.current = false
    setCurrent(0)
    setResponses([])
    setStartedAt(Date.now())
    setPhase('fixation')
  }

  const finishTrial = useCallback(() => {
    const trial = trials[current]
    if (!trial) return
    const resp = responseRef.current
    let correct: boolean | null = null
    if (trial.expected !== null) {
      correct = resp ? resp.key === trial.expected : false
    }
    const res: NBackTrialResult = {
      ...trial,
      response: resp?.key ?? null,
      reactionTimeMs: resp?.rt ?? null,
      correct,
    }
    setResponses((r) => [...r, res])
    responseRef.current = null

    if (current + 1 >= trials.length) {
      setPhase('done')
    } else {
      setCurrent((n) => n + 1)
      setPhase('isi')
    }
  }, [current, trials])

  const respond = (key: NBackResponse) => {
    if (phase !== 'stimulus' || responseRef.current) return
    responseRef.current = { key, rt: Date.now() - trialStart.current }
    finishTrial()
  }

  // fixation → stimulus (only at the very start)
  useEffect(() => {
    if (phase !== 'fixation') return
    const t = setTimeout(() => setPhase('stimulus'), NBACK_FIXATION_MS)
    return () => clearTimeout(t)
  }, [phase])

  // ISI → stimulus
  useEffect(() => {
    if (phase !== 'isi') return
    const t = setTimeout(() => setPhase('stimulus'), NBACK_ISI_MS)
    return () => clearTimeout(t)
  }, [phase])

  // stimulus lifecycle
  useEffect(() => {
    if (phase !== 'stimulus') return
    trialStart.current = Date.now()
    const t = setTimeout(() => {
      if (!responseRef.current) finishTrial()
    }, NBACK_DISPLAY_MS)
    return () => clearTimeout(t)
  }, [phase, finishTrial])

  // keyboard shortcuts (A / B)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'stimulus') return
      if (e.key === 'a' || e.key === 'A') respond('A')
      if (e.key === 'b' || e.key === 'B') respond('B')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // save on done
  useEffect(() => {
    if (phase !== 'done' || responses.length === 0) return
    if (supabaseSynced.current) return
    supabaseSynced.current = true
    const stats = scoreNBack(responses)
    const r: NBackResult = {
      id: `nback-${Date.now()}`,
      userName: user?.username,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      trials: responses,
      totalMs: Date.now() - startedAt,
      ...stats,
    }
    saveNBackResult(r)
    persistCompletedTestSessionBestEffort({
      testId: COGNITIVE_FLEXIBILITY_TEST_ID,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      totalMs: r.totalMs,
      score: r.accuracy,
      correctCount: r.correctCount,
      totalQuestions: r.evaluatedCount || trials.length,
      trials: r.trials.map((t, i) => ({
        question_index: i,
        question_id: `nback-${t.index}`,
        selected: [t.letter, t.expected ?? 'na', t.response ?? 'none'],
        correct: t.correct === true,
        score: t.correct === true ? 1 : 0,
        reaction_time_ms: t.reactionTimeMs,
      })),
      metadata: {
        source: 'cognitive-flexibility-nback',
        resultId: r.id,
        level: r.level,
        evaluatedCount: r.evaluatedCount,
      },
    })
  }, [phase, responses, startedAt, user, trials.length])

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
      onRespond={respond}
    />
  )
}

// ─── Intro ───────────────────────────────────────────────────────────────────
function Intro({ onNext, onQuit }: { onNext: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-violet-600">
          <Brain className="h-4 w-4" /> Fonctions exécutives · Flexibilité cognitive
        </div>
        <h1 className="mb-3 text-3xl font-bold">Tâche {NBACK_LEVEL}-Back</h1>
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          The N-Back Task is a cognitive paradigm used to assess working memory and the
          continuous updating of information. Participants must monitor a stream of
          stimuli and decide whether the current stimulus matches one presented a
          specified number of steps earlier.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cette version mesure la flexibilité cognitive et la mise à jour de la mémoire
          de travail à un niveau N = {NBACK_LEVEL}.
        </p>

        <div className="mt-6">
          <TestIntroSection testId={COGNITIVE_FLEXIBILITY_TEST_ID} />
        </div>

        <Button className="mt-6" onClick={onNext}>
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
        <p className="mb-4 text-sm text-muted-foreground">
          Une série de lettres va apparaître, une lettre par écran. Pour chaque lettre :
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            Appuyez sur <kbd className="rounded bg-muted px-1.5 py-0.5">A</kbd> si la
            lettre est <strong>identique</strong> à celle d'il y a 2 étapes.
          </li>
          <li>
            Appuyez sur <kbd className="rounded bg-muted px-1.5 py-0.5">B</kbd> dans tous
            les autres cas.
          </li>
          <li>
            Pas de réponse en {NBACK_DISPLAY_MS / 1000} s = compté comme erreur.
          </li>
        </ul>
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          22 essais (20 évalués) · {NBACK_DISPLAY_MS / 1000} s par lettre.
          Soyez rapide et précis.
        </div>
        <Button onClick={onStart}>
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

// ─── Stimulus ────────────────────────────────────────────────────────────────
function StimulusView({
  phase,
  trial,
  index,
  total,
  onRespond,
}: {
  phase: Phase
  trial: NBackTrial | undefined
  index: number
  total: number
  onRespond: (k: NBackResponse) => void
}) {
  return (
    <main className="container mx-auto max-w-3xl py-8">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {index + 1} / {total}
        </span>
        <span>
          <kbd className="rounded bg-muted px-1.5">A</kbd> = identique à n−2 ·{' '}
          <kbd className="rounded bg-muted px-1.5">B</kbd> = différente
        </span>
      </div>
      <Progress value={((index + (phase === 'stimulus' ? 1 : 0)) / total) * 100} className="mb-6" />
      <Card className="flex items-center justify-center p-16">
        <div className="flex h-56 w-56 items-center justify-center rounded-full bg-slate-900">
          {phase === 'fixation' || phase === 'isi' ? (
            <span className="text-6xl text-white">+</span>
          ) : phase === 'stimulus' && trial ? (
            <span className="text-9xl font-bold text-white">{trial.letter}</span>
          ) : null}
        </div>
      </Card>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Button
          size="lg"
          variant="outline"
          className="h-20 text-2xl font-bold"
          onClick={() => onRespond('A')}
          disabled={phase !== 'stimulus'}
        >
          A — identique
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-20 text-2xl font-bold"
          onClick={() => onRespond('B')}
          disabled={phase !== 'stimulus'}
        >
          B — différente
        </Button>
      </div>
    </main>
  )
}

// ─── Results ─────────────────────────────────────────────────────────────────
function Results({
  responses,
  onExit,
}: {
  responses: NBackTrialResult[]
  onExit: () => void
}) {
  const stats = scoreNBack(responses)

  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-1 text-2xl font-bold">Test terminé</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Niveau de performance :{' '}
          <span
            className={
              stats.level === 'Good'
                ? 'font-semibold text-emerald-600'
                : stats.level === 'Moyen'
                  ? 'font-semibold text-amber-600'
                  : 'font-semibold text-rose-600'
            }
          >
            {stats.level}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <Stat label="Précision" value={`${stats.accuracy}%`} />
          <Stat label="TR moyen" value={`${stats.meanRT} ms`} />
          <Stat
            label="Bonnes réponses"
            value={`${stats.correctCount} / ${stats.evaluatedCount}`}
          />
          <Stat label="Erreurs" value={String(stats.incorrectCount)} />
          <Stat label="Omissions (timeout)" value={String(stats.missedCount)} />
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
