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
import { getGroupDisplayInfo } from '@/helpers/server/model/utils/getGroupDisplayInfo'
import type { Locale } from '@/i18nConfig'
import logger from '@/logger.server'
import { getUserSession } from '@/services/auth/get-user-session'
import { getLatestSimulationResult } from '@/services/simulations/get-latest-simulation-result'
import type { DefaultPageProps } from '@/types'
import { redirect } from 'next/navigation'

export async function generateMetadata({ params }: DefaultPageProps) {
  const { locale } = await params
  const { t } = getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: t(
      'endpage.meta.title.carbon',
      'Mon empreinte carbone - Nos Gestes Climat'
    ),
    description: t(
      "Vos résultats de tests de notre calculateur d'empreinte carbone."
    ),
    alternates: {
      canonical: '/fin',
    },
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
    // A warn carries no stack: the component names where it happened.
    logger.warn('No session found in cookies, redirecting to the home page', {
      scope: 'site.view.endPage',
    })
    redirect('/')
  }

  const result = await getLatestSimulationResult({ withTendency: user.isAuth })

  return (
    <>
      <FootprintsLinks
        locale={locale as Locale}
        currentPage="carbone"
        basePathname={END_PAGE_PATH}
      />

      <CarbonFootprintResults
        computedResults={result.simulation.computedResults}
        locale={locale as Locale}
        tendency={result.tendency ?? undefined}
        hasPreviousSimulation={result.tendency !== null}
        group={result.group ? getGroupDisplayInfo(result.group) : null}
      />

      <IframeDataShareModal
        computedResults={result.simulation.computedResults}
      />
    </>
  )
}
