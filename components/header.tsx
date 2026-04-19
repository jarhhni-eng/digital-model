'use client'

import { Bell, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const isMobile = useIsMobile()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 bg-background border-b border-border h-16 flex items-center justify-between px-4 md:px-6 z-40 transition-all duration-200',
        isMobile ? 'left-0 pl-16' : 'left-64'
      )}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block truncate">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Search — tablet+ only */}
        <div className="hidden md:flex items-center relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-10 h-9 bg-muted border-border"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
