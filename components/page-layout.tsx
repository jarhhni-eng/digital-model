'use client'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  userRole: 'student' | 'teacher' | 'admin'
  userName?: string
  title?: string
  subtitle?: string
  children: React.ReactNode
  /** Extra classes for the <main> element */
  mainClassName?: string
  /** If true, adds bottom padding for mobile nav */
  mobileBottomNav?: boolean
}

export function PageLayout({
  userRole,
  userName,
  title,
  subtitle,
  children,
  mainClassName,
  mobileBottomNav = false,
}: PageLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <div className="bg-background min-h-screen">
      <Sidebar userRole={userRole} userName={userName} />
      <div className={cn('transition-all duration-200', isMobile ? 'ml-0' : 'ml-64')}>
        <Header title={title} subtitle={subtitle} />
        <main
          className={cn(
            'p-4 md:p-6 pt-24',
            mobileBottomNav && isMobile && 'pb-20',
            mainClassName
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
