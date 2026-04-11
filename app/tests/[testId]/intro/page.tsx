'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  User,
  ExternalLink,
  Target,
  Clock,
  ListChecks,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { getTestMetadata } from '@/lib/test-metadata'
import { useTranslation } from '@/lib/i18n'

export default function TestIntroPage({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const { testId } = use(params)
  const { t, locale } = useTranslation()
  const router = useRouter()
  const metadata = getTestMetadata(testId)

  if (!metadata) {
    // Fallback: skip directly to test
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Présentation non disponible pour ce test.</p>
          <Button onClick={() => router.push(`/tests/${testId}/instructions`)}>
            {t('btn.next')}
          </Button>
        </div>
      </div>
    )
  }

  const title = locale === 'ar' ? metadata.theoryTitle.ar : metadata.theoryTitle.fr
  const definition = locale === 'ar' ? metadata.definition.ar : metadata.definition.fr
  const background = locale === 'ar' ? metadata.background.ar : metadata.background.fr
  const objective = locale === 'ar' ? metadata.objective.ar : metadata.objective.fr

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 px-6 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link
            href="/tests"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('btn.back')}
          </Link>
          <Badge variant="secondary" className="text-xs">
            {locale === 'fr' ? 'Étape 1 sur 3 — Présentation' : 'الخطوة 1 من 3 — تقديم'}
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <BookOpen className="h-4 w-4" />
            {t('test.intro.title')}
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-3">{title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {metadata.estimatedDuration} {t('tests.minutes')}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" />
              {metadata.questionCount} {t('tests.questions')}
            </span>
          </div>
        </div>

        {/* Definition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              {t('test.intro.definition')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80">{definition}</p>
          </CardContent>
        </Card>

        {/* Scientific Background */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ExternalLink className="h-4 w-4 text-secondary" />
              {t('test.intro.background')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80">{background}</p>
          </CardContent>
        </Card>

        {/* Author + Source */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    {t('test.intro.author')}
                  </p>
                  <p className="text-sm text-foreground">{metadata.author}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    {t('test.intro.source')}
                  </p>
                  <p className="text-sm text-foreground italic">{metadata.source}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Objective */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <Target className="h-4 w-4" />
              {t('test.intro.objective')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{objective}</p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => router.push(`/tests/${testId}/instructions`)}
            size="lg"
            className="gap-2"
          >
            {t('btn.next')} — {locale === 'fr' ? 'Instructions' : 'التعليمات'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
