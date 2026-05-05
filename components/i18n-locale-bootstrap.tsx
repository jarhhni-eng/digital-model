'use client'

import { useEffect } from 'react'
import i18n, { STORAGE_KEY } from '@/lib/i18n/client'

function persistLocale(lng: string) {
  const short = lng.startsWith('fr') ? 'fr' : 'en'
  try {
    localStorage.setItem(STORAGE_KEY, short)
  } catch {
    /* ignore */
  }
}

/** Applies `localStorage` / navigator preference after mount so SSR and first client paint match. */
export function I18nLocaleBootstrap() {
  useEffect(() => {
    let cancelled = false

    const applyStoredOrNavigator = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'fr' || stored === 'en') {
          if (!cancelled && i18n.language.slice(0, 2) !== stored) {
            void i18n.changeLanguage(stored)
          }
          return
        }
      } catch {
        /* ignore */
      }
      const nav = navigator.language?.toLowerCase() ?? ''
      const next = nav.startsWith('fr') ? 'fr' : 'en'
      if (!cancelled && i18n.language.slice(0, 2) !== next) {
        void i18n.changeLanguage(next)
      }
    }

    applyStoredOrNavigator()

    const onLanguageChanged = (lng: string) => {
      persistLocale(lng)
    }
    i18n.on('languageChanged', onLanguageChanged)

    return () => {
      cancelled = true
      i18n.off('languageChanged', onLanguageChanged)
    }
  }, [])

  return null
}
