'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import {
  type MoroccanGradeLevel,
  type AcademicTrack,
  resolveDefaultTrack,
  trackRequired,
} from '@/lib/student-profile-types'
import { mockInstitutions, mockTeacherGroups } from '@/lib/mock-groups'
import { Brain, Loader2 } from 'lucide-react'

const gradeOptions: MoroccanGradeLevel[] = [
  'Tronc Commun',
  '1st Year Baccalaureate',
  '2nd Year Baccalaureate',
  'Other',
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('')
  const [teacherName, setTeacherName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [gradeLevel, setGradeLevel] = useState<MoroccanGradeLevel>('Tronc Commun')
  const [academicTrack, setAcademicTrack] = useState<AcademicTrack>('')
  const [institutionId, setInstitutionId] = useState(mockInstitutions[0]?.id ?? '')
  const [groupId, setGroupId] = useState(mockTeacherGroups[0]?.id ?? '')
  const [mathCurrent, setMathCurrent] = useState('')
  const [mathPrevious, setMathPrevious] = useState('')

  const academicYear = String(new Date().getFullYear())

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [authLoading, user, router])

  useEffect(() => {
    if (gradeLevel === 'Tronc Commun') {
      setAcademicTrack(resolveDefaultTrack('Tronc Commun'))
    } else if (!trackRequired(gradeLevel)) {
      setAcademicTrack('')
    }
  }, [gradeLevel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (trackRequired(gradeLevel) && !academicTrack) {
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/student-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          fullName,
          age: Number(age) || 0,
          gender,
          teacherName,
          schoolName,
          gradeLevel,
          academicTrack: gradeLevel === 'Tronc Commun' ? 'Scientific' : academicTrack,
          academicYear,
          mathScoreCurrent: mathCurrent === '' ? null : Number(mathCurrent),
          mathScorePrevious: mathPrevious === '' ? null : Number(mathPrevious),
          institutionId,
          groupId,
          updatedAt: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('save failed')
      router.push('/dashboard')
    } catch {
      setIsLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Student profile (Morocco)
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Required for cognitive and academic tracking. Academic year: <strong>{academicYear}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  min={5}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                required
              >
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teacher&apos;s name</Label>
                <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>School / institution</Label>
                <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution (platform)</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                >
                  {mockInstitutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Group (20–30 students)</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  {mockTeacherGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Grade level</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as MoroccanGradeLevel)}
              >
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {gradeLevel === 'Tronc Commun' && (
              <p className="text-sm text-muted-foreground">
                Track: <strong>Scientific</strong> (automatic for Tronc Commun).
              </p>
            )}

            {trackRequired(gradeLevel) && (
              <div className="space-y-2">
                <Label>Academic track (Filière)</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={academicTrack}
                  onChange={(e) => setAcademicTrack(e.target.value as AcademicTrack)}
                  required
                >
                  <option value="">— Select —</option>
                  <option value="Mathematical Sciences">Mathematical Sciences</option>
                  <option value="Experimental Sciences">Experimental Sciences</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mathematics score (current year)</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step={0.01}
                  value={mathCurrent}
                  onChange={(e) => setMathCurrent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mathematics score (previous year, optional)</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step={0.01}
                  value={mathPrevious}
                  onChange={(e) => setMathPrevious(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save and continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
