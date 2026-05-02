'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/dashboard-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStudentsForTeacher, mockStudentProfile } from '@/lib/mock-data'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell,
  PieChart, Pie
} from 'recharts'
import { Users, TrendingUp, AlertCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

const classPerformanceData = [
  { domain: 'Numerical', avgScore: 76.5 },
  { domain: 'Spatial', avgScore: 68.2 },
  { domain: 'Problem', avgScore: 65.8 },
  { domain: 'Algebra', avgScore: 0 },
]

const attendanceTrend = [
  { week: 'Week 1', completion: 72 },
  { week: 'Week 2', completion: 78 },
  { week: 'Week 3', completion: 85 },
  { week: 'Week 4', completion: 88 },
]

const weakAreaDistribution = [
  { name: 'Spatial', students: 2 },
  { name: 'Problem Solving', students: 2 },
  { name: 'Algebra', students: 3 },
  { name: 'Advanced Geometry', students: 1 },
]

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'teacher' && user.role !== 'admin'))) {
      router.replace('/')
    }
  }, [loading, user, router])

  // Scope to the logged-in teacher's roster only (admins see all).
  const myStudents = getStudentsForTeacher(user?.username, user?.role === 'admin')
  const totalStudents = myStudents.length
  const avgClassScore =
    totalStudents > 0
      ? (myStudents.reduce((sum, s) => sum + s.averageScore, 0) / totalStudents).toFixed(1)
      : '0.0'
  const studentsNeedingSupport = myStudents.filter((s) => s.averageScore < 70).length

  // Scatter chart derived from the filtered roster — keeps the visualisation
  // consistent with the table the teacher actually sees.
  const studentPerformanceScatter = myStudents.map((s) => ({
    name: s.name.split(' ')[0],
    testsCompleted: s.completedTests,
    avgScore: s.averageScore,
  }))

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="teacher" userName={user.username} />
      
      <div className={cn("transition-all duration-200", isMobile ? "ml-0" : "ml-64")}>
        <Header
          title="Tableau de bord professeur"
          subtitle="Gérez vos élèves et suivez la progression de la classe"
        />

        <main className="p-4 md:p-6 pt-24 max-w-7xl">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              title="Total Students"
              value={totalStudents}
              description="Active in class"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Class Average"
              value={`${avgClassScore}%`}
              description="Overall performance"
            />
            <StatCard
              icon={<AlertCircle className="w-5 h-5" />}
              title="Need Support"
              value={studentsNeedingSupport}
              description="Score below 70%"
            />
            <StatCard
              icon={<BookOpen className="w-5 h-5" />}
              title="Avg Tests/Student"
              value={
                totalStudents > 0
                  ? (
                      myStudents.reduce((sum, s) => sum + s.completedTests, 0) /
                      totalStudents
                    ).toFixed(1)
                  : '0.0'
              }
              description="Completed assessments"
            />
          </div>

          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analytics</CardTitle>
                <CardDescription>Filtres et rapports de cohorte</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/analytics">Ouvrir l&apos;analytique</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Domain Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Class Performance by Domain</CardTitle>
                <CardDescription>Average scores across cognitive domains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="domain" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="avgScore" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>Tests completed vs average score</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="testsCompleted"
                      name="Tests Completed"
                      label={{ value: 'Tests Completed', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="avgScore"
                      name="Avg Score"
                      label={{ value: 'Avg Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Scatter name="Students" data={studentPerformanceScatter} fill="#1e3a8a" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Completion Trend */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Assessment Completion Trend</CardTitle>
              <CardDescription>Weekly class assessment completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ fill: '#0d9488', r: 5 }}
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weak Areas Identified */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Identified Weak Areas</CardTitle>
                <CardDescription>Capacities where students struggle most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weakAreaDistribution.map((area) => (
                    <div key={area.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{area.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {area.students} student{area.students !== 1 ? 's' : ''} need support
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-warning">{area.students}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Generate Class Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Assign New Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Send Announcements
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Performance Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Student List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Roster</CardTitle>
                <CardDescription>
                  Vous ne voyez que les élèves rattachés à votre compte enseignant.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Nom
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Gmail
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Niveau scolaire
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Score moyen
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Tests réalisés
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Moy. 2024/25
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Moy. 2025/26
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-foreground font-medium">
                          {student.name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {student.email}
                        </td>
                        <td className="py-3 px-4 text-foreground text-xs">
                          {student.scholarLevel ?? '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={
                              student.averageScore >= 75
                                ? 'text-success font-semibold'
                                : student.averageScore >= 70
                                  ? 'text-warning font-semibold'
                                  : 'text-destructive font-semibold'
                            }
                          >
                            {student.averageScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-foreground">
                          {student.completedTests}
                        </td>
                        <td className="py-3 px-4 text-center text-foreground tabular-nums">
                          {student.mathAverage2024_2025 != null
                            ? `${student.mathAverage2024_2025.toFixed(1)} / 20`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-center text-foreground tabular-nums">
                          {student.mathAverage2025_2026 != null
                            ? `${student.mathAverage2025_2026.toFixed(1)} / 20`
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/teacher/students/${student.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
