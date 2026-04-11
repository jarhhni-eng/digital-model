'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine, ZAxis,
} from 'recharts'
import { TrendingUp, ArrowLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import {
  fitSEMModel1, DOMAIN_PREDICTOR_NAMES_FR, DOMAIN_PREDICTOR_NAMES_AR,
  rmseaQuality, cfiQuality,
} from '@/lib/sem'
import type { CognitiveDomainScores } from '@/lib/types'

// ── Demo data ─────────────────────────────────────────────────
function generateDemoSEMData() {
  const n = 30
  // Simulate cognitive domain scores for 30 students
  const domainScores: CognitiveDomainScores[] = Array.from({ length: n }, (_, i) => {
    const ability = (i / n) * 50 + 35
    const noise = () => (Math.random() - 0.5) * 20
    return {
      studentId: `student-${i}`,
      attentional: Math.max(20, Math.min(100, ability + noise())),
      reasoning: Math.max(20, Math.min(100, ability * 1.05 + noise())),
      spatial: Math.max(20, Math.min(100, ability * 0.95 + noise())),
      visual: Math.max(20, Math.min(100, ability * 0.90 + noise())),
      memory: Math.max(20, Math.min(100, ability + noise())),
      executive: Math.max(20, Math.min(100, ability * 1.02 + noise())),
      computedAt: new Date().toISOString(),
    }
  })

  // Simulate competency score: heavily influenced by spatial + reasoning + memory
  const competencyScores = domainScores.map((ds) =>
    Math.max(10, Math.min(100,
      0.35 * ds.spatial + 0.25 * ds.reasoning + 0.20 * ds.memory +
      0.10 * ds.attentional + 0.05 * ds.visual + 0.05 * ds.executive +
      (Math.random() - 0.5) * 15
    ))
  )

  return { domainScores, competencyScores }
}

const FIT_ICONS = {
  good: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  acceptable: <AlertCircle className="h-4 w-4 text-amber-500" />,
  poor: <XCircle className="h-4 w-4 text-red-500" />,
}
const FIT_COLORS = { good: 'text-emerald-600 border-emerald-200 bg-emerald-50', acceptable: 'text-amber-600 border-amber-200 bg-amber-50', poor: 'text-red-600 border-red-200 bg-red-50' }

export default function SEMPage() {
  const { locale } = useTranslation()

  const { domainScores, competencyScores } = useMemo(() => generateDemoSEMData(), [])
  const semResult = useMemo(() =>
    fitSEMModel1(competencyScores, domainScores, 'vectors-c1'), [domainScores, competencyScores])

  const domainNames = locale === 'fr' ? DOMAIN_PREDICTOR_NAMES_FR : DOMAIN_PREDICTOR_NAMES_AR

  // Coefficient chart data (skip intercept at index 0)
  const coefData = domainNames.map((name, i) => ({
    domain: name,
    coefficient: Math.round(semResult.coefficients[i + 1] * 1000) / 1000,
    se: Math.round(semResult.standardErrors[i + 1] * 1000) / 1000,
    pValue: semResult.pValues[i + 1],
    significant: semResult.pValues[i + 1] < 0.05,
  }))

  // Residual plot data
  const residualData = semResult.residuals.map((r, i) => ({
    x: i + 1,
    residual: Math.round(r * 100) / 100,
  }))

  const rmseaQ = rmseaQuality(semResult.rmsea)
  const cfiQ = cfiQuality(semResult.cfi)

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
                <TrendingUp className="h-6 w-6 text-primary" />
                {locale === 'fr' ? 'Modèle SEM — Vecteurs (C₁)' : 'نموذج SEM — المتجهات (ك₁)'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {locale === 'fr'
                  ? 'Modélisation par Équations Structurelles : prédiction de la compétence géométrique'
                  : 'نمذجة المعادلات البنائية: التنبؤ بالكفاءة الهندسية'}
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Model equation */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-2">
                  {locale === 'fr' ? 'Équation du modèle 2 :' : 'معادلة النموذج 2:'}
                </p>
                <code className="text-xs bg-background/80 rounded px-3 py-2 block font-mono">
                  C₁ = {Math.round(semResult.coefficients[0] * 100) / 100}
                  {domainNames.map((name, i) => {
                    const coef = semResult.coefficients[i + 1]
                    const sign = coef >= 0 ? '+' : '-'
                    return ` ${sign} ${Math.abs(Math.round(coef * 100) / 100)}·${name.substring(0, 3)}`
                  }).join('')}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  R² = {(semResult.rSquared * 100).toFixed(1)}% · n = {domainScores.length} {locale === 'fr' ? 'observations' : 'مشاهدة'}
                </p>
              </CardContent>
            </Card>

            {/* Fit indices */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'RMSEA', value: semResult.rmsea.toFixed(3), quality: rmseaQ, threshold: locale === 'fr' ? '< 0.05 excellent' : '< 0.05 ممتاز' },
                { label: 'CFI', value: semResult.cfi.toFixed(3), quality: cfiQ, threshold: locale === 'fr' ? '> 0.95 excellent' : '> 0.95 ممتاز' },
                { label: 'TLI', value: semResult.tli.toFixed(3), quality: cfiQuality(semResult.tli), threshold: locale === 'fr' ? '> 0.95 excellent' : '> 0.95 ممتاز' },
              ].map((idx) => (
                <Card key={idx.label} className={`border ${FIT_COLORS[idx.quality]}`}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      {FIT_ICONS[idx.quality]}
                      <span className="font-bold text-lg">{idx.value}</span>
                    </div>
                    <p className="text-sm font-semibold">{idx.label}</p>
                    <p className="text-xs opacity-70">{idx.threshold}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Coefficient chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'fr' ? 'Coefficients de régression' : 'معاملات الانحدار'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={coefData} layout="vertical" margin={{ left: 60, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="domain" tick={{ fontSize: 10 }} width={60} />
                      <Tooltip formatter={(v: number) => [v.toFixed(3)]} />
                      <ReferenceLine x={0} stroke="#888" />
                      <Bar dataKey="coefficient" radius={[0, 3, 3, 0]}>
                        {coefData.map((d, i) => (
                          <Cell
                            key={i}
                            fill={d.significant ? (d.coefficient >= 0 ? '#6366f1' : '#ef4444') : '#d1d5db'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Coefficient table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {locale === 'fr' ? 'Tableau des estimations' : 'جدول التقديرات'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground">{locale === 'fr' ? 'Prédicteur' : 'المنبئ'}</th>
                          <th className="text-right py-2 text-muted-foreground">β</th>
                          <th className="text-right py-2 text-muted-foreground">SE</th>
                          <th className="text-right py-2 text-muted-foreground">p</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-1.5 text-muted-foreground">{locale === 'fr' ? 'Constante' : 'الثابت'}</td>
                          <td className="py-1.5 text-right font-mono">{semResult.coefficients[0].toFixed(3)}</td>
                          <td className="py-1.5 text-right font-mono text-muted-foreground">{semResult.standardErrors[0].toFixed(3)}</td>
                          <td className="py-1.5 text-right">
                            <Badge variant="secondary" className="text-[10px]">
                              {semResult.pValues[0] < 0.001 ? '<.001' : semResult.pValues[0].toFixed(3)}
                            </Badge>
                          </td>
                        </tr>
                        {coefData.map((d, i) => (
                          <tr key={i} className="border-b border-border/30">
                            <td className="py-1.5">
                              {d.domain}
                              {d.significant && <span className="ml-1 text-primary">*</span>}
                            </td>
                            <td className="py-1.5 text-right font-mono">
                              <span className={d.coefficient >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                {d.coefficient.toFixed(3)}
                              </span>
                            </td>
                            <td className="py-1.5 text-right font-mono text-muted-foreground">{d.se.toFixed(3)}</td>
                            <td className="py-1.5 text-right">
                              <Badge
                                variant={d.significant ? 'default' : 'secondary'}
                                className={`text-[10px] ${d.significant ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                              >
                                {d.pValue < 0.001 ? '<.001' : d.pValue.toFixed(3)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[10px] text-muted-foreground mt-2">* p &lt; .05 — {locale === 'fr' ? 'significatif' : 'دال إحصائيًا'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Residual plot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {locale === 'fr' ? 'Analyse des résidus' : 'تحليل البواقي'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="x" name={locale === 'fr' ? 'Observation' : 'المشاهدة'} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="residual" name={locale === 'fr' ? 'Résidu' : 'البقية'} tick={{ fontSize: 10 }} />
                    <ZAxis range={[20, 20]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="4 2" />
                    <Scatter data={residualData} fill="#6366f1" opacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  {locale === 'fr'
                    ? 'Les résidus doivent être distribués aléatoirement autour de zéro (homoscédasticité).'
                    : 'يجب أن تتوزع البواقي عشوائيًا حول الصفر (تجانس التباين).'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
