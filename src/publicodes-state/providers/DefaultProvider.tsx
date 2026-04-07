'use client'
import { IframeOptionsProvider } from '@/app/[locale]/_components/mainLayoutProviders/IframeOptionsContext'
import CookieConsent from '@/components/cookies/CookieConsent'
import { CookieConsentProvider } from '@/components/cookies/useCookieManagement'

export default function DefaultProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <IframeOptionsProvider>
      <CookieConsentProvider>
        <CookieConsent />

        {children}
      </CookieConsentProvider>
    </IframeOptionsProvider>
  )
}
