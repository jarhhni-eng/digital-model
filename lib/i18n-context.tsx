'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

export type Locale = 'en' | 'fr' | 'ar'

type Messages = Record<string, string>

const messages: Record<Locale, Messages> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.domains': 'Domains',
    'nav.tests': 'Tests',
    'nav.results': 'Results',
    'nav.profile': 'Profile',
    'auth.login': 'Sign in',
    'auth.register': 'Create account',
  },
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.domains': 'Domaines',
    'nav.tests': 'Tests',
    'nav.results': 'Résultats',
    'nav.profile': 'Profil',
    'auth.login': 'Connexion',
    'auth.register': 'Créer un compte',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.domains': 'المجالات',
    'nav.tests': 'الاختبارات',
    'nav.results': 'النتائج',
    'nav.profile': 'الملف الشخصي',
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
  },
}

type I18nContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')

  const t = useCallback(
    (key: string) => messages[locale][key] ?? messages.en[key] ?? key,
    [locale]
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
