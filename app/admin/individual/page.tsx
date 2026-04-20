'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { buildAdminStudents, domainAverageForStudent } from '@/lib/admin-mock'
import { platformDomains } from '@/lib/platform-domains'
import { cn } from '@/lib/utils'

function color(v: number) {
  if (v >= 75) return 'text-green-600'
  if (v >= 50) return 'text-amber-600'
  return 'text-red-500'
}

const allTests = Array.from(
  new Map(
    platformDomains.flatMap((d) =>
      d.subdomains.flatMap((s) => s.capacities.map((c) => [c.testId, { testId: c.testId, name: c.nameFr ?? c.name }] as const))
    )
  ).values()
)

export default function IndividualResultsPage() {
  const students = useMemo(() => buildAdminStudents(), [])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(students[0]?.id ?? null)

  const filtered = students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
  const student = students.find((s) => s.id === selected) ?? students[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Résultats individuels</h1>
        <p className="text-slate-500 mt-1">Student → Tests → Scores  ·  Student → Domains → Moyennes.</p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Élèves ({students.length})</CardTitle>
            <Input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className="mt-2" />
          </CardHeader>
          <CardContent className="max-h-[520px] overflow-y-auto space-y-1 px-2">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  s.id === student?.id ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-slate-100'
                )}
              >
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-slate-500">{s.filiere} · {s.level}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {student && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{student.name}</CardTitle>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline">{student.filiere}</Badge>
                  <Badge variant="outline">{student.level}</Badge>
                  <Badge variant="outline">Groupe {student.groupId}</Badge>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Moyennes par domaine</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {platformDomains.map((d) => {
                  const v = domainAverageForStudent(student, d.id)
                  return (
                    <div key={d.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate pr-2">{d.name}</span>
                        <span className={cn('font-bold tabular-nums', color(v))}>{v}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Scores par test</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {allTests.map((t) => {
                    const v = student.testScores[t.testId] ?? 0
                    return (
                      <div key={t.testId} className="flex justify-between border-b border-slate-100 py-1.5">
                        <span className="truncate pr-2 text-slate-700">{t.name}</span>
                        <span className={cn('font-bold tabular-nums', color(v))}>{v}%</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
