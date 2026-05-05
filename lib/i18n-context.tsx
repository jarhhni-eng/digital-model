'use client'

/**
 * Thin wrapper over react-i18next for call sites that prefer `useI18n()`.
 * UI copy lives in `messages/en.json` and `messages/fr.json`.
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export type Locale = 'en' | 'fr'

type I18nContextCompat = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, options?: Record<string, string | number>) => string
}

export function useI18n(): I18nContextCompat {
  const { t: translate, i18n } = useTranslation()

  const locale: Locale = i18n.language.startsWith('fr') ? 'fr' : 'en'

  const setLocale = useCallback(
    (l: Locale) => {
      void i18n.changeLanguage(l)
    },
    [i18n],
  )

  const t = useCallback(
    (key: string, options?: Record<string, string | number>) =>
      translate(key, options) as string,
    [translate],
  )

  return { locale, setLocale, t }
}
