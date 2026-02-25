'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerProps {
  initialSeconds: number
  onTimeUp?: () => void
  showAlert?: boolean
}

export function Timer({
  initialSeconds,
  onTimeUp,
  showAlert = true,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const isWarning = showAlert && timeLeft <= 300 // 5 minutes
  const isCritical = showAlert && timeLeft <= 60 // 1 minute

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-semibold text-lg',
        isCritical
          ? 'bg-destructive/10 text-destructive border border-destructive/20'
          : isWarning
            ? 'bg-warning/10 text-warning border border-warning/20'
            : 'bg-card text-foreground border border-border'
      )}
    >
      <Clock className="w-5 h-5" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isCritical && (
        <AlertTriangle className="w-4 h-4 ml-2 animate-pulse" />
      )}
    </div>
  )
}
