import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'

export const STORAGE_KEY = 'cogniTestLocale'

if (!i18n.isInitialized) {
  if (typeof window !== 'undefined') {
    i18n.use(LanguageDetector)
  }
  i18n.use(initReactI18next).init({
    lng: typeof window === 'undefined' ? 'en' : undefined,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    defaultNS: 'translation',
    ns: ['translation'],
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

export default i18n
