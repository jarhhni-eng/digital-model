'use client'
import { useRef, useState } from 'react'
import { VECTOR_POINTS } from '@/lib/geometry/geo-vectors-complete'

/**
 * Coordinate plane that mirrors the canonical vecteurs.jpg figure but lets
 * the student click to place named points (Q9 / Q10 / Q11). Coordinates of
 * the labelled points are NOT displayed (per spec) — only the letters.
 */

interface ClickableVectorsPlaneProps {
  labels: string[]
  onChange?: (placed: { name: string; x: number; y: number }[]) => void
}

export function ClickableVectorsPlane({
  labels,
  onChange,
}: ClickableVectorsPlaneProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [placed, setPlaced] = useState<{ name: string; x: number; y: number }[]>([])

  const xMin = -4
  const xMax = 10
  const yMin = -6
  const yMax = 3
  const padX = 28
  const padY = 24
  const w = 520
  const h = 360
  const innerW = w - 2 * padX
  const innerH = h - 2 * padY
  const sx = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * innerW
  const sy = (y: number) => padY + ((yMax - y) / (yMax - yMin)) * innerH
  const ix = (px: number) => xMin + ((px - padX) / innerW) * (xMax - xMin)
  const iy = (py: number) => yMax - ((py - padY) / innerH) * (yMax - yMin)

  const xs: number[] = []
  for (let x = xMin; x <= xMax; x++) xs.push(x)
  const ys: number[] = []
  for (let y = yMin; y <= yMax; y++) ys.push(y)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * w
    const py = ((e.clientY - rect.top) / rect.height) * h
    const x = Math.round(ix(px))
    const y = Math.round(iy(py))
    if (x < xMin || x > xMax || y < yMin || y > yMax) return

    setPlaced((prev) => {
      const i = prev.length
      let next: { name: string; x: number; y: number }[]
      if (i >= labels.length) {
        next = [{ name: labels[0], x, y }]
      } else {
        next = [...prev, { name: labels[i], x, y }]
      }
      onChange?.(next)
      return next
    })
  }

  const reset = () => {
    setPlaced([])
    onChange?.([])
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">
        Cliquez sur le repère pour placer{' '}
        {labels.map((l, i) => (
          <span key={l}>
            {i > 0 ? ', ' : ''}
            <strong>{l}</strong>
          </span>
        ))}
        {' '}(plus de clics réinitialisent automatiquement).
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="block w-full cursor-crosshair bg-white"
        role="img"
        onClick={handleClick}
      >
        <rect width={w} height={h} fill="#fafafa" />

        {xs.map((x) => (
          <line
            key={`vx-${x}`}
            x1={sx(x)}
            y1={padY}
            x2={sx(x)}
            y2={h - padY}
            stroke={x === 0 ? '#94a3b8' : '#e5e7eb'}
            strokeWidth={x === 0 ? 1.4 : 0.6}
          />
        ))}
        {ys.map((y) => (
          <line
            key={`hy-${y}`}
            x1={padX}
            y1={sy(y)}
            x2={w - padX}
            y2={sy(y)}
            stroke={y === 0 ? '#94a3b8' : '#e5e7eb'}
            strokeWidth={y === 0 ? 1.4 : 0.6}
          />
        ))}

        {xs.filter((x) => x % 2 === 0).map((x) => (
          <text
            key={`xl-${x}`}
            x={sx(x)}
            y={sy(0) + 12}
            fontSize={10}
            textAnchor="middle"
            fill="#64748b"
          >
            {x}
          </text>
        ))}
        {ys.filter((y) => y % 2 === 0 && y !== 0).map((y) => (
          <text
            key={`yl-${y}`}
            x={sx(0) - 6}
            y={sy(y) + 3}
            fontSize={10}
            textAnchor="end"
            fill="#64748b"
          >
            {y}
          </text>
        ))}
        <text x={w - padX + 4} y={sy(0) + 4} fontSize={11} fill="#475569">x</text>
        <text x={sx(0) + 4} y={padY - 4} fontSize={11} fill="#475569">y</text>

        {/* Reference points — labels only, NO coordinates */}
        {VECTOR_POINTS.map((pt) => {
          const cx = sx(pt.x)
          const cy = sy(pt.y)
          return (
            <g key={pt.name}>
              <circle cx={cx} cy={cy} r={3.5} fill="#475569" stroke="white" strokeWidth={1} />
              <text
                x={cx + 6}
                y={cy - 6}
                fontSize={11}
                fontWeight={700}
                fill="#1e293b"
              >
                {pt.name}
              </text>
            </g>
          )
        })}

        {/* Placed points (red) */}
        {placed.map((p, i) => (
          <g key={`${p.name}-${i}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill="#dc2626" stroke="white" strokeWidth={1.5} />
            <text x={sx(p.x) + 6} y={sy(p.y) - 6} fontSize={12} fontWeight={700} fill="#dc2626">
              {p.name}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {placed.length === 0
            ? 'Aucun point placé.'
            : placed.map((p) => `${p.name}(${p.x};${p.y})`).join(' · ')}
        </span>
        <button
          type="button"
          onClick={reset}
          className="rounded border px-2 py-1 text-xs hover:bg-muted/50"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}
