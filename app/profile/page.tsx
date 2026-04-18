'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockStudentProfile, mockStudentResults, mockTeacherStudents } from '@/lib/mock-data'
import { Mail, User, Calendar, Award, Activity, School } from 'lucide-react'

type Role = 'student' | 'teacher'

export default function ProfilePage() {
  const isMobile = useIsMobile()
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('cogniTestRole') as Role | null
      const storedEmail = localStorage.getItem('cogniTestEmail') || undefined
      if (storedRole === 'teacher' || storedRole === 'student') {
        setRole(storedRole)
      }
      if (storedEmail) {
        setEmail(storedEmail)
      }
    } catch (error) {
      // ignore storage errors in demo
    }
  }, [])

  const isTeacher = role === 'teacher'

  const student = mockStudentProfile
  const teacher = {
    name: 'Dr. Richard Smith',
    email: 'richard.smith@ens-fes.ac.ma',
    institution: 'ENS FES',
    department: 'Mathematics Education',
    role: 'Research Supervisor',
  }

  const displayName = isTeacher ? teacher.name : student.name
  const displayEmail = isTeacher ? teacher.email : email || student.email

  const latestResult = mockStudentResults[0]
  const averageScore =
    mockStudentResults.reduce((sum, r) => sum + r.score, 0) / mockStudentResults.length

  const totalStudents = mockTeacherStudents.length
  const classAverage =
    mockTeacherStudents.reduce((sum, s) => sum + s.averageScore, 0) / totalStudents

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole={role} userName={displayName} />

      <div className={cn("transition-all duration-200", isMobile ? "ml-0" : "ml-64")}>
        <Header
          title="Profil"
          subtitle={isTeacher ? 'Profil enseignant et paramètres' : 'Profil élève et données académiques'}
        />

        <main className="p-6 pt-24 max-w-7xl space-y-6">
          {/* Top: identity + quick stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-base font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {displayName}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isTeacher ? teacher.role : 'Student participant'}
                  </CardDescription>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[11px] capitalize">
                      <User className="mr-1 h-3 w-3" />
                      {role}
                    </Badge>
                    {!isTeacher && (
                      <Badge variant="secondary" className="text-[11px]">
                        <School className="mr-1 h-3 w-3" />
                        {student.scholarLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{displayEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Joined{' '}
                      {isTeacher ? '2024-09-01' : student.joinDate}
                    </span>
                  </div>
                </div>
                {!isTeacher && (
                  <p className="text-xs text-muted-foreground">
                    This profile is linked to your cognitive assessment history within the ENS FES
                    research project. Profile edits are local to this demo and are not stored on a
                    server.
                  </p>
                )}
                {isTeacher && (
                  <p className="text-xs text-muted-foreground">
                    This profile summarises your supervising role over the cohort participating in
                    the CogniTest research study.
                  </p>
                )}
                <Button variant="outline" size="sm" className="mt-1" disabled>
                  Profile editing coming soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  {isTeacher ? 'Teaching overview' : 'Assessment overview'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Key indicators from your activity in the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {isTeacher ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Active students</p>
                        <p className="text-xl font-semibold text-foreground">
                          {totalStudents}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Class average</p>
                        <p className="text-xl font-semibold text-foreground">
                          {classAverage.toFixed(1)}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Overall score</p>
                        <p className="text-xl font-semibold text-foreground">
                          {Math.round(averageScore)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Latest assessment</p>
                        <p className="text-xl font-semibold text-foreground">
                          {latestResult?.score ?? 0}%
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {latestResult?.domain} · {latestResult?.date}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom: academic details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  {isTeacher ? 'Institution details' : 'Academic details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {isTeacher ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Institution</span>
                      <span className="font-medium text-foreground">{teacher.institution}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium text-foreground">{teacher.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium text-foreground">{teacher.role}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Age</span>
                      <span className="font-medium text-foreground">{student.age}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Scholar level</span>
                      <span className="font-medium text-foreground">{student.scholarLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Supervisor</span>
                      <span className="font-medium text-foreground">{student.teacher}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  {isTeacher ? 'Performance focus' : 'Mathematics performance'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {isTeacher ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Focus areas</span>
                      <span className="font-medium text-foreground">Numerical reasoning, algebra</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      Supporting interventions for students with persistent difficulties across
                      multiple domains.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last year score</span>
                      <span className="font-medium text-foreground">
                        {student.lastYearMathScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current score (self-estimated)</span>
                      <span className="font-medium text-foreground">
                        {student.currentMathScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delta</span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Award className="h-3 w-3 text-emerald-500" />
                        {(student.currentMathScore - student.lastYearMathScore) >= 0 ? '+' : ''}
                        {student.currentMathScore - student.lastYearMathScore}%
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

