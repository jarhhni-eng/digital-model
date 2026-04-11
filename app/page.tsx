'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Brain,
  Lock,
  Loader2,
  GraduationCap,
  Users,
  LayoutDashboard,
  BarChart3,
  User,
  Globe,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/i18n'
import { hasProfile } from '@/lib/data'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()
  const { locale, setLocale, t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setError(null)
    setIsLoading(true)

    const result = await login(username.trim(), password.trim(), userType)

    if (!result.success) {
      setError(result.error ?? t('auth.error.invalid'))
      setIsLoading(false)
      return
    }

    // Redirect based on role
    if (userType === 'student') {
      const profileExists = hasProfile(
        `student-${username.replace(/[^a-z0-9]/gi, '').toLowerCase()}`
      )
      // For demo, skip profile check and go to dashboard
      router.push('/dashboard')
    } else {
      router.push('/teacher/dashboard')
    }
  }

  const toggleLocale = () => setLocale(locale === 'fr' ? 'ar' : 'fr')

  return (
    <div className="min-h-screen bg-background flex items-stretch">
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-10 lg:py-16">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">

          {/* Left: Brand panel */}
          <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/90 via-primary to-secondary text-primary-foreground p-8 lg:p-10 shadow-xl">
            {/* Language toggle */}
            <button
              onClick={toggleLocale}
              className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md hover:bg-white/25 transition-colors"
              type="button"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale === 'fr' ? 'العربية' : 'Français'}
            </button>

            {/* ENS badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs backdrop-blur-md">
              <GraduationCap className="h-4 w-4" />
              <span className="font-semibold tracking-wide">{t('app.tagline')}</span>
            </div>

            {/* Logo + title */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl [font-family:var(--font-display)]">
                  {t('app.title')}
                </h1>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>

            {/* Value prop */}
            <p className="mt-6 max-w-md text-sm text-primary-foreground/80">
              {locale === 'fr'
                ? 'Plateforme de recherche moderne pour mesurer et visualiser les capacités cognitives mathématiques, conçue pour les études académiques longitudinales.'
                : 'منصة بحثية حديثة لقياس وتصور القدرات المعرفية الرياضية، مصممة للدراسات الأكاديمية الطولية.'}
            </p>

            {/* Feature cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 shadow-md backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-foreground/10">
                    <LayoutDashboard className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {locale === 'fr' ? 'Tableau Étudiant' : 'لوحة الطالب'}
                    </p>
                    <p className="text-[11px] text-primary-foreground/70">
                      {locale === 'fr' ? '7 domaines cognitifs évalués' : '٧ مجالات معرفية مُقيَّمة'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-[11px] text-primary-foreground/80">
                  {[
                    locale === 'fr' ? ['Capacités attentionnelles', '72%'] : ['القدرات الانتباهية', '٧٢٪'],
                    locale === 'fr' ? ['Raisonnement spatial', '80%'] : ['التفكير المكاني', '٨٠٪'],
                    locale === 'fr' ? ['Fonctions exécutives', '75%'] : ['الوظائف التنفيذية', '٧٥٪'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span>{label}</span>
                      <span className="font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-black/10 p-4 shadow-md backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/20">
                    <BarChart3 className="h-4 w-4 text-amber-200" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {locale === 'fr' ? 'Tableau Enseignant' : 'لوحة الأستاذ'}
                    </p>
                    <p className="text-[11px] text-primary-foreground/70">
                      {locale === 'fr' ? 'SEM · IRT · Recommandations' : 'SEM · IRT · توصيات'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-[11px] text-primary-foreground/80">
                  <div className="flex items-center justify-between">
                    <span>{locale === 'fr' ? 'Moyenne de classe' : 'متوسط الفصل'}</span>
                    <span className="font-semibold">76.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{locale === 'fr' ? 'Étudiants à risque' : 'طلاب في خطر'}</span>
                    <span className="rounded-full bg-red-400/20 px-2 py-0.5 text-[10px] text-red-50">
                      {locale === 'fr' ? '3 identifiés' : '٣ محددون'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{locale === 'fr' ? 'Modèle SEM actif' : 'نموذج SEM نشط'}</span>
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-100">
                      R² = 0.74
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professors */}
            <div className="mt-10 border-t border-primary-foreground/15 pt-4 text-xs text-primary-foreground/80">
              <p className="font-semibold tracking-wide">ENS FES · {locale === 'fr' ? 'Encadrement scientifique' : 'الإشراف العلمي'}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Prof. Jalal Asermouh</span>
                <span className="opacity-60">·</span>
                <span>Prof. Achraf Jarhni</span>
              </div>
            </div>
          </section>

          {/* Right: Login card */}
          <section className="flex items-center">
            <div className="w-full">
              <Card className="border-border bg-card/80 shadow-lg backdrop-blur">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {t('auth.title')}
                    </CardTitle>
                    {/* Mobile language toggle */}
                    <button
                      onClick={toggleLocale}
                      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors lg:hidden"
                      type="button"
                    >
                      <Globe className="h-3 w-3" />
                      {locale === 'fr' ? 'AR' : 'FR'}
                    </button>
                  </div>
                  <CardDescription className="text-xs">
                    {t('auth.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role toggle */}
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
                      {(['student', 'teacher'] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setUserType(role)}
                          className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all ${
                            userType === role
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {role === 'student' ? <User className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                          {role === 'student' ? t('auth.role.student') : t('auth.role.teacher')}
                        </button>
                      ))}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        {t('auth.username')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder={t('auth.username.placeholder')}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="h-10 border-border bg-background pl-10 text-sm"
                          required
                          disabled={isLoading}
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        {t('auth.password')}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder={t('auth.password.placeholder')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-10 border-border bg-background pl-10 text-sm"
                          required
                          disabled={isLoading}
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isLoading || !username.trim() || !password.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {locale === 'fr' ? 'Connexion...' : 'جاري الدخول...'}
                        </>
                      ) : (
                        t('btn.continue')
                      )}
                    </Button>

                    {/* Demo credentials hint */}
                    <div className="rounded-md border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground/70">{t('auth.demo.hint')}</p>
                      <p>{userType === 'student' ? t('auth.credentials.student') : t('auth.credentials.teacher')}</p>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-4 text-[11px] text-muted-foreground">
                <p>
                  {locale === 'fr'
                    ? 'Développé dans le cadre de la recherche doctorale à '
                    : 'تم تطويره في إطار البحث الدكتوري في '}
                  <span className="font-medium text-foreground">ENS FES</span>
                  {locale === 'fr' ? ' en cognition mathématique.' : ' في الإدراك الرياضي.'}
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
