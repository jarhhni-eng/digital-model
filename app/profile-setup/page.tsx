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
  resolveDefaultTrack,
} from '@/lib/student-profile-types'
import { SCHOLAR_LEVELS } from '@/lib/mock-data'
import { Brain, Loader2 } from 'lucide-react'
import { CenteredCardFormSkeleton } from '@/components/skeletons'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('')
  const [teacherName, setTeacherName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [gradeLevel, setGradeLevel] = useState<MoroccanGradeLevel>(SCHOLAR_LEVELS[0])
  const [mathAverage2025_2026, setMathAverage2025_2026] = useState('')
  const [mathAverage2024_2025, setMathAverage2024_2025] = useState('')

  const academicYear = '2025/2026'

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
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
          academicTrack: resolveDefaultTrack(gradeLevel),
          academicYear,
          mathAverage2025_2026:
            mathAverage2025_2026 === '' ? null : Number(mathAverage2025_2026),
          mathAverage2024_2025:
            mathAverage2024_2025 === '' ? null : Number(mathAverage2024_2025),
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
    return <CenteredCardFormSkeleton />
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
            Profil élève (Maroc)
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Requis pour le suivi cognitif et académique. Année scolaire :{' '}
            <strong>{academicYear}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Âge</Label>
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
              <Label>Genre</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                required
              >
                <option value="">—</option>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de l&apos;enseignant</Label>
                <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>École / établissement</Label>
                <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Niveau scolaire</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value as MoroccanGradeLevel)}
              >
                {SCHOLAR_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Moyenne générale en mathématiques 2025 / 2026</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step={0.01}
                  value={mathAverage2025_2026}
                  onChange={(e) => setMathAverage2025_2026(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Moyenne générale en mathématiques 2024 / 2025</Label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step={0.01}
                  value={mathAverage2024_2025}
                  onChange={(e) => setMathAverage2024_2025(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                'Enregistrer et continuer'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
