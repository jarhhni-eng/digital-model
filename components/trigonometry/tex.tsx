'use client'

/**
 * Thin KaTeX wrapper: renders a LaTeX source string inline.
 *
 * Usage:  <Tex>{String.raw`\cos(\theta)`}</Tex>
 *         <Tex block>{String.raw`M(\theta) = (\cos\theta, \sin\theta)`}</Tex>
 */
import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function Tex({
  children,
  block = false,
  className,
}: {
  children: string
  block?: boolean
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    katex.render(children, ref.current, {
      displayMode: block,
      throwOnError: false,
      strict: 'ignore',
    })
  }, [children, block])

  return <span ref={ref} className={className} />
}
