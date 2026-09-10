import FootprintsLinks from '@/components/results/FootprintsLinks'
import WaterFootprintResults from '@/components/results/waterFootprint/WaterFootprintResults'
import { noIndexObject } from '@/constants/metadata'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/auth/get-user-session'
import { getLatestSimulationResult } from '@/services/simulations/get-latest-simulation-result'
import type { DefaultPageProps } from '@/types'
import { notFound } from 'next/navigation'

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
    alternates: {
      canonical: '/fin/eau',
    },
    robots: noIndexObject,
  })
}

export default async function SimulationPage({
  params,
}: PageProps<'/[locale]/fin/eau'>) {
  const { locale } = await params
  const user = await getUserSession()
  const result = await getLatestSimulationResult({ withTendency: false })
  if (!user) {
    notFound()
  }

  return (
    <>
      <FootprintsLinks
        locale={locale as Locale}
        currentPage="eau"
        basePathname={END_PAGE_PATH}
      />

      <WaterFootprintResults
        computedResults={result.simulation.computedResults}
        locale={locale as Locale}
        hideSaveBlock={user.isAuth}
      />
    </>
  )
}
