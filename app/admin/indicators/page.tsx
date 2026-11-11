'use client'

import { useEffect, useState } from 'react'
import { Triangle } from 'lucide-react'
import { downloadCsv, useCkaMatrix } from '@/components/admin/cka-question-tables'

type ScoreCell = { earned: number | null; max: number | null; percent: number | null }
type Student = {
  studentId: string
  firstName: string
  lastName: string
  level: string | null
  teacher: string | null
  school: string | null
  cka: Record<string, {
    global: ScoreCell
    capacities: Record<string, ScoreCell>
    parts: Record<string, ScoreCell>
    durationMs: number | null
    clicks: number | null
  }>
}
type CkaTest = { id: string; name: string; capacities: { code: string; label: string }[]; parts: { key: string; label: string }[] }

function minutes(ms: number | null): string {
  if (ms == null) return 'Non disponible'
  return `${Math.round(ms / 60000)} min`
}

function list(cells: Record<string, ScoreCell> | undefined): string {
  if (!cells) return ''
  return Object.entries(cells)
    .filter(([, cell]) => cell.percent != null || cell.earned != null)
    .map(([key, cell]) => `${key}: ${cell.percent != null ? `${Math.round(cell.percent)}%` : `${cell.earned}/${cell.max}`}`)
    .join(' · ')
}

export default function IndicatorsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [tests, setTests] = useState<CkaTest[]>([])
  const [error, setError] = useState<string | null>(null)
  const matrix = useCkaMatrix()

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/aggregated-matrix')
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? 'Chargement impossible')
        if (!cancelled) {
          setStudents(body.students ?? [])
          setTests(body.ckaTests ?? [])
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const detail = new Map(matrix.tests.flatMap((test) => test.rows.map((row) => [`${row.studentId}|${test.id}`, row] as const)))
  const rows = students.flatMap((student) =>
    tests
      .filter((test) => student.cka[test.id])
      .map((test) => ({ student, test, score: student.cka[test.id], detail: detail.get(`${student.studentId}|${test.id}`) })),
  )

  function exportIndicators() {
    const headers = [
      'Student_ID', 'Nom', 'Prénom', 'Niveau', 'Enseignant', 'Établissement', 'Test_ID', 'Test',
      'Durée totale min', 'Clics totaux', 'J\'ai oublié', 'Je ne sais pas',
      'QCM multiples présentées', 'Scores partiels', 'Partiel %', 'Sans réponse', 'Non présentées', 'CK', 'Parties',
    ]
    downloadCsv('indicateurs-cka.csv', [
      headers,
      ...rows.map((row) => [
        row.student.studentId,
        row.student.lastName,
        row.student.firstName,
        row.student.level ?? '',
        row.student.teacher ?? '',
        row.student.school ?? '',
        row.test.id,
        row.test.name,
        row.score.durationMs == null ? '' : Math.round(row.score.durationMs / 60000),
        row.score.clicks ?? '',
        row.detail?.stats.forgot ?? '',
        row.detail?.stats.unknown ?? '',
        row.detail?.stats.multiPresented ?? '',
        row.detail?.stats.multiPartial ?? '',
        row.detail?.stats.multiPartialP ?? '',
        row.detail?.stats.unanswered ?? '',
        row.detail?.stats.notPresented ?? '',
        list(row.score.capacities),
        list(row.score.parts),
      ]),
    ])
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Triangle className="h-6 w-6 text-indigo-600" />
          Indicateurs de performance
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Uniquement les tests de cognition et apprentissage de la géométrie. La durée est la durée totale. Les clics ne sont affichés que s&apos;ils ont été enregistrés.
        </p>
        <button type="button" className="mt-2 text-sm text-indigo-700 underline" onClick={exportIndicators}>Exporter Excel (CSV)</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="max-h-[75vh] overflow-auto rounded border">
        <table className="min-w-max border-collapse text-sm">
          <thead className="sticky top-0 bg-white text-left text-slate-500">
            <tr>
              {['Student_ID', 'Élève', 'Niveau', 'Enseignant', 'Établissement', 'Test', 'Durée totale', 'Clics totaux', 'J\'ai oublié', 'Je ne sais pas', 'QCM multiples', 'Scores partiels', 'Partiel %', 'CK', 'Parties'].map((label) => (
                <th key={label} className="px-3 py-2">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.student.studentId}-${row.test.id}`} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{row.student.studentId}</td>
                <td className="px-3 py-2">{`${row.student.firstName} ${row.student.lastName}`.trim()}</td>
                <td className="px-3 py-2">{row.student.level ?? ''}</td>
                <td className="px-3 py-2">{row.student.teacher ?? ''}</td>
                <td className="px-3 py-2">{row.student.school ?? ''}</td>
                <td className="px-3 py-2">{row.test.name}</td>
                <td className="px-3 py-2">{minutes(row.score.durationMs)}</td>
                <td className="px-3 py-2">{row.score.clicks == null ? 'Non disponible' : row.score.clicks}</td>
                <td className="px-3 py-2">{row.detail ? row.detail.stats.forgot : 'Non disponible'}</td>
                <td className="px-3 py-2">{row.detail ? row.detail.stats.unknown : 'Non disponible'}</td>
                <td className="px-3 py-2">{row.detail ? row.detail.stats.multiPresented : 'Non disponible'}</td>
                <td className="px-3 py-2">{row.detail ? row.detail.stats.multiPartial : 'Non disponible'}</td>
                <td className="px-3 py-2">{row.detail?.stats.multiPartialP == null ? 'Non disponible' : `${String(row.detail.stats.multiPartialP).replace('.', ',')} %`}</td>
                <td className="px-3 py-2">{list(row.score.capacities) || 'Non disponible'}</td>
                <td className="px-3 py-2">{list(row.score.parts) || 'Non disponible'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
