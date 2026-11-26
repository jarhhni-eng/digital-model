'use client'

/**
 * Super-admin: archive (soft delete) and restore student / teacher accounts.
 *
 * Archived accounts and all their data become invisible to every other user
 * (RLS) and cannot sign in. Nothing is deleted; a restore brings it all back.
 * Route access: middleware (`/admin/accounts` → super_admin) + API gates.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, Loader2, RotateCcw, Search, UserX } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Role = 'student' | 'teacher'

type ActiveAccount = {
  id: string
  email: string
  full_name: string | null
  role: Role
  created_at: string
}

type ArchivedAccount = {
  id: string
  role: Role
  full_name: string | null
  archived_email: string | null
  archived_at: string
  archive_reason: string | null
  archived_by_email: string | null
}

const ROLE_LABEL: Record<Role, string> = { student: 'Élève', teacher: 'Enseignant' }

function formatDate(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR')
}

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  const json = (await res.json().catch(() => ({}))) as {
    error?: string
    complete?: boolean
    warnings?: string[]
  }
  return { ok: res.ok, json }
}

export default function AdminAccountsPage() {
  const [active, setActive] = useState<ActiveAccount[]>([])
  const [archived, setArchived] = useState<ArchivedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [warn, setWarn] = useState<string[]>([])

  const [archiveTarget, setArchiveTarget] = useState<ActiveAccount | null>(null)
  const [reason, setReason] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [restoreTarget, setRestoreTarget] = useState<ArchivedAccount | null>(null)
  const [busy, setBusy] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const res = await fetch('/api/admin/accounts', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Chargement impossible.')
      setActive(json.active ?? [])
      setArchived(json.archived ?? [])
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const needle = query.trim().toLowerCase()
  const filteredActive = useMemo(
    () =>
      active.filter(
        (a) => !needle || a.email.toLowerCase().includes(needle) || (a.full_name ?? '').toLowerCase().includes(needle),
      ),
    [active, needle],
  )
  const filteredArchived = useMemo(
    () =>
      archived.filter(
        (a) =>
          !needle ||
          (a.archived_email ?? '').toLowerCase().includes(needle) ||
          (a.full_name ?? '').toLowerCase().includes(needle),
      ),
    [archived, needle],
  )

  const openArchive = (account: ActiveAccount) => {
    setArchiveTarget(account)
    setReason('')
    setConfirmEmail('')
    setDialogError(null)
  }

  const emailMatches =
    archiveTarget != null && confirmEmail.trim().toLowerCase() === archiveTarget.email.trim().toLowerCase()
  const reasonValid = reason.trim().length >= 3 && reason.trim().length <= 500

  const submitArchive = async () => {
    if (!archiveTarget || !emailMatches || !reasonValid) return
    setBusy(true)
    setDialogError(null)
    const { ok, json } = await postJson(`/api/admin/accounts/${archiveTarget.id}/archive`, {
      reason: reason.trim(),
      confirmEmail: confirmEmail.trim(),
    })
    setBusy(false)
    if (!ok) {
      setDialogError(json.error ?? 'Archivage impossible.')
      return
    }
    setMsg(`Compte ${archiveTarget.email} archivé.`)
    setWarn(json.warnings ?? [])
    setArchiveTarget(null)
    await load()
  }

  const submitRestore = async () => {
    if (!restoreTarget) return
    setBusy(true)
    setDialogError(null)
    const { ok, json } = await postJson(`/api/admin/accounts/${restoreTarget.id}/restore`)
    setBusy(false)
    if (!ok) {
      setDialogError(json.error ?? 'Restauration impossible.')
      return
    }
    setMsg(`Compte ${restoreTarget.archived_email ?? ''} restauré.`)
    setWarn([])
    setRestoreTarget(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserX className="h-7 w-7 text-indigo-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comptes &amp; archivage</h1>
          <p className="text-sm text-slate-600">
            Un compte archivé ne peut plus se connecter et ses données deviennent invisibles pour tous les
            autres utilisateurs. Rien n&apos;est supprimé : vous pouvez le restaurer.
          </p>
        </div>
      </div>

      {msg && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <AlertTitle>{msg}</AlertTitle>
          {warn.length > 0 && (
            <AlertDescription className="text-amber-800">
              <ul className="list-disc pl-5">
                {warn.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}
      {listError && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <Input
          className="pl-9"
          placeholder="Rechercher par nom ou e-mail"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher un compte"
        />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Actifs ({active.length})</TabsTrigger>
          <TabsTrigger value="archived">Archivés ({archived.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Comptes actifs</CardTitle>
              <CardDescription>Élèves et enseignants. Les comptes administrateur ne peuvent pas être archivés.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActive.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-500">
                            Aucun compte.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredActive.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.email}</TableCell>
                            <TableCell>{a.full_name ?? '—'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{ROLE_LABEL[a.role]}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(a.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="destructive" onClick={() => openArchive(a)}>
                                <Archive className="mr-1 h-4 w-4" /> Archiver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Comptes archivés</CardTitle>
              <CardDescription>Visibles uniquement par le super administrateur.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail d&apos;origine</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Archivé le</TableHead>
                      <TableHead>Par</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArchived.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-500">
                          Aucun compte archivé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredArchived.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.archived_email ?? '—'}</TableCell>
                          <TableCell>{a.full_name ?? '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ROLE_LABEL[a.role]}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(a.archived_at)}</TableCell>
                          <TableCell>{a.archived_by_email ?? '—'}</TableCell>
                          <TableCell className="max-w-xs truncate" title={a.archive_reason ?? ''}>
                            {a.archive_reason ?? '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRestoreTarget(a)
                                setDialogError(null)
                              }}
                            >
                              <RotateCcw className="mr-1 h-4 w-4" /> Restaurer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={archiveTarget != null} onOpenChange={(open) => !open && !busy && setArchiveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archiver ce compte ?</DialogTitle>
            <DialogDescription>
              {archiveTarget && (
                <>
                  <strong>{archiveTarget.email}</strong> ({ROLE_LABEL[archiveTarget.role]}) ne pourra plus se
                  connecter. Ses résultats et son profil disparaîtront pour les enseignants, les administrateurs et
                  les tableaux de recherche. L&apos;adresse e-mail sera libérée pour une nouvelle inscription.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="archive-reason">Motif (obligatoire)</Label>
              <Textarea
                id="archive-reason"
                value={reason}
                maxLength={500}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex. : élève ayant quitté l’établissement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archive-confirm">Saisissez l&apos;e-mail du compte pour confirmer</Label>
              <Input
                id="archive-confirm"
                value={confirmEmail}
                autoComplete="off"
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={archiveTarget?.email}
              />
            </div>
            {dialogError && <p className="text-sm text-red-600">{dialogError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setArchiveTarget(null)}>
              Annuler
            </Button>
            <Button variant="destructive" disabled={busy || !emailMatches || !reasonValid} onClick={submitArchive}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Archiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreTarget != null} onOpenChange={(open) => !open && !busy && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer ce compte ?</DialogTitle>
            <DialogDescription>
              {restoreTarget && (
                <>
                  <strong>{restoreTarget.archived_email}</strong> pourra de nouveau se connecter et ses données
                  redeviendront visibles. Impossible si l&apos;adresse a été réutilisée entre-temps.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {dialogError && <p className="text-sm text-red-600">{dialogError}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setRestoreTarget(null)}>
              Annuler
            </Button>
            <Button disabled={busy} onClick={submitRestore}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
