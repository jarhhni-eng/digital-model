'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  cuttingQuestions,
  computeCuttingResult,
  NUM_CHOICES,
  MENTAL_CUTTING_STORAGE_KEY,
  MENTAL_CUTTING_TEST_ID,
  TOTAL_QUESTIONS,
  type CuttingResult,
} from '@/lib/mental-cutting-test'
import { TestIntroSection } from '@/components/assessment/test-intro-section'
import { Scissors, CheckCircle, XCircle, ChevronRight, BookOpen } from 'lucide-react'

// ─── Image with fallback ──────────────────────────────────────────────────────
function CuttingImage({ src, qNum }: { src: string; qNum: number }) {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className="w-full aspect-video max-w-xl mx-auto rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center gap-2">
        <Scissors className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">transformation {qNum}.jpg</p>
        <p className="text-xs text-muted-foreground/60">
          Déposez l&apos;image dans <code className="bg-muted px-1 rounded">public/transformation/</code>
        </p>
      </div>
    )
  }
  return (
    <div className="relative w-full aspect-video max-w-xl mx-auto rounded-2xl overflow-hidden border border-border bg-white shadow-md">
      <Image
        src={src}
        alt={`Transformation ${qNum}`}
        fill
        className="object-contain p-3"
        onError={() => setError(true)}
        priority
      />
    </div>
  )
}

// ─── Introduction page ────────────────────────────────────────────────────────
function IntroScreen({ onBegin }: { onBegin: () => void }) {
  const [showRefs, setShowRefs] = useState(false)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Mental Cutting Test</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Transformations Mentales — Visualisation Spatiale
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Le <strong className="text-foreground">Mental Cutting Test (MCT)</strong> est un outil
            d'évaluation largement utilisé pour mesurer les capacités de visualisation spatiale,
            en particulier l'aptitude à représenter mentalement la section d'un objet
            tridimensionnel par un plan de coupe. Ce test s'est progressivement imposé comme une
            référence dans l'étude des compétences cognitives liées à la transformation mentale
            des formes géométriques.
          </p>
          <p>
            Le principe du MCT repose sur la présentation de solides géométriques traversés par
            un plan imaginaire. Le sujet doit alors identifier, parmi plusieurs propositions, la
            forme exacte de la section obtenue.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">15</p>
              <p className="text-xs">questions</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">5</p>
              <p className="text-xs">choix / question</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-foreground">1 pt</p>
              <p className="text-xs">par bonne réponse</p>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-foreground">
            <p className="font-semibold text-primary mb-2">Instructions</p>
            <ul className="space-y-1.5 text-sm">
              <li>• Chaque question présente un solide 3D coupé par un plan imaginaire.</li>
              <li>• Identifiez la section résultante parmi les 5 propositions (1 à 5).</li>
              <li>• <strong>Une seule réponse correcte</strong> par question.</li>
              <li>• Utilisez le bouton <em>Suivant</em> pour avancer.</li>
              <li>• La correction détaillée s'affiche à la fin.</li>
            </ul>
          </div>

          {/* References */}
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="flex items-center gap-1.5 text-xs text-primary underline underline-offset-2"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {showRefs ? 'Masquer les références' : 'Références fondamentales (3)'}
          </button>
          {showRefs && (
            <div className="space-y-3 text-xs text-muted-foreground/80 border-l-2 border-primary/20 pl-3">
              <div>
                <p className="font-semibold text-foreground">CEEB (1939)</p>
                <p>Mental Cutting Test.</p>
                <p className="italic">Test développé initialement pour les examens d'entrée universitaires aux États-Unis.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Németh, B. (2007)</p>
                <p>Measurement of the development of spatial ability by Mental Cutting Test.</p>
                <p className="italic">Annales Mathematicae et Informaticae. — Étude classique montrant l'utilisation du MCT pour mesurer les capacités spatiales.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Sorby, S. A.</p>
                <p>Developing 3-D Spatial Visualization Skills.</p>
                <p className="italic">Engineering Design Graphics Journal. — Travaux sur le lien entre MCT et compétences en visualisation 3D.</p>
              </div>
            </div>
          )}
        </div>

        <TestIntroSection testId={MENTAL_CUTTING_TEST_ID} />

        <Button className="w-full h-12 text-base font-semibold" onClick={onBegin}>
          Commencer le test
        </Button>
      </div>
    </div>
  )
}

// ─── Score screen ─────────────────────────────────────────────────────────────
function ScoreScreen({ result }: { result: CuttingResult }) {
  const router = useRouter()
  const color =
    result.percentage >= 75
      ? 'text-green-600'
      : result.percentage >= 50
        ? 'text-amber-500'
        : 'text-red-600'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">

        <div className="text-center space-y-2">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Test terminé !</h1>
          <p className="text-sm text-muted-foreground">Mental Cutting Test — Transformations Spatiales</p>
        </div>

        {/* Main score */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
          <p className={`text-6xl font-bold tabular-nums ${color}`}>
            {result.score}
            <span className="text-2xl text-muted-foreground">/{result.total}</span>
          </p>
          <p className={`text-xl font-semibold ${color}`}>{result.percentage}%</p>
          <div className="mt-2">
            <Progress value={result.percentage} className="h-2.5" />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-3xl font-bold text-green-700">{result.score}</p>
            <p className="text-xs text-green-600 mt-1">Réponses correctes</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-3xl font-bold text-red-700">{result.total - result.score}</p>
            <p className="text-xs text-red-600 mt-1">Réponses incorrectes</p>
          </div>
        </div>

        {/* Incorrect questions */}
        {result.mistakes.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Questions incorrectes
            </p>
            <div className="flex flex-wrap gap-2">
              {result.mistakes.map((qNum) => (
                <Badge key={qNum} variant="destructive" className="text-xs">
                  Q{qNum}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Per-question detail */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 max-h-64 overflow-y-auto">
          <p className="text-sm font-semibold mb-2">Détail par question</p>
          {result.responses.map((r) => (
            <div
              key={r.questionNumber}
              className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                r.isCorrect
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-red-50 border border-red-100'
              }`}
            >
              <span className="font-medium">Q{r.questionNumber}</span>
              <span className="text-muted-foreground">
                Votre réponse : <strong>{r.selected ?? '—'}</strong>
              </span>
              {r.isCorrect ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-500" />
              )}
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

// ─── Main test ────────────────────────────────────────────────────────────────
export function MentalCuttingTest() {
  const [phase, setPhase] = useState<'intro' | 'test' | 'done'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | null>>({})
  const [result, setResult] = useState<CuttingResult | null>(null)

  const q = cuttingQuestions[currentIndex]!
  const isLast = currentIndex === TOTAL_QUESTIONS - 1
  const selected = answers[q.number] ?? null
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100

  function handleSelect(choice: number) {
    setAnswers((prev) => ({ ...prev, [q.number]: choice }))
  }

  function handleNext() {
    setCurrentIndex((i) => i + 1)
  }

  function handleSubmit() {
    const r = computeCuttingResult(answers)
    sessionStorage.setItem(MENTAL_CUTTING_STORAGE_KEY, JSON.stringify(r))
    setResult(r)
    setPhase('done')
  }

  if (phase === 'intro') return <IntroScreen onBegin={() => setPhase('test')} />
  if (phase === 'done' && result) return <ScoreScreen result={result} />

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Mental Cutting Test</span>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            Question {currentIndex + 1} / {TOTAL_QUESTIONS}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {Object.keys(answers).length}/{TOTAL_QUESTIONS} répondues
          </span>
        </div>
        <div className="max-w-2xl mx-auto mt-2">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-6">

          {/* Question header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Question <span className="text-primary font-bold">{q.number}</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              1 seule réponse correcte
            </span>
          </div>

          {/* Question image */}
          <CuttingImage src={q.imagePath} qNum={q.number} />

          {/* Question text */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 px-5 py-3 text-center">
            <p className="text-base font-semibold text-primary">
              Quelle est la section obtenue après la coupe du solide ?
            </p>
          </div>

          {/* Choices 1–5 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground text-center mb-3">
              Sélectionnez votre réponse :
            </p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: NUM_CHOICES }, (_, i) => i + 1).map((n) => {
                const isSelected = selected === n
                return (
                  <button
                    key={n}
                    onClick={() => handleSelect(n)}
                    className={[
                      'rounded-xl border-2 h-16 text-2xl font-bold transition-all duration-150',
                      'flex items-center justify-center',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 text-foreground',
                    ].join(' ')}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pb-8">
            {/* Dot progress */}
            <div className="flex gap-1.5 flex-wrap">
              {cuttingQuestions.map((sq, i) => (
                <div
                  key={sq.number}
                  className={[
                    'w-2.5 h-2.5 rounded-full transition-all',
                    i === currentIndex
                      ? 'bg-primary scale-125'
                      : answers[sq.number] != null
                        ? 'bg-primary/50'
                        : 'bg-muted-foreground/30',
                  ].join(' ')}
                />
              ))}
            </div>

            {isLast ? (
              <Button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6"
              >
                <CheckCircle className="w-4 h-4" />
                Soumettre
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selected === null}
                className="flex items-center gap-2 px-6"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {selected === null && !isLast && (
            <p className="text-center text-xs text-muted-foreground pb-2">
              Sélectionnez une réponse pour continuer.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
