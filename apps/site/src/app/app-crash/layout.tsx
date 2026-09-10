import '@/locales/initClient'
import '@/locales/initServer'

import '@/app/[locale]/globals.css'
import { marianne } from '@/app/[locale]/marianne'
import LogoHeader from '@/components/layout/headerServer/LogoHeader'
import type { ReactNode } from 'react'

/**
 * Root layout dédié à la page d'erreur applicative `/app-crash`.
 *
 * Volontairement minimal : pas de providers, pas de bandeau cookies, pas de
 * trackers (PostHog / Matomo). C'est un second root layout, indépendant de
 * `app/[locale]/layout.tsx`.
 */
export default function AppCrashLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#4949ba" />
      </head>
      <body className={`${marianne.className} text-default bg-white`}>
        {/* Header avec le logo uniquement : pas de bouton de connexion, il
            dépendrait de la session et casserait le cache nginx partagé. */}
        <header className="h-20 items-center bg-white shadow-xs">
          <LogoHeader />
        </header>

        {children}
      </body>
    </html>
  )
}
