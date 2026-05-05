'use client'

import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type LocaleSwitcherProps = {
  className?: string
  /** `icon` — même style que cloche / réglages ; `button` — libellé + chevron (ex. page d’accueil). */
  trigger?: 'icon' | 'button'
}

const LOCALES = [
  { code: 'en' as const, labelKey: 'locale.en' },
  { code: 'fr' as const, labelKey: 'locale.fr' },
]

export function LocaleSwitcher({ className, trigger = 'icon' }: LocaleSwitcherProps) {
  const { i18n, t } = useTranslation()
  const active = i18n.language.startsWith('fr') ? 'fr' : 'en'
  const activeLabel = active === 'fr' ? t('locale.fr') : t('locale.en')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger === 'icon' ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('text-muted-foreground hover:text-foreground shrink-0', className)}
            aria-label={t('locale.label')}
          >
            <Languages className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('h-9 gap-1.5 font-medium', className)}
            aria-label={t('locale.label')}
          >
            {activeLabel}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {LOCALES.map(({ code, labelKey }) => (
          <DropdownMenuItem
            key={code}
            className="gap-2"
            onClick={() => void i18n.changeLanguage(code)}
          >
            <Check className={cn('h-4 w-4', active !== code && 'opacity-0')} aria-hidden />
            {t(labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
