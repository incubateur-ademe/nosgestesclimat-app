import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import type { AppUser } from '@/helpers/server/dal/user'
import { getUser } from '@/helpers/server/dal/user'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import { posthogClient } from '@/services/tracking/posthogServer'
import type { DefaultPageProps } from '@/types'

export default async function ResultatsActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await getUser()
  const flag = await posthogClient.getFeatureFlag('actions-v2', user.id)

  if (!flag) {
    return <LegacyResultatsActionsPage user={user} locale={locale} />
  }

  return <div>Page en construction</div>
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
