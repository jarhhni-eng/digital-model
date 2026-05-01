'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, Shuffle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  ShATrial,
  ShATrialResult,
  ShAResult,
  SHA_CUE_MS,
  SHA_FIXATION_MS,
  SHA_ITI_MS,
  SHA_MAX_RESPONSE_MS,
  SHA_TEST_COUNT,
  SHA_TRAINING_COUNT,
  buildShATrials,
  correctSide,
  saveShAResult,
  SHIFTING_ATTENTION_TEST_ID,
} from '@/lib/attentional/shifting-attention'
import { TestIntroSection } from '@/components/assessment/test-intro-section'

type Phase = 'intro' | 'instructions' | 'training' | 'training-done' | 'test' | 'done'
type SubPhase = 'fixation' | 'cue' | 'stimulus' | 'iti'

export function ShiftingAttentionTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [trials, setTrials] = useState<ShATrial[]>([])
  const [current, setCurrent] = useState(0)
  const [sub, setSub] = useState<SubPhase>('fixation')
  const [responses, setResponses] = useState<ShATrialResult[]>([])
  const trialStart = useRef(0)
  const pressed = useRef<'left' | 'right' | null>(null)
  const [feedback, setFeedback] = useState<'ok' | 'ko' | null>(null)
  const [startedAt, setStartedAt] = useState<number>(0)

  const begin = (p: 'training' | 'test') => {
    setTrials(buildShATrials(p === 'training' ? SHA_TRAINING_COUNT : SHA_TEST_COUNT))
    setCurrent(0)
    setResponses([])
    setSub('fixation')
    setStartedAt(Date.now())
    setPhase(p)
  }

  const finish = useCallback(() => {
    const trial = trials[current]
    if (!trial) return
    const correct = pressed.current !== null && pressed.current === correctSide(trial)
    const res: ShATrialResult = {
      ...trial,
      response: pressed.current,
      reactionTimeMs: pressed.current ? Date.now() - trialStart.current : null,
      correct,
    }
    setResponses((r) => [...r, res])
    if (phase === 'training') setFeedback(correct ? 'ok' : 'ko')
    pressed.current = null
    if (current + 1 >= trials.length) {
      if (phase === 'training') setPhase('training-done')
      else setPhase('done')
    } else {
      setCurrent((n) => n + 1)
      setSub('iti')
    }
  }, [current, phase, trials])

  // subphase timers
  useEffect(() => {
    if (phase !== 'training' && phase !== 'test') return
    let timer: ReturnType<typeof setTimeout>
    if (sub === 'fixation') {
      timer = setTimeout(() => setSub('cue'), SHA_FIXATION_MS)
    } else if (sub === 'cue') {
      timer = setTimeout(() => setSub('stimulus'), SHA_CUE_MS)
    } else if (sub === 'stimulus') {
      trialStart.current = Date.now()
      timer = setTimeout(finish, SHA_MAX_RESPONSE_MS)
    } else if (sub === 'iti') {
      setFeedback(null)
      timer = setTimeout(() => setSub('fixation'), SHA_ITI_MS)
    }
    return () => clearTimeout(timer)
  }, [sub, phase, finish])

  // shared response handler — used by both keyboard and on-screen F / J buttons
  const respond = useCallback(
    (side: 'left' | 'right') => {
      if (sub !== 'stimulus') return
      if (pressed.current) return
      pressed.current = side
      finish()
    },
    [sub, finish],
  )

  // key input during stimulus
  useEffect(() => {
    if (sub !== 'stimulus') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'f') respond('left')
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'j') respond('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sub, respond])

  // save result
  useEffect(() => {
    if (phase !== 'done' || responses.length === 0) return
    const rts = responses.filter((r) => r.response && r.reactionTimeMs != null).map((r) => r.reactionTimeMs!)
    const meanRT = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0
    const swRTs = responses.filter((r) => r.isSwitch && r.response).map((r) => r.reactionTimeMs!)
    const repRTs = responses.filter((r) => !r.isSwitch && r.response).map((r) => r.reactionTimeMs!)
    const swMean = swRTs.length ? swRTs.reduce((a, b) => a + b, 0) / swRTs.length : 0
    const repMean = repRTs.length ? repRTs.reduce((a, b) => a + b, 0) / repRTs.length : 0
    const correct = responses.filter((r) => r.correct).length
    const r: ShAResult = {
      id: `sha-${Date.now()}`,
      userName: user?.username,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      trials: responses,
      totalMs: Date.now() - startedAt,
      correctCount: correct,
      meanRT,
      switchCost: Math.round(swMean - repMean),
      score: Math.round((correct / responses.length) * 100),
    }
    saveShAResult(r)
  }, [phase, responses, startedAt, user])

  if (phase === 'intro') return <Intro onNext={() => setPhase('instructions')} onQuit={() => router.push('/dashboard')} />
  if (phase === 'instructions') return <Instructions onTrain={() => begin('training')} onBack={() => setPhase('intro')} />
  if (phase === 'training-done') return <TrainingDone onTest={() => begin('test')} />
  if (phase === 'done') return <Results responses={responses} onExit={() => router.push('/dashboard')} />

  const trial = trials[current]
  if (!trial) return null
  const isTraining = phase === 'training'
  return (
    <TrialScreen
      trial={trial}
      sub={sub}
      index={current}
      total={trials.length}
      feedback={isTraining ? feedback : null}
      onRespond={respond}
    />
  )
}

function Intro({ onNext, onQuit }: { onNext: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-cyan-600">
          <Shuffle className="h-4 w-4" /> Flexibilité attentionnelle
        </div>
        <h1 className="mb-3 text-3xl font-bold">Shifting Attention Task</h1>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Ce test évalue votre capacité à maintenir votre attention sur une tâche et à la
          déplacer vers une autre tâche lorsque c’est nécessaire. Le paradigme de commutation de
          tâches mesure la flexibilité cognitive et le contrôle exécutif.
        </p>

        <div className="mb-6">
          <TestIntroSection testId={SHIFTING_ATTENTION_TEST_ID} />
        </div>

        <Button onClick={onNext}>
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function Instructions({ onTrain, onBack }: { onTrain: () => void; onBack: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      <Card className="p-8">
        <h2 className="mb-3 text-2xl font-bold">Consignes</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Un indice s’affiche en haut de l’écran avant chaque chiffre. Répondez selon l’indice :
        </p>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
            <p className="mb-1 font-semibold text-blue-700 dark:text-blue-400">PARITÉ</p>
            <p className="text-xs text-muted-foreground">
              Le chiffre est-il pair ou impair ?
            </p>
            <p className="mt-2 text-xs">
              <kbd className="rounded bg-muted px-1.5 py-0.5">←</kbd> ou{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">F</kbd> = pair ·{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">→</kbd> ou{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">J</kbd> = impair
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
            <p className="mb-1 font-semibold text-red-700 dark:text-red-400">MAGNITUDE</p>
            <p className="text-xs text-muted-foreground">
              Le chiffre est-il inférieur ou supérieur à 5 ?
            </p>
            <p className="mt-2 text-xs">
              <kbd className="rounded bg-muted px-1.5 py-0.5">←</kbd> ou{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">F</kbd> = &lt; 5 ·{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">→</kbd> ou{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">J</kbd> = &gt; 5
            </p>
          </div>
        </div>
        <p className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          Répondez aussi vite et précisément que possible. La tâche peut changer d’un essai à
          l’autre.
        </p>
        <Button onClick={onTrain}>
          Commencer l’entraînement ({SHA_TRAINING_COUNT} essais) <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function TrainingDone({ onTest }: { onTest: () => void }) {
  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <h2 className="mb-2 text-2xl font-bold">Entraînement terminé</h2>
        <p className="mb-6 text-muted-foreground">
          Vous allez maintenant commencer le test ({SHA_TEST_COUNT} essais sans feedback).
        </p>
        <Button onClick={onTest}>Commencer le test</Button>
      </Card>
    </main>
  )
}

function TrialScreen({
  trial,
  sub,
  index,
  total,
  feedback,
  onRespond,
}: {
  trial: ShATrial
  sub: SubPhase
  index: number
  total: number
  feedback: 'ok' | 'ko' | null
  onRespond?: (side: 'left' | 'right') => void
}) {
  const cue = trial.task === 'parity' ? 'PARITÉ (pair/impair)' : 'MAGNITUDE (< 5 / > 5)'
  const cueColor = trial.task === 'parity' ? '#2563eb' : '#dc2626'
  const buttonsActive = sub === 'stimulus' && !!onRespond
  return (
    <main className="container mx-auto max-w-4xl py-8">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Essai {index + 1} / {total}
        </span>
        <span>← / F = gauche · → / J = droite</span>
      </div>
      <Progress value={(index / total) * 100} className="mb-4" />
      <Card className="flex h-96 items-center justify-center p-8">
        {(sub === 'cue' || sub === 'stimulus') && (
          <div className="text-center">
            <div
              className="mb-8 text-xl font-bold tracking-wide"
              style={{ color: cueColor }}
            >
              {cue}
            </div>
            {sub === 'stimulus' ? (
              <div className="text-8xl font-black">{trial.digit}</div>
            ) : (
              <div className="h-24" />
            )}
          </div>
        )}
        {sub === 'fixation' && <div className="text-6xl">+</div>}
        {sub === 'iti' && feedback && (
          <div className={feedback === 'ok' ? 'text-emerald-600' : 'text-red-600'}>
            <span className="text-2xl font-bold">{feedback === 'ok' ? '✓ Correct' : '✗ Incorrect'}</span>
          </div>
        )}
      </Card>

      {/* On-screen F / J response buttons (also keyboard-accessible) */}
      <div className="mt-6 grid grid-cols-2 gap-4 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => onRespond?.('left')}
          disabled={!buttonsActive}
          className={[
            'flex items-center justify-center gap-3 rounded-2xl border-2 px-6 py-5 text-lg font-bold transition-all',
            buttonsActive
              ? 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-500 hover:bg-blue-100 cursor-pointer'
              : 'border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50',
          ].join(' ')}
          aria-label="Réponse gauche (F)"
        >
          <kbd className="rounded bg-white/80 border border-current px-2 py-0.5 text-base">F</kbd>
          <span>← Gauche</span>
        </button>
        <button
          type="button"
          onClick={() => onRespond?.('right')}
          disabled={!buttonsActive}
          className={[
            'flex items-center justify-center gap-3 rounded-2xl border-2 px-6 py-5 text-lg font-bold transition-all',
            buttonsActive
              ? 'border-red-300 bg-red-50 text-red-700 hover:border-red-500 hover:bg-red-100 cursor-pointer'
              : 'border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50',
          ].join(' ')}
          aria-label="Réponse droite (J)"
        >
          <span>Droite →</span>
          <kbd className="rounded bg-white/80 border border-current px-2 py-0.5 text-base">J</kbd>
        </button>
      </div>
    </main>
  )
}

function Results({ responses, onExit }: { responses: ShATrialResult[]; onExit: () => void }) {
  const correct = responses.filter((r) => r.correct).length
  const rts = responses.filter((r) => r.response && r.reactionTimeMs != null).map((r) => r.reactionTimeMs!)
  const meanRT = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0
  const swRTs = responses.filter((r) => r.isSwitch && r.response).map((r) => r.reactionTimeMs!)
  const repRTs = responses.filter((r) => !r.isSwitch && r.response).map((r) => r.reactionTimeMs!)
  const swMean = swRTs.length ? Math.round(swRTs.reduce((a, b) => a + b, 0) / swRTs.length) : 0
  const repMean = repRTs.length ? Math.round(repRTs.reduce((a, b) => a + b, 0) / repRTs.length) : 0
  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-6 text-2xl font-bold">Test terminé</h1>
        <div className="grid grid-cols-2 gap-3 text-left">
          <Stat label="Score" value={`${correct} / ${responses.length}`} />
          <Stat label="Pourcentage" value={`${Math.round((correct / responses.length) * 100)}%`} />
          <Stat label="RT moyen" value={`${meanRT} ms`} />
          <Stat label="Switch cost (switch − repeat)" value={`${swMean - repMean} ms`} />
          <Stat label="RT switch" value={`${swMean} ms`} />
          <Stat label="RT repeat" value={`${repMean} ms`} />
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
