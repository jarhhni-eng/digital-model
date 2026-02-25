'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2 } from 'lucide-react'

export default function ProfileSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    scholarLevel: 'Grade 9',
    lastYearMathScore: '',
    currentMathScore: '',
    teacher: '',
  })
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to dashboard
    router.push('/dashboard')
  }

  const scholarLevels = [
    'Primary School',
    'Grade 6-7',
    'Grade 8-9',
    'Grade 10',
    'Grade 11-12',
    'University',
  ]

  const teachers = [
    'Dr. Richard Smith',
    'Dr. Emily Johnson',
    'Prof. Michael Chen',
    'Dr. Sarah Williams',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4">
      {/* Academic accent elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Help us learn more about your cognitive assessment background
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Emma Johnson"
                className="h-10 bg-background border-border"
                required
                disabled={isLoading}
              />
            </div>

            {/* Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="16"
                  className="h-10 bg-background border-border"
                  min="5"
                  max="100"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Scholar Level */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scholar Level
                </label>
                <select
                  name="scholarLevel"
                  value={formData.scholarLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 h-10 bg-background border-2 border-border rounded-lg text-foreground focus:border-primary focus:outline-none"
                  disabled={isLoading}
                >
                  {scholarLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Math Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Math Score - Last Year
                </label>
                <Input
                  type="number"
                  name="lastYearMathScore"
                  value={formData.lastYearMathScore}
                  onChange={handleChange}
                  placeholder="72"
                  className="h-10 bg-background border-border"
                  min="0"
                  max="100"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Math Score (Estimated)
                </label>
                <Input
                  type="number"
                  name="currentMathScore"
                  value={formData.currentMathScore}
                  onChange={handleChange}
                  placeholder="75"
                  className="h-10 bg-background border-border"
                  min="0"
                  max="100"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Teacher Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Your Teacher
              </label>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="w-full px-3 py-2 h-10 bg-background border-2 border-border rounded-lg text-foreground focus:border-primary focus:outline-none"
                required
                disabled={isLoading}
              >
                <option value="">-- Choose a teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>

            {/* Information Box */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Privacy Notice:</strong> Your
                profile information is securely stored and used only for your cognitive
                assessments. Your data will be protected in accordance with our privacy
                policy.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
