import IframeDataShareModal from '@/components/iframe/IframeDataShareModal'
import CarbonFootprintResults from '@/components/results/carbonFootprint/CarbonFootprintResults'
import FootprintsLinks from '@/components/results/FootprintsLinks'
import { noIndexObject } from '@/constants/metadata'
import {
  END_PAGE_PATH,
  MON_ESPACE_RESULTS_DETAIL_PATH,
} from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { NoSessionFoundError, throwNextError } from '@/helpers/server/error'
import { getSimulationResult } from '@/helpers/server/model/simulationResult'
import {
  getTendency,
  type Tendency,
} from '@/helpers/server/model/utils/getTendency'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/auth/get-user-session'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
import type { DefaultPageProps } from '@/types'
import { captureException } from '@sentry/nextjs'
import { notFound, redirect } from 'next/navigation'

export async function generateMetadata({ params }: DefaultPageProps) {
  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t(
      'endpage.meta.title.carbon',
      'Mon empreinte carbone - Nos Gestes Climat'
    ),
    description: t(
      "Vos résultats de tests de notre calculateur d'empreinte carbone."
    ),
    robots: noIndexObject,
  })
}

export default async function FinPage({
  params,
  searchParams,
}: PageProps<'/[locale]/fin'>) {
  const { locale } = await params
  const { sid } = await searchParams

  // Legacy feature, allowed to load a simulation data by passing an sid param in the URL, used in transactionnal e-mailing
  if (sid) {
    redirect(
      MON_ESPACE_RESULTS_DETAIL_PATH.replace(':simulationId', sid as string)
    )
  }

  const user = await getUserSession()
  if (!user) {
    captureException(new NoSessionFoundError(), { level: 'warning' })
    redirect('/')
  }

  const simulations = await getCompletedSimulations({
    pageSize: user.isAuth ? 2 : 1,
  })

  const [simulation, previousSimulation] = simulations
  if (!simulation) {
    notFound()
  }

  const simulationResult = await throwNextError(async () => {
    return await getSimulationResult({
      simulation,
    })
  })
  let tendency: Tendency | undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (previousSimulation) {
    tendency = getTendency({
      previousValue: previousSimulation.computedResults.carbone.bilan,
      currentValue: simulation.computedResults.carbone.bilan,
    })
  }

  return (
    <>
      <FootprintsLinks
        locale={locale as Locale}
        currentPage="carbone"
        basePathname={END_PAGE_PATH}
      />

      <CarbonFootprintResults
        simulationResult={simulationResult}
        hasPreviousSimulation={!!previousSimulation}
        locale={locale as Locale}
        tendency={tendency}
      />

      <IframeDataShareModal
        computedResults={simulationResult.computedResults}
      />
    </>
  )
}
