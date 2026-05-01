'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { TestIntroSection } from '@/components/assessment/test-intro-section'
import { INHIBITION_TEST_ID } from '@/lib/attentional/inhibition'
import {
  INHIBITION_FIXATION_MS,
  INHIBITION_ISI_MS,
  INHIBITION_NO_GO_LETTER,
  INHIBITION_STIMULUS_MS,
  buildInhibitionTrials,
  saveInhibitionResult,
  scoreInhibition,
  type InhibitionResult,
  type InhibitionTrial,
  type InhibitionTrialResult,
} from '@/lib/attentional/inhibition'

type Phase = 'intro' | 'instructions' | 'fixation' | 'stimulus' | 'isi' | 'done'

export function InhibitionTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [trials, setTrials] = useState<InhibitionTrial[]>([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState<InhibitionTrialResult[]>([])
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)
  const pressed = useRef(false)
  const reactionMs = useRef<number | null>(null)

  const begin = () => {
    setTrials(buildInhibitionTrials())
    setCurrent(0)
    setResponses([])
    setStartedAt(Date.now())
    setPhase('fixation')
  }

  const finishTrial = useCallback(() => {
    const trial = trials[current]
    if (!trial) return
    const correct = trial.isNoGo ? !pressed.current : pressed.current
    const res: InhibitionTrialResult = {
      ...trial,
      pressed: pressed.current,
      reactionTimeMs: reactionMs.current,
      correct,
    }
    setResponses((r) => [...r, res])
    pressed.current = false
    reactionMs.current = null
    if (current + 1 >= trials.length) {
      setPhase('done')
    } else {
      setCurrent((n) => n + 1)
      setPhase('isi')
    }
  }, [current, trials])

  // fixation → stimulus
  useEffect(() => {
    if (phase !== 'fixation') return
    const t = setTimeout(() => setPhase('stimulus'), INHIBITION_FIXATION_MS)
    return () => clearTimeout(t)
  }, [phase])

  // ISI → stimulus
  useEffect(() => {
    if (phase !== 'isi') return
    const t = setTimeout(() => setPhase('stimulus'), INHIBITION_ISI_MS)
    return () => clearTimeout(t)
  }, [phase])

  // stimulus lifecycle
  useEffect(() => {
    if (phase !== 'stimulus') return
    trialStart.current = Date.now()
    const t = setTimeout(finishTrial, INHIBITION_STIMULUS_MS)
    return () => clearTimeout(t)
  }, [phase, finishTrial])

  // keypress
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'stimulus' && !pressed.current) {
        e.preventDefault()
        pressed.current = true
        reactionMs.current = Date.now() - trialStart.current
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  // save on done
  useEffect(() => {
    if (phase !== 'done' || responses.length === 0) return
    const stats = scoreInhibition(responses)
    const r: InhibitionResult = {
      id: `inhibition-${Date.now()}`,
      userName: user?.username,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      trials: responses,
      totalMs: Date.now() - startedAt,
      ...stats,
    }
    saveInhibitionResult(r)
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
    />
  )
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function Intro({ onNext, onQuit }: { onNext: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-rose-600">
          <ShieldAlert className="h-4 w-4" /> Inhibition · CPT
        </div>
        <h1 className="mb-3 text-3xl font-bold">
          Test de Performance Continue (CPT) — Inhibition
        </h1>
        <p className="mb-4 text-sm leading-relaxed text-foreground">
          Vous allez voir une série de lettres apparaître à l&apos;écran, une à la fois.
          La règle est simple :
        </p>
        <ul className="mb-4 ml-6 list-disc space-y-1.5 text-sm text-foreground">
          <li>
            Appuyez sur <kbd className="rounded bg-muted px-1.5 py-0.5">Espace</kbd> dès
            qu&apos;une lettre apparaît — <strong>aussi vite que possible</strong>.
          </li>
          <li>
            <strong>Exception :</strong> ne réagissez <strong>pas</strong> quand la lettre
            cible apparaît.
          </li>
        </ul>
        <p className="mb-4 text-xs italic text-muted-foreground">
          Cette tâche mesure votre attention soutenue et votre capacité à inhiber une
          réponse automatique. Soyez rapide, mais précis.
        </p>

        <div className="mb-6">
          <TestIntroSection testId={INHIBITION_TEST_ID} />
        </div>

        <Button className="mt-2" onClick={onNext}>
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function Instructions({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      <Card className="p-8">
        <h2 className="mb-3 text-2xl font-bold">Consignes</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Une lettre s'affiche au centre de l'écran. Vous devez :
        </p>
        <ul className="mb-6 ml-6 list-disc space-y-1 text-sm text-muted-foreground">
          <li>
            Appuyer sur{' '}
            <kbd className="rounded bg-muted px-1.5 py-0.5">Espace</kbd> dès qu'une lettre
            apparaît…
          </li>
          <li>
            … <strong>sauf quand la lettre est « {INHIBITION_NO_GO_LETTER} »</strong> :
            vous ne devez appuyer sur aucune touche.
          </li>
        </ul>
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          20 essais · la lettre « {INHIBITION_NO_GO_LETTER} » apparaît 3 fois ·
          ~30 secondes au total.
        </div>
        <Button onClick={onStart}>
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function StimulusView({
  phase,
  trial,
  index,
  total,
}: {
  phase: Phase
  trial: InhibitionTrial | undefined
  index: number
  total: number
}) {
  return (
    <main className="container mx-auto max-w-4xl py-8">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Essai {index + 1} / {total}
        </span>
        <span>
          Espace pour toutes les lettres{' '}
          <strong>sauf « {INHIBITION_NO_GO_LETTER} »</strong>
        </span>
      </div>
      <Progress value={(index / total) * 100} className="mb-6" />
      <Card className="flex items-center justify-center p-16">
        <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-slate-900">
          {phase === 'fixation' || phase === 'isi' ? (
            <span className="text-6xl text-white">+</span>
          ) : phase === 'stimulus' && trial ? (
            <span className="text-8xl font-bold text-white">{trial.letter}</span>
          ) : null}
        </div>
      </Card>
    </main>
  )
}

function Results({
  responses,
  onExit,
}: {
  responses: InhibitionTrialResult[]
  onExit: () => void
}) {
  const stats = scoreInhibition(responses)
  const interpretation =
    stats.score >= 85
      ? 'Excellent contrôle inhibiteur'
      : stats.score >= 70
        ? 'Inhibition correcte — vigilance à maintenir'
        : stats.score >= 50
          ? 'Difficultés modérées d\'inhibition'
          : 'Difficultés marquées : inhibition / attention'

  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-1 text-2xl font-bold">Test terminé</h1>
        <p className="mb-6 text-sm text-muted-foreground">{interpretation}</p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <Stat label="Score global" value={`${stats.score} / 100`} />
          <Stat label="Précision" value={`${stats.accuracy}%`} />
          <Stat
            label={`Hits (lettres ≠ ${INHIBITION_NO_GO_LETTER})`}
            value={String(stats.hits)}
          />
          <Stat
            label="Erreurs de commission"
            value={`${stats.commissionErrors} (${stats.commissionRate}%)`}
          />
          <Stat label="Erreurs d'omission" value={String(stats.omissionErrors)} />
          <Stat label="TR moyen" value={`${stats.meanRT} ms`} />
          <Stat label="Variabilité TR (σ)" value={`${stats.rtStdDev} ms`} />
          <Stat label="Total essais" value={String(responses.length)} />
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
