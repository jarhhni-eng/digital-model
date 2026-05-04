'use client'

import { use } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { platformDomains } from '@/lib/platform-domains'
import type { DomainCapacity } from '@/lib/mock-data'
import { ArrowLeft, ClipboardList, ChevronRight, Brain, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DomainDetailPageProps {
  params: Promise<{ domainId: string }>
}

export default function DomainDetailPage({ params }: DomainDetailPageProps) {
  const { domainId } = use(params)
  const domain = platformDomains.find((d) => d.id === domainId)
  const isMobile = useIsMobile()

  if (!domain) {
    return (
      <div className="bg-background min-h-screen">
        <Sidebar userRole="student" />
        <div className={cn("p-4 md:p-6 pt-24 transition-all", isMobile ? "ml-0" : "ml-64")}>
          <div className="max-w-2xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Domain not found</h1>
            <p className="text-muted-foreground mb-6">
              The domain you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Button variant="outline" asChild>
              <Link href="/domains">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Domains
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const DomainIcon = domain.id === 'mathematics-learning' ? Calculator : Brain

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole="student" />

      <div className={cn("transition-all duration-200", isMobile ? "ml-0" : "ml-64")}>
        <Header
          title={domain.name}
          subtitle={domain.description}
        />

        <main className={cn("p-4 md:p-6 pt-24 max-w-5xl", isMobile && "pb-20")}>
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm">
            <Link
              href="/domains"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Domains
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{domain.name}</span>
          </nav>

          {/* Domain intro */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <DomainIcon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{domain.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {domain.subdomains.length} subdomains · {domain.subdomains.reduce((n, s) => n + s.capacities.length, 0)} tests available
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subdomains and Capacities */}
          <div className="space-y-6">
            {domain.subdomains.map((subdomain, idx) => (
              <Card key={subdomain.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-muted-foreground font-normal tabular-nums">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    {subdomain.name}
                  </CardTitle>
                  <CardDescription>
                    {subdomain.capacities.length} capacity {subdomain.capacities.length === 1 ? 'test' : 'tests'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subdomain.capacities.map((capacity) => (
                      <CapacityCard key={capacity.id} capacity={capacity} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function CapacityCard({ capacity }: { capacity: DomainCapacity }) {
  return (
    <Link
      href={`/tests/${capacity.testId}`}
      className={cn(
        'flex items-center justify-between gap-3 p-4 rounded-lg border border-border',
        'bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {capacity.name}
          </p>
          {capacity.nameFr && (
            <p className="text-xs text-muted-foreground truncate">{capacity.nameFr}</p>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
    </Link>
  )
}
