'use client'

/**
 * Interactive unit circle (cercle trigonométrique).
 *
 * Core didactic tool: each point on the circle is addressed by its
 * curvilinear abscissa θ (radians). Students may either:
 *   - drag the point freely,
 *   - or click one of the reference-angle tick marks,
 *   - or see it placed at a fixed target angle (read-only mode).
 *
 * Projections on the x / y axes highlight cos(θ) and sin(θ) as
 * geometric objects, not abstract numbers.
 */

import { useCallback, useMemo, useRef } from 'react'
import { Tex } from './tex'

// ─── Reference angles (radians, degrees, LaTeX label, Cartesian hint) ───────
const REF_ANGLES: { rad: number; latex: string }[] = [
  { rad: 0,               latex: '0' },
  { rad: Math.PI / 6,     latex: String.raw`\tfrac{\pi}{6}` },
  { rad: Math.PI / 4,     latex: String.raw`\tfrac{\pi}{4}` },
  { rad: Math.PI / 3,     latex: String.raw`\tfrac{\pi}{3}` },
  { rad: Math.PI / 2,     latex: String.raw`\tfrac{\pi}{2}` },
  { rad: 2 * Math.PI / 3, latex: String.raw`\tfrac{2\pi}{3}` },
  { rad: 3 * Math.PI / 4, latex: String.raw`\tfrac{3\pi}{4}` },
  { rad: 5 * Math.PI / 6, latex: String.raw`\tfrac{5\pi}{6}` },
  { rad: Math.PI,         latex: String.raw`\pi` },
  { rad: 7 * Math.PI / 6, latex: String.raw`\tfrac{7\pi}{6}` },
  { rad: 5 * Math.PI / 4, latex: String.raw`\tfrac{5\pi}{4}` },
  { rad: 4 * Math.PI / 3, latex: String.raw`\tfrac{4\pi}{3}` },
  { rad: 3 * Math.PI / 2, latex: String.raw`\tfrac{3\pi}{2}` },
  { rad: 5 * Math.PI / 3, latex: String.raw`\tfrac{5\pi}{3}` },
  { rad: 7 * Math.PI / 4, latex: String.raw`\tfrac{7\pi}{4}` },
  { rad: 11 * Math.PI / 6,latex: String.raw`\tfrac{11\pi}{6}` },
]

/** Normalize to [0, 2π). */
function norm(a: number): number {
  const two = Math.PI * 2
  return ((a % two) + two) % two
}

/** LaTeX for θ: snaps to a known reference angle if close (within 3°). */
function thetaLatex(theta: number): string {
  const t = norm(theta)
  for (const r of REF_ANGLES) {
    if (Math.abs(t - r.rad) < (Math.PI / 180) * 3) return r.latex
  }
  const deg = Math.round((t * 180) / Math.PI)
  return `${deg}^{\\circ}`
}

/** Pretty cos/sin for reference angles; otherwise decimal (2 dp). */
function projLatex(v: number): string {
  const known: { v: number; tex: string }[] = [
    { v: 0, tex: '0' },
    { v: 1, tex: '1' },
    { v: -1, tex: '-1' },
    { v: 0.5, tex: String.raw`\tfrac{1}{2}` },
    { v: -0.5, tex: String.raw`-\tfrac{1}{2}` },
    { v: Math.sqrt(2) / 2, tex: String.raw`\tfrac{\sqrt{2}}{2}` },
    { v: -Math.sqrt(2) / 2, tex: String.raw`-\tfrac{\sqrt{2}}{2}` },
    { v: Math.sqrt(3) / 2, tex: String.raw`\tfrac{\sqrt{3}}{2}` },
    { v: -Math.sqrt(3) / 2, tex: String.raw`-\tfrac{\sqrt{3}}{2}` },
  ]
  for (const k of known) if (Math.abs(v - k.v) < 0.01) return k.tex
  return v.toFixed(2)
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface UnitCircleProps {
  /** Current curvilinear abscissa θ in radians. */
  theta: number
  /** Called with the new angle when the point moves (if `interactive`). */
  onChange?: (theta: number) => void
  /** Fixed target marker (dashed), rendered in green. */
  targetTheta?: number | null
  /** If false, the point cannot be dragged. */
  interactive?: boolean
  /** Highlight the cos(θ) projection on the x-axis. */
  showCosProjection?: boolean
  /** Highlight the sin(θ) projection on the y-axis. */
  showSinProjection?: boolean
  /** Show labels for the reference angles around the circle. */
  showAngleTicks?: boolean
  /** Live readout of θ and (cos, sin) under the circle. */
  showReadout?: boolean
  /** Pixel size. */
  size?: number
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UnitCircle({
  theta,
  onChange,
  targetTheta = null,
  interactive = true,
  showCosProjection = false,
  showSinProjection = false,
  showAngleTicks = true,
  showReadout = true,
  size = 360,
}: UnitCircleProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const R = size * 0.4              // radius in SVG units
  const cx = size / 2               // center x
  const cy = size / 2               // center y

  // Round to 2 dp to avoid SSR/CSR float-precision hydration mismatches.
  const r2 = (n: number) => Math.round(n * 100) / 100

  // SVG y is inverted ⇒ sin is negated when drawing.
  const px = r2(cx + R * Math.cos(theta))
  const py = r2(cy - R * Math.sin(theta))

  const tgt = useMemo(() => {
    if (targetTheta == null) return null
    return {
      x: Math.round((cx + R * Math.cos(targetTheta)) * 100) / 100,
      y: Math.round((cy - R * Math.sin(targetTheta)) * 100) / 100,
    }
  }, [targetTheta, cx, cy, R])

  // Drag handling ───────────────────────────────────────────────────────────
  const updateFromPointer = useCallback(
    (ev: React.PointerEvent<SVGSVGElement>) => {
      if (!interactive || !svgRef.current || !onChange) return
      const rect = svgRef.current.getBoundingClientRect()
      const x = ev.clientX - rect.left - cx
      const y = ev.clientY - rect.top - cy
      // invert y (SVG) so counter-clockwise matches math convention
      const ang = norm(Math.atan2(-y, x))
      onChange(ang)
    },
    [cx, cy, interactive, onChange]
  )

  const dragging = useRef(false)
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    dragging.current = true
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    updateFromPointer(e)
  }
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging.current) updateFromPointer(e)
  }
  const onUp = () => { dragging.current = false }

  // ── Pre-computed: tick marks at reference angles ────────────────────────
  const ticks = showAngleTicks
    ? REF_ANGLES.map((a) => ({
        ...a,
        tx: r2(cx + (R + 14) * Math.cos(a.rad)),
        ty: r2(cy - (R + 14) * Math.sin(a.rad)),
        mx: r2(cx + R * Math.cos(a.rad)),
        my: r2(cy - R * Math.sin(a.rad)),
      }))
    : []

  return (
    <div className="inline-flex flex-col items-center select-none">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ touchAction: 'none', cursor: interactive ? 'grab' : 'default' }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm"
      >
        {/* Axes */}
        <line x1={0} y1={cy} x2={size} y2={cy} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={cx} y1={0} x2={cx} y2={size} stroke="#cbd5e1" strokeWidth={1} />

        {/* x-axis arrow tip label */}
        <text x={size - 8} y={cy - 6} fontSize="11" fill="#64748b">x</text>
        <text x={cx + 6} y={12} fontSize="11" fill="#64748b">y</text>

        {/* Unit circle */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#6366f1" strokeWidth={1.5} />

        {/* Target marker (dashed) */}
        {tgt && (
          <>
            <line x1={cx} y1={cy} x2={tgt.x} y2={tgt.y} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="4 3" />
            <circle cx={tgt.x} cy={tgt.y} r={5} fill="none" stroke="#16a34a" strokeWidth={2} />
          </>
        )}

        {/* Angle arc (from +x to current θ) */}
        <path
          d={describeArc(cx, cy, R * 0.22, 0, theta)}
          fill="none"
          stroke="#f97316"
          strokeWidth={2}
        />

        {/* Reference-angle ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <circle cx={t.mx} cy={t.my} r={2.5} fill="#94a3b8" />
            {/* KaTeX labels are rendered as HTML below; we emit only a tiny degree backup here */}
            <foreignObject
              x={t.tx - 18}
              y={t.ty - 10}
              width={36}
              height={20}
              style={{ overflow: 'visible' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 11,
                  color: '#475569',
                  lineHeight: 1,
                }}
              >
                <Tex>{t.latex}</Tex>
              </div>
            </foreignObject>
          </g>
        ))}

        {/* cos projection */}
        {showCosProjection && (
          <>
            <line
              x1={px} y1={py} x2={px} y2={cy}
              stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3"
            />
            <line
              x1={cx} y1={cy} x2={px} y2={cy}
              stroke="#ef4444" strokeWidth={3}
            />
            <circle cx={px} cy={cy} r={4} fill="#ef4444" />
          </>
        )}

        {/* sin projection */}
        {showSinProjection && (
          <>
            <line
              x1={px} y1={py} x2={cx} y2={py}
              stroke="#2563eb" strokeWidth={2} strokeDasharray="4 3"
            />
            <line
              x1={cx} y1={cy} x2={cx} y2={py}
              stroke="#2563eb" strokeWidth={3}
            />
            <circle cx={cx} cy={py} r={4} fill="#2563eb" />
          </>
        )}

        {/* Radius + movable point */}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#334155" strokeWidth={1.2} />
        <circle
          cx={px} cy={py} r={8}
          fill="#4f46e5"
          stroke="white" strokeWidth={2}
          style={{ cursor: interactive ? 'grab' : 'default' }}
        />
        <text
          x={px + 12}
          y={py - 10}
          fontSize="13"
          fontWeight="bold"
          fill="#1e293b"
        >
          M
        </text>
      </svg>

      {showReadout && (
        <div className="mt-3 flex flex-col items-center gap-1 text-sm">
          <div>
            <span className="text-slate-500 mr-2">Abscisse curviligne :</span>
            <Tex>{String.raw`\theta = ` + thetaLatex(theta)}</Tex>
          </div>
          <div className="flex gap-4">
            <span className="text-red-600">
              <Tex>{String.raw`\cos\theta = ` + projLatex(Math.cos(theta))}</Tex>
            </span>
            <span className="text-blue-600">
              <Tex>{String.raw`\sin\theta = ` + projLatex(Math.sin(theta))}</Tex>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SVG arc helper ──────────────────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
}
function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, start)
  const e = polar(cx, cy, r, end)
  const delta = norm(end - start)
  const large = delta > Math.PI ? 1 : 0
  // sweep=0 because SVG's y is flipped relative to math orientation
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`
}

// ─── Public helpers re-exported for quiz scoring ─────────────────────────────
export { norm as normalizeAngle, thetaLatex, projLatex }
