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
import { getUser } from '@/helpers/server/dal/user'
import { NotFoundError, throwNextError } from '@/helpers/server/error'
import { getSimulationResult } from '@/helpers/server/model/simulationResult'
import { getSimulations } from '@/helpers/server/model/simulations'
import {
  getTendency,
  type Tendency,
} from '@/helpers/server/model/utils/getTendency'
import type { Locale } from '@/i18nConfig'
import type { DefaultPageProps } from '@/types'
import { captureException } from '@sentry/nextjs'
import { redirect } from 'next/navigation'

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
      `${MON_ESPACE_RESULTS_DETAIL_PATH.replace(':simulationId', sid as string)}`
    )
  }

  const user = await getUser()
  let simulations
  try {
    simulations = await getSimulations(
      { user },
      { completedOnly: true, pageSize: user.isAuth ? 2 : 1 }
    )
  } catch (e) {
    captureException(e)
    redirect('/')
  }

  const [simulation, previousSimulation] = simulations

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!simulation) {
    captureException(new NotFoundError(), {
      level: 'warning',
      extra: {
        simulations,
      },
    })
    redirect('/')
  }
  const simulationResult = await throwNextError(async () => {
    return getSimulationResult({
      user,
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
    <div data-track>
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
    </div>
  )
}
