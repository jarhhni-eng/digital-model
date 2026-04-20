'use client'
import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Trash2, ImageOff, Check, FolderOpen } from 'lucide-react'
import { VP_SUBTESTS, VPSubtestMeta, CORRECTIONS, parseFilename, candidateFilenames } from '@/lib/visuo-perceptive'
import {
  saveImage,
  removeImage,
  listStoredImages,
  clearAllImages,
} from '@/lib/visuo-perceptive/image-store'
import { VPImage } from './vp-image'

export function VPImageUploader() {
  const [selected, setSelected] = useState<VPSubtestMeta>(VP_SUBTESTS[0])
  const [stored, setStored] = useState<string[]>([])
  const [bulkCount, setBulkCount] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const bulkRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setStored(listStoredImages())
    const h = () => setStored(listStoredImages())
    window.addEventListener('vp-images-changed', h)
    return () => window.removeEventListener('vp-images-changed', h)
  }, [])

  const corr = CORRECTIONS[selected.id]
  const expected = Object.keys(corr).map((n) => parseInt(n, 10)).sort((a, b) => a - b)
  const hasImage = (n: number) => {
    const cands = candidateFilenames(selected.id, n)
    return cands.some((c) => stored.includes(c))
  }

  const onReplace = async (n: number, file: File) => {
    await saveImage(`${selected.id}_${n}.jpg`, file)
  }

  const onBulk = async (files: FileList | null) => {
    if (!files) return
    let ok = 0
    for (const f of Array.from(files)) {
      const parsed = parseFilename(f.name)
      if (!parsed) continue
      await saveImage(`${parsed.subtest}_${parsed.number}.jpg`, f)
      ok += 1
    }
    setBulkCount(`${ok} image(s) importée(s).`)
    setTimeout(() => setBulkCount(null), 4000)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Import en masse</h2>
            <p className="text-sm text-muted-foreground">
              Sélectionnez plusieurs fichiers nommés{' '}
              <code className="font-mono text-xs">sous_test_numero.jpg</code> — ils sont affectés automatiquement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={bulkRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onBulk(e.target.files)
                if (bulkRef.current) bulkRef.current.value = ''
              }}
            />
            <Button onClick={() => bulkRef.current?.click()}>
              <FolderOpen className="mr-2 h-4 w-4" /> Importer un dossier
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Supprimer toutes les images stockées localement ?')) clearAllImages()
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Tout effacer
            </Button>
          </div>
        </div>
        {bulkCount && <div className="mt-3 text-sm text-emerald-600">{bulkCount}</div>}
        <p className="mt-3 text-xs text-muted-foreground">
          Alternative sans upload : déposez les fichiers dans{' '}
          <code className="font-mono">public/images/visuo-perceptive/</code> — ils seront servis directement.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Par sous-test</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {VP_SUBTESTS.map((s) => {
            const active = s.id === selected.id
            const done = Object.keys(CORRECTIONS[s.id]).filter((k) =>
              candidateFilenames(s.id, parseInt(k, 10)).some((c) => stored.includes(c)),
            ).length
            const total = Object.keys(CORRECTIONS[s.id]).length
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                  active ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">
                  {done}/{total} image(s)
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {expected.map((n) => {
            const filename = `${selected.id}_${n}.jpg`
            const present = hasImage(n)
            return (
              <div key={n} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant={present ? 'default' : 'outline'}>
                    {present ? <Check className="mr-1 h-3 w-3" /> : <ImageOff className="mr-1 h-3 w-3" />}
                    {n}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    rép. {corr[n]}
                  </span>
                </div>
                {present ? (
                  <VPImage
                    filename={filename}
                    candidates={candidateFilenames(selected.id, n)}
                    alt={`${selected.id} ${n}`}
                    className="h-24 w-full rounded border object-contain"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
                    manquante
                  </div>
                )}
                <div className="mt-2 flex gap-1">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]
                        if (f) await onReplace(n, f)
                        e.target.value = ''
                      }}
                    />
                    <span className="flex cursor-pointer items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted">
                      <Upload className="h-3 w-3" /> {present ? 'Remplacer' : 'Téléverser'}
                    </span>
                  </label>
                  {present && (
                    <button
                      onClick={() => removeImage(filename)}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-red-50 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
      <input ref={fileRef} type="file" className="hidden" />
    </div>
  )
}
