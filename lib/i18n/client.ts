import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'

export const STORAGE_KEY = 'cogniTestLocale'

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    // Same on server and first client paint — `I18nLocaleBootstrap` applies stored / navigator after mount.
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    defaultNS: 'translation',
    ns: ['translation'],
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

export default i18n
