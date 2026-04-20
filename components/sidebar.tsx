'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/components/ui/use-mobile'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  role: 'student' | 'teacher' | 'both' | 'admin'
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Tableau de bord', href: '/dashboard', role: 'both' },
  { icon: <Brain className="w-5 h-5" />, label: 'Domaines', href: '/domains', role: 'student' },
  { icon: <ClipboardList className="w-5 h-5" />, label: 'Tests', href: '/tests', role: 'student' },
  { icon: <FileText className="w-5 h-5" />, label: 'Résultats', href: '/results', role: 'student' },
  { icon: <Users className="w-5 h-5" />, label: 'Élèves', href: '/students', role: 'teacher' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytique', href: '/analytics', role: 'teacher' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Rapports', href: '/reports', role: 'teacher' },
  { icon: <Settings className="w-5 h-5" />, label: 'Profil', href: '/profile', role: 'both' },
]

interface SidebarProps {
  userRole: 'student' | 'teacher' | 'admin'
  userName?: string
}

export function Sidebar({ userRole, userName = 'Utilisateur' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const filteredItems = navItems.filter((item) => {
    if (item.role === 'both') return true
    // Admins never use the shared Sidebar — they have a dedicated isolated one.
    if (userRole === 'admin') return false
    return item.role === userRole
  })

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleNavClick = () => {
    if (isMobile) setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger button — mobile only */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {/* Backdrop overlay — mobile only, when open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-200',
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">CogniTest</h1>
              <p className="text-xs text-muted-foreground">Recherche académique</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Footer */}
        <div className="border-t border-sidebar-border px-4 py-4 flex-shrink-0">
          <div className="mb-3 px-2">
            <p className="text-xs text-muted-foreground mb-0.5">Connecté en tant que</p>
            <p className="font-medium text-sidebar-foreground text-sm truncate">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
