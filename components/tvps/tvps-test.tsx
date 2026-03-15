'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Timer } from '@/components/timer'
import { ParticipantForm } from './participant-form'
import {
  TVPS_SUBTESTS,
  TVPS_TOTAL_ITEMS,
  TVPS_TEST_ID,
  TVPS_ANSWER_KEY,
  getTVPSImagePath,
  getSubtestForItem,
  createEmptyTVPSSession,
  saveTVPSSession,
  loadTVPSSession,
  clearTVPSSession,
  saveTVPSResult,
  computeTVPSResult,
  type TVPSSession,
  type TVPSItemResponse,
  type TVPSOption,
  type TVPSParticipantInfo,
} from '@/lib/tvps'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const TEST_DURATION_SECONDS = 3600 // 60 min for full test
const OPTIONS: TVPSOption[] = ['A', 'B', 'C', 'D']

export function TVPSTest() {
  const router = useRouter()
  const [session, setSession] = useState<TVPSSession | null>(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(1)

  useEffect(() => {
    const loaded = loadTVPSSession()
    if (loaded && loaded.responses.length === TVPS_TOTAL_ITEMS) {
      setSession(loaded)
    } else {
      const newSession = createEmptyTVPSSession(null)
      setSession(newSession)
      saveTVPSSession(newSession)
    }
  }, [])

  // Record shownAt when item is displayed (for response time)
  useEffect(() => {
    if (!session || session.participantInfo === null) return
    const now = new Date().toISOString()
    setSession((prev) => {
      if (!prev) return prev
      const res = prev.responses[currentItemIndex - 1]
      if (res.shownAt) return prev
      const next = {
        ...prev,
        responses: prev.responses.map((r) =>
          r.itemIndex === currentItemIndex
            ? { ...r, shownAt: now }
            : r
        ),
      }
      saveTVPSSession(next)
      return next
    })
  }, [currentItemIndex, session?.participantInfo])

  const handleParticipantSubmit = useCallback((info: TVPSParticipantInfo) => {
    setSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, participantInfo: info }
      saveTVPSSession(next)
      return next
    })
  }, [])

  const currentResponse = session?.responses[currentItemIndex - 1] ?? null
  const selectedOption = currentResponse?.selectedOption ?? null
  const subtest = getSubtestForItem(currentItemIndex)

  const setSelectedOption = useCallback(
    (option: TVPSOption) => {
      if (!session) return
      const now = new Date().toISOString()
      const res = session.responses[currentItemIndex - 1]
      const shownAt = res?.shownAt ? new Date(res.shownAt).getTime() : null
      const responseTimeMs = shownAt ? Date.now() - shownAt : null
      const correct =
        TVPS_ANSWER_KEY && TVPS_ANSWER_KEY[currentItemIndex - 1] !== undefined
          ? TVPS_ANSWER_KEY[currentItemIndex - 1] === option
          : null
      const next = {
        ...session,
        responses: session.responses.map((r) =>
          r.itemIndex === currentItemIndex
            ? {
                ...r,
                selectedOption: option,
                answeredAt: now,
                responseTimeMs,
                correct,
              }
            : r
        ),
      }
      setSession(next)
      saveTVPSSession(next)
    },
    [session, currentItemIndex]
  )

  const handleNext = useCallback(() => {
    if (currentItemIndex < TVPS_TOTAL_ITEMS) {
      setCurrentItemIndex((i) => i + 1)
    }
  }, [currentItemIndex])

  const handlePrevious = useCallback(() => {
    if (currentItemIndex > 1) {
      setCurrentItemIndex((i) => i - 1)
    }
  }, [currentItemIndex])

  const handleSubmit = useCallback(() => {
    if (!session) return
    const result = computeTVPSResult(session)
    saveTVPSResult(result)
    clearTVPSSession()
    router.push('/results/visuo-perceptive')
  }, [session, router])

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  // Participant form step
  if (session.participantInfo === null) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            TVPS-3 – Visuo-Perceptive Capacity
          </h1>
          <p className="text-muted-foreground mb-8">
            Please enter participant information before starting the test.
          </p>
          <ParticipantForm onSubmit={handleParticipantSubmit} />
        </div>
      </div>
    )
  }

  const answeredCount = session.responses.filter(
    (r) => r.selectedOption !== null
  ).length
  const isLastItem = currentItemIndex === TVPS_TOTAL_ITEMS
  const isFirstInSubtest =
    subtest && currentItemIndex === subtest.startItemIndex

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">TVPS-3 – Visuo-Perceptive</h1>
            <p className="text-xs text-muted-foreground">
              Item {currentItemIndex} of {TVPS_TOTAL_ITEMS}
              {subtest && ` · ${subtest.name}`}
            </p>
          </div>
          <Timer initialSeconds={TEST_DURATION_SECONDS} onTimeUp={handleSubmit} />
        </div>
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {isFirstInSubtest && subtest && (
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="font-medium text-foreground">Subtest: {subtest.name}</p>
              <p className="text-sm text-muted-foreground">
                Items {subtest.startItemIndex}–{subtest.startItemIndex + subtest.itemCount - 1}
              </p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-bold text-foreground">
                {Math.round((currentItemIndex / TVPS_TOTAL_ITEMS) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(currentItemIndex / TVPS_TOTAL_ITEMS) * 100}%`,
                }}
              />
            </div>
          </div>

          <Card className="mb-8 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Item {currentItemIndex}</CardTitle>
              <CardDescription>
                Select the correct answer (A, B, C, or D) for the stimulus below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center bg-muted/30 rounded-lg p-4 min-h-[240px]">
                <ItemImage itemIndex={currentItemIndex} />
              </div>
              <div className="border-t border-border pt-6">
                <Label className="text-base font-medium mb-3 block">Your answer</Label>
                <RadioGroup
                  value={selectedOption ?? ''}
                  onValueChange={(v) => setSelectedOption(v as TVPSOption)}
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
                        id={`item${currentItemIndex}-${opt}`}
                      />
                      <Label
                        htmlFor={`item${currentItemIndex}-${opt}`}
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
              disabled={currentItemIndex === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-2 flex-wrap justify-center max-w-full overflow-x-auto">
              {Array.from({ length: Math.min(TVPS_TOTAL_ITEMS, 24) }).map((_, i) => {
                const num = i + 1
                const isActive = currentItemIndex === num
                const hasAnswer = session.responses[num - 1]?.selectedOption
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentItemIndex(num)}
                    className={cn(
                      'w-8 h-8 rounded-md font-medium transition-colors border-2 text-xs shrink-0',
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
              {TVPS_TOTAL_ITEMS > 24 && (
                <span className="text-muted-foreground text-xs self-center">…</span>
              )}
            </div>
            {isLastItem ? (
              <Button
                onClick={handleSubmit}
                className="bg-success hover:bg-success/90 text-white"
              >
                Submit test
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            {answeredCount} of {TVPS_TOTAL_ITEMS} answered
          </p>
        </div>
      </div>
    </div>
  )
}

function ItemImage({ itemIndex }: { itemIndex: number }) {
  const src = getTVPSImagePath(itemIndex)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground text-sm p-6 text-center max-w-md">
        <p>Item {itemIndex} image not found.</p>
        <p className="text-xs mt-2">
          Add TVPS_page-{String(itemIndex).padStart(4, '0')}.jpg to /public/images/
        </p>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`TVPS item ${itemIndex}`}
      className="max-w-full max-h-[50vh] w-auto h-auto object-contain"
      onError={() => setError(true)}
    />
  )
}
