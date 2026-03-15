'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TVPSParticipantInfo } from '@/lib/tvps'
import { cn } from '@/lib/utils'

interface ParticipantFormProps {
  onSubmit: (info: TVPSParticipantInfo) => void
  className?: string
}

const defaultInfo: TVPSParticipantInfo = {
  name: '',
  gender: '',
  school: '',
  examiner: '',
  dateOfBirth: '',
  dateOfEvaluation: new Date().toISOString().slice(0, 10),
  chronologicalAge: '',
  gradeLevel: '',
  participantId: '',
}

export function ParticipantForm({ onSubmit, className }: ParticipantFormProps) {
  const [info, setInfo] = useState<TVPSParticipantInfo>(defaultInfo)

  const handleChange = (field: keyof TVPSParticipantInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInfo((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(info)
  }

  return (
    <Card className={cn('max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle>Participant information</CardTitle>
        <CardDescription>
          TVPS-3 – Please complete the form before starting the test.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={info.name}
                onChange={handleChange('name')}
                placeholder="Participant name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={info.gender}
                onChange={handleChange('gender')}
                placeholder="e.g. Male, Female"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              value={info.school}
              onChange={handleChange('school')}
              placeholder="School or institution"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examiner">Examiner</Label>
            <Input
              id="examiner"
              value={info.examiner}
              onChange={handleChange('examiner')}
              placeholder="Examiner name"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={info.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfEvaluation">Date of evaluation</Label>
              <Input
                id="dateOfEvaluation"
                type="date"
                value={info.dateOfEvaluation}
                onChange={handleChange('dateOfEvaluation')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chronologicalAge">Chronological age</Label>
              <Input
                id="chronologicalAge"
                value={info.chronologicalAge}
                onChange={handleChange('chronologicalAge')}
                placeholder="e.g. 8 years"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade level</Label>
              <Input
                id="gradeLevel"
                value={info.gradeLevel}
                onChange={handleChange('gradeLevel')}
                placeholder="e.g. Grade 3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="participantId">Participant ID</Label>
            <Input
              id="participantId"
              value={info.participantId}
              onChange={handleChange('participantId')}
              placeholder="Unique identifier"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Start test
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
