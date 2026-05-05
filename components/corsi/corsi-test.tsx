'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  BLOCK_POSITIONS,
  CORSI_STORAGE_KEY,
  CORSI_TEST_ID,
  TOTAL_ATTEMPTS,
  HIGHLIGHT_DURATION_MS,
  INTER_BLOCK_DELAY_MS,
  PRE_SEQUENCE_DELAY_MS,
  generateSequence,
  sequenceLengthFor,
  sequencesMatch,
  type AttemptRecord,
  type CorsiResult,
} from '@/lib/corsi-test'
import { persistCompletedTestSessionBestEffort } from '@/lib/results/submit-completed-session-api'
import { Brain, CheckCircle, XCircle, BookOpen } from 'lucide-react'

// ─── Phases ───────────────────────────────────────────────────────────────────
type Phase =
  | 'intro'
  | 'countdown'    // 3-second delay before sequence
  | 'showing'      // blocks lighting up
  | 'responding'   // user clicking
  | 'feedback'     // brief correct/incorrect flash
  | 'done'

// ─── Introduction ─────────────────────────────────────────────────────────────
function IntroScreen({ onBegin }: { onBegin: () => void }) {
  const [showRefs, setShowRefs] = useState(false)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Test de Tapotement des Blocs de Corsi</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Corsi Block Tapping Task — Mémoire Visuospatiale
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Le <strong className="text-foreground">Test de Tapotement des Blocs de Corsi (CBT)</strong> est un
            outil neuropsychologique largement utilisé pour évaluer les compétences visuospatiales et la
            capacité de mémoire de travail. Le test comporte une séquence de blocs que le participant doit
            tapoter dans le même ordre que celui dans lequel ils ont été présentés. Depuis son développement,
            différentes variations du CBT ont émergé, en faisant une méthode cruciale pour évaluer diverses
            fonctions cognitives et applications dans plusieurs contextes de recherche.
          </p>
          <p>
            La disposition spatiale des carrés 2D de la Tâche de Tapotement des Blocs de Corsi en ligne
            comme présenté dans <strong className="text-foreground">Kessels et al. (2000)</strong>.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">{TOTAL_ATTEMPTS}</p>
              <p className="text-xs">essais</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">3→5</p>
              <p className="text-xs">blocs / séquence</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">9</p>
              <p className="text-xs">blocs au total</p>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-foreground">
            <p className="font-semibold text-primary mb-2">Instructions</p>
            <ul className="space-y-1.5 text-sm">
              <li>• Neuf carrés identiques s'affichent de manière asymétrique à l'écran.</li>
              <li>• Certains carrés <strong>clignotent</strong> dans un ordre précis — mémorisez-le.</li>
              <li>• Reproduisez la séquence en <strong>cliquant sur les carrés dans le même ordre</strong>.</li>
              <li>• Confirmez votre réponse avec le bouton <strong className="font-mono bg-muted px-1.5 py-0.5 rounded">S</strong>.</li>
              <li>• Séquences de longueur croissante : essais 1-2 (3 blocs), 3-4 (4 blocs), 5 (5 blocs).</li>
            </ul>
          </div>

          <button
            onClick={() => setShowRefs(!showRefs)}
            className="flex items-center gap-1.5 text-xs text-primary underline underline-offset-2"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {showRefs ? 'Masquer la référence' : 'Référence (Kessels et al., 2000)'}
          </button>
          {showRefs && (
            <div className="text-xs text-muted-foreground/80 border-l-2 border-primary/20 pl-3 space-y-1">
              <p><strong className="text-foreground">Kessels, R. P. C., van Zandvoort, M. J. E., Postma, A., Kappelle, L. J., & de Haan, E. H. F. (2000).</strong></p>
              <p>The Corsi Block-Tapping Task: standardization and normative data.</p>
              <p className="italic">Applied Neuropsychology, 7(4), 252–258.</p>
              <p className="mt-2"><strong className="text-foreground">Özer, D., Özyürek, A., & Göksun, T. (2025).</strong></p>
              <p>Digital adaptation of the Corsi Block Tapping Task: reliability and normative data.</p>
              <p className="italic">Journal of Clinical and Experimental Neuropsychology.</p>
            </div>
          )}
        </div>

        <Button className="w-full h-12 text-base font-semibold" onClick={onBegin}>
          Commencer le test
        </Button>
      </div>
    </div>
  )
}

// ─── Score screen ─────────────────────────────────────────────────────────────
function ScoreScreen({ result }: { result: CorsiResult }) {
  const router = useRouter()
  const pct = Math.round((result.score / result.maxScore) * 100)
  const color = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Test terminé !</h1>
          <p className="text-sm text-muted-foreground">Corsi Block Tapping Task</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
          <p className={`text-6xl font-bold tabular-nums ${color}`}>
            {result.score}
            <span className="text-2xl text-muted-foreground">/{result.maxScore}</span>
          </p>
          <p className={`text-xl font-semibold ${color}`}>{pct}% de réussite</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">Détail par essai</p>
          {result.attempts.map((a) => (
            <div
              key={a.attemptNumber}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
                a.isCorrect
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-red-50 border border-red-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {a.isCorrect
                  ? <CheckCircle className="w-4 h-4 text-green-600" />
                  : <XCircle className="w-4 h-4 text-red-500" />}
                <span className="font-medium">Essai {a.attemptNumber}</span>
                <span className="text-xs text-muted-foreground">({a.sequenceLength} blocs)</span>
              </div>
              <div className="text-xs space-y-0.5 text-right">
                <p className="text-muted-foreground">Cible : <strong>{a.targetSequence.join('→')}</strong></p>
                <p className={a.isCorrect ? 'text-green-600' : 'text-red-500'}>
                  Réponse : <strong>{a.userSequence.length > 0 ? a.userSequence.join('→') : '—'}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => router.push('/results')}>
            Mes résultats
          </Button>
          <Button onClick={() => router.push('/tests')}>
            Retour aux tests
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Block grid ───────────────────────────────────────────────────────────────
const BLOCK_SIZE = 52   // px

interface BlockGridProps {
  lit: number | null          // block id currently lit (during show)
  selected: number[]          // user-selected ids (during respond)
  phase: Phase
  onClick: (id: number) => void
}

function BlockGrid({ lit, selected, phase, onClick }: BlockGridProps) {
  const canClick = phase === 'responding'

  return (
    <div
      className="relative w-full rounded-2xl border-2 border-border bg-muted/20 select-none"
      style={{ aspectRatio: '4/3' }}
    >
      {BLOCK_POSITIONS.map((block) => {
        const isLit      = lit === block.id
        const isSelected = selected.includes(block.id)
        const selOrder   = selected.indexOf(block.id) + 1   // show click order

        return (
          <button
            key={block.id}
            onClick={() => canClick && onClick(block.id)}
            style={{
              position:   'absolute',
              left:       `calc(${block.x}% - ${BLOCK_SIZE / 2}px)`,
              top:        `calc(${block.y}% - ${BLOCK_SIZE / 2}px)`,
              width:      BLOCK_SIZE,
              height:     BLOCK_SIZE,
            }}
            className={[
              'rounded-lg border-2 transition-all duration-150 flex items-center justify-center',
              'text-sm font-bold',
              isLit
                ? 'bg-amber-400 border-amber-500 shadow-lg shadow-amber-300 scale-110'
                : isSelected
                  ? 'bg-primary border-primary text-primary-foreground shadow-md scale-105'
                  : canClick
                    ? 'bg-card border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                    : 'bg-card border-border cursor-default',
            ].join(' ')}
          >
            {isSelected && selOrder}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CorsiTest() {
  const [phase, setPhase]           = useState<Phase>('intro')
  const [attempt, setAttempt]       = useState(1)
  const [sequence, setSequence]     = useState<number[]>([])
  const [litBlock, setLitBlock]     = useState<number | null>(null)
  const [userSeq, setUserSeq]       = useState<number[]>([])
  const [countdown, setCountdown]   = useState(3)
  const [feedback, setFeedback]     = useState<'correct' | 'incorrect' | null>(null)
  const [records, setRecords]       = useState<AttemptRecord[]>([])
  const [result, setResult]         = useState<CorsiResult | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Cleanup on unmount ──
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // ── Play sequence ──
  const playSequence = useCallback((seq: number[]) => {
    setPhase('showing')
    setLitBlock(null)

    seq.forEach((blockId, idx) => {
      const start = idx * (HIGHLIGHT_DURATION_MS + INTER_BLOCK_DELAY_MS)
      timerRef.current = setTimeout(() => setLitBlock(blockId), start)
      timerRef.current = setTimeout(
        () => setLitBlock(null),
        start + HIGHLIGHT_DURATION_MS
      )
    })

    const totalTime = seq.length * (HIGHLIGHT_DURATION_MS + INTER_BLOCK_DELAY_MS)
    timerRef.current = setTimeout(() => {
      setLitBlock(null)
      setPhase('responding')
    }, totalTime)
  }, [])

  // ── Start attempt ──
  const startAttempt = useCallback((attemptNum: number) => {
    const len = sequenceLengthFor(attemptNum)
    const seq = generateSequence(len)
    setSequence(seq)
    setUserSeq([])
    setFeedback(null)
    setCountdown(3)
    setPhase('countdown')

    // 3-second countdown
    let count = 3
    const tick = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(tick)
        playSequence(seq)
      }
    }, 1000)
  }, [playSequence])

  // ── Block click ──
  function handleBlockClick(id: number) {
    if (phase !== 'responding') return
    if (userSeq.includes(id)) return   // don't allow duplicate in sequence
    setUserSeq((prev) => [...prev, id])
  }

  // ── Submit (S button) ──
  function handleSubmit() {
    if (phase !== 'responding') return
    const isCorrect = sequencesMatch(userSeq, sequence)
    const record: AttemptRecord = {
      attemptNumber: attempt,
      sequenceLength: sequence.length,
      targetSequence: sequence,
      userSequence: userSeq,
      isCorrect,
    }
    const updatedRecords = [...records, record]
    setRecords(updatedRecords)
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    setPhase('feedback')

    timerRef.current = setTimeout(() => {
      if (attempt >= TOTAL_ATTEMPTS) {
        // Done
        const score = updatedRecords.filter((r) => r.isCorrect).length
        const finalResult: CorsiResult = {
          attempts: updatedRecords,
          score,
          maxScore: TOTAL_ATTEMPTS,
          completedAt: new Date().toISOString(),
        }
        sessionStorage.setItem(CORSI_STORAGE_KEY, JSON.stringify(finalResult))
        const trials = finalResult.attempts.map((a, i) => ({
          question_index: i,
          question_id: `corsi-attempt-${a.attemptNumber}`,
          selected: a.userSequence,
          free_text: JSON.stringify({ target: a.targetSequence, length: a.sequenceLength }),
          correct: a.isCorrect,
          score: a.isCorrect ? 1 : 0,
          reaction_time_ms: null,
        }))
        persistCompletedTestSessionBestEffort({
          testId: CORSI_TEST_ID,
          completedAt: finalResult.completedAt,
          totalMs: null,
          score: Math.round((finalResult.score / finalResult.maxScore) * 100),
          correctCount: finalResult.score,
          totalQuestions: finalResult.maxScore,
          trials,
          metadata: { source: 'corsi' },
        })
        setResult(finalResult)
        setPhase('done')
      } else {
        setAttempt((a) => a + 1)
        startAttempt(attempt + 1)
      }
    }, 1500)
  }

  // ── Clear last block click ──
  function handleUndo() {
    setUserSeq((prev) => prev.slice(0, -1))
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return <IntroScreen onBegin={() => startAttempt(1)} />
  }
  if (phase === 'done' && result) {
    return <ScoreScreen result={result} />
  }

  const isResponding = phase === 'responding'
  const isShowingOrCountdown = phase === 'countdown' || phase === 'showing'

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Blocs de Corsi</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_ATTEMPTS }).map((_, i) => (
              <div
                key={i}
                className={[
                  'w-3 h-3 rounded-full border-2 transition-all',
                  i < attempt - 1
                    ? records[i]?.isCorrect
                      ? 'bg-green-500 border-green-500'
                      : 'bg-red-400 border-red-400'
                    : i === attempt - 1
                      ? 'bg-primary border-primary scale-125'
                      : 'bg-muted border-border',
                ].join(' ')}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Essai {attempt} / {TOTAL_ATTEMPTS}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 pt-6 pb-8">
        <div className="w-full max-w-2xl space-y-5">

          {/* Status banner */}
          <div className={[
            'rounded-xl px-5 py-3 text-center font-semibold text-sm transition-all',
            phase === 'countdown'
              ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : phase === 'showing'
                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                : phase === 'responding'
                  ? 'bg-primary/5 border border-primary/20 text-primary'
                  : feedback === 'correct'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-600',
          ].join(' ')}>
            {phase === 'countdown' && `Préparez-vous... ${countdown}`}
            {phase === 'showing'   && 'Observez la séquence...'}
            {phase === 'responding' && `Reproduisez la séquence — ${userSeq.length} / ${sequence.length} bloc(s) sélectionné(s)`}
            {phase === 'feedback' && feedback === 'correct'   && '✓ Séquence correcte !'}
            {phase === 'feedback' && feedback === 'incorrect' && '✗ Séquence incorrecte'}
          </div>

          {/* Sequence length badge */}
          <div className="flex justify-center gap-2">
            {sequence.map((_, i) => (
              <div
                key={i}
                className={[
                  'w-7 h-7 rounded-lg border-2 transition-all text-xs font-bold flex items-center justify-center',
                  i < userSeq.length
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted/50 border-border text-muted-foreground',
                ].join(' ')}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Block grid */}
          <BlockGrid
            lit={litBlock}
            selected={userSeq}
            phase={phase}
            onClick={handleBlockClick}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {isResponding && (
              <Button
                variant="outline"
                onClick={handleUndo}
                disabled={userSeq.length === 0}
                className="px-5"
              >
                ← Annuler dernier
              </Button>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!isResponding || userSeq.length === 0}
              className={[
                'px-8 h-12 text-base font-bold tracking-widest',
                isResponding && userSeq.length > 0
                  ? 'bg-primary hover:bg-primary/90'
                  : 'opacity-50',
              ].join(' ')}
            >
              S
            </Button>
          </div>

          {isShowingOrCountdown && (
            <p className="text-center text-xs text-muted-foreground">
              Ne cliquez pas pendant la séquence
            </p>
          )}
          {isResponding && (
            <p className="text-center text-xs text-muted-foreground">
              Cliquez sur les blocs dans le bon ordre, puis appuyez sur <strong>S</strong> pour confirmer.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
