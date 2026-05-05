'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Building2, Loader2, Plus } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type SchoolRow = Database['public']['Tables']['schools']['Row']

export default function AdminSchoolsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [rows, setRows] = useState<SchoolRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const res = await fetch('/api/admin/schools')
      const data = await res.json()
      if (!res.ok) {
        setListError(data.error ?? 'Chargement impossible.')
        setRows([])
        return
      }
      setRows(data.schools ?? [])
    } catch {
      setListError('Erreur réseau.')
      setRows([])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'super_admin') {
      router.replace('/admin')
      return
    }
    void load()
  }, [authLoading, user, router, load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setCreateLoading(true)
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), city: city.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.error ?? 'Échec.')
        return
      }
      setMsg(`Établissement « ${data.school?.name ?? name} » créé.`)
      setName('')
      setCity('')
      await load()
    } catch {
      setErr('Erreur réseau.')
    } finally {
      setCreateLoading(false)
    }
  }

  const toggleActive = async (s: SchoolRow) => {
    setErr(null)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/schools/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !s.is_active }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.error ?? 'Mise à jour impossible.')
        return
      }
      await load()
    } catch {
      setErr('Erreur réseau.')
    }
  }

  if (authLoading || !user || user.role !== 'super_admin') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Chargement…
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            Établissements scolaires
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Créez et gérez les écoles de la plateforme. Les enseignants (inscription ou compte créé ici)
            y sont rattachés ; les élèves choisissent d&apos;abord l&apos;établissement puis un enseignant
            de cette liste.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" />
            Nouvel établissement
          </CardTitle>
          <CardDescription>Nom affiché aux élèves et enseignants lors des inscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="sch-name">Nom</Label>
              <Input
                id="sch-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Lycée qualifiant …"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2 w-full sm:w-48">
              <Label htmlFor="sch-city">Ville (optionnel)</Label>
              <Input
                id="sch-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Fès"
              />
            </div>
            <Button type="submit" disabled={createLoading} className="shrink-0">
              {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
            </Button>
          </form>
          {err && <p className="text-sm text-destructive mt-3">{err}</p>}
          {msg && <p className="text-sm text-emerald-700 mt-3">{msg}</p>}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Liste des établissements</CardTitle>
          <CardDescription>
            Désactiver un établissement le retire des listes publiques (inscription, profil élève).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2 py-10 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement…
            </p>
          ) : listError ? (
            <p className="text-sm text-destructive">{listError}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      Aucun établissement. Ajoutez-en un ci-dessus.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.city ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={r.is_active ? 'default' : 'secondary'}>
                          {r.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void toggleActive(r)}
                        >
                          {r.is_active ? 'Désactiver' : 'Réactiver'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
