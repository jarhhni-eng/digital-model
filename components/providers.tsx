'use client'

import { AuthProvider } from '@/lib/auth-context'
import { I18nProvider } from '@/lib/i18n-context'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </I18nProvider>
  )
}
