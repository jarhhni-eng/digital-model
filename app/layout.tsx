import type { Metadata } from 'next'
import { Inter, Poppins, Noto_Kufi_Arabic } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { I18nProvider } from '@/lib/i18n'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
})
const notoKufi = Noto_Kufi_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-arabic',
})

export const metadata: Metadata = {
  title: 'CogniTest – Plateforme d\'Évaluation Cognitive',
  description:
    'Plateforme de recherche académique pour l\'évaluation des capacités cognitives et mathématiques — ENS Fès',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${inter.variable} ${poppins.variable} ${notoKufi.variable}`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
