'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Timer } from '@/components/timer'
import {
  VISUO_CONSTRUCTIVE_QUESTION_COUNT,
  VISUO_CONSTRUCTIVE_FIRST_PAGE,
  VISUO_CONSTRUCTIVE_TEST_ID,
  VISUO_CONSTRUCTIVE_ANSWER_KEY,
  getConstructiveImagePath,
  computeCorrectCount,
  saveVisuoConstructiveSession,
  loadVisuoConstructiveSession,
  clearVisuoConstructiveSession,
  saveVisuoConstructiveResult,
  type VisuoConstructiveSession,
  type VisuoConstructiveResult,
  type VisualPuzzleItemResponse,
  type VisualPuzzleOption,
} from '@/lib/visuo-constructive'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const TEST_DURATION_SECONDS = 2400 // 40 min

const OPTIONS: VisualPuzzleOption[] = ['A', 'B', 'C', 'D']

function createEmptySession(): VisuoConstructiveSession {
  const now = new Date().toISOString()
  const responses: VisualPuzzleItemResponse[] = Array.from(
    { length: VISUO_CONSTRUCTIVE_QUESTION_COUNT },
    (_, i) => ({
      questionNumber: i + 1,
      selectedOption: null,
      answeredAt: null,
    })
  )
  return {
    testId: VISUO_CONSTRUCTIVE_TEST_ID,
    startedAt: now,
    responses,
  }
}

export function VisuoConstructiveTest() {
  const router = useRouter()
  const [session, setSession] = useState<VisuoConstructiveSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)

  useEffect(() => {
    const loaded = loadVisuoConstructiveSession()
    if (
      loaded &&
      loaded.responses.length === VISUO_CONSTRUCTIVE_QUESTION_COUNT
    ) {
      setSession(loaded)
    } else {
      const newSession = createEmptySession()
      setSession(newSession)
      saveVisuoConstructiveSession(newSession)
    }
  }, [])

  const currentResponse = session?.responses[currentQuestion - 1] ?? null
  const selectedOption = currentResponse?.selectedOption ?? null

  const setSelectedOption = useCallback(
    (option: VisualPuzzleOption) => {
      if (!session) return
      const now = new Date().toISOString()
      const next = {
        ...session,
        responses: session.responses.map((r) =>
          r.questionNumber === currentQuestion
            ? { ...r, selectedOption: option, answeredAt: now }
            : r
        ),
      }
      setSession(next)
      saveVisuoConstructiveSession(next)
    },
    [session, currentQuestion]
  )

  const handleNext = useCallback(() => {
    if (currentQuestion < VISUO_CONSTRUCTIVE_QUESTION_COUNT) {
      setCurrentQuestion((q) => q + 1)
    }
  }, [currentQuestion])

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 1) {
      setCurrentQuestion((q) => q - 1)
    }
  }, [currentQuestion])

  const handleSubmit = useCallback(() => {
    if (!session) return
    const answeredCount = session.responses.filter(
      (r) => r.selectedOption !== null
    ).length
    const correctCount = computeCorrectCount(
      session.responses,
      VISUO_CONSTRUCTIVE_ANSWER_KEY
    )
    const scorePercent =
      correctCount !== null && VISUO_CONSTRUCTIVE_QUESTION_COUNT > 0
        ? Math.round(
            (correctCount / VISUO_CONSTRUCTIVE_QUESTION_COUNT) * 100
          )
        : null
    const result: VisuoConstructiveResult = {
      session,
      totalQuestions: VISUO_CONSTRUCTIVE_QUESTION_COUNT,
      answeredCount,
      correctCount: correctCount ?? null,
      scorePercent,
      completedAt: new Date().toISOString(),
    }
    saveVisuoConstructiveResult(result)
    clearVisuoConstructiveSession()
    router.push('/results/visuo-constructive')
  }, [session, router])

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading test…</p>
      </div>
    )
  }

  const answeredCount = session.responses.filter(
    (r) => r.selectedOption !== null
  ).length
  const isLastQuestion = currentQuestion === VISUO_CONSTRUCTIVE_QUESTION_COUNT

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">
              WAIS Visual Puzzles – Visuo-Constructive
            </h1>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestion} of {VISUO_CONSTRUCTIVE_QUESTION_COUNT}
            </p>
          </div>
          <Timer
            initialSeconds={TEST_DURATION_SECONDS}
            onTimeUp={handleSubmit}
          />
        </div>
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-sm font-bold text-foreground">
                {Math.round(
                  (currentQuestion / VISUO_CONSTRUCTIVE_QUESTION_COUNT) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(currentQuestion / VISUO_CONSTRUCTIVE_QUESTION_COUNT) * 100}%`,
                }}
              />
            </div>
          </div>

          <Card className="mb-8 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Question {currentQuestion}
              </CardTitle>
              <CardDescription>
                Select the correct answer (Option A, B, C, or D) for the puzzle
                below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center bg-muted/30 rounded-lg p-4 min-h-[280px]">
                <PuzzleImage questionNumber={currentQuestion} />
              </div>

              <div className="border-t border-border pt-6">
                <Label className="text-base font-medium mb-3 block">
                  Your answer
                </Label>
                <RadioGroup
                  value={selectedOption ?? ''}
                  onValueChange={(v) =>
                    setSelectedOption(v as VisualPuzzleOption)
                  }
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {OPTIONS.map((opt) => (
                    <div
                      key={opt}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg border-2 p-4 transition-colors',
                        selectedOption === opt
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/50'
                      )}
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`q${currentQuestion}-${opt}`}
                      />
                      <Label
                        htmlFor={`q${currentQuestion}-${opt}`}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        Option {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2 flex-wrap justify-center max-w-full overflow-x-auto">
              {Array.from({
                length: Math.min(VISUO_CONSTRUCTIVE_QUESTION_COUNT, 20),
              }).map((_, i) => {
                const num = i + 1
                const isActive = currentQuestion === num
                const hasAnswer = session.responses[num - 1]?.selectedOption
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentQuestion(num)}
                    className={cn(
                      'w-9 h-9 rounded-lg font-medium transition-colors border-2 text-sm shrink-0',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : hasAnswer
                          ? 'bg-primary/20 border-primary/50 text-foreground'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {num}
                  </button>
                )
              })}
              {VISUO_CONSTRUCTIVE_QUESTION_COUNT > 20 && (
                <span className="text-muted-foreground text-sm self-center">
                  …
                </span>
              )}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                className="bg-success hover:bg-success/90 text-white"
              >
                Submit test
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next question
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {answeredCount} of {VISUO_CONSTRUCTIVE_QUESTION_COUNT} answered
          </p>
        </div>
      </div>
    </div>
  )
}

function PuzzleImage({ questionNumber }: { questionNumber: number }) {
  const src = getConstructiveImagePath(questionNumber)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground text-sm p-6 text-center max-w-md">
        <p>Question {questionNumber} image not found.</p>
        <p className="text-xs mt-2">
          Add constructive_page-
          {String(VISUO_CONSTRUCTIVE_FIRST_PAGE + questionNumber - 1).padStart(4, '0')}
          .jpg to /public/images/
        </p>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Visual puzzle question ${questionNumber}`}
      className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
      onError={() => setError(true)}
    />
  )
}
