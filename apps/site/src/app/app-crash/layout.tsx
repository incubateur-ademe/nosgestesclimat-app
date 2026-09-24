import '@/locales/initClient'
import '@/locales/initServer'

import { marianne } from '@/app/[locale]/marianne'
import LogoHeader from '@/components/layout/headerServer/LogoHeader'
import '@/styles/globals.css'
import type { ReactNode } from 'react'

/**
 * Root layout dedicated to `/app-crash`. A second root layout, independent of
 * `app/[locale]/layout.tsx`: no providers, no cookie banner, no trackers — this
 * is the page that must render when everything else is down.
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
        {/* Logo only: a sign-in button would depend on the session and break the
            shared nginx cache. */}
        <header className="h-20 items-center bg-white shadow-xs">
          <LogoHeader unoptimizedLogo />
        </header>

        {children}
      </body>
    </html>
  )
}
