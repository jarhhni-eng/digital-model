'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, Headphones, Volume2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  DIGIT_SPAN_SEQUENCES,
  DigitSpanResult,
  DigitSpanTrialResult,
  compareDigits,
  parseDigitAnswer,
  saveDigitSpanResult,
  speakDigits,
  DIGIT_SPAN_TEST_ID,
} from '@/lib/memory/digit-span'
import { TestIntroSection } from '@/components/assessment/test-intro-section'

type Phase = 'intro' | 'instructions' | 'running' | 'done'

export function DigitSpanTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [trials, setTrials] = useState<DigitSpanTrialResult[]>([])
  const [answer, setAnswer] = useState('')
  const [playing, setPlaying] = useState(false)
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)

  const playSequence = useCallback(async () => {
    setPlaying(true)
    trialStart.current = Date.now()
    const seq = DIGIT_SPAN_SEQUENCES[current]
    await speakDigits(seq)
    setPlaying(false)
  }, [current])

  const submit = useCallback(() => {
    const seq = DIGIT_SPAN_SEQUENCES[current]
    const ans = parseDigitAnswer(answer)
    const correct = compareDigits(seq, ans)
    const trial: DigitSpanTrialResult = {
      index: current,
      sequence: seq,
      answer: ans,
      correct,
      reactionTimeMs: Date.now() - trialStart.current,
    }
    setTrials((t) => [...t, trial])
    setAnswer('')
    if (current + 1 >= DIGIT_SPAN_SEQUENCES.length) {
      setPhase('done')
    } else {
      setCurrent((n) => n + 1)
    }
  }, [current, answer])

  useEffect(() => {
    if (phase === 'done' && trials.length > 0) {
      const correct = trials.filter((t) => t.correct).length
      const r: DigitSpanResult = {
        id: `ds-${Date.now()}`,
        userName: user?.username,
        startedAt: new Date(startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        trials,
        totalMs: Date.now() - startedAt,
        correctCount: correct,
        score: Math.round((correct / DIGIT_SPAN_SEQUENCES.length) * 100),
      }
      saveDigitSpanResult(r)
    }
  }, [phase, trials, startedAt, user])

  if (phase === 'intro') {
    return (
      <Intro
        onQuit={() => router.push('/dashboard')}
        onStart={() => {
          setStartedAt(Date.now())
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

  return (
    <TrialView
      index={current}
      total={DIGIT_SPAN_SEQUENCES.length}
      playing={playing}
      answer={answer}
      onPlay={playSequence}
      onAnswerChange={setAnswer}
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
          <Headphones className="h-4 w-4" /> Mémoire de travail
        </div>
        <h1 className="mb-3 text-3xl font-bold">Digit Span — WAIS-IV</h1>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Le Digit Span évalue la mémoire à court terme et la mémoire de travail. Une séquence
          de chiffres vous sera lue à haute voix ; vous devrez les reproduire dans le même
          ordre. 9 séquences progressives.
        </p>
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <strong>Durée estimée :</strong> ~5 minutes. Assurez-vous que le son est activé.
        </div>

        <div className="mb-6">
          <TestIntroSection testId={DIGIT_SPAN_TEST_ID} />
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
            <strong>1.</strong> Vous verrez un bouton « Écouter ». Cliquez pour entendre une
            séquence de chiffres.
          </li>
          <li>
            <strong>2.</strong> Écoutez attentivement et mémorisez l'ordre des chiffres.
          </li>
          <li>
            <strong>3.</strong> Une fois terminé, tapez les chiffres dans le même ordre dans le
            champ de texte.
          </li>
          <li>
            <strong>4.</strong> Cliquez « Valider » pour continuer à la séquence suivante.
          </li>
          <li>
            <strong>5.</strong> Vous recevez 1 point pour chaque séquence correcte.
          </li>
        </ol>
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30">
          💡 Les 9 séquences se font progressivement plus longues. Concentrez-vous !
        </div>
        <Button onClick={onBegin}>
          Commencer les séquences <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function TrialView({
  index,
  total,
  playing,
  answer,
  onPlay,
  onAnswerChange,
  onSubmit,
}: {
  index: number
  total: number
  playing: boolean
  answer: string
  onPlay: () => void
  onAnswerChange: (s: string) => void
  onSubmit: () => void
}) {
  return (
    <main className="container mx-auto max-w-xl py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Séquence {index + 1} / {total}
        </h2>
      </div>
      <Progress value={((index + 1) / total) * 100} className="mb-6" />

      <Card className="space-y-6 p-6">
        <div>
          <Button
            onClick={onPlay}
            disabled={playing}
            className="w-full gap-2"
            size="lg"
          >
            <Volume2 className="h-5 w-5" />
            {playing ? 'Lecture en cours…' : 'Écouter la séquence'}
          </Button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Reproduisez la séquence (chiffres uniquement) :
          </label>
          <Input
            type="text"
            inputMode="numeric"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="ex: 3 2"
            className="font-mono text-lg"
            autoFocus
            disabled={playing}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Saisissez les chiffres séparés par des espaces ou collés.
          </p>
        </div>

        <Button
          onClick={onSubmit}
          disabled={!answer.trim() || playing}
          className="w-full"
          size="lg"
        >
          Valider
        </Button>
      </Card>
    </main>
  )
}

function Results({
  trials,
  onExit,
}: {
  trials: DigitSpanTrialResult[]
  onExit: () => void
}) {
  const correct = trials.filter((t) => t.correct).length
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
            <p className="text-2xl font-bold">
              {Math.round((correct / trials.length) * 100)}%
            </p>
          </div>
        </div>
        <div className="mb-6 max-h-48 overflow-auto rounded-md border bg-slate-50 p-3 dark:bg-slate-900">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Détails :</p>
          {trials.map((t) => (
            <div key={t.index} className="text-left text-xs">
              <span className={t.correct ? 'text-green-600' : 'text-red-600'}>
                Seq {t.index + 1}: {t.sequence.join('')} →{' '}
                {t.answer.length ? t.answer.join('') : '(vide)'}{' '}
                {t.correct ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
        <Button onClick={onExit}>Retour au tableau de bord</Button>
      </Card>
    </main>
  )
}
