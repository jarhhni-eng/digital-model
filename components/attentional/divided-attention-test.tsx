'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle2, Target, Download } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  DA_COLOR_HEX,
  DA_COLOR_LABEL,
  DA_TRIAL_COUNT,
  DA_TRIAL_DURATION_MS,
  DAColor,
  DATrial,
  DATrialResult,
  DARResult,
  buildDATrials,
  saveDAResult,
  toCSV,
} from '@/lib/attentional/divided-attention'

type Phase = 'intro' | 'instructions' | 'running' | 'done'

export function DividedAttentionTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')
  const [trials, setTrials] = useState<DATrial[]>([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState<DATrialResult[]>([])
  const [startedAt, setStartedAt] = useState<number>(0)
  const trialStart = useRef(0)
  const pressed = useRef(false)
  const reactionMs = useRef<number | null>(null)

  // Start a fresh trial set
  const begin = () => {
    setTrials(buildDATrials())
    setCurrent(0)
    setResponses([])
    setStartedAt(Date.now())
    setPhase('running')
  }

  const finishTrial = useCallback(() => {
    const trial = trials[current]
    if (!trial) return
    const pr: DATrialResult = {
      ...trial,
      pressed: pressed.current,
      reactionTimeMs: reactionMs.current,
      correct: pressed.current === trial.isGo,
    }
    setResponses((r) => [...r, pr])
    pressed.current = false
    reactionMs.current = null
    if (current + 1 >= trials.length) {
      setPhase('done')
    } else {
      setCurrent((n) => n + 1)
    }
  }, [current, trials])

  // Trial timer
  useEffect(() => {
    if (phase !== 'running') return
    trialStart.current = Date.now()
    const t = setTimeout(finishTrial, DA_TRIAL_DURATION_MS)
    return () => clearTimeout(t)
  }, [phase, current, finishTrial])

  // Keypress
  useEffect(() => {
    if (phase !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !pressed.current) {
        pressed.current = true
        reactionMs.current = Date.now() - trialStart.current
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  // Save result when done
  useEffect(() => {
    if (phase !== 'done' || responses.length === 0) return
    const correctCount = responses.filter((r) => r.correct).length
    const result: DARResult = {
      id: `da-${Date.now()}`,
      userName: user?.username,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      trials: responses,
      totalMs: Date.now() - startedAt,
      correctCount,
      score: Math.round((correctCount / DA_TRIAL_COUNT) * 100),
    }
    saveDAResult(result)
  }, [phase, responses, startedAt, user])

  if (phase === 'intro') return <IntroScreen onNext={() => setPhase('instructions')} onQuit={() => router.push('/dashboard')} />
  if (phase === 'instructions') return <InstructionsScreen onStart={begin} onBack={() => setPhase('intro')} />
  if (phase === 'done') return <ResultsScreen responses={responses} onExit={() => router.push('/dashboard')} />

  const trial = trials[current]
  if (!trial) return null
  return <TrialScreen trial={trial} index={current} total={trials.length} />
}

// ──────────── Screens ────────────

function IntroScreen({ onNext, onQuit }: { onNext: () => void; onQuit: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onQuit} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quitter
      </Button>
      <Card className="p-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600">
          <Target className="h-4 w-4" /> Attention divisée
        </div>
        <h1 className="mb-3 text-3xl font-bold">Divided Attention Test</h1>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          L’attention divisée est la capacité du cerveau à prêter attention à deux stimuli
          différents en même temps et à répondre aux multiples exigences de l’environnement. Ce
          test mesure votre aptitude à traiter plusieurs sources d’information simultanément.
        </p>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Lorsque l’attention est divisée, des interférences apparaissent et la performance peut
          diminuer : le cerveau ne peut traiter qu’une quantité limitée d’informations.
          L’entraînement permet toutefois d’améliorer cette capacité.
        </p>
        <Button onClick={onNext}>
          Suivant <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function InstructionsScreen({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <main className="container mx-auto max-w-3xl py-10">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      <Card className="p-8">
        <h2 className="mb-3 text-2xl font-bold">Consignes</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Une balle colorée se déplace à l’écran. En même temps, un mot désignant une couleur
          s’affiche en haut.
        </p>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <p className="mb-1 font-semibold text-emerald-700 dark:text-emerald-400">Go (match)</p>
            <p className="text-xs text-muted-foreground">
              Le nom de la couleur correspond à la couleur de la balle → appuyez sur{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">Espace</kbd>.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
            <p className="mb-1 font-semibold text-red-700 dark:text-red-400">No-Go (mismatch)</p>
            <p className="text-xs text-muted-foreground">
              Le nom ne correspond pas → n’appuyez sur aucune touche.
            </p>
          </div>
        </div>
        <div className="mb-6 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          Couleurs : green, red, black, white. 16 essais (4 par couleur). ~60 secondes.
        </div>
        <Button onClick={onStart}>
          Commencer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </main>
  )
}

function TrialScreen({ trial, index, total }: { trial: DATrial; index: number; total: number }) {
  const progress = ((index) / total) * 100
  return (
    <main className="container mx-auto max-w-5xl py-6">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Essai {index + 1} / {total}
        </span>
        <Badge variant="outline">Appuyez sur Espace si le mot correspond à la balle</Badge>
      </div>
      <Progress value={progress} className="mb-4" />

      <Card className="p-8">
        <div className="mb-6 flex items-center justify-center">
          <span
            className="text-5xl font-bold tracking-wider"
            style={{ color: DA_COLOR_HEX[trial.wordColor] === '#ffffff' ? '#4b5563' : DA_COLOR_HEX[trial.wordColor] }}
          >
            {DA_COLOR_LABEL[trial.wordColor]}
          </span>
        </div>
        <BallCanvas ballColor={trial.ballColor} />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Suivez la balle avec votre curseur et appuyez sur{' '}
          <kbd className="rounded bg-muted px-1.5 py-0.5">Espace</kbd> uniquement si le mot correspond
          à la couleur de la balle.
        </p>
      </Card>
    </main>
  )
}

function BallCanvas({ ballColor }: { ballColor: DAColor }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const vel = useRef({ vx: 0.003, vy: 0.0025 })
  useEffect(() => {
    let raf = 0
    const tick = () => {
      setPos((p) => {
        let { x, y } = p
        x += vel.current.vx
        y += vel.current.vy
        if (x < 0.05 || x > 0.95) vel.current.vx *= -1
        if (y < 0.1 || y > 0.9) vel.current.vy *= -1
        return { x: Math.max(0.05, Math.min(0.95, x)), y: Math.max(0.1, Math.min(0.9, y)) }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  useEffect(() => {
    const cvs = ref.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    const w = cvs.width
    const h = cvs.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#e2e8f0'
    ctx.strokeRect(0, 0, w, h)
    ctx.beginPath()
    ctx.arc(pos.x * w, pos.y * h, 22, 0, Math.PI * 2)
    ctx.fillStyle = DA_COLOR_HEX[ballColor]
    ctx.fill()
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [pos, ballColor])
  return (
    <canvas
      ref={ref}
      width={800}
      height={400}
      className="mx-auto block w-full max-w-3xl rounded border bg-slate-50"
    />
  )
}

function ResultsScreen({ responses, onExit }: { responses: DATrialResult[]; onExit: () => void }) {
  const correct = responses.filter((r) => r.correct).length
  const goCorrect = responses.filter((r) => r.isGo && r.correct).length
  const noGoCorrect = responses.filter((r) => !r.isGo && r.correct).length
  const goTotal = responses.filter((r) => r.isGo).length
  const noGoTotal = responses.filter((r) => !r.isGo).length
  const rts = responses.filter((r) => r.pressed && r.reactionTimeMs != null).map((r) => r.reactionTimeMs!)
  const meanRT = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0

  const handleCSV = () => {
    const mockResult: DARResult = {
      id: 'preview',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      trials: responses,
      totalMs: 0,
      correctCount: correct,
      score: Math.round((correct / responses.length) * 100),
    }
    const csv = toCSV(mockResult)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'divided-attention.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="container mx-auto max-w-2xl py-10">
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h1 className="mb-2 text-2xl font-bold">Test terminé</h1>
        <p className="mb-6 text-muted-foreground">Voici vos résultats :</p>
        <div className="mb-6 grid grid-cols-2 gap-4 text-left">
          <Stat label="Score" value={`${correct} / ${responses.length}`} />
          <Stat label="Pourcentage" value={`${Math.round((correct / responses.length) * 100)}%`} />
          <Stat label="Go corrects" value={`${goCorrect} / ${goTotal}`} />
          <Stat label="No-Go corrects" value={`${noGoCorrect} / ${noGoTotal}`} />
          <Stat label="Temps de réaction moyen" value={`${meanRT} ms`} />
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={handleCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={onExit}>Retour au tableau de bord</Button>
        </div>
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
