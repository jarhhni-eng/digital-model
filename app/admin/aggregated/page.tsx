'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { avg, buildAdminStudents, domainAverageForStudent, mockInstitutions, mockTeacherGroups } from '@/lib/admin-mock'
import { platformDomains } from '@/lib/platform-domains'
import { cn } from '@/lib/utils'

function color(v: number) {
  if (v >= 75) return 'text-green-600'
  if (v >= 50) return 'text-amber-600'
  return 'text-red-500'
}

function PctBar({ v }: { v: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden w-full">
      <div className={cn('h-full', v >= 75 ? 'bg-green-500' : v >= 50 ? 'bg-amber-500' : 'bg-red-400')} style={{ width: `${v}%` }} />
    </div>
  )
}

export default function AggregatedPage() {
  const students = useMemo(() => buildAdminStudents(), [])

  const byTeacher = mockTeacherGroups.map((g) => {
    const group = students.filter((s) => s.groupId === g.id)
    const domains = platformDomains.map((d) => ({
      id: d.id, name: d.name, avg: avg(group.map((s) => domainAverageForStudent(s, d.id))),
    }))
    return { group: g, domains, overall: avg(domains.map((d) => d.avg)) }
  })

  const byFiliere = Array.from(new Set(students.map((s) => s.filiere))).map((f) => ({
    filiere: f, avg: avg(students.filter((s) => s.filiere === f).flatMap((s) => platformDomains.map((d) => domainAverageForStudent(s, d.id)))),
  }))

  const byLevel = Array.from(new Set(students.map((s) => s.level))).map((lv) => ({
    level: lv, avg: avg(students.filter((s) => s.level === lv).flatMap((s) => platformDomains.map((d) => domainAverageForStudent(s, d.id)))),
  }))

  const byInst = mockInstitutions.map((inst) => ({
    name: inst.name,
    avg: avg(students.filter((s) => s.institutionId === inst.id).flatMap((s) => platformDomains.map((d) => domainAverageForStudent(s, d.id)))),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Résultats agrégés</h1>
        <p className="text-slate-500 mt-1">Moyennes par groupe / filière / niveau / établissement.</p>
      </div>

      {/* By Teacher (Group) */}
      <Card>
        <CardHeader><CardTitle className="text-base">Par enseignant / groupe</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {byTeacher.map((t) => (
            <div key={t.group.id} className="space-y-2 pb-4 border-b border-slate-100 last:border-0">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{t.group.name}</p>
                  <p className="text-xs text-slate-500">{t.group.teacherName} · {t.group.studentCount} élèves</p>
                </div>
                <span className={cn('text-xl font-bold tabular-nums', color(t.overall))}>{t.overall}%</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {t.domains.map((d) => (
                  <div key={d.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="truncate pr-2">{d.name}</span>
                      <span className={cn('font-bold tabular-nums', color(d.avg))}>{d.avg}%</span>
                    </div>
                    <PctBar v={d.avg} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Par filière</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {byFiliere.map((f) => (
              <div key={f.filiere}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate pr-2">{f.filiere}</span>
                  <span className={cn('font-bold tabular-nums', color(f.avg))}>{f.avg}%</span>
                </div>
                <PctBar v={f.avg} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Par niveau scolaire</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {byLevel.map((l) => (
              <div key={l.level}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate pr-2">{l.level}</span>
                  <span className={cn('font-bold tabular-nums', color(l.avg))}>{l.avg}%</span>
                </div>
                <PctBar v={l.avg} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Par établissement</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {byInst.map((i) => (
              <div key={i.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate pr-2">{i.name}</span>
                  <span className={cn('font-bold tabular-nums', color(i.avg))}>{i.avg}%</span>
                </div>
                <PctBar v={i.avg} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
