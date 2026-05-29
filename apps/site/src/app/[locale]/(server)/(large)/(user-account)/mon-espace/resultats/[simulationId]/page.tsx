import CarbonFootprintResults from '@/components/results/carbonFootprint/CarbonFootprintResults'
import FootprintsLinks from '@/components/results/FootprintsLinks'
import {
  MON_ESPACE_RESULTS_DETAIL_PATH,
  MON_ESPACE_RESULTS_PATH,
} from '@/constants/urls/paths'
import Breadcrumbs from '@/design-system/layout/Breadcrumbs'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { DefaultPageProps } from '@/types'
import { findSimulationResult } from '@nosgestesclimat/core/features/simulations/repositories/simulation-result.repository'
import { notFound } from 'next/navigation'

export default async function DetailledResultsPage({
  params,
}: DefaultPageProps<{ params: { locale: string; simulationId: string } }>) {
  const { simulationId, locale } = await params

  const { t } = await getServerTranslation({ locale })

  const simulationResult = await findSimulationResult(simulationId)

  if (!simulationResult) {
    notFound()
  }

  return (
    <>
      <Breadcrumbs
        items={[
          {
            href: MON_ESPACE_RESULTS_PATH,
            label: t(
              'mon-espace.resultsDetail.breadcrumb.results',
              'Mes résultats'
            ),
          },
          {
            href: MON_ESPACE_RESULTS_DETAIL_PATH.replace(
              ':simulationId',
              simulationId
            ),
            label: t(
              'mon-espace.resultsDetail.breadcrumb.resultDetail',
              'Détail des résultats'
            ),
            isActive: true,
          },
        ]}
      />

      <FootprintsLinks
        locale={locale}
        currentPage="carbone"
        basePathname={`${MON_ESPACE_RESULTS_PATH}/resultats/${simulationId}`}
      />

      <CarbonFootprintResults
        simulationResult={simulationResult}
        locale={locale}
        hideSaveBlock
      />
    </>
  )
}
