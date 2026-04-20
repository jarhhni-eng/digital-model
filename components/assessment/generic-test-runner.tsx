'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Timer } from '@/components/timer'
import { mockTestQuestions } from '@/lib/mock-data'
import { getTestMetadata } from '@/lib/test-metadata'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Test } from '@/lib/mock-data'

type Phase = 'intro' | 'instructions' | 'run'

interface GenericTestRunnerProps {
  test: Test | undefined
}

export function GenericTestRunner({ test }: GenericTestRunnerProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const testId = test?.id ?? 'unknown'

  const [phase, setPhase] = useState<Phase>('intro')
  const [acceptedInstructions, setAcceptedInstructions] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const testStartRef = useRef<string | null>(null)
  const questionEnteredAt = useRef<number>(Date.now())
  const questionTimesMs = useRef<Record<number, number>>({})

  const answersRef = useRef<Record<string, string>>({})

  const questions = test?.questions?.length ? test.questions : mockTestQuestions
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const meta = getTestMetadata(testId)
  const testTitle = test?.title ?? 'Assessment Test'
  const testDuration = test?.duration ?? 1800

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && currentQuestion?.type === 'drawing') {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [currentQuestion.type, currentQuestionIndex])

  useEffect(() => {
    questionEnteredAt.current = Date.now()
    const q = questions[currentQuestionIndex]
    if (q.type === 'mcq') setSelectedOption(answersRef.current[q.id] ?? null)
    if (q.type === 'text') setTextAnswer(answersRef.current[q.id] ?? '')
  }, [currentQuestionIndex, questions])

  const recordTimeForCurrentQuestion = useCallback(() => {
    const elapsed = Date.now() - questionEnteredAt.current
    const prev = questionTimesMs.current[currentQuestionIndex] ?? 0
    questionTimesMs.current[currentQuestionIndex] = prev + elapsed
    questionEnteredAt.current = Date.now()
  }, [currentQuestionIndex])

  const persistCurrentAnswer = useCallback(() => {
    const q = questions[currentQuestionIndex]
    if (q.type === 'mcq' && selectedOption) answersRef.current[q.id] = selectedOption
    if (q.type === 'text') answersRef.current[q.id] = textAnswer
    if (q.type === 'drawing' && canvasRef.current) {
      try {
        answersRef.current[q.id] = canvasRef.current.toDataURL('image/png')
      } catch {
        answersRef.current[q.id] = ''
      }
    }
  }, [currentQuestionIndex, selectedOption, textAnswer, questions])

  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentQuestion.type !== 'drawing') return
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      }
    }
  }

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentQuestion.type !== 'drawing') return
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke()
      }
    }
  }

  const handleDrawEnd = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const handleNext = () => {
    persistCurrentAnswer()
    recordTimeForCurrentQuestion()
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1)
    }
  }

  const handlePrevious = () => {
    recordTimeForCurrentQuestion()
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save your test.',
        variant: 'destructive',
      })
      return
    }
    persistCurrentAnswer()
    recordTimeForCurrentQuestion()
    setIsSubmitting(true)
    const startedAt = testStartRef.current ?? new Date().toISOString()
    const answers = questions.map((q, idx) => ({
      questionId: q.id,
      selectedValue: answersRef.current[q.id] ?? null,
      timeSpentMs: questionTimesMs.current[idx] ?? null,
    }))
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          testId,
          startedAt,
          answers,
        }),
      })
      if (!res.ok) throw new Error('Submit failed')
      toast({
        title: 'Test completed and saved successfully',
        description: 'Your responses have been recorded.',
      })
      router.push('/dashboard')
    } catch {
      toast({
        title: 'Save failed',
        description: 'Could not submit. Try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const beginTest = () => {
    if (!acceptedInstructions) return
    testStartRef.current = new Date().toISOString()
    questionEnteredAt.current = Date.now()
    setPhase('run')
  }

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{testTitle} — Theoretical introduction</CardTitle>
              <CardDescription>Read before you continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Definition:</strong> {meta.definition}</p>
              <p><strong className="text-foreground">Scientific background:</strong> {meta.background}</p>
              <p><strong className="text-foreground">Author / adaptation:</strong> {meta.author}</p>
              <p><strong className="text-foreground">Source:</strong> {meta.source}</p>
              <p><strong className="text-foreground">Objective:</strong> {meta.objective}</p>
            </CardContent>
          </Card>
          <Button onClick={() => setPhase('instructions')} className="w-full sm:w-auto">
            Continue to instructions
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{meta.instructions}</p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accept"
                  checked={acceptedInstructions}
                  onCheckedChange={(c) => setAcceptedInstructions(!!c)}
                />
                <Label htmlFor="accept" className="text-sm font-medium leading-none">
                  I have read and accept the instructions. I understand that scores are shown after submission.
                </Label>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPhase('intro')}>
              Back
            </Button>
            <Button onClick={beginTest} disabled={!acceptedInstructions}>
              Start test
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">{testTitle}</h1>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <Timer initialSeconds={testDuration} onTimeUp={handleSubmit} />
        </div>
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-bold text-foreground">
                {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>

          <Card className="mb-8 shadow-sm">
            <CardHeader>
              {(currentQuestion.label || currentQuestion.competencyCode) && (
                <div className="flex items-center gap-2 mb-2">
                  {currentQuestion.label && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {currentQuestion.label}
                    </span>
                  )}
                  {currentQuestion.competencyCode && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                      {currentQuestion.competencyCode}
                    </span>
                  )}
                </div>
              )}
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              {currentQuestion.instructions && (
                <CardDescription className="mt-2 text-base">
                  {currentQuestion.instructions}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {currentQuestion.type === 'mcq' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedOption(option)}
                      className={cn(
                        'w-full p-4 text-left rounded-lg border-2 transition-all font-medium min-h-[56px]',
                        selectedOption === option
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-card border-border text-foreground hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            selectedOption === option
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          )}
                        >
                          {selectedOption === option && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <div>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none min-h-48 resize-none"
                  />
                </div>
              )}

              {currentQuestion.type === 'drawing' && (
                <div className="space-y-4">
                  <div className="bg-background border-2 border-border rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      onMouseDown={handleDrawStart}
                      onMouseMove={handleDrawMove}
                      onMouseUp={handleDrawEnd}
                      onMouseLeave={handleDrawEnd}
                      className="w-full cursor-crosshair bg-white"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    Clear Canvas
                  </Button>
                </div>
              )}

              {currentQuestion.type === 'audio' && (
                <div className="space-y-4">
                  <div className="bg-secondary/5 border-2 border-secondary/20 rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center animate-pulse">
                        <Mic className="w-8 h-8 text-secondary" />
                      </div>
                    </div>
                    <p className="font-medium text-foreground mb-2">Ready to Record</p>
                    <Button variant="outline" size="sm">
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2 flex-wrap justify-center max-w-[50%]">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    persistCurrentAnswer()
                    recordTimeForCurrentQuestion()
                    setCurrentQuestionIndex(index)
                  }}
                  className={cn(
                    'w-10 h-10 rounded-lg font-medium transition-colors border-2 text-sm',
                    currentQuestionIndex === index
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-primary'
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-success hover:bg-success/90 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Save / Submit Test'}
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
