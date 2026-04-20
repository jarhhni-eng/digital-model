'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  CheckCircle2,
  ImageOff,
  Save,
  FileSignature,
  AlertCircle,
} from 'lucide-react'
import {
  BEERY_MOTRICE_ITEM_COUNT,
  motriceImagePath,
  getSession,
  getResult,
  saveResult,
  convertRawScore,
  BeeryMotriceSession,
  BeeryMotriceResult,
} from '@/lib/beery-motrice'
import { useAuth } from '@/lib/auth-context'

export default function ManualCorrectionSessionPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params?.sessionId
  const router = useRouter()
  const { user } = useAuth()

  const [session, setSession] = useState<BeeryMotriceSession | null>(null)
  const [existing, setExisting] = useState<BeeryMotriceResult | undefined>(undefined)
  const [rawInput, setRawInput] = useState<string>('')
  const [saved, setSaved] = useState<BeeryMotriceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    const s = getSession(sessionId)
    setSession(s ?? null)
    const r = getResult(sessionId)
    setExisting(r)
    if (r) {
      setRawInput(String(r.rawScore))
      setSaved(r)
    }
  }, [sessionId])

  const drawingByItem = useMemo(() => {
    const map = new Map<number, string>()
    session?.drawings.forEach((d) => map.set(d.item, d.dataUrl))
    return map
  }, [session])

  const preview = useMemo(() => {
    const n = Number(rawInput)
    if (!rawInput || Number.isNaN(n)) return null
    if (n < 0 || n > BEERY_MOTRICE_ITEM_COUNT) return null
    return convertRawScore(n)
  }, [rawInput])

  if (!sessionId) return null
  if (!session) {
    return (
      <main className="container mx-auto max-w-4xl py-8">
        <Card className="p-10 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <p className="text-muted-foreground">Session introuvable.</p>
          <Link href="/admin/manual-correction">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
            </Button>
          </Link>
        </Card>
      </main>
    )
  }

  const handleValidate = () => {
    setError(null)
    const n = Number(rawInput)
    if (rawInput === '' || Number.isNaN(n)) {
      setError('Saisissez un score entier entre 0 et 10.')
      return
    }
    if (n < 0 || n > BEERY_MOTRICE_ITEM_COUNT) {
      setError(`Le score brut doit être compris entre 0 et ${BEERY_MOTRICE_ITEM_COUNT}.`)
      return
    }
    const { standardScore, niveau } = convertRawScore(n)
    const result: BeeryMotriceResult = {
      sessionId: session.id,
      userName: session.userName,
      rawScore: Math.round(n),
      standardScore,
      niveau,
      validatedAt: new Date().toISOString(),
      validatedBy: user?.username ?? 'admin',
      domain: 'traitement_visuel',
      test: 'beery_vmi',
    }
    saveResult(result)
    setSaved(result)
    setExisting(result)
  }

  return (
    <main className="container mx-auto max-w-6xl py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/manual-correction">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
            </Button>
          </Link>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <FileSignature className="h-7 w-7 text-indigo-500" />
            Correction — {session.userName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Test Beery VMI · {new Date(session.startedAt).toLocaleString('fr-FR')} ·{' '}
            {session.drawings.length} / {BEERY_MOTRICE_ITEM_COUNT} items dessinés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">traitement_visuel</Badge>
          <Badge variant="outline">beery_vmi</Badge>
        </div>
      </div>

      {/* Grid items */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {Array.from({ length: BEERY_MOTRICE_ITEM_COUNT }, (_, i) => i + 1).map((item) => {
          const drawing = drawingByItem.get(item)
          return (
            <Card key={item} className="overflow-hidden p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Item {item}</h3>
                <span className="font-mono text-xs text-muted-foreground">
                  motrice_{item}.jpg
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs uppercase text-muted-foreground">Original</p>
                  <StimulusImg item={item} />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase text-muted-foreground">
                    Dessin de l’élève
                  </p>
                  {drawing ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={drawing}
                      alt={`Dessin item ${item}`}
                      className="h-40 w-full rounded border bg-white object-contain"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded border-2 border-dashed bg-muted/30 text-xs text-muted-foreground">
                      Aucun dessin
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Scoring panel */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Saisie du score</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="raw">
              Score brut (0 – {BEERY_MOTRICE_ITEM_COUNT})
            </label>
            <Input
              id="raw"
              type="number"
              min={0}
              max={BEERY_MOTRICE_ITEM_COUNT}
              step={1}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-40"
              placeholder="Ex. 8"
            />
          </div>
          <Button onClick={handleValidate} className="gap-2">
            <Save className="h-4 w-4" />
            {existing ? 'Mettre à jour' : 'Convertir et valider'}
          </Button>
          {preview && !saved && (
            <div className="text-sm text-muted-foreground">
              Aperçu : <strong>{preview.standardScore}</strong> ({preview.niveau})
            </div>
          )}
        </div>
        {error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        {saved && (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <strong>Résultat enregistré</strong>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Score brut</p>
                <p className="text-2xl font-bold">{saved.rawScore} / {BEERY_MOTRICE_ITEM_COUNT}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Score standard</p>
                <p className="text-2xl font-bold">{saved.standardScore}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Niveau</p>
                <p className="text-2xl font-bold">{saved.niveau}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Validé le {new Date(saved.validatedAt).toLocaleString('fr-FR')}
              {saved.validatedBy ? ` par ${saved.validatedBy}` : ''}. Le résultat est
              désormais visible dans le profil cognitif de l’élève.
            </p>
          </div>
        )}

        {/* Conversion table reference */}
        <div className="mt-6 rounded-md border bg-muted/30 p-4 text-xs">
          <p className="mb-2 font-semibold">Barème de conversion</p>
          <ul className="grid grid-cols-2 gap-1 text-muted-foreground md:grid-cols-4">
            <li>15 – 16 → <strong>115</strong> (Supérieur)</li>
            <li>12 – 14 → <strong>100</strong> (Moyen)</li>
            <li>8 – 11 → <strong>85</strong> (Limite)</li>
            <li>0 – 7 → <strong>70</strong> (Faible)</li>
          </ul>
        </div>
      </Card>
    </main>
  )
}

function StimulusImg({ item }: { item: number }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-1 rounded border-2 border-dashed bg-muted/30 p-2 text-center text-xs text-muted-foreground">
        <ImageOff className="h-5 w-5" />
        <span className="font-mono">motrice_{item}.jpg</span>
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={motriceImagePath(item)}
      alt={`Original item ${item}`}
      className="h-40 w-full rounded border bg-white object-contain"
      onError={() => setFailed(true)}
    />
  )
}
