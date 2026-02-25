'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StatCard, ProgressCard } from '@/components/dashboard-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockTeacherStudents, mockStudentProfile, mockStudentResults, mockDomains } from '@/lib/mock-data'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { ArrowLeft, Mail, Calendar, Award, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const radarData = [
  { capacity: 'Counting', score: 85 },
  { capacity: 'Arithmetic', score: 72 },
  { capacity: 'Comparison', score: 80 },
  { capacity: 'Rotation', score: 65 },
  { capacity: 'Geometry', score: 72 },
]

interface StudentDetailsPageProps {
  params: {
    studentId: string
  }
}

export default function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  const router = useRouter()
  const student = mockTeacherStudents.find((s) => s.id === params.studentId) || mockTeacherStudents[0]
  const profile = mockStudentProfile

  const attemptHistory = [
    { attempt: '1', date: '2025-02-15', score: 68, domain: 'Numerical' },
    { attempt: '2', date: '2025-02-18', score: 72, domain: 'Spatial' },
    { attempt: '3', date: '2025-02-20', score: 78, domain: 'Numerical' },
    { attempt: '4', date: '2025-02-22', score: 65, domain: 'Problem Solving' },
  ]

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="teacher" userName="Dr. Richard Smith" />
      
      <div className="ml-64">
        <Header
          title={`Student Profile: ${student.name}`}
          subtitle="Detailed progress and assessment history"
        />
        
        <main className="p-6 pt-24 max-w-7xl">
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Class
          </Button>

          {/* Student Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <CardDescription>Enrolled: {student.joinDate}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium text-foreground">
                        {student.joinDate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Average Score</p>
                    <p className="text-2xl font-bold text-primary">
                      {student.averageScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">
                      Tests Completed
                    </p>
                    <p className="text-2xl font-bold text-secondary">
                      {student.completedTests}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Award className="w-5 h-5" />}
              title="Current Avg"
              value={`${student.averageScore.toFixed(1)}%`}
              description="Performance level"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Total Tests"
              value={student.completedTests}
              description="Completed assessments"
            />
            <StatCard
              icon={<AlertCircle className="w-5 h-5" />}
              title="Focus Areas"
              value={student.weakAreas.length}
              description="Need improvement"
            />
            <StatCard
              icon={<Award className="w-5 h-5" />}
              title="Best Score"
              value="85%"
              description="Counting capacity"
            />
          </div>

          {/* Performance Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Capacity Profile</CardTitle>
                <CardDescription>Performance across different capacities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="capacity" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#1e3a8a"
                      fill="#1e3a8a"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Domain Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Domain Progress</CardTitle>
                <CardDescription>Completion across domains</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDomains.slice(0, 3).map((domain) => (
                  <div key={domain.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {domain.name}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {domain.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                        style={{ width: `${domain.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Assessment Trend */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Score progression over recent assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={attemptHistory}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#1e3a8a"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attempt History */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>Recent test attempts and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attemptHistory.map((attempt) => (
                  <div
                    key={attempt.attempt}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {attempt.domain}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {attempt.score}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weak Areas & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Areas Needing Support</CardTitle>
              </CardHeader>
              <CardContent>
                {student.weakAreas.length > 0 ? (
                  <div className="space-y-2">
                    {student.weakAreas.map((area) => (
                      <div
                        key={area}
                        className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                        <span className="text-sm text-foreground">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No weak areas identified
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Teacher Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Send Assignment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Schedule Review
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Print Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Message Student
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
