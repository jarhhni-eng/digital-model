'use client'

import { useEffect, useState } from 'react'

type Cell = {
  score: number | null
  display: string
  status: string
  selectedLetters: string
  selectedText: string
  expectedLetters: string
  missedLetters: string
}
type Auto = { slot: number; prompt: string | null; text: string | null; code: number | null }
type Stats = {
  correctN: number
  correctP: number | null
  partialN: number
  partialP: number | null
  incorrectN: number
  incorrectP: number | null
  forgot: number
  unknown: number
  multiPresented: number
  multiPartial: number
  multiPartialP: number | null
  unanswered: number
  notPresented: number
}
type Notes = {
  controlScore: number | null
  controlMax: number | null
  semesterScore: number | null
  semesterMax: number | null
  regionalScore: number | null
  regionalMax: number | null
}
export type CkaMatrixRow = {
  studentId: string
  firstName: string
  lastName: string
  level: string | null
  className: string | null
  teacher: string | null
  teacherId: string | null
  school: string | null
  completedAt: string | null
  globalPercent: number | null
  durationMs: number | null
  clicks: number | null
  cells: Cell[]
  autos: Auto[]
  stats: Stats
  notes: Notes
}
export type CkaMatrixTest = {
  id: string
  name: string
  lesson: string
  questions: { id: string; number: number; prompt: string; type: string; multi: boolean; scorable: boolean; autoSlot: number | null; max: number | null }[]
  rows: CkaMatrixRow[]
}

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const body = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function pct(value: number | null): string {
  return value == null ? 'Non disponible' : `${String(value).replace('.', ',')} %`
}

function autoLabel(auto: Auto | undefined): string {
  if (!auto?.text) return ''
  return auto.code == null ? auto.text : `${auto.text} (${auto.code})`
}

export function useCkaMatrix() {
  const [tests, setTests] = useState<CkaMatrixTest[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/cka-question-matrix')
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? 'Chargement impossible')
        if (!cancelled) setTests(body.tests ?? [])
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])
  return { tests, error }
}

function exportTest(test: CkaMatrixTest) {
  const headers = [
    'Student_ID', 'Nom', 'Prénom', 'Niveau', 'Classe', 'Enseignant', 'Teacher_ID', 'Établissement',
    ...test.questions.map((question) => `Q${question.number}`),
    'Autoévaluation 1', 'Code 1', 'Autoévaluation 2', 'Code 2', 'Autoévaluation 3', 'Code 3',
    'Correctes N', 'Correctes %', 'Partielles N', 'Partielles %', 'Incorrectes N', 'Incorrectes %',
    'Note contrôle 2026/2027', 'Max contrôle', 'Note S2 2025/2026', 'Max S2', 'Note régional 2025/2026', 'Max régional',
  ]
  const rows = test.rows.map((row) => [
    row.studentId,
    row.lastName,
    row.firstName,
    row.level ?? '',
    row.className ?? '',
    row.teacher ?? '',
    row.teacherId ?? '',
    row.school ?? '',
    ...row.cells.map((cell) => cell.display),
    ...[0, 1, 2].flatMap((index) => [row.autos[index]?.text ?? '', row.autos[index]?.code ?? '']),
    row.stats.correctN,
    row.stats.correctP ?? '',
    row.stats.partialN,
    row.stats.partialP ?? '',
    row.stats.incorrectN,
    row.stats.incorrectP ?? '',
    row.notes.controlScore ?? '',
    row.notes.controlMax ?? '',
    row.notes.semesterScore ?? '',
    row.notes.semesterMax ?? '',
    row.notes.regionalScore ?? '',
    row.notes.regionalMax ?? '',
  ])
  downloadCsv(`cka-questions-${test.id}.csv`, [headers, ...rows])
}

export function CkaQuestionTables() {
  const { tests, error } = useCkaMatrix()
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Détails des résultats question par question — Tests de la cognition et apprentissage de la géométrie</h2>
        <p className="mt-1 text-sm text-slate-500">
          Une cellule vide signifie que la question n&apos;a pas de score. Les questions sans réponse ne sont pas comptées comme incorrectes.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {tests.map((test) => (
        <div key={test.id} className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-medium">{test.name}</h3>
              <p className="text-xs text-slate-500">Test_ID {test.id}{test.lesson ? ` · Leçon : ${test.lesson}` : ''}</p>
            </div>
            <button type="button" className="text-sm text-indigo-700 underline" onClick={() => exportTest(test)}>
              Exporter ce tableau (CSV)
            </button>
          </div>
          <div className="max-h-[60vh] overflow-auto rounded border">
            <table className="min-w-max border-collapse text-xs">
              <thead className="sticky top-0 bg-white text-left text-slate-500">
                <tr>
                  {['Student_ID', 'Nom', 'Prénom', 'Niveau', 'Classe', 'Enseignant', 'Établissement'].map((label) => (
                    <th key={label} className="px-2 py-2">{label}</th>
                  ))}
                  {test.questions.map((question) => (
                    <th key={question.id} className="px-2 py-2" title={question.id}>Q{question.number}</th>
                  ))}
                  {['Auto 1', 'Auto 2', 'Auto 3', 'Correctes', 'Correctes %', 'Partielles', 'Partielles %', 'Incorrectes', 'Incorrectes %'].map((label) => (
                    <th key={label} className="px-2 py-2">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {test.rows.map((row) => (
                  <tr key={row.studentId} className="border-t">
                    <td className="px-2 py-1 font-mono">{row.studentId}</td>
                    <td className="px-2 py-1">{row.lastName}</td>
                    <td className="px-2 py-1">{row.firstName}</td>
                    <td className="px-2 py-1">{row.level ?? ''}</td>
                    <td className="px-2 py-1">{row.className ?? ''}</td>
                    <td className="px-2 py-1">{row.teacher ?? ''}</td>
                    <td className="px-2 py-1">{row.school ?? ''}</td>
                    {row.cells.map((cell, index) => (
                      <td key={`${row.studentId}-${test.questions[index]?.id ?? index}`} className="px-2 py-1 whitespace-nowrap">{cell.display}</td>
                    ))}
                    <td className="px-2 py-1">{autoLabel(row.autos[0])}</td>
                    <td className="px-2 py-1">{autoLabel(row.autos[1])}</td>
                    <td className="px-2 py-1">{autoLabel(row.autos[2])}</td>
                    <td className="px-2 py-1">{row.stats.correctN}</td>
                    <td className="px-2 py-1">{pct(row.stats.correctP)}</td>
                    <td className="px-2 py-1">{row.stats.partialN}</td>
                    <td className="px-2 py-1">{pct(row.stats.partialP)}</td>
                    <td className="px-2 py-1">{row.stats.incorrectN}</td>
                    <td className="px-2 py-1">{pct(row.stats.incorrectP)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  )
}

export function CkaAnswerDetail({ studentId }: { studentId: string }) {
  const { tests, error } = useCkaMatrix()
  const available = tests.filter((test) => test.rows.some((row) => row.studentId === studentId))
  const [testId, setTestId] = useState('')
  const selectedId = testId || available[0]?.id || ''
  const test = available.find((item) => item.id === selectedId)
  const row = test?.rows.find((item) => item.studentId === studentId)

  function exportDetail() {
    if (!test || !row) return
    const headers = ['Student_ID', 'Test_ID', 'Question_ID', 'Numéro', 'Énoncé', 'Type', 'Réponse', 'Lettres', 'Attendu', 'Score', 'Score max', 'Statut', 'Options manquantes']
    const lines = test.questions.map((question, index) => {
      const cell = row.cells[index]
      return [
        row.studentId,
        test.id,
        question.id,
        question.number,
        question.prompt,
        question.type,
        cell?.selectedText ?? '',
        cell?.selectedLetters ?? '',
        cell?.expectedLetters ?? '',
        cell?.score ?? '',
        question.max ?? '',
        cell?.status ?? '',
        cell?.missedLetters ?? '',
      ]
    })
    downloadCsv(`reponses-${row.studentId}-${test.id}.csv`, [headers, ...lines])
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Détails des réponses du test</h2>
          <p className="text-sm text-slate-500">Consultation complémentaire des réponses CKA. Le tableau ci-dessus n&apos;est pas modifié.</p>
        </div>
        {row && (
          <button type="button" className="text-sm text-indigo-700 underline" onClick={exportDetail}>
            Exporter ce détail (CSV)
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {available.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Aucune passation CKA enregistrée pour cet élève.</p>
      ) : (
        <>
          <label className="mt-3 block text-sm">
            Test
            <select className="ml-2 rounded border px-2 py-1" value={selectedId} onChange={(event) => setTestId(event.target.value)}>
              {available.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          {test && row && (
            <div className="mt-3 space-y-3 text-sm">
              <p className="text-slate-600">
                {row.studentId} · {row.firstName} {row.lastName} · {row.level ?? 'Niveau non renseigné'} · {row.teacher ?? 'Enseignant non renseigné'} · {row.school ?? 'Établissement non renseigné'}
                <br />
                {test.name} · {test.lesson} · Score global {row.globalPercent == null ? 'Non disponible' : `${row.globalPercent} %`} · {row.completedAt ? new Date(row.completedAt).toLocaleString('fr-FR') : 'Date non disponible'}
              </p>
              <div className="space-y-2">
                {test.questions.map((question, index) => {
                  const cell = row.cells[index]
                  return (
                    <div key={question.id} className="rounded border p-3">
                      <p className="font-medium">Q{question.number} · {question.id} · {question.type}</p>
                      <p className="mt-1 text-slate-700">{question.prompt}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Réponse : {cell?.selectedText || '—'} {cell?.selectedLetters ? `(${cell.selectedLetters})` : ''}
                        {' · '}Attendu : {cell?.expectedLetters || '—'}
                        {' · '}Score : {cell?.score == null ? '—' : `${cell.score} / ${question.max ?? '—'}`}
                        {' · '}{cell?.status}
                        {cell?.missedLetters ? ` · Bonnes options non cochées : ${cell.missedLetters}` : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs">
                {row.autos.map((auto) => (
                  <p key={auto.slot}>
                    Autoévaluation {auto.slot}{auto.prompt ? ` — ${auto.prompt}` : ''} : {auto.text ?? 'Non disponible'}
                    {auto.code == null ? '' : ` · code ${auto.code}`}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
