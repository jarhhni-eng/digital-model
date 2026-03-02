'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Brain,
  Mail,
  Lock,
  Loader2,
  GraduationCap,
  Users,
  LayoutDashboard,
  BarChart3,
} from 'lucide-react'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'student' | 'teacher'>('student')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      localStorage.setItem('cogniTestRole', userType)
      localStorage.setItem('cogniTestEmail', email)
    } catch (error) {
      // ignore storage errors in demo
    }

    // Redirect based on user type (same logic as before)
    if (userType === 'student') {
      router.push('/dashboard')
    } else {
      router.push('/teacher/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-stretch">
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-10 lg:py-16">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left: brand + storytelling */}
          <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/90 via-primary to-secondary text-primary-foreground p-8 lg:p-10 shadow-xl">
            {/* ENS badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs backdrop-blur-md">
              <GraduationCap className="h-4 w-4" />
              <span className="font-semibold tracking-wide">ENS FES · Cognitive Research</span>
            </div>

            {/* Logo + title */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl [font-family:var(--font-display)]">
                  CogniTest
                </h1>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
                  Cognitive Assessment Platform
                </p>
              </div>
            </div>

            {/* Value prop */}
            <p className="mt-6 max-w-md text-sm text-primary-foreground/80">
              A modern research platform for measuring and visualising mathematical cognitive
              capacities, designed for longitudinal academic studies.
            </p>

            {/* Mini preview cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 shadow-md backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-foreground/10">
                      <LayoutDashboard className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Student Dashboard
                      </p>
                      <p className="text-[11px] text-primary-foreground/70">
                        Personalised domain progress & scores.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-100">
                    Live
                  </span>
                </div>

                <div className="mt-4 h-20 rounded-xl bg-primary-foreground/10 p-3 text-[11px] text-primary-foreground/80">
                  <div className="flex items-center justify-between">
                    <span>Numerical reasoning</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                    <div className="h-full w-4/5 rounded-full bg-emerald-300" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-primary-foreground/70">
                    <span>Spatial visualisation</span>
                    <span>68%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-black/10 p-4 shadow-md backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/20">
                      <BarChart3 className="h-4 w-4 text-amber-200" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Teacher Insights
                      </p>
                      <p className="text-[11px] text-primary-foreground/70">
                        Cohort performance & weak areas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-[11px] text-primary-foreground/80">
                  <div className="flex items-center justify-between">
                    <span>Class average</span>
                    <span className="font-semibold">76.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Students needing support</span>
                    <span className="rounded-full bg-red-400/20 px-2 py-0.5 text-[10px] text-red-50">
                      3 identified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professors / research team */}
            <div className="mt-10 border-t border-primary-foreground/15 pt-4 text-xs text-primary-foreground/80">
              <p className="font-semibold tracking-wide">ENS FES · Research supervision</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Prof. Jalal Asermouh</span>
                <span className="opacity-60">·</span>
                <span>Prof. Achraf Jarhni</span>
              </div>
            </div>
          </section>

          {/* Right: login card */}
          <section className="flex items-center">
            <div className="w-full">
              <Card className="border-border bg-card/80 shadow-lg backdrop-blur">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Sign in to CogniTest
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select your role and use any demo credentials to explore the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role toggle */}
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
                      <button
                        type="button"
                        onClick={() => setUserType('student')}
                        className={`rounded-md py-2 text-xs font-medium transition-all ${
                          userType === 'student'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('teacher')}
                        className={`rounded-md py-2 text-xs font-medium transition-all ${
                          userType === 'teacher'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Teacher
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Institutional email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@ens-fes.ac.ma"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 border-border bg-background pl-10 text-sm"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-10 border-border bg-background pl-10 text-sm"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in…
                        </>
                      ) : (
                        'Continue'
                      )}
                    </Button>

                    <div className="rounded-md border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                      This is a demo environment. Use any email and password to explore student and
                      teacher experiences.
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-4 text-[11px] text-muted-foreground">
                <p>
                  Built within the{' '}
                  <span className="font-medium text-foreground">ENS FES</span> academic context to
                  support PhD-level research in mathematical cognition.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
