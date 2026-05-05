'use client'

import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n/client'
import { AuthProvider } from '@/lib/auth-context'
import { HtmlLang } from '@/components/html-lang'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <HtmlLang />
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </I18nextProvider>
  )
}
