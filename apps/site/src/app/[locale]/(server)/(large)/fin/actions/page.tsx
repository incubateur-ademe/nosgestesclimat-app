import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { hasActionV2Rollout } from '@/services/actions/has-action-v2-rollout'
import type { AppUser } from '@/services/users/get-user-session'
import { getUserSession } from '@/services/users/get-user-session'
import type { DefaultPageProps } from '@/types'

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
  const flag = await hasActionV2Rollout(user.id)

  if (!flag) {
    return <LegacyResultatsActionsPage user={user} locale={locale} />
  }

  const [actionsCatalogue, themes] = await Promise.all([
    getPersonalizedActionsCatalogue(user.id),
    getThemes(),
  ])

  return (
    <ActionsPage
      topActions={actionsCatalogue.topActions}
      actions={actionsCatalogue.actions}
      assessmentStatus={actionsCatalogue.assessmentStatus}
      themes={themes}
      locale={locale}
    />
  )
}

async function LegacyResultatsActionsPage({
  user,
  locale,
}: {
  user: AppUser
  locale: Locale
}) {
  const simulations = await getCompletedSimulations({ user }, { pageSize: 1 })

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
