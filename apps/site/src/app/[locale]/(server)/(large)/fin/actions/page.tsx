import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import type { AppUser } from '@/helpers/server/dal/user'
import { getUser } from '@/helpers/server/dal/user'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { getThemes } from '@/services/actions/get-themes'
import { getFeatureFlag } from '@/services/feature-flags/getFeatureFlag'
import type { DefaultPageProps } from '@/types'
import { getPersonalizedActionsCatalogue } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'

export default async function ResultatsActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUser()
  const flag = await getFeatureFlag('actions-v2', user.id)

  if (!flag) {
    return <LegacyResultatsActionsPage user={user} locale={locale} />
  }

  const [actionsCatalogue, themes] = await Promise.all([
    getPersonalizedActionsCatalogue(user.id),
    getThemes(),
  ])

  return (
    <ActionsPage
      topActions={actionsCatalogue.actions.slice(0, 3)}
      actions={actionsCatalogue.actions}
      themes={themes}
      locale={locale}
      assessmentStatus={actionsCatalogue.assessmentStatus}
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
