'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { DomainCard } from '@/components/dashboard-cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockDomains, mockStudentProfile } from '@/lib/mock-data'
import { Brain, Lock, ArrowRight } from 'lucide-react'

interface DomainWithColor {
  id: string
  name: string
  description: string
  progress: number
  capacities: Array<{
    id: string
    name: string
    score: number
    attempts: number
  }>
  isLocked: boolean
  icon: string
}

const domainsWithIcons: DomainWithColor[] = mockDomains.map((domain) => ({
  ...domain,
  icon: domain.name === 'Numerical Reasoning' ? '🔢' :
        domain.name === 'Spatial Visualization' ? '📐' :
        domain.name === 'Problem Solving' ? '🧩' : '📚'
}))

export default function DomainsPage() {
  const router = useRouter()

  const handleDomainClick = (domainId: string, isLocked: boolean) => {
    if (!isLocked) {
      router.push(`/domains/${domainId}`)
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" userName={mockStudentProfile.name} />
      
      <div className="ml-64">
        <Header
          title="Cognitive Domains"
          subtitle="Explore and complete assessments in different cognitive areas"
        />
        
        <main className="p-6 pt-24 max-w-7xl">
          {/* Domain Hierarchy Info */}
          <Card className="mb-8 bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-base">Understanding Domains</CardTitle>
              <CardDescription>
                The assessment platform is organized hierarchically into Domains, which contain Capacities
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="space-y-2">
                <p>
                  <strong className="text-foreground">Domains:</strong> Broad cognitive areas (e.g., Numerical Reasoning, Spatial Visualization)
                </p>
                <p>
                  <strong className="text-foreground">Capacities:</strong> Specific skills within each domain that are assessed through tests
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Domains Grid */}
          <div className="space-y-6">
            {domainsWithIcons.map((domain) => (
              <div
                key={domain.id}
                onClick={() => handleDomainClick(domain.id, domain.isLocked)}
                className={domain.isLocked ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
              >
                <Card className={domain.isLocked ? 'bg-muted/30' : 'hover:shadow-md transition-shadow'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl mt-1">{domain.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {domain.name}
                            {domain.isLocked && (
                              <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {domain.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Progress
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {domain.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                          style={{ width: `${domain.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Capacities */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Capacities ({domain.capacities.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {domain.capacities.map((capacity) => (
                          <div
                            key={capacity.id}
                            className="bg-background border border-border rounded-lg p-3 hover:border-primary transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {capacity.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {capacity.attempts} {capacity.attempts === 1 ? 'attempt' : 'attempts'}
                                </p>
                              </div>
                              {capacity.score > 0 && (
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">
                                    {capacity.score}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Score</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    {!domain.isLocked && (
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDomainClick(domain.id, domain.isLocked)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Locked Domains Notice */}
          <Card className="mt-8 bg-warning/5 border-warning/20">
            <CardHeader>
              <CardTitle className="text-base">Locked Domains</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Some domains are locked until you complete prerequisites. Progress through available domains to unlock advanced assessments.
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
