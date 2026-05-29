import IframeDataShareModal from '@/components/iframe/IframeDataShareModal'
import CarbonFootprintResults from '@/components/results/carbonFootprint/CarbonFootprintResults'
import FootprintsLinks from '@/components/results/FootprintsLinks'
import { noIndexObject } from '@/constants/metadata'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getAnonSession } from '@/helpers/server/dal/anonSession'
import { getUser } from '@/helpers/server/dal/user'
import { NoSessionFoundError } from '@/helpers/server/error'
import type { Locale } from '@/i18nConfig'
import type { DefaultPageProps } from '@/types'
import { logException } from '@nosgestesclimat/core'
import { NoCompletedSimulationForUserException } from '@nosgestesclimat/core/features/simulations/exceptions/simulation-result.exception'
import { getSimulationResult } from '@nosgestesclimat/core/features/simulations/services/get-simulation-result.service'
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

  if (sid) {
    redirect(`/mon-espace/resultats/${sid as string}`)
  }

  const [user, session] = await Promise.all([getUser(), getAnonSession()])
  if (!session.userId) {
    captureException(new NoSessionFoundError())
    redirect('/')
  }

  let simulationResult
  try {
    simulationResult = await getSimulationResult({
      userId: session.userId,
      withTendency: user.isAuth,
    })
  } catch (error) {
    if (error instanceof NoCompletedSimulationForUserException) {
      logException(error)
    } else {
      captureException(error)
    }
    redirect('/')
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
        locale={locale as Locale}
      />

      <IframeDataShareModal
        computedResults={simulationResult.computedResults}
      />
    </>
  )
}
