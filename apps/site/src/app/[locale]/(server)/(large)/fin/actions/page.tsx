import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import type { AppUser } from '@/helpers/server/dal/user'
import { getUser } from '@/helpers/server/dal/user'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { getActions } from '@/services/actions/get-actions'
import { getThemes } from '@/services/actions/get-themes'
import { getFeatureFlag } from '@/services/feature-flags/getFeatureFlag'
import type { DefaultPageProps } from '@/types'

export default async function ResultatsActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUser()
  const flag = await getFeatureFlag('actions-v2', user.id)

  if (!flag) {
    return <LegacyResultatsActionsPage user={user} locale={locale} />
  }

  const [actions, themes] = await Promise.all([getActions(), getThemes()])

  return (
    <ActionsPage
      // topActions={topActions}
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
  const simulations = await getCompletedSimulations({ user }, { pageSize: 1 })

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
