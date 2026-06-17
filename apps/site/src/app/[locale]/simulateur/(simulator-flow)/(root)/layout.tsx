import { ClientLayout } from '@/components/layout/ClientLayout'
import LocalisationBanner from '@/components/translation/LocalisationBanner'
import {
  AGE_PAGE_PATH,
  END_PAGE_PATH,
  START_SIMULATION_PATH,
} from '@/constants/urls/paths'
import { getCachedRules } from '@/helpers/modelFetching/getCachedRules'
import { getUser } from '@/services/users/get-user'

import CurrentSimulationTracker from '@/components/tracking/CurrentSimulationTracker'
import { NotFoundError } from '@/helpers/server/error'
import { parseModelString } from '@/helpers/server/model/models'
import { getCurrentSimulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { EngineProvider, FormProvider } from '@/publicodes-state'
import { getFeatureFlag } from '@/services/feature-flags/getFeatureFlag'
import { getUserAgeRange } from '@/services/users/get-user-age-range'
import { captureException } from '@sentry/nextjs'
import { redirect } from 'next/navigation'

export default async function SimulationLayout({
  children,
  params,
}: LayoutProps<'/[locale]/simulateur'>) {
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

  if (
    currentSimulation.progression === 0 &&
    (await getFeatureFlag('ab-test-question-tranche-dage', user.id)) ===
      'test' &&
    !(await getUserAgeRange())
  ) {
    redirect(AGE_PAGE_PATH)
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
      serverUserId={user.id}>
      <CurrentSimulationTracker currentSimulation={currentSimulation} />
      <EngineProvider rules={rules} root="bilan">
        {model && <LocalisationBanner model={model} />}
        <FormProvider root="bilan">{children}</FormProvider>
      </EngineProvider>
    </ClientLayout>
  )
}
