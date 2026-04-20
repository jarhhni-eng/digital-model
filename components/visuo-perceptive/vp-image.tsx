'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import { getImageSrc } from '@/lib/visuo-perceptive/image-store'
import { ImageOff } from 'lucide-react'

interface VPImageProps {
  filename: string
  candidates?: string[]
  alt: string
  className?: string
}

export function VPImage({ filename, candidates, alt, className }: VPImageProps) {
  const tryList = useMemo(() => {
    const list = candidates && candidates.length ? candidates : [filename]
    // de-dup while keeping order
    return Array.from(new Set([filename, ...list]))
  }, [filename, candidates])

  const [idx, setIdx] = useState(0)
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setIdx(0)
    setFailed(false)
    const h = () => {
      setIdx(0)
      setFailed(false)
    }
    window.addEventListener('vp-images-changed', h)
    return () => window.removeEventListener('vp-images-changed', h)
  }, [filename, candidates])

  const currentName = tryList[idx] ?? filename
  const src = getImageSrc(currentName)

  const handleError = () => {
    if (idx + 1 < tryList.length) {
      setIdx(idx + 1)
    } else {
      setFailed(true)
    }
  }

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    if (img.complete && img.naturalWidth === 0) handleError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/40 p-6 text-center text-sm text-muted-foreground ${className ?? ''}`}
      >
        <ImageOff className="h-6 w-6" />
        <div className="font-mono text-xs">{filename}</div>
        <div>Image manquante — téléversez via l’onglet « Gestion des images ».</div>
      </div>
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={imgRef} src={src} alt={alt} className={className} onError={handleError} />
}
