'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LogOut,
  Settings,
  Users,
  LayoutDashboard,
  Brain,
  FileText,
  Globe,
  Layers,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/lib/i18n'

interface NavItem {
  icon: React.ReactNode
  labelKey: string
  href: string
  role: 'student' | 'teacher' | 'both'
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    labelKey: 'nav.dashboard',
    href: '/dashboard',
    role: 'both',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    labelKey: 'nav.domains',
    href: '/domains',
    role: 'student',
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    labelKey: 'nav.tests',
    href: '/tests',
    role: 'student',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    labelKey: 'nav.results',
    href: '/results',
    role: 'student',
  },
  {
    icon: <Users className="w-5 h-5" />,
    labelKey: 'nav.students',
    href: '/teacher/students',   // fixed: was /students (404)
    role: 'teacher',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    labelKey: 'nav.groups',
    href: '/teacher/groups',     // new
    role: 'teacher',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    labelKey: 'nav.analytics',
    href: '/teacher/analytics',  // fixed: was /analytics (404)
    role: 'teacher',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    labelKey: 'nav.insights',
    href: '/teacher/insights',   // new
    role: 'teacher',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    labelKey: 'nav.reports',
    href: '/teacher/reports',    // fixed: was /reports (404)
    role: 'teacher',
  },
  {
    icon: <Settings className="w-5 h-5" />,
    labelKey: 'nav.profile',
    href: '/profile',
    role: 'both',
  },
]

interface SidebarProps {
  userRole?: 'student' | 'teacher'
  userName?: string
}

export function Sidebar({ userRole: userRoleProp, userName: userNameProp }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { t, locale, setLocale, isRTL } = useTranslation()

  // Prefer data from auth context over props
  const userRole = (user?.role === 'admin' ? 'teacher' : user?.role) ?? userRoleProp ?? 'student'
  const userName = user?.displayName ?? userNameProp ?? 'User'

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const filteredItems = navItems.filter(
    (item) => item.role === userRole || item.role === 'both'
  )

  return (
    <aside
      className={cn(
        'fixed top-0 h-screen w-64 bg-sidebar border-sidebar-border flex flex-col z-40',
        isRTL ? 'right-0 border-l' : 'left-0 border-r'
      )}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">CogniTest</h1>
            <p className="text-xs text-muted-foreground">
              {locale === 'ar' ? 'البحث الأكاديمي' : 'Academic Research'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {item.icon}
              <span>{t(item.labelKey as any)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === 'fr' ? 'ar' : 'fr')}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
        >
          <Globe className="w-4 h-4" />
          {locale === 'fr' ? 'العربية' : 'Français'}
        </button>

        {/* User info */}
        <div className="px-2">
          <p className="text-xs text-muted-foreground mb-0.5">
            {locale === 'ar' ? 'مُسجَّل دخوله' : 'Connecté en tant que'}
          </p>
          <p className="font-medium text-sidebar-foreground text-sm truncate">{userName}</p>
          <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
