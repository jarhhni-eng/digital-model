'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle2, Brain, Volume2, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  RAVLT_LIST_A,
  RAVLT_LIST_B,
  RAVLTLevelKey,
  RAVLTLevelScore,
  RAVLTResult,
  computeTotalScore,
  finalizeRAVLT,
  loadActiveRAVLT,
  parseAnswers,
  saveActiveRAVLT,
  scoreList,
  speakWords,
  RAVLT_TEST_ID,
} from '@/lib/memory/ravlt'
import { persistCompletedTestSessionBestEffort } from '@/lib/results/submit-completed-session-api'

type Phase =
  | 'intro'
  | 'L1a-show'
  | 'L1a-recall'
  | 'L1b-show'
  | 'L1b-recall'
  | 'L2-show'
  | 'L2-recall'
  | 'L3-show'
  | 'L3-recall'
  | 'L4-recall'
  | 'L5-wait'
  | 'L5-recall'
  | 'done'

const WORD_DISPLAY_MS = 1500

export function RAVLTTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [result, setResult] = useState<RAVLTResult>(() => ({
    id: `ravlt-${Date.now()}`,
    userName: user?.username,
    startedAt: new Date().toISOString(),
    levels: {},
    totalScore: 0,
  }))
  const [l5Remaining, setL5Remaining] = useState<number>(0)

  // Resume any persisted RAVLT session (e.g. for L5 delayed recall)
  useEffect(() => {
    const existing = loadActiveRAVLT()
    if (existing && (!user?.username || existing.userName === user.username)) {
      setResult(existing)
      if (existing.levels.L4 && !existing.levels.L5 && existing.l5UnlockAt) {
        setPhase('L5-wait')
      }
    }
  }, [user])

  // L5 countdown tick
  useEffect(() => {
    if (phase !== 'L5-wait' || !result.l5UnlockAt) return
    const tick = () => {
      const remaining = new Date(result.l5UnlockAt!).getTime() - Date.now()
      setL5Remaining(Math.max(0, remaining))
      if (remaining <= 0) setPhase('L5-recall')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [phase, result.l5UnlockAt])

  const saveLevel = (key: RAVLTLevelKey, score: RAVLTLevelScore) => {
    setResult((r) => {
      const next: RAVLTResult = {
        ...r,
        levels: { ...r.levels, [key]: score },
      }
      next.totalScore = computeTotalScore(next.levels)
      saveActiveRAVLT(next)
      return next
    })
  }

  const l1aRecalled = result.levels.L1a?.correctWords ?? []
  const l1bRecalled = result.levels.L1b?.correctWords ?? []
  const previouslyRecalled = useMemo(
    () => Array.from(new Set([...l1aRecalled, ...l1bRecalled])),
    [l1aRecalled, l1bRecalled],
  )

  if (phase === 'intro') {
    return (
      <Intro
        onQuit={() => router.push('/dashboard')}
        onStart={() => {
          setResult((r) => ({ ...r, startedAt: new Date().toISOString() }))
          setPhase('L1a-show')
        }}
      />
    )
  }

  if (phase === 'L1a-show') {
    return (
      <ShowWords
        title="Niveau 1a — Présentation visuelle"
        subtitle="Mémorisez les 15 mots de la liste A qui s'affichent successivement."
        words={RAVLT_LIST_A as unknown as string[]}
        onDone={() => setPhase('L1a-recall')}
      />
    )
  }

  if (phase === 'L1a-recall') {
    return (
      <RecallScreen
        title="Niveau 1a — Rappel libre"
        subtitle="Écrivez tous les mots dont vous vous souvenez, sans ordre imposé."
        maxScore={15}
        onSubmit={(answers) => {
          const score = scoreList('L1a', answers, RAVLT_LIST_A)
          saveLevel('L1a', score)
          setPhase('L1b-show')
        }}
      />
    )
  }

  if (phase === 'L1b-show') {
    return (
      <ReadAloud
        title="Niveau 1b — Dictée orale"
        subtitle="Écoutez les mots de la liste A dictés à voix haute, un par seconde."
        words={RAVLT_LIST_A as unknown as string[]}
        onDone={() => setPhase('L1b-recall')}
      />
    )
  }

  if (phase === 'L1b-recall') {
    return (
      <RecallScreen
        title="Niveau 1b — Rappel après dictée"
        subtitle="Écrivez tous les mots dont vous vous souvenez."
        maxScore={15}
        onSubmit={(answers) => {
          const score = scoreList('L1b', answers, RAVLT_LIST_A)
          saveLevel('L1b', score)
          setPhase('L2-show')
        }}
      />
    )
  }

  if (phase === 'L2-show') {
    return (
      <ReadAloud
        title="Niveau 2 — Apprentissage renforcé"
        subtitle="Les mêmes mots sont relus. Concentrez-vous, vous devrez retrouver MÊME les mots déjà rappelés."
        words={RAVLT_LIST_A as unknown as string[]}
        onDone={() => setPhase('L2-recall')}
      />
    )
  }

  if (phase === 'L2-recall') {
    return (
      <RecallScreen
        title="Niveau 2 — Rappel élargi"
        subtitle="Tapez tous les mots dont vous vous souvenez. Seuls les NOUVEAUX mots (non retrouvés auparavant) comptent, max 5."
        maxScore={5}
        onSubmit={(answers) => {
          const score = scoreList('L2', answers, RAVLT_LIST_A, previouslyRecalled)
          saveLevel('L2', score)
          setPhase('L3-show')
        }}
      />
    )
  }

  if (phase === 'L3-show') {
    return (
      <ReadAloud
        title="Niveau 3 — Liste B (interférence)"
        subtitle="Une nouvelle liste de 15 mots est dictée. Mémorisez-la."
        words={RAVLT_LIST_B as unknown as string[]}
        onDone={() => setPhase('L3-recall')}
      />
    )
  }

  if (phase === 'L3-recall') {
    return (
      <RecallScreen
        title="Niveau 3 — Rappel de la liste B"
        subtitle="Écrivez les mots de la liste B, sans ordre imposé."
        maxScore={15}
        onSubmit={(answers) => {
          const score = scoreList('L3', answers, RAVLT_LIST_B)
          saveLevel('L3', score)
          setPhase('L4-recall')
        }}
      />
    )
  }

  if (phase === 'L4-recall') {
    return (
      <RecallScreen
        title="Niveau 4 — Rappel différé immédiat (liste A)"
        subtitle="Sans relecture, écrivez tous les mots de la liste A dont vous vous souvenez."
        maxScore={15}
        onSubmit={(answers) => {
          const score = scoreList('L4', answers, RAVLT_LIST_A)
          saveLevel('L4', score)
          // Schedule L5 in 20 minutes
          setResult((r) => {
            const unlockAt = new Date(Date.now() + 20 * 60 * 1000).toISOString()
            const next: RAVLTResult = { ...r, levels: { ...r.levels, L4: score }, l5UnlockAt: unlockAt }
            next.totalScore = computeTotalScore(next.levels)
            saveActiveRAVLT(next)
            return next
          })
          setPhase('L5-wait')
        }}
      />
    )
  }

  if (phase === 'L5-wait') {
    const mins = Math.floor(l5Remaining / 60000)
    const secs = Math.floor((l5Remaining % 60000) / 1000)
    return (
      <main className="container mx-auto max-w-xl py-16">
        <Card className="p-10 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h1 className="mb-2 text-2xl font-bold">Pause de 20 minutes</h1>
          <p className="mb-6 text-muted-foreground">
            Le rappel différé à long terme sera disponible dans :
          </p>
          <p className="mb-6 font-mono text-5xl font-bold">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
          <p className="text-xs text-muted-foreground">
            Vous pouvez quitter cette page ; le test reprend automatiquement lorsque vous y
            reviendrez après 20 minutes.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Revenir plus tard
            </Button>
            {l5Remaining <= 0 && (
              <Button onClick={() => setPhase('L5-recall')}>Commencer le rappel final</Button>
            )}
          </div>
        </Card>
      </main>
    )
  }

  if (phase === 'L5-recall') {
    return (
      <RecallScreen
        title="Niveau 5 — Rappel différé à long terme (20 min)"
        subtitle="Écrivez tous les mots de la liste A dont vous vous souvenez."
        maxScore={15}
        onSubmit={(answers) => {
          const score = scoreList('L5', answers, RAVLT_LIST_A)
          setResult((r) => {
            const next: RAVLTResult = {
              ...r,
              levels: { ...r.levels, L5: score },
              completedAt: new Date().toISOString(),
            }
            next.totalScore = computeTotalScore(next.levels)
            finalizeRAVLT(next)
            const levelEntries = Object.entries(next.levels).filter(
              (e): e is [RAVLTLevelKey, RAVLTLevelScore] => Boolean(e[1]),
            )
            const trials = levelEntries.map(([key, lv], i) => ({
              question_index: i,
              question_id: `ravlt-${key}`,
              selected: lv.correctWords,
              free_text: lv.extraWords.length ? lv.extraWords.join('; ') : null,
              correct: lv.score > 0,
              score: Math.min(1, lv.score / 15),
              reaction_time_ms: null,
            }))
            const maxByLevels = levelEntries.length * 15 || 15
            persistCompletedTestSessionBestEffort({
              testId: RAVLT_TEST_ID,
              startedAt: next.startedAt,
              completedAt: next.completedAt ?? new Date().toISOString(),
              totalMs: null,
              score: Math.min(100, Math.round((next.totalScore / maxByLevels) * 100)),
              correctCount: Math.round(next.totalScore),
              totalQuestions: maxByLevels,
              trials,
              metadata: { source: 'ravlt-test', resultId: next.id, totalScore: next.totalScore },
            })
            return next
          })
          setPhase('done')
        }}
      />
    )
  }

  if (phase === 'done') {
    return <FinalResults result={result} onExit={() => router.push('/dashboard')} />
  }

  return null
}

// ──────────── Shared screens ────────────

function Intro({ onStart, onQuit }: { onStart: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-rose-600">
          <Brain className="h-4 w-4" /> Mémoire à long terme
        </div>
        <h1 className="mb-3 text-3xl font-bold">Rey Auditory Verbal Learning Test (RAVLT)</h1>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Le RAVLT évalue la mémoire verbale, l’apprentissage et le rappel à court et long
          terme. Une liste de 15 mots vous sera présentée plusieurs fois ; vous devrez les
          rappeler librement à différents moments. Une liste d’interférence puis un rappel
          différé après 20 minutes complètent le test.
        </p>
        <ul className="mb-6 ml-5 list-disc text-sm text-muted-foreground">
          <li>Niveau 1a : liste A visuelle puis rappel</li>
          <li>Niveau 1b : liste A dictée oralement puis rappel</li>
          <li>Niveau 2 : relecture de la liste A, rappel élargi (bonus max 5)</li>
          <li>Niveau 3 : liste B (interférence) puis rappel</li>
          <li>Niveau 4 : rappel immédiat de la liste A</li>
          <li>Niveau 5 : rappel différé après 20 minutes</li>
        </ul>
        <Button onClick={onStart}>
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function ShowWords({
  title,
  subtitle,
  words,
  onDone,
}: {
  title: string
  subtitle: string
  words: string[]
  onDone: () => void
}) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (i >= words.length) {
      const t = setTimeout(onDone, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setI((n) => n + 1), WORD_DISPLAY_MS)
    return () => clearTimeout(t)
  }, [i, words.length, onDone])
  return (
    <main className="container mx-auto max-w-3xl py-8">
      <h2 className="mb-1 text-xl font-bold">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>
      <Progress value={(i / words.length) * 100} className="mb-6" />
      <Card className="flex h-64 items-center justify-center">
        <span className="text-5xl font-bold tracking-wide">
          {i < words.length ? words[i] : '…'}
        </span>
      </Card>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Mot {Math.min(i + 1, words.length)} / {words.length}
      </p>
    </main>
  )
}

function ReadAloud({
  title,
  subtitle,
  words,
  onDone,
}: {
  title: string
  subtitle: string
  words: string[]
  onDone: () => void
}) {
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const donePromise = useRef<Promise<void> | null>(null)
  const start = async () => {
    setStarted(true)
    donePromise.current = (async () => {
      for (let k = 0; k < words.length; k++) {
        setI(k)
        await speakWords([words[k]], 0)
        await new Promise((r) => setTimeout(r, 1000))
      }
    })()
    await donePromise.current
    onDone()
  }
  return (
    <main className="container mx-auto max-w-3xl py-8">
      <h2 className="mb-1 text-xl font-bold">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>
      <Card className="flex h-64 flex-col items-center justify-center gap-4">
        {!started ? (
          <Button onClick={start}>
            <Volume2 className="mr-2 h-4 w-4" /> Démarrer la dictée
          </Button>
        ) : (
          <>
            <Volume2 className="h-10 w-10 text-rose-500" />
            <Progress value={(i / words.length) * 100} className="w-3/4" />
            <p className="text-sm text-muted-foreground">
              Mot {i + 1} / {words.length}
            </p>
          </>
        )}
      </Card>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        💡 Assurez-vous que le son de votre appareil est activé.
      </p>
    </main>
  )
}

function RecallScreen({
  title,
  subtitle,
  maxScore,
  onSubmit,
}: {
  title: string
  subtitle: string
  maxScore: number
  onSubmit: (answers: string[]) => void
}) {
  const [text, setText] = useState('')
  const submit = () => {
    onSubmit(parseAnswers(text))
  }
  return (
    <main className="container mx-auto max-w-3xl py-8">
      <h2 className="mb-1 text-xl font-bold">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>
      <Card className="p-6">
        <label className="mb-2 block text-sm font-medium">
          Entrez les mots (un par ligne ou séparés par des virgules) — score max : {maxScore}
        </label>
        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="tambour&#10;rideau&#10;sonnette&#10;..."
          className="font-mono"
          autoFocus
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={submit} disabled={!text.trim()}>
            Valider
          </Button>
        </div>
      </Card>
    </main>
  )
}

function FinalResults({ result, onExit }: { result: RAVLTResult; onExit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Card className="p-8">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-6 text-center text-2xl font-bold">Test terminé — RAVLT</h1>
        <div className="grid gap-3 md:grid-cols-2">
          {(['L1a', 'L1b', 'L2', 'L3', 'L4', 'L5'] as const).map((k) => {
            const l = result.levels[k]
            const max = k === 'L2' ? 5 : 15
            return (
              <div key={k} className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Niveau {k}</p>
                <p className="text-xl font-bold">
                  {l?.score ?? 0} / {max}
                </p>
                {l?.extraWords?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Intrusions : {l.extraWords.join(', ')}
                  </p>
                ) : null}
              </div>
            )
          })}
          <div className="col-span-2 rounded-md border-2 border-rose-200 bg-rose-50 p-3 dark:bg-rose-950/30">
            <p className="text-xs text-muted-foreground">Score total (tous niveaux)</p>
            <p className="text-3xl font-bold">{result.totalScore} / 80</p>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Badge variant="outline">Résultat enregistré dans votre profil</Badge>
        </div>
        <div className="mt-6 flex justify-center">
          <Button onClick={onExit}>Retour au tableau de bord</Button>
        </div>
      </Card>
    </main>
  )
}
