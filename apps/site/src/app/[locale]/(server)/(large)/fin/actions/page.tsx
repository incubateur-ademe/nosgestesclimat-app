import ActionsPage from '@/components/actions/pages/ActionsPage'
import NoResultsBlock from '@/components/dashboard/NoResultsBlock'
import { ACTIONS_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { getUserSession } from '@/services/auth/get-user-session'
import { getCurrentSimulation } from '@/services/simulations/get-current-simulation'
import type { DefaultPageProps } from '@/types'
import { redirect } from 'next/navigation'

export const generateMetadata = getCommonMetadata({
  title: t('actions.listPage.metaTitle'),
  alternates: {
    canonical: '/fin/actions',
  },
})

export default async function ResultatsActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUserSession()

  if (!user) {
    redirect(ACTIONS_PATH)
  }

  const [actionsCatalogue, themes, currentSimulation] = await Promise.all([
    getPersonalizedActionsCatalogue(user.id, locale),
    getThemes(locale),
    getCurrentSimulation(),
  ])

  // No finished simulation: nothing to personalize from.
  if (actionsCatalogue.assessmentStatus === null) {
    return <NoResultsBlock locale={locale} />
  }

  return (
    <ActionsPage
      topActions={actionsCatalogue.topActions}
      actions={actionsCatalogue.actions}
      assessmentStatus={actionsCatalogue.assessmentStatus}
      themes={themes}
      locale={locale}
      from="fin"
      totalFootprint={currentSimulation?.computedResults.carbone.bilan}
      shouldHideActionCommitFeature
    />
  )
}
