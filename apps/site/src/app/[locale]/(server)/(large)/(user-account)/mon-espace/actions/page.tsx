import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import Trans from '@/components/translation/trans/TransServer'
import { MON_ESPACE_ACTIONS_PATH } from '@/constants/urls/paths'
import type { AppUser } from '@/helpers/server/dal/user'
import { throwNextError } from '@/helpers/server/error'
import { getSimulations } from '@/helpers/server/model/simulations'
import { getAuthUser } from '@/helpers/server/model/user'
import type { Locale } from '@/i18nConfig'
import { posthogClient } from '@/services/tracking/posthogServer'
import type { DefaultPageProps } from '@/types'
import ProfileTab from '../_components/ProfileTabs'

export default async function MonEspaceActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await throwNextError(getAuthUser)
  const flag = await posthogClient.getFeatureFlag('actions-v2', user.id)

  if (!flag) {
    return <LegacyMonEspaceActionsPage user={user} locale={locale} />
  }

  return <div>Page en construction</div>
}

async function LegacyMonEspaceActionsPage({
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

  return (
    <div className="flex flex-col">
      <h1 className="sr-only mb-6 text-2xl font-bold">
        <Trans i18nKey="mon-espace.actions.title" locale={locale}>
          Mes actions
        </Trans>
      </h1>

      <ProfileTab locale={locale} activePath={MON_ESPACE_ACTIONS_PATH} />
      <LegacyActionPage simulations={simulations} locale={locale} />
    </div>
  )
}
