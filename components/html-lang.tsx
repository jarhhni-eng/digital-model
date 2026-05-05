'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/** Keeps `<html lang>` in sync with the active i18next language (client only). */
export function HtmlLang() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const apply = (lng: string) => {
      const short = lng.startsWith('fr') ? 'fr' : 'en'
      document.documentElement.lang = short
    }
    apply(i18n.language)
    i18n.on('languageChanged', apply)
    return () => {
      i18n.off('languageChanged', apply)
    }
  }, [i18n])

  return null
}
