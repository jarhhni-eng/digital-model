'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { fr, type TranslationKey } from './i18n/fr'
import { ar } from './i18n/ar'
import type { Locale } from './types'
import { getLocale, saveLocale } from './data'

// ── Translation dictionaries ─────────────────────────────────
const translations: Record<Locale, Record<TranslationKey, string>> = { fr, ar }

// ── Context ──────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey, fallback?: string) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    try {
      const stored = getLocale()
      setLocaleState(stored)
    } catch {
      // ignore SSR
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    saveLocale(l)
    // Update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', l)
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      return translations[locale][key] ?? fallback ?? key
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRTL: locale === 'ar' }}>
      {children}
    </I18nContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────
export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used inside <I18nProvider>')
  return ctx
}

// ── Standalone translate (for server-compatible usage) ────────
export function translate(key: TranslationKey, locale: Locale = 'fr'): string {
  return translations[locale][key] ?? key
}
