'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  ChevronRight,
  ArrowLeft,
  Info,
} from 'lucide-react'
import { getTestInstructions, getTestMetadata } from '@/lib/test-metadata'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'
import { getTestSession, saveTestSession } from '@/lib/data'
import type { TestSession } from '@/lib/types'

export default function TestInstructionsPage({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const { testId } = use(params)
  const { t, locale } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const instructions = getTestInstructions(testId)
  const metadata = getTestMetadata(testId)

  const handleStart = async () => {
    if (!accepted || !user) return
    setIsStarting(true)

    const now = new Date().toISOString()

    // Create or resume test session
    const existing = getTestSession(testId, user.id)
    if (!existing) {
      const session: TestSession = {
        sessionId: `session-${testId}-${user.id}-${Date.now()}`,
        testId,
        studentId: user.id,
        startedAt: now,
        submittedAt: null,
        instructionsAcceptedAt: now,
        questionTimings: [],
        answers: {},
        status: 'in-progress',
      }
      saveTestSession(session)
    } else {
      // Update instructions accepted time if not set
      if (!existing.instructionsAcceptedAt) {
        saveTestSession({ ...existing, instructionsAcceptedAt: now })
      }
    }

    router.push(`/tests/${testId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 px-6 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link
            href={`/tests/${testId}/intro`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('btn.previous')}
          </Link>
          <Badge variant="secondary" className="text-xs">
            {locale === 'fr' ? 'Étape 2 sur 3 — Instructions' : 'الخطوة 2 من 3 — التعليمات'}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {metadata
              ? (locale === 'ar' ? metadata.theoryTitle.ar : metadata.theoryTitle.fr)
              : t('test.instructions.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('test.instructions.title')}</p>
        </div>

        {instructions ? (
          <>
            {/* Steps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListOrdered className="h-4 w-4 text-primary" />
                  {locale === 'fr' ? 'Comment procéder' : 'كيفية المتابعة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {instructions.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground/80 leading-relaxed">
                        {locale === 'ar' ? step.ar : step.fr}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Important Notes */}
            {instructions.importantNotes.length > 0 && (
              <Card className="border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    {t('test.instructions.important')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {instructions.importantNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        {locale === 'ar' ? note.ar : note.fr}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Example Question */}
            {instructions.exampleQuestion && (
              <Card className="border-secondary/30 bg-secondary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-secondary">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('test.instructions.example')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm font-medium">{instructions.exampleQuestion.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {instructions.exampleQuestion.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          i === instructions.exampleQuestion!.correctIndex
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'border-border bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + i)}.</span>{' '}
                        {opt}
                        {i === instructions.exampleQuestion!.correctIndex && (
                          <CheckCircle2 className="inline ml-2 h-3 w-3" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {locale === 'ar'
                      ? instructions.exampleQuestion.explanation.ar
                      : instructions.exampleQuestion.explanation.fr}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {locale === 'fr'
                ? 'Lisez et répondez à chaque question. Cliquez Suivant pour avancer. Vos scores sont enregistrés à la soumission.'
                : 'اقرأ كل سؤال وأجب عليه. انقر التالي للمتابعة. تُسجَّل نتائجك عند الإرسال.'}
            </CardContent>
          </Card>
        )}

        {/* Acceptance checkbox */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <Checkbox
            id="accept"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(!!v)}
            className="mt-0.5"
          />
          <label
            htmlFor="accept"
            className="text-sm text-foreground/80 cursor-pointer leading-relaxed"
          >
            {locale === 'fr'
              ? 'J\'ai lu et compris les instructions ci-dessus. Je suis prêt(e) à commencer le test.'
              : 'لقد قرأت وفهمت التعليمات أعلاه. أنا مستعد/ة لبدء الاختبار.'}
          </label>
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <Button
            onClick={handleStart}
            disabled={!accepted || isStarting}
            size="lg"
            className="gap-2"
          >
            {isStarting ? (
              locale === 'fr' ? 'Démarrage...' : 'جاري البدء...'
            ) : (
              <>
                {t('btn.begin_test')}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
