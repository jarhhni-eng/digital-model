'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, CheckCircle2, Clock, FileSignature } from 'lucide-react'
import {
  listSessions,
  listResults,
  BEERY_MOTRICE_ITEM_COUNT,
  BeeryMotriceSession,
  BeeryMotriceResult,
} from '@/lib/beery-motrice'

export default function ManualCorrectionPage() {
  const [sessions, setSessions] = useState<BeeryMotriceSession[]>([])
  const [results, setResults] = useState<BeeryMotriceResult[]>([])

  useEffect(() => {
    const refresh = () => {
      setSessions(listSessions())
      setResults(listResults())
    }
    refresh()
    window.addEventListener('beery-motrice-changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('beery-motrice-changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const sorted = [...sessions].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))

  return (
    <main className="container mx-auto max-w-6xl py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <FileSignature className="h-7 w-7 text-indigo-500" />
            Manual Correction
          </h1>
          <p className="mt-1 text-muted-foreground">
            Liste des sessions à corriger manuellement (test Beery VMI — intégration visuo-motrice).
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Aucune session enregistrée pour le moment.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Test</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Score</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => {
                  const result = results.find((r) => r.sessionId === s.id)
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{s.userName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(s.startedAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">Beery VMI</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.drawings.length} / {BEERY_MOTRICE_ITEM_COUNT}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {result ? (
                          <span>
                            <strong>{result.standardScore}</strong>{' '}
                            <span className="text-muted-foreground">({result.niveau})</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/manual-correction/${s.id}`}>
                          <Button size="sm" variant={result ? 'outline' : 'default'}>
                            <Pencil className="mr-2 h-3 w-3" />
                            {result ? 'Réviser' : 'Corriger'}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  )
}

function StatusBadge({ status }: { status: BeeryMotriceSession['status'] }) {
  if (status === 'corrected') {
    return (
      <Badge className="gap-1 bg-emerald-600 text-white">
        <CheckCircle2 className="h-3 w-3" /> Corrigé
      </Badge>
    )
  }
  if (status === 'submitted') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" /> À corriger
      </Badge>
    )
  }
  return <Badge variant="outline">En cours</Badge>
}
