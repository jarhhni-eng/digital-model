'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Eraser, Trash2 } from 'lucide-react'
import type { BeeryDrawingTool } from '@/lib/beery-vmi'
import { cn } from '@/lib/utils'

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 400
const PENCIL_STROKE = '#1a1a1a'
const PENCIL_WIDTH = 2.5
const ERASER_WIDTH = 24

interface DrawingCanvasProps {
  width?: number
  height?: number
  tool: BeeryDrawingTool
  initialDataUrl: string | null
  onDrawingChange: (dataUrl: string) => void
  className?: string
  disabled?: boolean
}

export function DrawingCanvas({
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
  tool,
  initialDataUrl,
  onDrawingChange,
  className,
  disabled = false,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }, [])

  const getPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      if ('touches' in e) {
        const t = e.touches[0]
        return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    []
  )

  // Initialize or restore from initialDataUrl
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (initialDataUrl) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = initialDataUrl
    }
  }, [initialDataUrl, getCtx])

  const emitChange = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    onDrawingChange(dataUrl)
  }, [onDrawingChange])

  const draw = useCallback(
    (x: number, y: number) => {
      const ctx = getCtx()
      if (!ctx) return
      if (tool === 'pencil') {
        ctx.strokeStyle = PENCIL_STROKE
        ctx.lineWidth = PENCIL_WIDTH
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        if (lastPos.current) {
          ctx.beginPath()
          ctx.moveTo(lastPos.current.x, lastPos.current.y)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
        lastPos.current = { x, y }
      } else {
        ctx.clearRect(x - ERASER_WIDTH / 2, y - ERASER_WIDTH / 2, ERASER_WIDTH, ERASER_WIDTH)
        lastPos.current = { x, y }
      }
      emitChange()
    },
    [tool, getCtx, emitChange]
  )

  const handleStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (disabled) return
      e.preventDefault()
      const point = getPoint(e)
      if (!point) return
      lastPos.current = point
      setIsDrawing(true)
      draw(point.x, point.y)
    },
    [disabled, getPoint, draw]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || disabled) return
      e.preventDefault()
      const point = getPoint(e)
      if (!point) return
      draw(point.x, point.y)
    },
    [isDrawing, disabled, getPoint, draw]
  )

  const handleEnd = useCallback(() => {
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    emitChange()
  }, [getCtx, emitChange])

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        className={cn(
          'rounded-lg border-2 border-border overflow-hidden bg-white',
          disabled && 'opacity-70 pointer-events-none'
        )}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full max-w-full touch-none cursor-crosshair block"
          style={{ maxHeight: 400 }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          disabled={disabled}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear drawing
        </Button>
      </div>
    </div>
  )
}

export function DrawingToolToggle({
  tool,
  onToolChange,
  disabled,
}: {
  tool: BeeryDrawingTool
  onToolChange: (t: BeeryDrawingTool) => void
  disabled?: boolean
}) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border">
      <Button
        type="button"
        variant={tool === 'pencil' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onToolChange('pencil')}
        disabled={disabled}
        className="gap-2"
      >
        <Pencil className="w-4 h-4" />
        Pencil
      </Button>
      <Button
        type="button"
        variant={tool === 'erase' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onToolChange('erase')}
        disabled={disabled}
        className="gap-2"
      >
        <Eraser className="w-4 h-4" />
        Erase
      </Button>
    </div>
  )
}
