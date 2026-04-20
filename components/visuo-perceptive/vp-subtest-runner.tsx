'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, MousePointerClick, Pencil } from 'lucide-react'
import {
  VPSubtestMeta,
  VPTrial,
  buildTrials,
  VP_MEMORY_STIMULUS_MS,
  resultStorageKey,
} from '@/lib/visuo-perceptive'
import { gradeTrial, summarize, TrialAnswer } from '@/lib/visuo-perceptive/scoring'
import { VPImage } from './vp-image'

interface RunnerProps {
  subtest: VPSubtestMeta
}

type Phase = 'stimulus' | 'answer' | 'done'

interface LiveMetrics {
  startedAt: number
  clicks: number
  modifications: number
  selected: number | null
}

const newMetrics = (): LiveMetrics => ({
  startedAt: Date.now(),
  clicks: 0,
  modifications: 0,
  selected: null,
})

export function VPSubtestRunner({ subtest }: RunnerProps) {
  const router = useRouter()
  const trials = useMemo<VPTrial[]>(() => buildTrials(subtest), [subtest])
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<Phase>(subtest.memoryOddEven ? 'stimulus' : 'answer')
  const [answers, setAnswers] = useState<TrialAnswer[]>([])
  const metricsRef = useRef<LiveMetrics>(newMetrics())
  const [stimulusProgress, setStimulusProgress] = useState(0)

  const current = trials[i]

  // Stimulus timer for memory-odd-even subtests
  useEffect(() => {
    if (!current) return
    if (phase !== 'stimulus') return
    setStimulusProgress(0)
    const t0 = Date.now()
    const iv = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - t0) / VP_MEMORY_STIMULUS_MS) * 100)
      setStimulusProgress(pct)
    }, 50)
    const to = setTimeout(() => {
      clearInterval(iv)
      metricsRef.current = newMetrics()
      setPhase('answer')
    }, VP_MEMORY_STIMULUS_MS)
    return () => {
      clearInterval(iv)
      clearTimeout(to)
    }
  }, [phase, current])

  if (trials.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <h1 className="mb-2 text-xl font-semibold">{subtest.title}</h1>
          <p className="mb-6 text-muted-foreground">
            Ce sous-test ne contient pas encore de base de correction. Ajoutez-la dans{' '}
            <code className="font-mono text-xs">lib/visuo-perceptive/corrections.ts</code> pour l’activer.
          </p>
          <Button variant="outline" onClick={() => router.push('/tests/test-visuo-perceptive')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au hub
          </Button>
        </Card>
      </div>
    )
  }

  if (phase === 'done') {
    const result = summarize(subtest.id, answers)
    return <ResultSummary subtest={subtest} result={result} />
  }

  const progressPct = ((i + (phase === 'answer' ? 0.5 : 0)) / trials.length) * 100

  const handleSelect = (value: number) => {
    const m = metricsRef.current
    m.clicks += 1
    if (m.selected !== null && m.selected !== value) m.modifications += 1
    m.selected = value
  }

  const handleNext = () => {
    const m = metricsRef.current
    const timeMs = Date.now() - m.startedAt
    const graded = gradeTrial(m.selected, current.correct, current.trialIndex, current.questionNumber, {
      timeMs,
      clicks: m.clicks,
      modifications: m.modifications,
    })
    const next = [...answers, graded]
    setAnswers(next)
    const nextIndex = i + 1
    if (nextIndex >= trials.length) {
      const summary = summarize(subtest.id, next)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(resultStorageKey(subtest.id), JSON.stringify(summary))
      }
      setPhase('done')
      return
    }
    setI(nextIndex)
    metricsRef.current = newMetrics()
    setPhase(subtest.memoryOddEven ? 'stimulus' : 'answer')
  }

  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/tests/test-visuo-perceptive')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{subtest.category}</Badge>
          <Badge>{subtest.choices} choix</Badge>
          {subtest.memoryOddEven && <Badge variant="secondary">mémoire 3s</Badge>}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {subtest.title} — Essai {i + 1} / {trials.length}
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <Progress value={progressPct} />
      </div>

      {phase === 'stimulus' && current.stimulusFile && (
        <Card className="mb-4 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Stimulus — mémorisez</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {Math.max(0, Math.ceil((VP_MEMORY_STIMULUS_MS * (1 - stimulusProgress / 100)) / 1000))}s
            </div>
          </div>
          <div className="mx-auto max-w-2xl">
            <VPImage
              filename={current.stimulusFile}
              candidates={current.stimulusCandidates}
              alt="stimulus"
              className="mx-auto max-h-[420px] w-full rounded-md border object-contain"
            />
          </div>
          <Progress value={stimulusProgress} className="mt-4" />
        </Card>
      )}

      {phase === 'answer' && (
        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Question</h3>
              <VPImage
                filename={current.questionFile}
                candidates={current.questionCandidates}
                alt={`question ${current.questionNumber}`}
                className="w-full rounded-md border object-contain"
              />
              <p className="mt-2 font-mono text-xs text-muted-foreground">{current.questionFile}</p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
                Choisissez une réponse (1 à {subtest.choices})
              </h3>
              <ChoiceGrid count={subtest.choices} onSelect={handleSelect} />
              <div className="mt-6 flex items-center justify-between">
                <LiveCounters metricsRef={metricsRef} />
                <Button onClick={handleNext}>
                  {i + 1 === trials.length ? 'Terminer' : 'Question suivante'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function ChoiceGrid({ count, onSelect }: { count: 4 | 5; onSelect: (v: number) => void }) {
  const [sel, setSel] = useState<number | null>(null)
  const values = Array.from({ length: count }, (_, i) => i + 1)
  return (
    <div className={`grid gap-3 ${count === 5 ? 'grid-cols-5' : 'grid-cols-2'}`}>
      {values.map((v) => {
        const active = sel === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => {
              setSel(v)
              onSelect(v)
            }}
            className={`flex h-16 items-center justify-center rounded-md border text-xl font-semibold transition ${
              active
                ? 'border-primary bg-primary text-primary-foreground shadow'
                : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
            }`}
          >
            {v}
          </button>
        )
      })}
    </div>
  )
}

function LiveCounters({ metricsRef }: { metricsRef: React.MutableRefObject<LiveMetrics> }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(iv)
  }, [])
  const m = metricsRef.current
  return (
    <div className="flex gap-4 text-xs text-muted-foreground" data-tick={tick}>
      <span className="flex items-center gap-1">
        <MousePointerClick className="h-3 w-3" /> {m.clicks} clic(s)
      </span>
      <span className="flex items-center gap-1">
        <Pencil className="h-3 w-3" /> {m.modifications} modif(s)
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {Math.floor((Date.now() - m.startedAt) / 1000)}s
      </span>
    </div>
  )
}

function ResultSummary({
  subtest,
  result,
}: {
  subtest: VPSubtestMeta
  result: ReturnType<typeof summarize>
}) {
  const router = useRouter()
  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card className="p-8">
        <h1 className="mb-1 text-2xl font-bold">{subtest.title} — Résultat</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sous-test terminé. Voici la synthèse brute ; le profil cognitif complet est disponible dans la page
          de résultats agrégés.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Score" value={`${result.totalCorrect} / ${result.total}`} />
          <Stat label="Pourcentage" value={`${Math.round(result.percentage)} %`} />
          <Stat label="Temps moyen" value={`${(result.averageTimeMs / 1000).toFixed(1)} s`} />
          <Stat label="Clics totaux" value={`${result.totalClicks}`} />
          <Stat label="Modifications" value={`${result.totalModifications}`} />
          <Stat label="Essais" value={`${result.total}`} />
        </div>

        <div className="mt-8 overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Question</th>
                <th className="px-3 py-2 text-left">Réponse</th>
                <th className="px-3 py-2 text-left">Correcte</th>
                <th className="px-3 py-2 text-left">Score</th>
                <th className="px-3 py-2 text-left">Temps (s)</th>
              </tr>
            </thead>
            <tbody>
              {result.answers.map((a) => (
                <tr key={a.trialIndex} className="border-t">
                  <td className="px-3 py-2">#{a.questionNumber}</td>
                  <td className="px-3 py-2">{a.userAnswer ?? '—'}</td>
                  <td className="px-3 py-2">{a.correctAnswer}</td>
                  <td className={`px-3 py-2 font-semibold ${a.score ? 'text-emerald-600' : 'text-red-600'}`}>
                    {a.score}
                  </td>
                  <td className="px-3 py-2">{(a.timeMs / 1000).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => router.push('/results/visuo-perceptive')}>
            Voir le profil cognitif complet
          </Button>
          <Button variant="outline" onClick={() => router.push('/tests/test-visuo-perceptive')}>
            Retour au hub
          </Button>
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}
