import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import type { AppUser } from '@/helpers/server/dal/user'
import { getUser } from '@/helpers/server/dal/user'
import { getSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { posthogClient } from '@/services/tracking/posthogServer'
import type { DefaultPageProps } from '@/types'
import { actions } from '@nosgestesclimat/core/features/actions/data/actions/index'
import { themes } from '@nosgestesclimat/core/features/actions/data/themes/index'

export default async function ResultatsActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUser()
  const flag = await posthogClient.getFeatureFlag('actions-v2', user.id)

  if (!flag) {
    return <LegacyResultatsActionsPage user={user} locale={locale} />
  }

  return (
    <ActionsPage
      topActions={actions.slice(0, 3)}
      actions={actions}
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
  const simulations = await getSimulations(
    { user },
    { completedOnly: true, pageSize: 1 }
  )

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
