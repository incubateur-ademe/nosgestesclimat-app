import '@/locales/initClient'
import '@/locales/initServer'

import '@/app/[locale]/globals.css'
import { marianne } from '@/app/[locale]/marianne'
import LogoHeader from '@/components/layout/headerServer/LogoHeader'
import type { ReactNode } from 'react'

/**
 * Root layout dédié à `/app-crash`. Un second root layout, indépendant de
 * `app/[locale]/layout.tsx` : pas de providers, pas de bandeau cookies, pas de
 * trackers — c'est la page qui doit s'afficher quand le reste est HS.
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
        {/* Logo seul : un bouton de connexion dépendrait de la session et
            casserait le cache nginx partagé. */}
        <header className="h-20 items-center bg-white shadow-xs">
          <LogoHeader />
        </header>

        {children}
      </body>
    </html>
  )
}
