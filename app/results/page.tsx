'use client'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StatCard, ProgressCard } from '@/components/dashboard-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockStudentResults, mockStudentProfile, mockDomains } from '@/lib/mock-data'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ScatterChart, Scatter, Cell 
} from 'recharts'
import { Award, TrendingUp, BookOpen, Download } from 'lucide-react'

const radarData = [
  { capacity: 'Counting', A: 85, B: 90 },
  { capacity: 'Arithmetic', A: 72, B: 80 },
  { capacity: 'Number Compare', A: 80, B: 85 },
  { capacity: 'Mental Rotation', A: 65, B: 70 },
  { capacity: 'Geometry', A: 72, B: 75 },
]

const strengthsWeaknesses = [
  { name: 'Counting', score: 85, category: 'Strength' },
  { name: 'Arithmetic', score: 72, category: 'Average' },
  { name: 'Number Compare', score: 80, category: 'Strength' },
  { name: 'Mental Rotation', score: 65, category: 'Weakness' },
  { name: 'Geometry', score: 72, category: 'Average' },
]

export default function ResultsPage() {
  const overallScore = 71
  const improvement = 12
  const totalAttempts = mockStudentResults.reduce(
    (sum, result) => sum + result.capacities.length,
    0
  )

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" userName={mockStudentProfile.name} />
      
      <div className="ml-64">
        <Header
          title="Assessment Results"
          subtitle="View your cognitive assessment performance and progress"
        />
        
        <main className="p-6 pt-24 max-w-7xl">
          {/* Overall Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Award className="w-5 h-5" />}
              title="Overall Score"
              value={`${overallScore}%`}
              change={{ value: improvement, trend: 'up' }}
              description="Improvement from last month"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Best Performance"
              value="85%"
              description="Counting capacity"
            />
            <StatCard
              icon={<BookOpen className="w-5 h-5" />}
              title="Capacities Tested"
              value={totalAttempts}
              description="Across all domains"
            />
            <StatCard
              icon={<Award className="w-5 h-5" />}
              title="Improvement Rate"
              value="+3%"
              description="Per week average"
            />
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Radar Chart - Capacities Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Capacity Profile</CardTitle>
                <CardDescription>Your performance across different cognitive capacities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="capacity" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Radar
                      name="Your Score"
                      dataKey="A"
                      stroke="#1e3a8a"
                      fill="#1e3a8a"
                      fillOpacity={0.5}
                    />
                    <Radar
                      name="Target Score"
                      dataKey="B"
                      stroke="#0d9488"
                      fill="#0d9488"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Strengths vs Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle>Strengths & Weaknesses</CardTitle>
                <CardDescription>Your performance distribution across capacities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strengthsWeaknesses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {strengthsWeaknesses.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.category === 'Strength'
                              ? '#16a34a'
                              : entry.category === 'Average'
                                ? '#f59e0b'
                                : '#ef4444'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Domain Results */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Domain Breakdown</CardTitle>
              <CardDescription>Detailed results for each cognitive domain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockStudentResults.map((result) => (
                  <div key={result.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{result.domain}</p>
                        <p className="text-xs text-muted-foreground">{result.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{result.score}%</p>
                      </div>
                    </div>

                    {/* Capacities in Domain */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-6">
                      {result.capacities.map((capacity) => (
                        <div
                          key={capacity.name}
                          className="bg-muted/30 rounded-lg p-3 border border-border"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {capacity.name}
                          </p>
                          <p className="text-lg font-bold text-primary mt-1">
                            {capacity.score}%
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 mt-3">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Your assessment scores over the past assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={mockStudentResults.map((r, i) => ({
                    name: `Assessment ${i + 1}`,
                    score: r.score,
                    date: r.date,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
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

          {/* Recommendations */}
          <Card className="bg-secondary/5 border-secondary/20 mb-8">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                  <p>
                    <strong className="text-foreground">Focus on Mental Rotation:</strong> Your performance in spatial visualization needs attention. Try more practice assessments in this area.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                  <p>
                    <strong className="text-foreground">Excel in Counting:</strong> Strong performance! Consider progressing to more advanced numerical reasoning tasks.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>
                    <strong className="text-foreground">Unlock Advanced Domains:</strong> Once you complete Algebra prerequisites, you'll gain access to calculus assessments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline">
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
