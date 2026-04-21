'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockStudentProfile } from '@/lib/mock-data'
import {
  Brain, Eye, Zap, Target, Activity, Layers,
  CheckCircle2, Clock, Circle, Triangle, FileSignature,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  getLatestResultForUser,
  BEERY_MOTRICE_ITEM_COUNT,
  BeeryMotriceResult,
} from '@/lib/beery-motrice'
import { getLatestDAResult, DARResult } from '@/lib/attentional/divided-attention'
import { getLatestSAResult, SAResult } from '@/lib/attentional/selective-attention'
import { getLatestSARTResult, SARTResult } from '@/lib/attentional/sustained-attention'
import { getLatestTMTResult, TMTResult } from '@/lib/attentional/trail-making'
import { getLatestShAResult, ShAResult } from '@/lib/attentional/shifting-attention'
import { getLatestRAVLTResult, RAVLTResult } from '@/lib/memory/ravlt'
import { getLatestDigitSpanResult, DigitSpanResult } from '@/lib/memory/digit-span'
import { getLatestSpatialGeometryResult, SpatialGeometryResult } from '@/lib/geometry/spatial-geometry'

// ─── Exact same domain/test definitions as dashboard ──────────────────────────

const DOMAINS = [
  {
    id: 'attentional',
    name: 'Attentional capacities',
    nameFr: 'Capacités attentionnelles',
    icon: <Target className="w-4 h-4" />,
    color: '#3b82f6',
    score: 74,
    tests: [
      { id: 'test-divided-attention',       name: 'Divided attention',       status: 'completed',   score: 78 },
      { id: 'test-selective-attention',     name: 'Selective attention',     status: 'completed',   score: 72 },
      { id: 'test-sustained-attention',     name: 'Sustained attention',     status: 'in-progress', score: 65 },
      { id: 'test-visuo-spatial-attention', name: 'Attentional flexibility', status: 'upcoming',    score: 0  },
    ],
  },
  {
    id: 'reasoning',
    name: 'Reasoning capacities',
    nameFr: 'Capacités de raisonnement',
    icon: <Brain className="w-4 h-4" />,
    color: '#8b5cf6',
    score: 68,
    tests: [
      { id: 'test-abstract-reasoning',  name: 'Abstract reasoning',  status: 'completed', score: 70 },
      { id: 'test-deductive-reasoning', name: 'Deductive reasoning', status: 'completed', score: 75 },
      { id: 'test-inductive-reasoning', name: 'Inductive reasoning', status: 'upcoming',  score: 0  },
    ],
  },
  {
    id: 'spatial',
    name: 'Spatial reasoning',
    nameFr: 'Raisonnement spatial',
    icon: <Layers className="w-4 h-4" />,
    color: '#10b981',
    score: 61,
    tests: [
      { id: 'test-mental-rotation',        name: '2D mental rotation',    status: 'completed',   score: 65 },
      { id: 'test-mental-rotation-3d',     name: '3D mental rotation',    status: 'in-progress', score: 55 },
      { id: 'test-spatial-transformation', name: 'Mental transformation', status: 'upcoming',    score: 0  },
      { id: 'test-spatial-orientation',    name: 'Spatial orientation',   status: 'upcoming',    score: 0  },
    ],
  },
  {
    id: 'visual',
    name: 'Visual processing',
    nameFr: 'Traitement visuel',
    icon: <Eye className="w-4 h-4" />,
    color: '#f59e0b',
    score: 70,
    tests: [
      { id: 'test-visuo-motor',        name: 'Visual-motor ability',          status: 'completed',   score: 80 },
      { id: 'test-visuo-constructive', name: 'Visual constructive ability',    status: 'completed',   score: 74 },
      { id: 'test-visuo-perceptive',   name: 'Visual discrimination (TVPS)',   status: 'completed',   score: 72 },
      { id: 'test-visuo-perceptive',   name: 'Visual memory (TVPS)',           status: 'completed',   score: 68 },
      { id: 'test-visuo-perceptive',   name: 'Spatial relations (TVPS)',       status: 'in-progress', score: 60 },
      { id: 'test-visuo-perceptive',   name: 'Form constancy (TVPS)',          status: 'upcoming',    score: 0  },
      { id: 'test-visuo-perceptive',   name: 'Sequential memory (TVPS)',       status: 'upcoming',    score: 0  },
      { id: 'test-visuo-perceptive',   name: 'Figure-ground (TVPS)',           status: 'upcoming',    score: 0  },
      { id: 'test-visuo-perceptive',   name: 'Visual closure (TVPS)',          status: 'upcoming',    score: 0  },
    ],
  },
  {
    id: 'memory',
    name: 'Memory capacities',
    nameFr: 'Capacités de mémoire',
    icon: <Activity className="w-4 h-4" />,
    color: '#ef4444',
    score: 66,
    tests: [
      { id: 'test-visuo-spatial-memory', name: 'Working memory (visuospatial)', status: 'completed',   score: 70 },
      { id: 'test-working-memory',       name: 'Working memory (global)',        status: 'in-progress', score: 58 },
      { id: 'test-long-term-memory',     name: 'Long-term memory',               status: 'upcoming',    score: 0  },
    ],
  },
  {
    id: 'executive',
    name: 'Executive functions',
    nameFr: 'Fonctions exécutives',
    icon: <Zap className="w-4 h-4" />,
    color: '#06b6d4',
    score: 63,
    tests: [
      { id: 'test-cognitive-flexibility', name: 'Cognitive flexibility', status: 'completed',   score: 68 },
      { id: 'test-inhibition',            name: 'Inhibition',            status: 'completed',   score: 60 },
      { id: 'test-processing-speed',      name: 'Processing speed',      status: 'upcoming',    score: 0  },
    ],
  },
  {
    id: 'geometry-learning',
    name: 'Cognition et apprentissage de la géométrie',
    nameFr: 'Cognition et apprentissage de la géométrie',
    icon: <Triangle className="w-4 h-4" />,
    color: '#6366f1',
    score: 0,
    tests: [
      { id: 'test-geo-vectors',      name: 'Vecteurs et translation', status: 'upcoming', score: 0 },
      { id: 'test-geo-central-sym',  name: 'Symétrie centrale',        status: 'upcoming', score: 0 },
      { id: 'test-geo-axial-sym',    name: 'Symétrie axiale',          status: 'upcoming', score: 0 },
      { id: 'test-geo-dot-product',  name: 'Produit scalaire',         status: 'upcoming', score: 0 },
      { id: 'test-geo-trigonometry', name: 'Trigonométrie',            status: 'upcoming', score: 0 },
      { id: 'test-geo-line-plane',   name: 'Droite dans le plan',      status: 'upcoming', score: 0 },
      { id: 'test-geo-3d-geometry',  name: 'Géométrie dans l\'espace', status: 'upcoming', score: 0 },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed')
    return (
      <Badge className="gap-1 text-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <CheckCircle2 className="w-3 h-3" /> Completed
      </Badge>
    )
  if (status === 'in-progress')
    return (
      <Badge className="gap-1 text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        <Clock className="w-3 h-3" /> In progress
      </Badge>
    )
  return (
    <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
      <Circle className="w-3 h-3" /> Upcoming
    </Badge>
  )
}

function AttStat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 75) return 'text-green-600'
  if (score >= 55) return 'text-amber-600'
  return 'text-red-500'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [beery, setBeery] = useState<BeeryMotriceResult | null>(null)
  const [da, setDa] = useState<DARResult | null>(null)
  const [sa, setSa] = useState<SAResult | null>(null)
  const [sart, setSart] = useState<SARTResult | null>(null)
  const [tmt, setTmt] = useState<TMTResult | null>(null)
  const [sha, setSha] = useState<ShAResult | null>(null)
  const [ravlt, setRavlt] = useState<RAVLTResult | null>(null)
  const [digitSpan, setDigitSpan] = useState<DigitSpanResult | null>(null)
  const [spatialGeometry, setSpatialGeometry] = useState<SpatialGeometryResult | null>(null)

  useEffect(() => {
    const refresh = () => {
      const name = user?.username
      if (!name) {
        setBeery(null)
        setDa(null); setSa(null); setSart(null); setTmt(null); setSha(null)
        setRavlt(null); setDigitSpan(null)
        return
      }
      setBeery(getLatestResultForUser(name) ?? null)
      setDa(getLatestDAResult(name) ?? null)
      setSa(getLatestSAResult(name) ?? null)
      setSart(getLatestSARTResult(name) ?? null)
      setTmt(getLatestTMTResult(name) ?? null)
      setSha(getLatestShAResult(name) ?? null)
      setRavlt(getLatestRAVLTResult(name) ?? null)
      setDigitSpan(getLatestDigitSpanResult(name) ?? null)
      setSpatialGeometry(getLatestSpatialGeometryResult(name) ?? null)
    }
    refresh()
    window.addEventListener('beery-motrice-changed', refresh)
    window.addEventListener('attentional-changed', refresh)
    window.addEventListener('memory-changed', refresh)
    window.addEventListener('geometry-changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('beery-motrice-changed', refresh)
      window.removeEventListener('attentional-changed', refresh)
      window.removeEventListener('memory-changed', refresh)
      window.removeEventListener('geometry-changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [user])

  const totalTests = DOMAINS.reduce((s, d) => s + d.tests.length, 0)
  const completedTests = DOMAINS.reduce(
    (s, d) => s + d.tests.filter(t => t.status === 'completed').length, 0
  )
  const overallScore = Math.round(
    DOMAINS.reduce((s, d) => s + d.score, 0) / DOMAINS.length
  )

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" userName={mockStudentProfile.name} />

      <div className={cn('transition-all duration-200', isMobile ? 'ml-0' : 'ml-64')}>
        <Header
          title="Résultats des évaluations"
          subtitle="Vos performances par domaine cognitif et par test"
        />

        <main className={cn('p-4 md:p-6 pt-24 max-w-5xl', isMobile && 'pb-20')}>

          {/* ── Summary bar ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold text-primary">{overallScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">Overall score</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold text-green-600">{completedTests}</p>
                <p className="text-xs text-muted-foreground mt-1">Tests completed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold text-muted-foreground">{totalTests}</p>
                <p className="text-xs text-muted-foreground mt-1">Total tests</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Mémoire (résultats persistés) ────────────────────────────────── */}
          {(ravlt || digitSpan) && (
            <Card className="mb-6 border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-rose-600" />
                  <CardTitle className="text-base">Capacités de mémoire — derniers résultats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-2 md:grid-cols-2">
                  {digitSpan && (
                    <AttStat
                      label="Digit Span"
                      value={`${digitSpan.score}%`}
                      detail={`${digitSpan.correctCount}/${digitSpan.trials.length}`}
                    />
                  )}
                  {ravlt && (
                    <AttStat
                      label="RAVLT"
                      value={`${ravlt.totalScore}`}
                      detail={`/80 · ${Object.keys(ravlt.levels).length}/6 niveaux`}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Beery VMI (résultat corrigé par l'admin) ────────────────────── */}
          {beery && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-amber-500/10 p-2 text-amber-600">
                      <FileSignature className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Beery VMI — Intégration visuo-motrice
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Traitement visuel · Corrigé par un administrateur le{' '}
                        {new Date(beery.validatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Brut</p>
                      <p className="text-lg font-bold">{beery.rawScore}/{BEERY_MOTRICE_ITEM_COUNT}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Standard</p>
                      <p className="text-lg font-bold">{beery.standardScore}</p>
                    </div>
                    <Badge className="bg-amber-600 text-white">{beery.niveau}</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* ── Capacités attentionnelles (résultats persistés) ───────────── */}
          {(da || sa || sart || tmt || sha) && (
            <Card className="mb-6 border-blue-200 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Capacités attentionnelles — derniers résultats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
                  {da && <AttStat label="Attention divisée" value={`${da.score}%`} detail={`${da.correctCount}/${da.trials.length}`} />}
                  {sa && <AttStat label="Attention sélective" value={`${sa.score}%`} detail={`${sa.correctCount}/${sa.trials.length}`} />}
                  {sart && <AttStat label="Attention soutenue" value={`${sart.score}%`} detail={`C:${sart.commissionErrors} · O:${sart.omissionErrors}`} />}
                  {tmt && <AttStat label="Trail Making" value={`${tmt.score}`} detail={`B−A: ${Math.round(tmt.switchCost/1000)}s`} />}
                  {sha && <AttStat label="Flexibilité" value={`${sha.score}%`} detail={`Switch: ${sha.switchCost}ms`} />}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Domain → Tests → Scores ─────────────────────────────────────── */}
          <div className="space-y-6">
            {DOMAINS.map((domain) => {
              const completed = domain.tests.filter(t => t.status === 'completed').length
              const total = domain.tests.length

              return (
                <Card key={domain.id} className="overflow-hidden">
                  {/* Domain header */}
                  <CardHeader
                    className="pb-3"
                    style={{ borderLeft: `4px solid ${domain.color}` }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: domain.color }}>{domain.icon}</span>
                        <div>
                          <CardTitle className="text-base">{domain.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{domain.nameFr}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-2xl font-bold"
                          style={{ color: domain.color }}
                        >
                          {domain.score}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {completed}/{total} completed
                        </p>
                      </div>
                    </div>

                    {/* Domain progress bar */}
                    <div className="mt-3">
                      <Progress
                        value={domain.score}
                        className="h-2"
                        style={{ '--progress-color': domain.color } as React.CSSProperties}
                      />
                    </div>
                  </CardHeader>

                  {/* Tests list */}
                  <CardContent className="pt-0">
                    <div className="divide-y divide-border">
                      {domain.tests.map((test, idx) => (
                        <div
                          key={`${test.id}-${idx}`}
                          className="flex items-center justify-between py-3 gap-3"
                        >
                          {/* Test name + status */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  test.status === 'completed'
                                    ? '#16a34a'
                                    : test.status === 'in-progress'
                                    ? '#f59e0b'
                                    : '#d1d5db',
                              }}
                            />
                            <span className="text-sm font-medium truncate">
                              {test.name}
                            </span>
                          </div>

                          {/* Status badge */}
                          <div className="flex-shrink-0">
                            <StatusBadge status={test.status} />
                          </div>

                          {/* Score */}
                          <div className="w-16 text-right flex-shrink-0">
                            {test.status !== 'upcoming' ? (
                              <span
                                className={cn(
                                  'text-sm font-bold',
                                  scoreColor(test.score)
                                )}
                              >
                                {test.score}%
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
