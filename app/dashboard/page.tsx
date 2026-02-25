'use client'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StatCard, ProgressCard, TestCard } from '@/components/dashboard-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockDomains, mockTests, mockStudentProfile } from '@/lib/mock-data'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Clock, CheckCircle2, BookOpen } from 'lucide-react'

const overallScore = 71
const progressData = [
  { domain: 'Numerical', score: 78 },
  { domain: 'Spatial', score: 68 },
  { domain: 'Problem', score: 62 },
]

const timelineData = [
  { week: 'Week 1', score: 55 },
  { week: 'Week 2', score: 62 },
  { week: 'Week 3', score: 68 },
  { week: 'Week 4', score: 71 },
]

const pieData = [
  { name: 'Completed', value: 3, fill: '#16a34a' },
  { name: 'In Progress', value: 1, fill: '#f59e0b' },
  { name: 'Upcoming', value: 1, fill: '#64748b' },
]

export default function StudentDashboard() {
  const completedTests = mockTests.filter(t => t.status === 'completed').length
  const inProgressTests = mockTests.filter(t => t.status === 'in-progress').length
  const upcomingTests = mockTests.filter(t => t.status === 'upcoming').length
  const avgDomainProgress = Math.round(mockDomains.reduce((sum, d) => sum + d.progress, 0) / mockDomains.length)

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" userName={mockStudentProfile.name} />
      
      <div className="ml-64">
        <Header title="Dashboard" subtitle="Welcome back to your cognitive assessment progress" />
        
        <main className="p-6 pt-24 max-w-7xl">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Overall Score"
              value={`${overallScore}%`}
              change={{ value: 12, trend: 'up' }}
              description="This month"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              title="Completed Tests"
              value={completedTests}
              description={`${mockTests.length} total`}
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              title="In Progress"
              value={inProgressTests}
              description="Active now"
            />
            <StatCard
              icon={<BookOpen className="w-5 h-5" />}
              title="Domain Progress"
              value={`${avgDomainProgress}%`}
              description="Average across domains"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Domain Performance</CardTitle>
                <CardDescription>Your scores across cognitive domains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="domain" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      cursor={{ fill: '#f1f5f9' }}
                    />
                    <Bar dataKey="score" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Test Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Test Status</CardTitle>
                <CardDescription>Distribution of test progress</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-sm mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Over Time */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>Your assessment scores progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    cursor={{ stroke: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#1e3a8a"
                    strokeWidth={2}
                    dot={{ fill: '#1e3a8a', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Tests */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Recent Assessments</h2>
                <p className="text-sm text-muted-foreground">Your upcoming and completed tests</p>
              </div>
              <Button variant="outline">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTests.map((test) => (
                <TestCard
                  key={test.id}
                  title={test.title}
                  domain={test.domain}
                  status={test.status}
                  dueDate={test.dueDate}
                />
              ))}
            </div>
          </div>

          {/* Domain Progress Cards */}
          <div className="mb-8">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Domain Progress</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockDomains.filter(d => !d.isLocked).map((domain) => (
                <ProgressCard
                  key={domain.id}
                  title={domain.name}
                  description={domain.description}
                  value={domain.progress}
                  label={`${domain.progress}%`}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
