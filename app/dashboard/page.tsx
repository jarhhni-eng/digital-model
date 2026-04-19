'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, Clock, CheckCircle2, BookOpen,
  Brain, Eye, Zap, Target, Activity, Layers,
  ChevronRight,
} from 'lucide-react'
import type { TestSubmission } from '@/lib/submissions-types'

// ─── Domain & test definitions ────────────────────────────────────────────────

const DOMAINS = [
  {
    id: 'attentional',
    name: 'Attentional capacities',
    nameFr: 'Capacités attentionnelles',
    icon: <Target className="w-4 h-4" />,
    color: '#3b82f6',
    score: 74,
    tests: [
      { id: 'test-divided-attention',     name: 'Divided attention',     status: 'completed',   score: 78 },
      { id: 'test-selective-attention',   name: 'Selective attention',   status: 'completed',   score: 72 },
      { id: 'test-sustained-attention',   name: 'Sustained attention',   status: 'in-progress', score: 65 },
      { id: 'test-visuo-spatial-attention', name: 'Attentional flexibility', status: 'upcoming', score: 0 },
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
      { id: 'test-abstract-reasoning',   name: 'Abstract reasoning',  status: 'completed',   score: 70 },
      { id: 'test-deductive-reasoning',  name: 'Deductive reasoning', status: 'completed',   score: 75 },
      { id: 'test-inductive-reasoning',  name: 'Inductive reasoning', status: 'upcoming',    score: 0  },
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
      { id: 'test-mental-rotation',         name: '2D mental rotation',     status: 'completed',   score: 65 },
      { id: 'test-mental-rotation',         name: '3D mental rotation',     status: 'in-progress', score: 55 },
      { id: 'test-spatial-transformation',  name: 'Mental transformation',  status: 'upcoming',    score: 0  },
      { id: 'test-spatial-orientation',     name: 'Spatial orientation',    status: 'upcoming',    score: 0  },
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
      { id: 'test-visuo-motor',        name: 'Visual-motor ability',      status: 'completed', score: 80 },
      { id: 'test-visuo-constructive', name: 'Visual constructive ability', status: 'completed', score: 74 },
      // TVPS sub-tests
      { id: 'test-visuo-perceptive',   name: 'Visual discrimination (TVPS)',  status: 'completed',   score: 72 },
      { id: 'test-visuo-perceptive',   name: 'Visual memory (TVPS)',          status: 'completed',   score: 68 },
      { id: 'test-visuo-perceptive',   name: 'Spatial relations (TVPS)',      status: 'in-progress', score: 60 },
      { id: 'test-visuo-perceptive',   name: 'Form constancy (TVPS)',         status: 'upcoming',    score: 0  },
      { id: 'test-visuo-perceptive',   name: 'Sequential memory (TVPS)',      status: 'upcoming',    score: 0  },
      { id: 'test-visuo-perceptive',   name: 'Figure-ground (TVPS)',          status: 'upcoming',    score: 0  },
      { id: 'test-visuo-perceptive',   name: 'Visual closure (TVPS)',         status: 'upcoming',    score: 0  },
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
      { id: 'test-working-memory',       name: 'Working memory (global)',       status: 'in-progress', score: 58 },
      { id: 'test-long-term-memory',     name: 'Long-term memory',              status: 'upcoming',    score: 0  },
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
]

// Chart data derived from DOMAINS
const domainPerformanceData = DOMAINS.map((d) => ({
  domain: d.nameFr.split(' ')[0],
  fullName: d.name,
  score: d.score,
  fill: d.color,
}))

const progressOverTimeData = [
  { test: 'Divided att.', score: 78 },
  { test: 'Selective att.', score: 72 },
  { test: 'Abstract res.', score: 70 },
  { test: 'Deductive res.', score: 75 },
  { test: '2D Rotation', score: 65 },
  { test: 'Visuo-motor', score: 80 },
  { test: 'Visual constr.', score: 74 },
  { test: 'Cogn. flexib.', score: 68 },
  { test: 'Inhibition', score: 60 },
  { test: 'WM visuospat.', score: 70 },
]

// All tests flat list for "Recent Assessments"
const ALL_TESTS = DOMAINS.flatMap((d) =>
  d.tests.map((t) => ({ ...t, domain: d.name, domainId: d.id, color: d.color }))
)

// Unique tests (deduplicate by name for display)
const UNIQUE_TESTS = ALL_TESTS.filter(
  (t, i, arr) => arr.findIndex((x) => x.name === t.name) === i
)

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === 'completed')
    return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Completed</Badge>
  if (status === 'in-progress')
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">In progress</Badge>
  return <Badge variant="outline" className="text-xs text-muted-foreground">Upcoming</Badge>
}

// ─── Custom bar tooltip ───────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: { payload: { fullName: string; score: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-border rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold">{d.fullName}</p>
      <p className="text-primary font-bold">{d.score}%</p>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [subs, setSubs] = useState<TestSubmission[]>([])
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.userId) return
    fetch(`/api/submissions?userId=${encodeURIComponent(user.userId)}`)
      .then((r) => r.json())
      .then((d) => setSubs(d.submissions ?? []))
      .catch(() => setSubs([]))
  }, [user?.userId])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  const submittedIds = new Set(subs.map((s) => s.testId))

  // Counts from UNIQUE_TESTS
  const completedCount  = UNIQUE_TESTS.filter(
    (t) => t.status === 'completed' || submittedIds.has(t.id)
  ).length
  const inProgressCount = UNIQUE_TESTS.filter((t) => t.status === 'in-progress').length
  const upcomingCount   = UNIQUE_TESTS.filter((t) => t.status === 'upcoming').length

  const pieData = [
    { name: 'Completed tests',   value: completedCount,  fill: '#16a34a' },
    { name: 'In-progress tests', value: inProgressCount, fill: '#f59e0b' },
    { name: 'Upcoming tests',    value: upcomingCount,   fill: '#64748b' },
  ]

  const avgScore = Math.round(DOMAINS.reduce((s, d) => s + d.score, 0) / DOMAINS.length)

  // Strengths & weaknesses for results section
  const sorted = [...DOMAINS].sort((a, b) => b.score - a.score)
  const strengths   = sorted.slice(0, 2)
  const weaknesses  = sorted.slice(-2).reverse()

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" userName={user.username} />
      <MobileNav userRole="student" />

      <div className={cn("transition-all duration-200", isMobile ? "ml-0" : "ml-64")}>
        <Header title="Tableau de bord" subtitle="Suivi de votre progression cognitive" />

        <main className={cn("p-4 md:p-6 pt-24 max-w-7xl mx-auto", isMobile && "pb-20")}>

          {/* Research banner */}
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm text-primary mb-1">
                Invitation à participer à une recherche
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vous êtes invité(e) à participer à une recherche visant à mieux comprendre
                les processus d&apos;apprentissage au cycle secondaire qualifiant.
                Toutes les données sont anonymisées — ENS Fès, USMBA.
              </p>
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, title: 'Overall Score',    value: `${avgScore}%`,      sub: 'Across all domains' },
              { icon: <CheckCircle2 className="w-5 h-5" />, title: 'Completed',      value: completedCount,      sub: `${UNIQUE_TESTS.length} total` },
              { icon: <Clock className="w-5 h-5" />,        title: 'In Progress',    value: inProgressCount,     sub: 'Active now' },
              { icon: <BookOpen className="w-5 h-5" />,     title: 'Upcoming',       value: upcomingCount,       sub: 'Not yet started' },
            ].map((s) => (
              <Card key={s.title}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">{s.title}</p>
                    <span className="text-primary">{s.icon}</span>
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Performance + Pie ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Bar chart — 6 domains */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Domain Performance</CardTitle>
                <CardDescription>Your scores across cognitive domains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={domainPerformanceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {domainPerformanceData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {DOMAINS.map((d) => (
                    <div key={d.id} className="flex items-center gap-1.5 text-xs">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pie — test status with labels */}
            <Card>
              <CardHeader>
                <CardTitle>Test Status</CardTitle>
                <CardDescription>Distribution of test progress</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2 mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Progress Over Time ── */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>Score per completed assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={progressOverTimeData} margin={{ top: 5, right: 20, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="test"
                    tick={{ fontSize: 10 }}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    cursor={{ stroke: '#e2e8f0' }}
                  />
                  <Legend verticalAlign="top" />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score (%)"
                    stroke="#1e3a8a"
                    strokeWidth={2.5}
                    dot={{ fill: '#1e3a8a', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ── Capacity Profile (Results) ── */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Capacity Profile</CardTitle>
              <CardDescription>Strengths and areas for improvement across cognitive domains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* All domains with bar */}
              {DOMAINS.map((d) => (
                <div key={d.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span style={{ color: d.color }}>{d.icon}</span>
                      <span className="font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ color: d.color }}>{d.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${d.score}%`, backgroundColor: d.color }}
                    />
                  </div>
                </div>
              ))}

              {/* Strengths / Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">Strengths</p>
                  {strengths.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-green-800">{d.name}</span>
                      <span className="font-bold text-green-700">{d.score}%</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <p className="text-sm font-semibold text-amber-700 mb-2">Areas to improve</p>
                  {weaknesses.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-amber-800">{d.name}</span>
                      <span className="font-bold text-amber-700">{d.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Domain Breakdown + per-test progress ── */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Domain Breakdown</h2>
            <div className="space-y-4">
              {DOMAINS.map((domain) => (
                <Card key={domain.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ color: domain.color }}>{domain.icon}</span>
                        <CardTitle className="text-base">{domain.name}</CardTitle>
                      </div>
                      <span className="text-sm font-bold" style={{ color: domain.color }}>
                        {domain.score}%
                      </span>
                    </div>
                    <Progress value={domain.score} className="h-1.5 mt-1" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {domain.tests.map((t, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
                          <Link
                            href={`/tests/${t.id}`}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{t.name}</span>
                          </Link>
                          <div className="flex items-center gap-3">
                            {t.score > 0 && (
                              <span className="tabular-nums font-medium text-xs">{t.score}%</span>
                            )}
                            <StatusBadge status={t.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ── Recent Assessments ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Recent Assessments</h2>
                <p className="text-sm text-muted-foreground">All cognitive capacity assessments</p>
              </div>
              <Button variant="outline" asChild size="sm">
                <Link href="/tests">View All</Link>
              </Button>
            </div>

            {DOMAINS.map((domain) => (
              <div key={domain.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: domain.color }}>{domain.icon}</span>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {domain.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {domain.tests.map((t, i) => {
                    const done = t.status === 'completed' || submittedIds.has(t.id)
                    return (
                      <Link key={i} href={done ? '/results' : `/tests/${t.id}`}>
                        <div className={cn(
                          'rounded-xl border p-4 transition-all hover:shadow-sm cursor-pointer',
                          done ? 'border-green-200 bg-green-50/50' : 'border-border bg-card hover:border-primary/30'
                        )}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight">{t.name}</p>
                            <StatusBadge status={done ? 'completed' : t.status} />
                          </div>
                          {t.score > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Score</span>
                                <span className="font-semibold">{t.score}%</span>
                              </div>
                              <Progress value={t.score} className="h-1" />
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
