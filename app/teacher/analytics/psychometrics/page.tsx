'use client'

import { useMemo } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ReferenceLine,
} from 'recharts'
import { Brain, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { analyzeItems, runPCA, irtCurvePoints } from '@/lib/psychometrics'

// ── Demo response matrix (30 students × 12 items) ────────────
function generateDemoData() {
  const n = 30
  const items = 12
  // Simulate responses with varying difficulty (0.3–0.8) and discrimination
  const difficulties = [0.8, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.38, 0.35, 0.3, 0.28]
  const discrimination = [0.15, 0.35, 0.42, 0.55, 0.48, 0.60, 0.25, 0.58, 0.32, 0.62, 0.45, 0.18]

  const responseMatrix: Record<string, boolean[]> = {}
  const totalScores: number[] = new Array(n).fill(0)

  for (let i = 0; i < items; i++) {
    const qid = `q${i + 1}`
    responseMatrix[qid] = []
    for (let j = 0; j < n; j++) {
      // Simulate response based on difficulty and add noise
      const ability = (j / n) * 3 - 1.5  // spread abilities from -1.5 to 1.5
      const p = 1 / (1 + Math.exp(-(discrimination[i] * 3) * (ability - (2 * difficulties[i] - 1.5))))
      const correct = Math.random() < p
      responseMatrix[qid].push(correct)
      if (correct) totalScores[j]++
    }
  }

  return { responseMatrix, totalScores }
}

// Demo domain scores for PCA (6 domains × 30 students)
function generatePCAData() {
  const n = 30
  const domains = 6
  return Array.from({ length: n }, (_, j) => {
    const baseAbility = (j / n) * 60 + 40 + (Math.random() - 0.5) * 20
    return Array.from({ length: domains }, (_, d) =>
      Math.max(20, Math.min(100, baseAbility + (Math.random() - 0.5) * 25))
    )
  })
}

export default function PsychometricsPage() {
  const { locale } = useTranslation()

  const { responseMatrix, totalScores } = useMemo(() => generateDemoData(), [])
  const itemAnalyses = useMemo(() => analyzeItems(responseMatrix, totalScores), [responseMatrix, totalScores])
  const pcaResult = useMemo(() => runPCA(generatePCAData()), [])

  // IRT curve for a sample item
  const irtCurve = useMemo(() => irtCurvePoints(1.2, 0.0, 40), [])

  const difficultyData = itemAnalyses.map((a, i) => ({
    item: `Q${i + 1}`,
    difficulty: Math.round(a.difficultyIndex * 100) / 100,
    discrimination: Math.round(a.discriminationIndex * 100) / 100,
    informative: a.isInformative,
  }))

  const screeData = pcaResult.eigenvalues.map((e, i) => ({
    factor: `F${i + 1}`,
    eigenvalue: Math.round(e * 100) / 100,
    variance: pcaResult.explainedVariance[i],
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="teacher" />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/teacher/analytics">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {locale === 'fr' ? 'Retour' : 'رجوع'}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                {locale === 'fr' ? 'Analyse Psychométrique' : 'التحليل النفسي القياسي'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {locale === 'fr'
                  ? 'IRT, PCA, indices de difficulté et discrimination des items'
                  : 'IRT، PCA، مؤشرات الصعوبة والتمييز للبنود'}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Item Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {locale === 'fr' ? 'Indice de difficulté par item' : 'مؤشر الصعوبة لكل بند'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="item" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [v.toFixed(2), locale === 'fr' ? 'Difficulté' : 'الصعوبة']} />
                    <ReferenceLine y={0.3} stroke="#ef4444" strokeDasharray="4 2" label={{ value: locale === 'fr' ? 'Très difficile' : 'صعب جدًا', fontSize: 10, fill: '#ef4444' }} />
                    <ReferenceLine y={0.7} stroke="#10b981" strokeDasharray="4 2" label={{ value: locale === 'fr' ? 'Facile' : 'سهل', fontSize: 10, fill: '#10b981' }} />
                    <Bar dataKey="difficulty" radius={[3, 3, 0, 0]}>
                      {difficultyData.map((d, i) => (
                        <Cell key={i} fill={d.difficulty < 0.3 ? '#ef4444' : d.difficulty > 0.7 ? '#10b981' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Discrimination Index */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'fr' ? 'Indice de discrimination' : 'مؤشر التمييز'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {difficultyData.map((d) => (
                      <div key={d.item} className="flex items-center gap-2">
                        <span className="w-8 text-xs text-muted-foreground">{d.item}</span>
                        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              d.informative ? 'bg-emerald-500' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.abs(d.discrimination) * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-xs text-right font-mono">{d.discrimination.toFixed(2)}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] shrink-0 ${d.informative ? 'text-emerald-600 border-emerald-200' : 'text-red-500 border-red-200'}`}
                        >
                          {d.informative
                            ? (locale === 'fr' ? 'Informatif' : 'مفيد')
                            : (locale === 'fr' ? 'Non-inf.' : 'غير مفيد')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {locale === 'fr'
                      ? `${difficultyData.filter((d) => d.informative).length}/${difficultyData.length} items informatifs (seuil : 0.20)`
                      : `${difficultyData.filter((d) => d.informative).length}/${difficultyData.length} بنود مفيدة (عتبة: 0.20)`}
                  </p>
                </CardContent>
              </Card>

              {/* IRT Characteristic Curve */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'fr' ? 'Courbe Caractéristique d\'Item (2PL)' : 'منحنى خصائص البند (2PL)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    {locale === 'fr' ? 'Item exemple : a = 1.2, b = 0.0' : 'بند نموذجي: a = 1.2, b = 0.0'}
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={irtCurve}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="theta"
                        tick={{ fontSize: 10 }}
                        label={{ value: 'θ (habileté)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                      />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(3), 'P(correct)']} />
                      <ReferenceLine x={0} stroke="#aaa" strokeDasharray="3 3" />
                      <ReferenceLine y={0.5} stroke="#aaa" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="probability" stroke="#6366f1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* PCA Scree Plot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {locale === 'fr' ? 'PCA — Diagramme des éboulis (Scree Plot)' : 'PCA — مخطط الانحدار'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={screeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="factor" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="4 2" label={{ value: locale === 'fr' ? 'Seuil Kaiser' : 'عتبة كايزر', fontSize: 10, fill: '#ef4444' }} />
                      <Bar dataKey="eigenvalue" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      {locale === 'fr' ? 'Variance expliquée par facteur' : 'التباين المُفسَّر لكل عامل'}
                    </p>
                    {screeData.map((s, i) => (
                      <div key={s.factor} className="flex items-center gap-2 text-xs">
                        <span className="w-6 font-medium">{s.factor}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${s.variance}%` }} />
                        </div>
                        <span className="w-12 text-right text-muted-foreground">{s.variance}%</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-2">
                      {locale === 'fr'
                        ? `Cumul F1+F2 : ${pcaResult.cumulativeVariance[1]?.toFixed(1)}%`
                        : `تراكم F1+F2: ${pcaResult.cumulativeVariance[1]?.toFixed(1)}٪`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
