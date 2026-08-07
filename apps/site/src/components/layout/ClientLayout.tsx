import MainHooks from '@/app/[locale]/_components/mainLayoutProviders/MainHooks'
import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import ErrorBoundary from '@/components/error/ErrorBoundary'
import { GoogleTagIframe } from '@/components/googleTagManager/GoogleTagIframe'
import { GoogleTagScript } from '@/components/googleTagManager/GoogleTagScript'
import { PartnerProvider } from '@/contexts/partner/PartnerContext'
import SkipToMainContentLink from '@/design-system/accessibility/SkipToMainContentLink'
import Banner from '@/design-system/cms/Banner'
import type { Simulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { UserProvider } from '@/publicodes-state'
import type { UserSession } from '@/services/auth/get-user-session'
import type { SkipLinksDisplayed } from '@/types'
import type { PropsWithChildren } from 'react'
import { Suspense } from 'react'

type RootLayoutProps = PropsWithChildren & {
  locale: string
  userSession: UserSession
  skipLinksDisplayed?: SkipLinksDisplayed
  /** The user's persisted simulation, when the route has one. */
  simulation?: Simulation
}

export const ClientLayout = ({
  children,
  skipLinksDisplayed,
  locale,
  userSession,
  simulation,
}: RootLayoutProps) => (
  <ErrorBoundary>
    <QueryClientProviderWrapper>
      {/*
        Keyed by simulation id on purpose. Everything below seeds React state
        from the persisted simulation once, at mount (the provider's simulation,
        the engine situation, the current question…). On a client-side
        navigation React keeps those instances alive, so starting a new
        simulation would otherwise keep replaying the previous one's answers.
        The key remounts the tree exactly when the server hands over a different simulation,
        and never during a running one (the id does not change while the user answers).
      */}
      <UserProvider
        key={simulation?.id}
        userSession={userSession}
        simulation={simulation}>
        <PartnerProvider>
          <Suspense>
            <MainHooks />
          </Suspense>
          <SkipToMainContentLink skipLinksDisplayed={skipLinksDisplayed} />

          <Suspense fallback={null}>
            <Banner locale={locale as Locale} />
          </Suspense>
          {children}
          <GoogleTagScript />
          <GoogleTagIframe />
        </PartnerProvider>
      </UserProvider>
    </QueryClientProviderWrapper>
  </ErrorBoundary>
)
