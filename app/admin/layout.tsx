'use client'

/**
 * Admin dashboard layout — applied to every route under /admin/**.
 *
 * Enforces strict isolation:
 *   - Only users with role === 'admin' may render children.
 *   - Any other role is redirected to '/'.
 *   - Renders the AdminSidebar ONLY (no shared Sidebar), so no link to
 *     student or teacher interfaces exists anywhere inside /admin.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="bg-slate-50 min-h-screen">
      <AdminSidebar userName={user.username} />
      <div className={cn('transition-all duration-200', isMobile ? 'ml-0 pt-16' : 'ml-64')}>
        <main className="p-4 md:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  )
}
