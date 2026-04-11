'use client'

import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Printer, Download, Users, BarChart3 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'

export default function TeacherReportsPage() {
  const { user } = useAuth()
  const { t, locale } = useTranslation()

  const reportTypes = [
    {
      icon: <Users className="h-5 w-5" />,
      titleFr: 'Rapport de classe',
      titleAr: 'تقرير الفصل',
      descFr: 'Résumé des performances de tous les étudiants du groupe avec scores par domaine.',
      descAr: 'ملخص أداء جميع طلاب المجموعة مع النتائج حسب كل مجال.',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      titleFr: 'Rapport psychométrique',
      titleAr: 'تقرير القياس النفسي',
      descFr: 'Indices de difficulté, discrimination et IRT pour chaque test administré.',
      descAr: 'مؤشرات الصعوبة والتمييز ونظرية IRT لكل اختبار أُجري.',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      titleFr: 'Rapport SEM',
      titleAr: 'تقرير SEM',
      descFr: 'Coefficients du modèle d\'équations structurelles, indices d\'ajustement et recommandations.',
      descAr: 'معاملات نموذج المعادلات البنائية ومؤشرات الملاءمة والتوصيات.',
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole="teacher" />
      <main className="flex-1 ml-64 p-8 print:ml-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {t('nav.reports')}
            </h1>
            <Button variant="outline" onClick={() => window.print()} className="gap-2 print:hidden">
              <Printer className="h-4 w-4" />
              {t('btn.print')}
            </Button>
          </div>

          <div className="grid gap-4">
            {reportTypes.map((rt, i) => (
              <Card key={i} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {rt.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{locale === 'fr' ? rt.titleFr : rt.titleAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {locale === 'fr' ? rt.descFr : rt.descAr}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="shrink-0 gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {locale === 'fr' ? 'Générer' : 'إنشاء'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            {locale === 'fr'
              ? 'Les rapports sont générés en utilisant l\'impression du navigateur (PDF). Assurez-vous que les données sont chargées avant d\'imprimer.'
              : 'تُنشأ التقارير باستخدام طباعة المتصفح (PDF). تأكد من تحميل البيانات قبل الطباعة.'}
          </p>
        </div>
      </main>
    </div>
  )
}
