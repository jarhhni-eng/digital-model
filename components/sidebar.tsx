'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  role: 'student' | 'teacher' | 'both'
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: 'Dashboard',
    href: '/dashboard',
    role: 'both',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    label: 'Domains',
    href: '/domains',
    role: 'student',
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    label: 'Tests',
    href: '/tests',
    role: 'student',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: 'Results',
    href: '/results',
    role: 'student',
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: 'Students',
    href: '/students',
    role: 'teacher',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: 'Analytics',
    href: '/analytics',
    role: 'teacher',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Reports',
    href: '/reports',
    role: 'teacher',
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: 'Profile',
    href: '/profile',
    role: 'both',
  },
]

interface SidebarProps {
  userRole: 'student' | 'teacher'
  userName?: string
}

export function Sidebar({ userRole, userName = 'User' }: SidebarProps) {
  const pathname = usePathname()

  const filteredItems = navItems.filter(
    (item) => item.role === userRole || item.role === 'both'
  )

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">
              CogniTest
            </h1>
            <p className="text-xs text-muted-foreground">Academic Research</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="mb-4 px-2">
          <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
          <p className="font-medium text-sidebar-foreground text-sm truncate">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {userRole}
          </p>
        </div>
        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
