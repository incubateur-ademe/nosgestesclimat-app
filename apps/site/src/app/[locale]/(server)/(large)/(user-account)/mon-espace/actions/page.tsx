import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import Trans from '@/components/translation/trans/TransServer'
import { MON_ESPACE_ACTIONS_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { Locale } from '@/i18nConfig'
import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { hasActionV2Rollout } from '@/services/actions/has-action-v2-rollout'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
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
  const user = await requireAuthUser()
  const flag = await hasActionV2Rollout(user.id, locale)

  const [maybePersonalizedActionsCatalogue, themes] = flag
    ? await Promise.all([
        getPersonalizedActionsCatalogue(user.id, locale),
        getThemes(locale),
      ])
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
        <div>
          <ActionsPage
            title={
              <Trans locale={locale} i18nKey="actions.listPage.title">
                Vos actions personnalisées pour diminuer votre empreinte
              </Trans>
            }
            description={
              <Trans locale={locale} i18nKey="actions.listPage.description">
                Ces actions sont personnalisées selon vos réponses au test.
                Choisissez celles qui vous semblent atteignables et lancez-vous
                !
              </Trans>
            }
            topActions={maybePersonalizedActionsCatalogue.topActions}
            actions={maybePersonalizedActionsCatalogue.actions}
            assessmentStatus={
              maybePersonalizedActionsCatalogue.assessmentStatus
            }
            themes={themes}
            locale={locale}
            from="mon-espace"
          />
        </div>
      ) : (
        <LegacyMonEspaceActionsPage locale={locale} />
      )}
    </div>
  )
}

async function LegacyMonEspaceActionsPage({ locale }: { locale: Locale }) {
  const simulations = await getCompletedSimulations({ pageSize: 1 })

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
