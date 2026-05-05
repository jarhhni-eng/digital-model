'use client'

/**
 * Admin dashboard layout — applied to every route under /admin/**.
 *
 * Enforces strict isolation:
 *   - Only users with role `admin` or `super_admin` may render children.
 *   - Any other role is redirected to '/'.
 *   - Renders the AdminSidebar ONLY (no shared Sidebar), so no link to
 *     student or teacher interfaces exists anywhere inside /admin.
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserCog } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { AdminAuthShellSkeleton } from '@/components/skeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isAdminAreaRole } from '@/lib/auth-types'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const isMobile = useIsMobile()
  const showSuperAdminProvisioning =
    user?.role === 'super_admin' && pathname !== '/admin/admins'

  useEffect(() => {
    if (!loading && (!user || !isAdminAreaRole(user.role))) router.replace('/')
  }, [loading, user, router])

  if (loading || !user || !isAdminAreaRole(user.role)) {
    return <AdminAuthShellSkeleton />
  }

  return (
    <div className="bg-slate-50 min-h-screen relative">
      <div
        className={cn(
          'fixed z-[60] flex justify-end',
          isMobile ? 'top-4 right-4' : 'top-4 right-4 md:right-6',
        )}
      >
        <LocaleSwitcher trigger="button" />
      </div>
      <AdminSidebar userName={user.username} />
      <div className={cn('transition-all duration-200', isMobile ? 'ml-0 pt-16' : 'ml-64')}>
        <main className="p-4 md:p-8 max-w-7xl space-y-4">
          {showSuperAdminProvisioning && (
            <Alert className="border-indigo-200 bg-indigo-50/80 text-slate-900 shadow-sm [&>svg]:text-indigo-700">
              <UserCog className="h-4 w-4" aria-hidden />
              <AlertTitle>Comptes administrateur</AlertTitle>
              <AlertDescription className="text-slate-700">
                Vous pouvez créer d&apos;autres comptes <strong>admin</strong> pour votre équipe (connexion sur la
                page d&apos;accueil). Ouvrez la page dédiée ou le lien{' '}
                <strong className="font-medium">Administrateurs</strong> dans le menu de gauche.
                <span className="mt-2 block">
                  <Link
                    href="/admin/admins"
                    className="font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
                  >
                    Gérer les administrateurs
                  </Link>
                </span>
              </AlertDescription>
            </Alert>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
