import FootprintsLinks from '@/components/results/FootprintsLinks'
import WaterFootprintResults from '@/components/results/waterFootprint/WaterFootprintResults'
import { noIndexObject } from '@/constants/metadata'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getUser } from '@/helpers/server/dal/user'
import { throwNextError } from '@/helpers/server/error'
import { getSimulationResult } from '@/helpers/server/model/simulationResult'
import { getSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
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
    robots: noIndexObject,
  })
}

export default async function SimulationPage({
  params,
}: PageProps<'/[locale]/fin/eau'>) {
  const { locale } = await params
  const user = await getUser()
  const [simulation] = await getSimulations(
    { user },
    { completedOnly: true, pageSize: 1 }
  )
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!simulation) {
    notFound()
  }
  const simulationResult = await throwNextError(async () => {
    return getSimulationResult({
      user,
      simulation,
    })
  })

  return (
    <div data-track>
      <FootprintsLinks
        locale={locale as Locale}
        currentPage="eau"
        basePathname={END_PAGE_PATH}
      />

      <WaterFootprintResults
        simulationResult={simulationResult}
        locale={locale as Locale}
        hideSaveBlock={user.isAuth}
      />
    </div>
  )
}
