import FootprintsLinks from '@/components/results/FootprintsLinks'
import WaterFootprintResults from '@/components/results/waterFootprint/WaterFootprintResults'
import {
  MON_ESPACE_RESULTS_DETAIL_PATH,
  MON_ESPACE_RESULTS_PATH,
} from '@/constants/urls/paths'
import Breadcrumbs from '@/design-system/layout/Breadcrumbs'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { buildAlternates } from '@/helpers/metadata/getMetadataObject'
import { getSimulationResult } from '@/services/simulations/get-simulation-result'
import type { DefaultPageProps } from '@/types'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: DefaultPageProps<{
  params: { locale: string; simulationId: string }
}>): Promise<Metadata> {
  const { locale, simulationId } = await params

  return {
    alternates: buildAlternates({
      locale,
      canonical: `/mon-espace/resultats/${simulationId}/eau`,
    }),
  }
}

export default async function DetailledResultsWaterPage({
  params,
}: DefaultPageProps<{ params: { locale: string; simulationId: string } }>) {
  const { simulationId, locale } = await params

  const { t } = await getServerTranslation({ locale })

  const simulationResult = await getSimulationResult(simulationId)

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
          },
          {
            href: `${MON_ESPACE_RESULTS_DETAIL_PATH.replace(':simulationId', simulationId)}/eau`,
            label: t(
              'mon-espace.resultsDetail.breadcrumb.waterFootprint',
              'Empreinte eau'
            ),
            isActive: true,
          },
        ]}
      />

      <FootprintsLinks
        locale={locale}
        currentPage="eau"
        basePathname={`${MON_ESPACE_RESULTS_PATH}/resultats/${simulationId}`}
      />

      <WaterFootprintResults
        computedResults={simulationResult.simulation.computedResults}
        locale={locale}
        hideSaveBlock
      />
    </>
  )
}
