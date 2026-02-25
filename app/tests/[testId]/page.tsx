'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer } from '@/components/timer'
import { mockTestQuestions } from '@/lib/mock-data'
import { ChevronLeft, ChevronRight, Volume2, Mic, Download, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestPageProps {
  params: {
    testId: string
  }
}

export default function TestPage({ params }: TestPageProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number | null>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const currentQuestion = mockTestQuestions[currentQuestionIndex]
  const totalQuestions = mockTestQuestions.length

  // Canvas drawing setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && currentQuestion.type === 'drawing') {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [currentQuestion.type])

  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentQuestion.type !== 'drawing') return
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(
          e.clientX - rect.left,
          e.clientY - rect.top
        )
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
        ctx.lineTo(
          e.clientX - rect.left,
          e.clientY - rect.top
        )
        ctx.stroke()
      }
    }
  }

  const handleDrawEnd = () => {
    setIsDrawing(false)
  }

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
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption(null)
      setTextAnswer('')
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedOption(null)
      setTextAnswer('')
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/results')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">Assessment Test</h1>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <Timer initialSeconds={1800} onTimeUp={handleSubmit} />
        </div>
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </span>
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

          {/* Question Card */}
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              {currentQuestion.instructions && (
                <CardDescription className="mt-2 text-base">
                  {currentQuestion.instructions}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* MCQ Type */}
              {currentQuestion.type === 'mcq' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(option)}
                      className={cn(
                        'w-full p-4 text-left rounded-lg border-2 transition-all font-medium',
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

              {/* Text Answer Type */}
              {currentQuestion.type === 'text' && (
                <div>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none min-h-48 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {textAnswer.length} characters
                  </p>
                </div>
              )}

              {/* Drawing Canvas Type */}
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
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                      className="flex-1"
                    >
                      Clear Canvas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save Drawing
                    </Button>
                  </div>
                </div>
              )}

              {/* Audio Recording Type */}
              {currentQuestion.type === 'audio' && (
                <div className="space-y-4">
                  <div className="bg-secondary/5 border-2 border-secondary/20 rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center animate-pulse">
                        <Mic className="w-8 h-8 text-secondary" />
                      </div>
                    </div>
                    <p className="font-medium text-foreground mb-2">
                      Ready to Record
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click start to begin recording your response
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" size="sm">
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={cn(
                    'w-10 h-10 rounded-lg font-medium transition-colors border-2',
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
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
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
