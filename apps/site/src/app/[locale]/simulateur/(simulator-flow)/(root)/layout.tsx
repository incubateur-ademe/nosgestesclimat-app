import { ClientLayout } from '@/components/layout/ClientLayout'
import LocalisationBanner from '@/components/translation/LocalisationBanner'
import { END_PAGE_PATH, START_SIMULATION_PATH } from '@/constants/urls/paths'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getUserSession } from '@/services/auth/get-user-session'

import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { NotFoundError } from '@/helpers/server/error'
import { parseModelString } from '@/helpers/server/model/models'
import type { Locale } from '@/i18nConfig'
import { EngineProvider, FormProvider } from '@/publicodes-state'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import { captureException } from '@sentry/nextjs'
import { redirect } from 'next/navigation'

export default async function SimulationLayout({
  children,
  params,
}: LayoutProps<'/[locale]/simulateur'>) {
  const { locale } = await params

  const user = await getUserSession()
  if (!user) {
    redirect(START_SIMULATION_PATH)
  }

  const currentSimulation = await getCurrentSimulation()
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
  const model = parseModelString(currentSimulation.model)
  return (
    <ClientLayout
      serverSimulations={serverSimulations}
      skipLinksDisplayed={new Set(['main', 'footer'])}
      locale={locale}
      userSession={user}>
      <CurrentSimulationTracker currentSimulation={currentSimulation} />
      <EngineProvider rules={rules} root="bilan">
        {model && <LocalisationBanner model={model} />}
        <FormProvider root="bilan">{children}</FormProvider>
      </EngineProvider>
    </ClientLayout>
  )
}
