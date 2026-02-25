'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'student' | 'teacher'>('student')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect based on user type
    if (userType === 'student') {
      router.push('/dashboard')
    } else {
      router.push('/teacher/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4">
      {/* Academic accent elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              CogniTest
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Cognitive Assessment Platform
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-2">
              Academic research platform for evaluating mathematical cognitive capacities
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                  userType === 'student'
                    ? 'bg-primary text-primary-foreground border-2 border-primary'
                    : 'bg-muted text-muted-foreground border-2 border-transparent hover:border-border'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setUserType('teacher')}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                  userType === 'teacher'
                    ? 'bg-primary text-primary-foreground border-2 border-primary'
                    : 'bg-muted text-muted-foreground border-2 border-transparent hover:border-border'
                }`}
              >
                Teacher
              </button>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 bg-background border-border"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-10 bg-background border-border"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            {/* Demo Note */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 text-center text-xs text-muted-foreground">
              This is a demo. Use any email and password to proceed.
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>
              This platform is part of a PhD research project
            </p>
            <p className="mt-2">
              © 2025 CogniTest. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
