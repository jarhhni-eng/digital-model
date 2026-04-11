'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Brain, Loader2, ChevronRight, ChevronLeft, User, BookOpen, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/i18n'
import { saveStudentProfile, addStudentToGroup } from '@/lib/data'
import { MOROCCAN_INSTITUTIONS, DEMO_TEACHERS } from '@/lib/mock-users'
import type { StudentProfile, GradeLevel, Filiere, Gender } from '@/lib/types'

// ── Academic year helper ──────────────────────────────────────
function getCurrentAcademicYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1  // 1-12
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

// ── Filière options per grade ─────────────────────────────────
const FILIERE_BY_GRADE: Record<GradeLevel, Filiere[]> = {
  'tronc-commun': ['scientifique'],
  '1bac': ['math-sciences', 'experimental-sciences'],
  '2bac': ['math-sciences', 'experimental-sciences'],
}

export default function ProfileSetupPage() {
  const { user } = useAuth()
  const { t, locale } = useTranslation()
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)

  // Step 1 — Personal
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')

  // Step 2 — Academic
  const [teacherId, setTeacherId] = useState('')
  const [institution, setInstitution] = useState('')
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('')
  const [filiere, setFiliere] = useState<Filiere | ''>('')
  const [mathScorePrev, setMathScorePrev] = useState('')
  const [mathScoreCurr, setMathScoreCurr] = useState('')

  const academicYear = getCurrentAcademicYear()

  // When grade changes, auto-assign filière for tronc-commun
  const handleGradeChange = (g: GradeLevel) => {
    setGradeLevel(g)
    if (g === 'tronc-commun') {
      setFiliere('scientifique')
    } else {
      setFiliere('')
    }
  }

  const step1Valid = fullName.trim().length >= 2 && age !== '' && gender !== ''
  const step2Valid =
    teacherId !== '' &&
    institution !== '' &&
    gradeLevel !== '' &&
    filiere !== '' &&
    mathScoreCurr !== ''

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (step1Valid) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!step2Valid || !user) return
    setIsLoading(true)

    await new Promise((r) => setTimeout(r, 600))

    const selectedTeacher = DEMO_TEACHERS.find((t) => t.id === teacherId)

    const profile: StudentProfile = {
      id: `profile-${user.id}`,
      userId: user.id,
      fullName: fullName.trim(),
      age: parseInt(age, 10),
      gender: gender as Gender,
      teacherId,
      teacherName: selectedTeacher?.name ?? teacherId,
      institution,
      gradeLevel: gradeLevel as GradeLevel,
      filiere: filiere as Filiere,
      academicYear,
      mathScorePreviousYear: mathScorePrev ? parseFloat(mathScorePrev) : null,
      mathScoreCurrentYear: parseFloat(mathScoreCurr),
      groupId: 'group-001',  // default demo group
    }

    saveStudentProfile(profile)
    addStudentToGroup('group-001', user.id)

    router.push('/dashboard')
  }

  const gradeLabels: Record<GradeLevel, string> = {
    'tronc-commun': t('profile.grade.tronc-commun'),
    '1bac': t('profile.grade.1bac'),
    '2bac': t('profile.grade.2bac'),
  }

  const filiereLabels: Record<Filiere, string> = {
    'scientifique': t('profile.filiere.scientifique'),
    'math-sciences': t('profile.filiere.math-sciences'),
    'experimental-sciences': t('profile.filiere.experimental-sciences'),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4 py-10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t('profile.setup.title')}</CardTitle>
          <CardDescription className="text-sm mt-1">{t('profile.setup.subtitle')}</CardDescription>

          {/* Step indicator */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  s < step
                    ? 'bg-primary text-primary-foreground'
                    : s === step
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {s < step ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                <span className={`text-xs font-medium ${s === step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s === 1 ? t('profile.step.personal') : t('profile.step.academic')}
                </span>
                {s < 2 && <div className="h-px w-8 bg-border" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* ── Step 1: Personal Information ── */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <User className="h-4 w-4" />
                {t('profile.step.personal')}
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('profile.fullname')}</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('profile.fullname.placeholder')}
                  className="h-10 bg-background"
                  required
                />
              </div>

              {/* Age + Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('profile.age')}</label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="16"
                    min="10"
                    max="25"
                    className="h-10 bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('profile.gender')}</label>
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
                    {(['male', 'female'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`rounded-md py-2 text-xs font-medium transition-all ${
                          gender === g
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {g === 'male' ? t('profile.gender.male') : t('profile.gender.female')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!step1Valid}
                className="w-full h-10"
              >
                {t('btn.next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {/* ── Step 2: Academic Information ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <BookOpen className="h-4 w-4" />
                {t('profile.step.academic')}
              </div>

              {/* Teacher */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('profile.teacher')}</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="">{locale === 'fr' ? '-- Choisir un professeur --' : '-- اختر أستاذاً --'}</option>
                  {DEMO_TEACHERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.institution}
                    </option>
                  ))}
                </select>
              </div>

              {/* Institution */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('profile.institution')}</label>
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="">{locale === 'fr' ? '-- Choisir un établissement --' : '-- اختر مؤسسة --'}</option>
                  {MOROCCAN_INSTITUTIONS.map((inst) => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              {/* Grade Level */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('profile.grade')}</label>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/60 p-1">
                  {(['tronc-commun', '1bac', '2bac'] as GradeLevel[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGradeChange(g)}
                      className={`rounded-md py-2 text-xs font-medium transition-all ${
                        gradeLevel === g
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {gradeLabels[g]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filière (conditional) */}
              {gradeLevel && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('profile.filiere')}</label>
                  {gradeLevel === 'tronc-commun' ? (
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {t('profile.filiere.auto')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
                      {FILIERE_BY_GRADE[gradeLevel].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFiliere(f)}
                          className={`rounded-md py-2 text-xs font-medium transition-all ${
                            filiere === f
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {filiereLabels[f]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Academic Year (read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('profile.academic_year')}</label>
                <div className="flex h-10 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                  {academicYear}
                  <span className="ml-2 text-xs text-muted-foreground/60">({locale === 'fr' ? 'automatique' : 'تلقائي'})</span>
                </div>
              </div>

              {/* Math Scores */}
              <div className="grid grid-cols-2 gap-4">
                {gradeLevel && gradeLevel !== 'tronc-commun' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t('profile.math_score_prev')}</label>
                    <Input
                      type="number"
                      value={mathScorePrev}
                      onChange={(e) => setMathScorePrev(e.target.value)}
                      placeholder={t('profile.math_score.placeholder')}
                      min="0"
                      max="20"
                      step="0.5"
                      className="h-10 bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground">{locale === 'fr' ? 'Note sur 20 (facultatif)' : 'العلامة من 20 (اختياري)'}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('profile.math_score_curr')}</label>
                  <Input
                    type="number"
                    value={mathScoreCurr}
                    onChange={(e) => setMathScoreCurr(e.target.value)}
                    placeholder={t('profile.math_score.placeholder')}
                    min="0"
                    max="20"
                    step="0.5"
                    className="h-10 bg-background"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">{locale === 'fr' ? 'Note sur 20' : 'العلامة من 20'}</p>
                </div>
              </div>

              {/* Notice */}
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {locale === 'fr'
                  ? 'Vos données sont utilisées uniquement à des fins de recherche académique. Elles ne seront pas partagées.'
                  : 'بياناتك تُستخدم لأغراض البحث الأكاديمي فقط ولن تُشارك مع أطراف أخرى.'}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-10"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('btn.previous')}
                </Button>
                <Button
                  type="submit"
                  disabled={!step2Valid || isLoading}
                  className="flex-1 h-10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {locale === 'fr' ? 'Enregistrement...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    t('btn.save')
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
