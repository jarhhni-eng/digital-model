'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer } from '@/components/timer'
import { DrawingCanvas, DrawingToolToggle } from './drawing-canvas'
import {
  BEERY_VMI_SHAPE_COUNT,
  BEERY_VMI_TEST_ID,
  getBeeryShapeImagePath,
  type BeeryItemResponse,
  type BeeryVMISession,
  type BeeryVMIResult,
  type BeeryErrorAnalysis,
  type BeeryDrawingTool,
  saveBeerySession,
  loadBeerySession,
  clearBeerySession,
  saveBeeryResult,
  computeBeeryRawScore,
  rawToStandardScore,
  standardScoreToPercentile,
  computeBeeryProfile,
} from '@/lib/beery-vmi'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const TEST_DURATION_SECONDS = 2400 // 40 min

function createEmptySession(): BeeryVMISession {
  const now = new Date().toISOString()
  const responses: BeeryItemResponse[] = Array.from({ length: BEERY_VMI_SHAPE_COUNT }, (_, i) => ({
    itemIndex: i + 1,
    drawingDataUrl: null,
    startedAt: now,
    completedAt: null,
    completed: false,
  }))
  return {
    testId: BEERY_VMI_TEST_ID,
    startedAt: now,
    responses,
  }
}

export function BeeryVMITest() {
  const router = useRouter()
  const [session, setSession] = useState<BeeryVMISession | null>(null)
  const [currentItem, setCurrentItem] = useState(1)
  const [tool, setTool] = useState<BeeryDrawingTool>('pencil')

  // Load or create session
  useEffect(() => {
    const loaded = loadBeerySession()
    if (loaded && loaded.responses.length === BEERY_VMI_SHAPE_COUNT) {
      setSession(loaded)
    } else {
      const newSession = createEmptySession()
      setSession(newSession)
      saveBeerySession(newSession)
    }
  }, [])

  const currentResponse = session?.responses[currentItem - 1] ?? null
  const currentDrawingUrl = currentResponse?.drawingDataUrl ?? null

  const updateCurrentResponse = useCallback(
    (updates: Partial<BeeryItemResponse>) => {
      if (!session) return
      const next = {
        ...session,
        responses: session.responses.map((r) =>
          r.itemIndex === currentItem ? { ...r, ...updates } : r
        ),
      }
      setSession(next)
      saveBeerySession(next)
    },
    [session, currentItem]
  )

  const handleDrawingChange = useCallback(
    (dataUrl: string) => {
      const now = new Date().toISOString()
      updateCurrentResponse({
        drawingDataUrl: dataUrl,
        completedAt: now,
        completed: true,
      })
    },
    [updateCurrentResponse]
  )

  const handleNext = useCallback(() => {
    if (currentItem < BEERY_VMI_SHAPE_COUNT) {
      setCurrentItem((i) => i + 1)
    }
  }, [currentItem])

  const handlePrevious = useCallback(() => {
    if (currentItem > 1) {
      setCurrentItem((i) => i - 1)
    }
  }, [currentItem])

  const handleSubmit = useCallback(() => {
    if (!session) return
    const rawScore = computeBeeryRawScore(session.responses)
    const standardScore = rawToStandardScore(rawScore)
    const percentile = standardScoreToPercentile(standardScore)
    const errorAnalysis: BeeryErrorAnalysis[] = session.responses.map((r) => ({
      itemIndex: r.itemIndex,
      visualPerception: false,
      visualMotorIntegration: false,
      motorCoordination: false,
    }))
    const profile = computeBeeryProfile(rawScore, errorAnalysis)
    const result: BeeryVMIResult = {
      session,
      rawScore,
      standardScore,
      percentile,
      profile,
      errorAnalysis,
      completedAt: new Date().toISOString(),
    }
    saveBeeryResult(result)
    clearBeerySession()
    router.push('/results/beery-vmi')
  }, [session, router])

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading test…</p>
      </div>
    )
  }

  const completedCount = session.responses.filter((r) => r.completed).length
  const isLastItem = currentItem === BEERY_VMI_SHAPE_COUNT

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">Beery VMI – Visuo-Motor Capacity</h1>
            <p className="text-xs text-muted-foreground">
              Shape {currentItem} of {BEERY_VMI_SHAPE_COUNT} • Copy the shape in the drawing area
            </p>
          </div>
          <Timer initialSeconds={TEST_DURATION_SECONDS} onTimeUp={handleSubmit} />
        </div>
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-bold text-foreground">
                {Math.round((currentItem / BEERY_VMI_SHAPE_COUNT) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentItem / BEERY_VMI_SHAPE_COUNT) * 100}%` }}
              />
            </div>
          </div>

          <Card className="mb-8 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Item {currentItem}</CardTitle>
              <CardDescription>
                Look at the shape on the left. Draw the same shape in the box on the right. Use
                pencil or erase, then go to the next shape.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Model shape */}
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Model</p>
                  <div className="aspect-square max-w-[400px] w-full border-2 border-border rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    <ModelShapeImage itemNumber={currentItem} />
                  </div>
                </div>
                {/* Drawing area */}
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Your drawing</p>
                  <div className="flex flex-col gap-2">
                    <DrawingToolToggle tool={tool} onToolChange={setTool} />
                    <DrawingCanvas
                      tool={tool}
                      initialDataUrl={currentDrawingUrl}
                      onDrawingChange={handleDrawingChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentItem === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: Math.min(BEERY_VMI_SHAPE_COUNT, 15) }).map((_, i) => {
                const num = i + 1
                const isActive = currentItem === num
                const hasDrawing = session.responses[num - 1]?.completed
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentItem(num)}
                    className={cn(
                      'w-9 h-9 rounded-lg font-medium transition-colors border-2 text-sm',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : hasDrawing
                          ? 'bg-primary/20 border-primary/50 text-foreground'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {num}
                  </button>
                )
              })}
              {BEERY_VMI_SHAPE_COUNT > 15 && (
                <span className="text-muted-foreground text-sm self-center">…</span>
              )}
            </div>

            {isLastItem ? (
              <Button
                onClick={handleSubmit}
                className="bg-success hover:bg-success/90 text-white"
              >
                Finish test
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {completedCount} of {BEERY_VMI_SHAPE_COUNT} shapes drawn
          </p>
        </div>
      </div>
    </div>
  )
}

function ModelShapeImage({ itemNumber }: { itemNumber: number }) {
  const src = getBeeryShapeImagePath(itemNumber)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
        Shape {itemNumber}
        <br />
        <span className="text-xs">(Add shape_{itemNumber}.png to /public/beery-vmi/)</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Beery VMI shape ${itemNumber}`}
      className="object-contain w-full h-full max-w-full max-h-full"
      onError={() => setError(true)}
    />
  )
}
