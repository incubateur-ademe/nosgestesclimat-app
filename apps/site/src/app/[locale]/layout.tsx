import Trackers from '@/components/tracking/Trackers'
import MatomoScript__deprecated from '@/hooks/tracking/MatomoServerTracker'
import '@/locales/initClient'
import '@/locales/initServer'
import type { DefaultPageProps } from '@/types'
import { dir } from 'i18next'
import Script from 'next/script'
import { Suspense } from 'react'

import DefaultProvider from '@/publicodes-state/providers/DefaultProvider'
import { BODY_ID } from './_components/mainLayoutProviders/IframeOptionsContext'
import './globals.css'
import { marianne } from './marianne'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
} & DefaultPageProps) {
  const { locale } = await params

  return (
    <html lang={locale} dir={dir(locale)}>
      <head>
        <link rel="icon" href="/favicon.png" />

        <meta
          name="google-site-verification"
          content="oQ9gPKS4kocrCJP6CoguSkdIKKZ6ilZz0aQw_ZIgtVc"
        />

        <meta property="twitter:card" content="summary_large_image" />

        <link rel="manifest" href="/manifest.webmanifest" />

        <meta name="theme-color" content="#4949ba" />

        <MatomoScript__deprecated />
        <Suspense>
          <Trackers locale={locale} />
        </Suspense>

        <Script
          src="https://tally.so/widgets/embed.js"
          strategy="lazyOnload"></Script>
      </head>
      <DefaultProvider>
        <body
          id={BODY_ID}
          className={`${marianne.className} text-default bg-white transition-colors duration-700`}>
          {children}
        </body>
      </DefaultProvider>
    </html>
  )
}
