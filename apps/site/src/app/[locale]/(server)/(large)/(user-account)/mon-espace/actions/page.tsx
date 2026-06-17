import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import Trans from '@/components/translation/trans/TransServer'
import { MON_ESPACE_ACTIONS_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { throwNextError } from '@/helpers/server/error'
import { getCompletedSimulations } from '@/helpers/server/model/simulations'
import { getAuthUser } from '@/helpers/server/model/user'
import type { Locale } from '@/i18nConfig'
import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { hasActionV2Rollout } from '@/services/actions/has-action-v2-rollout'
import type { AppUser } from '@/services/users/get-user-session'
import type { DefaultPageProps } from '@/types'
import ProfileTab from '../_components/ProfileTabs'

export const generateMetadata = getCommonMetadata({
  title: t('actions.listPage.metaTitle'),
  alternates: {
    canonical: '/mon-espace/actions',
  },
})

export default async function MonEspaceActionsPage({
  params,
}: DefaultPageProps) {
  const { locale } = await params
  const user = await throwNextError(getAuthUser)
  const flag = await hasActionV2Rollout(user.id)

  const [maybePersonalizedActionsCatalogue, themes] = flag
    ? await Promise.all([getPersonalizedActionsCatalogue(user.id), getThemes()])
    : [undefined, undefined]

  return (
    <div className="flex flex-col">
      <h1 className="sr-only text-2xl font-bold">
        <Trans i18nKey="mon-espace.actions.title" locale={locale}>
          Mes actions
        </Trans>
      </h1>

      <ProfileTab locale={locale} activePath={MON_ESPACE_ACTIONS_PATH} />

      {flag && maybePersonalizedActionsCatalogue ? (
        <div className="pt-4">
          <ActionsPage
            topActions={maybePersonalizedActionsCatalogue.topActions}
            actions={maybePersonalizedActionsCatalogue.actions}
            assessmentStatus={
              maybePersonalizedActionsCatalogue.assessmentStatus
            }
            themes={themes}
            locale={locale}
          />
        </div>
      ) : (
        <LegacyMonEspaceActionsPage user={user} locale={locale} />
      )}
    </div>
  )
}

async function LegacyMonEspaceActionsPage({
  user,
  locale,
}: {
  user: AppUser
  locale: Locale
}) {
  const simulations = await getCompletedSimulations({ user }, { pageSize: 1 })

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
