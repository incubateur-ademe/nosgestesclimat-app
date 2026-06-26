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
  serverSimulations?: Simulation[]
}

export const ClientLayout = ({
  children,
  skipLinksDisplayed,
  locale,
  userSession,
  serverSimulations,
}: RootLayoutProps) => (
  <ErrorBoundary>
    <QueryClientProviderWrapper>
      <UserProvider
        userSession={userSession}
        serverSimulations={serverSimulations}>
        <PartnerProvider>
          <Suspense>
            <MainHooks />
          </Suspense>
          <SkipToMainContentLink skipLinksDisplayed={skipLinksDisplayed} />

          <Banner locale={locale as Locale} />
          {children}
          <GoogleTagScript />
          <GoogleTagIframe />
        </PartnerProvider>
      </UserProvider>
    </QueryClientProviderWrapper>
  </ErrorBoundary>
)
