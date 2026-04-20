'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, Palette } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  SA_COLOR_HEX,
  SA_COLOR_TO_KEY,
  SA_KEY_TO_COLOR,
  SATrial,
  SATrialResult,
  SAResult,
  buildSATrials,
  saveSAResult,
} from '@/lib/attentional/selective-attention'

type Phase = 'intro' | 'instructions' | 'running' | 'done'

export function SelectiveAttentionTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [trials, setTrials] = useState<SATrial[]>([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState<SATrialResult[]>([])
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)

  const begin = () => {
    setTrials(buildSATrials())
    setCurrent(0)
    setResponses([])
    setStartedAt(Date.now())
    setPhase('running')
  }

  useEffect(() => {
    if (phase !== 'running') return
    trialStart.current = Date.now()
  }, [phase, current])

  const respond = useCallback(
    (key: string) => {
      const t = trials[current]
      if (!t) return
      const col = SA_KEY_TO_COLOR[key.toLowerCase()]
      if (!col) return
      const result: SATrialResult = {
        ...t,
        keyPressed: key.toUpperCase(),
        reactionTimeMs: Date.now() - trialStart.current,
        correct: col === t.wordMeaning,
      }
      setResponses((r) => [...r, result])
      if (current + 1 >= trials.length) setPhase('done')
      else setCurrent((n) => n + 1)
    },
    [current, trials],
  )

  useEffect(() => {
    if (phase !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (['d', 'f', 'j', 'l'].includes(k)) {
        e.preventDefault()
        respond(k)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, respond])

  useEffect(() => {
    if (phase !== 'done' || responses.length === 0) return
    const correctCount = responses.filter((r) => r.correct).length
    const r: SAResult = {
      id: `sa-${Date.now()}`,
      userName: user?.username,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      trials: responses,
      totalMs: Date.now() - startedAt,
      correctCount,
      score: Math.round((correctCount / responses.length) * 100),
    }
    saveSAResult(r)
  }, [phase, responses, startedAt, user])

  if (phase === 'intro') return <Intro onNext={() => setPhase('instructions')} onQuit={() => router.push('/dashboard')} />
  if (phase === 'instructions') return <Instructions onStart={begin} onBack={() => setPhase('intro')} />
  if (phase === 'done') return <Results responses={responses} onExit={() => router.push('/dashboard')} />

  return (
    <TrialView
      trial={trials[current]}
      index={current}
      total={trials.length}
      onClickKey={respond}
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
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-amber-600">
          <Palette className="h-4 w-4" /> Attention sélective
        </div>
        <h1 className="mb-3 text-3xl font-bold">Tâche de Stroop (SCWT)</h1>
        <p className="mb-3 text-sm text-muted-foreground">
          <strong>Durée estimée :</strong> ~5 minutes · Scicovery GmbH
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Le Test de Couleur et de Mot de Stroop évalue l’attention sélective et l’interférence
          cognitive. Vous devez répondre à une dimension de stimulus tout en supprimant une
          réponse automatique mais conflictuelle.
        </p>
        <p className="text-xs italic text-muted-foreground">
          Références : Stroop (1935) · Elcin, Velasquez &amp; Colombo (2024)
        </p>
        <Button className="mt-6" onClick={onNext}>
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
          Un mot désignant une couleur s’affiche à l’écran, écrit avec des lettres d’une couleur
          potentiellement différente. Vous devez répondre au{' '}
          <strong>sens du mot</strong>, pas à la couleur des lettres.
        </p>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KeyCard letter="D" color="green" label="Green" />
          <KeyCard letter="F" color="yellow" label="Yellow" />
          <KeyCard letter="J" color="red" label="Red" />
          <KeyCard letter="L" color="blue" label="Blue" />
        </div>
        <p className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          Exemple : le mot « RED » affiché en bleu → vous devez appuyer sur{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5">J</kbd> (rouge = sens du mot).
        </p>
        <Button onClick={onStart}>
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function KeyCard({
  letter,
  color,
  label,
}: {
  letter: string
  color: 'red' | 'yellow' | 'green' | 'blue'
  label: string
}) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <kbd className="inline-block rounded bg-muted px-3 py-2 font-mono text-lg font-bold">
        {letter}
      </kbd>
      <p className="mt-2 text-sm font-semibold" style={{ color: SA_COLOR_HEX[color] }}>
        {label}
      </p>
    </div>
  )
}

function TrialView({
  trial,
  index,
  total,
  onClickKey,
}: {
  trial: SATrial
  index: number
  total: number
  onClickKey: (k: string) => void
}) {
  if (!trial) return null
  return (
    <main className="container mx-auto max-w-4xl py-8">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Écran {index + 1} / {total}
        </span>
        <span>Répondez au sens du mot</span>
      </div>
      <Progress value={(index / total) * 100} className="mb-6" />

      <Card className="p-12">
        <div className="mb-12 text-center">
          <span
            className="text-7xl font-black tracking-widest"
            style={{ color: SA_COLOR_HEX[trial.inkColor] }}
          >
            {trial.wordMeaning.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(['D', 'F', 'J', 'L'] as const).map((k) => {
            const col = SA_KEY_TO_COLOR[k.toLowerCase()]
            return (
              <button
                key={k}
                onClick={() => onClickKey(k)}
                className="rounded-lg border p-4 transition hover:bg-muted"
              >
                <kbd className="block rounded bg-muted px-2 py-2 text-center font-mono text-2xl font-bold">
                  {k}
                </kbd>
                <p className="mt-2 text-center text-sm font-semibold" style={{ color: SA_COLOR_HEX[col] }}>
                  {col.toUpperCase()}
                </p>
              </button>
            )
          })}
        </div>
      </Card>
    </main>
  )
}

function Results({ responses, onExit }: { responses: SATrialResult[]; onExit: () => void }) {
  const correct = responses.filter((r) => r.correct).length
  const rts = responses.filter((r) => r.reactionTimeMs != null).map((r) => r.reactionTimeMs!)
  const meanRT = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0
  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-2 text-2xl font-bold">Test terminé</h1>
        <div className="my-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-xl font-bold">
              {correct} / {responses.length}
            </p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Pourcentage</p>
            <p className="text-xl font-bold">{Math.round((correct / responses.length) * 100)}%</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3 col-span-2">
            <p className="text-xs text-muted-foreground">Temps de réaction moyen</p>
            <p className="text-xl font-bold">{meanRT} ms</p>
          </div>
        </div>
        <Button onClick={onExit}>Retour au tableau de bord</Button>
      </Card>
    </main>
  )
}
