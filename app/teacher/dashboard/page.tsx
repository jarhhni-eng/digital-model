'use client'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StatCard } from '@/components/dashboard-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockTeacherStudents, mockStudentProfile } from '@/lib/mock-data'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell,
  PieChart, Pie
} from 'recharts'
import { Users, TrendingUp, AlertCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'

const classPerformanceData = [
  { domain: 'Numerical', avgScore: 76.5 },
  { domain: 'Spatial', avgScore: 68.2 },
  { domain: 'Problem', avgScore: 65.8 },
  { domain: 'Algebra', avgScore: 0 },
]

const studentPerformanceScatter = [
  { name: 'Emma', testsCompleted: 8, avgScore: 75 },
  { name: 'James', testsCompleted: 9, avgScore: 82 },
  { name: 'Sofia', testsCompleted: 5, avgScore: 68 },
  { name: 'Marcus', testsCompleted: 8, avgScore: 80 },
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
  const totalStudents = mockTeacherStudents.length
  const avgClassScore = (
    mockTeacherStudents.reduce((sum, s) => sum + s.averageScore, 0) /
    totalStudents
  ).toFixed(1)
  const studentsNeedingSupport = mockTeacherStudents.filter(
    (s) => s.averageScore < 70
  ).length

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="teacher" userName="Dr. Richard Smith" />
      
      <div className="ml-64">
        <Header
          title="Teacher Dashboard"
          subtitle="Manage students and monitor class progress"
        />
        
        <main className="p-6 pt-24 max-w-7xl">
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
              value={(
                mockTeacherStudents.reduce((sum, s) => sum + s.completedTests, 0) /
                totalStudents
              ).toFixed(1)}
              description="Completed assessments"
            />
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
                <CardDescription>Monitor individual student progress</CardDescription>
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
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Join Date
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Avg Score
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Tests Done
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Focus Areas
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTeacherStudents.map((student) => (
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
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {student.joinDate}
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
                        <td className="py-3 px-4 text-xs">
                          {student.weakAreas.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {student.weakAreas.slice(0, 2).map((area) => (
                                <span
                                  key={area}
                                  className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No issues</span>
                          )}
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
