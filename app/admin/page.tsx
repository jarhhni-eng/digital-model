'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'

// Admin sub-panels
import { ResearchInfoPanel } from '@/components/admin/research-info'
import { ResultsPanel } from '@/components/admin/results-panel'
import { PerformanceIndicatorsPanel } from '@/components/admin/performance-indicators'
import { PsychometricModule } from '@/components/admin/psychometric-module'
import { SemModelsPanel } from '@/components/admin/sem-models'
import { PredictionPanel } from '@/components/admin/prediction-panel'
import { ReportPanel } from '@/components/admin/report-panel'

const tabs = [
  { value: 'recherche', label: 'Recherche' },
  { value: 'resultats', label: 'Résultats' },
  { value: 'indicateurs', label: 'Indicateurs' },
  { value: 'psychometrie', label: 'Psychométrie' },
  { value: 'sem', label: 'Modèles SEM' },
  { value: 'prediction', label: 'Prédictions' },
  { value: 'rapport', label: 'Rapport' },
]

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/')
  }, [loading, user, router])

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="admin" userName={user.username} />

      <div className={cn('transition-all duration-200', isMobile ? 'ml-0' : 'ml-64')}>
        <Header
          title="Administration de la recherche"
          subtitle="ENS Fès — Doctorat en Sciences de l'Éducation | LREF — USMBA"
        />

        <main className="p-4 md:p-6 pt-24 max-w-7xl">
          <Tabs defaultValue="recherche">
            {/* Tab list — scrollable on mobile */}
            <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="flex w-max gap-1 h-auto p-1 mb-6">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-shrink-0 text-xs sm:text-sm px-3 py-1.5 h-auto"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="recherche">
              <ResearchInfoPanel />
            </TabsContent>

            <TabsContent value="resultats">
              <ResultsPanel />
            </TabsContent>

            <TabsContent value="indicateurs">
              <PerformanceIndicatorsPanel />
            </TabsContent>

            <TabsContent value="psychometrie">
              <PsychometricModule />
            </TabsContent>

            <TabsContent value="sem">
              <SemModelsPanel />
            </TabsContent>

            <TabsContent value="prediction">
              <PredictionPanel />
            </TabsContent>

            <TabsContent value="rapport">
              <ReportPanel />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
