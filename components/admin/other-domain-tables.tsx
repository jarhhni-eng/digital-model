'use client'

import { useMemo, useState } from 'react'
import type { OtherCell, OtherStudentRow, OtherTestSection } from '@/lib/admin/other-domains-matrix'

export type OtherIdentity = {
  studentId: string
  firstName: string
  lastName: string
  level: string | null
  className: string | null
  teacher: string | null
  school: string | null
  year: string | null
}

const IDENTITY_HEADERS = ['Student_ID', 'Nom', 'Prénom', 'Niveau', 'Classe', 'Enseignant', 'Établissement', 'Année']

function identityCells(student: OtherIdentity): string[] {
  return [
    student.studentId,
    student.lastName,
    student.firstName,
    student.level ?? '',
    student.className ?? '',
    student.teacher ?? '',
    student.school ?? '',
    student.year ?? '',
  ]
}

function num(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ''
  return String(Math.round(value * 10) / 10)
}

function pct(value: number | null | undefined): string {
  const text = num(value)
  return text ? `${text}%` : ''
}

function day(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ''
}

function statusLabel(section: OtherTestSection, row: OtherStudentRow | undefined): string {
  switch (row?.status) {
    case 'completed':
      return 'Terminé'
    case 'partial': {
      const done = section.groups.filter((g) => g.key !== 'test-visuo-perceptive' && row.cells[g.key]?.status === 'completed').length
      return `Partiel (${done}/${section.groups.filter((g) => g.key !== 'test-visuo-perceptive').length})`
    }
    case 'pending':
      return 'En attente de validation'
    case 'in-progress':
      return 'En cours'
    default:
      return ''
  }
}

function cellTitle(cell: OtherCell | undefined): string | undefined {
  if (!cell) return undefined
  const state = cell.status === 'pending' ? 'En attente de validation' : cell.status === 'in-progress' ? 'En cours' : 'Terminé'
  return [state, day(cell.date)].filter(Boolean).join(' · ')
}

/** Column layout shared by the screen table and the CSV, so both always match. */
function columnsFor(section: OtherTestSection) {
  const tvps = section.kind === 'tvps'
  const columns: { header: string; value: (row: OtherStudentRow | undefined) => string; groupKey?: string }[] = []
  for (const group of section.groups) {
    const prefix = section.groups.length > 1 || tvps ? `${group.label} – ` : ''
    const cell = (row: OtherStudentRow | undefined) => row?.cells[group.key]
    columns.push({ header: `${prefix}Score`, value: (row) => num(cell(row)?.earned), groupKey: group.key })
    columns.push({ header: `${prefix}Max`, value: (row) => num(cell(row)?.max), groupKey: group.key })
    columns.push({ header: `${prefix}%`, value: (row) => pct(cell(row)?.percent), groupKey: group.key })
    columns.push({ header: `${prefix}Date`, value: (row) => day(cell(row)?.date), groupKey: group.key })
  }
  if (tvps) columns.push({ header: 'Moyenne TVPS-3 (%)', value: (row) => pct(row?.meanPercent) })
  columns.push({ header: 'Statut', value: (row) => statusLabel(section, row) })
  return columns
}

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function download(filename: string, rows: unknown[][]) {
  const body = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([`﻿${body}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function OtherDomainTables({
  sections,
  students,
  warning,
}: {
  sections: OtherTestSection[]
  students: OtherIdentity[]
  warning?: string | null
}) {
  const [selected, setSelected] = useState('')
  const section = sections.find((s) => s.id === selected) ?? sections[0]
  const columns = useMemo(() => (section ? columnsFor(section) : []), [section])
  // On screen, TVPS-3 dates move into each cell's tooltip to keep the table narrow (CSV keeps them).
  const screenColumns = section?.kind === 'tvps' ? columns.filter((c) => !c.header.endsWith('– Date')) : columns

  function exportCsv() {
    if (!section) return
    const rows = students.map((student) => [
      ...identityCells(student),
      ...columns.map((column) => column.value(section.rows[student.studentId])),
    ])
    download(`resultats-${section.id}.csv`, [[...IDENTITY_HEADERS, ...columns.map((c) => c.header)], ...rows])
  }

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">2. Autres domaines</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded border px-2 py-1.5 text-sm"
            value={section?.id ?? ''}
            onChange={(e) => setSelected(e.target.value)}
            aria-label="Test affiché"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.kind === 'tvps' ? 'TVPS-3 (8 sous-tests)' : s.name} · {s.mode === 'external' ? 'Externe' : 'Interne'} · {s.completedCount}
              </option>
            ))}
          </select>
          <button type="button" className="text-sm text-indigo-700 underline" onClick={exportCsv} disabled={!section}>
            Exporter Excel (CSV)
          </button>
        </div>
      </div>
      {warning && <p className="text-sm text-amber-700">{warning}</p>}
      {section && (
        <>
          <p className="text-xs text-slate-500">
            {section.domainName} · {section.mode === 'external' ? 'Test externe (résultats importés validés)' : 'Test interne (passation dans l’application)'} · dernière passation terminée
          </p>
          <div className="max-h-[70vh] overflow-auto rounded border">
            <table className="min-w-max border-collapse text-xs">
              <thead className="sticky top-0 bg-white">
                {section.groups.length > 1 || section.kind === 'tvps' ? (
                  <tr className="text-left text-slate-700">
                    <th colSpan={IDENTITY_HEADERS.length} />
                    {section.groups.map((group) => (
                      <th
                        key={group.key}
                        colSpan={screenColumns.filter((c) => c.groupKey === group.key).length}
                        className="border-l px-2 pt-2"
                      >
                        {group.label}
                      </th>
                    ))}
                    <th colSpan={screenColumns.filter((c) => !c.groupKey).length} className="border-l" />
                  </tr>
                ) : null}
                <tr className="text-left text-slate-500">
                  {IDENTITY_HEADERS.map((label) => (
                    <th key={label} className="px-2 py-2">{label}</th>
                  ))}
                  {screenColumns.map((column) => (
                    <th key={column.header} className="px-2 py-2">
                      {column.groupKey && column.header.includes(' – ') ? column.header.split(' – ').pop() : column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const row = section.rows[student.studentId]
                  return (
                    <tr key={student.studentId} className="border-t">
                      {identityCells(student).map((value, index) => (
                        <td key={IDENTITY_HEADERS[index]} className={`px-2 py-1 ${index === 0 ? 'font-mono' : ''}`}>{value}</td>
                      ))}
                      {screenColumns.map((column) => (
                        <td
                          key={column.header}
                          className="px-2 py-1"
                          title={column.groupKey ? cellTitle(row?.cells[column.groupKey]) : undefined}
                        >
                          {column.value(row)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
