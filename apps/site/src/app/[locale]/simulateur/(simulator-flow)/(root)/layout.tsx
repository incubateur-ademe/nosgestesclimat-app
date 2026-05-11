import { ClientLayout } from '@/components/layout/ClientLayout'
import LocalisationBanner from '@/components/translation/LocalisationBanner'
import { END_PAGE_PATH, START_SIMULATION_PATH } from '@/constants/urls/paths'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getUser } from '@/helpers/server/dal/user'

import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { NotFoundError } from '@/helpers/server/error'
import { parseModelString } from '@/helpers/server/model/models'
import { getCurrentSimulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { EngineProvider, FormProvider } from '@/publicodes-state'
import { captureException } from '@sentry/nextjs'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[locale]/simulateur/intercalaire'>) {
  const { locale } = await params

  const user = await getUser()

  const currentSimulation = await getCurrentSimulation({ user })
  const serverSimulations = currentSimulation ? [currentSimulation] : []
  if (!currentSimulation) {
    captureException(new NotFoundError(), { level: 'warning' })
    redirect(START_SIMULATION_PATH)
  }
  if (currentSimulation.progression === 1) {
    redirect(END_PAGE_PATH)
  }
  const rules = await getCachedRules({
    modelStr: currentSimulation.model,
    locale: locale as Locale,
  })
  return (
    <ClientLayout
      serverSimulations={serverSimulations}
      skipLinksDisplayed={new Set(['main', 'footer'])}
      locale={locale}
      serverUserId={user.id}>
      <CurrentSimulationTracker currentSimulation={currentSimulation} />
      <EngineProvider rules={rules}>
        <LocalisationBanner model={parseModelString(currentSimulation.model)} />
        <FormProvider root="bilan">{children}</FormProvider>
      </EngineProvider>
    </ClientLayout>
  )
}
