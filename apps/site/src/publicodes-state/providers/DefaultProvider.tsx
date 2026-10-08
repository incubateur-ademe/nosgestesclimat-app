'use client'
import { IframeOptionsProvider } from '@/app/[locale]/_components/mainLayoutProviders/IframeOptionsContext'
import CookieConsent from '@/components/cookies/CookieConsent'
import { CookieConsentProvider } from '@/components/cookies/useCookieManagement'
import { TooltipProvider } from '@/design-system/shadcn/tooltip'
import { MotionConfig } from 'framer-motion'

export default function DefaultProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <IframeOptionsProvider>
      <CookieConsentProvider>
        <CookieConsent />

        <MotionConfig reducedMotion="user">
          <TooltipProvider>{children}</TooltipProvider>
        </MotionConfig>
      </CookieConsentProvider>
    </IframeOptionsProvider>
  )
}
