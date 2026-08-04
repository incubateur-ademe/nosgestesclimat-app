import ActionsPage from '@/components/actions/pages/ActionsPage'
import NoResultsBlock from '@/components/dashboard/NoResultsBlock'
import Trans from '@/components/translation/trans/TransServer'
import { MON_ESPACE_ACTIONS_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { requireAuthUser } from '@/services/auth/require-auth-user'
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

  const [personalizedActionsCatalogue, themes] = await Promise.all([
    getPersonalizedActionsCatalogue(user.id, locale),
    getThemes(locale),
  ])

  return (
    <div className="flex flex-col">
      <h1 className="sr-only text-2xl font-bold">
        <Trans i18nKey="mon-espace.actions.title" locale={locale}>
          Mes actions
        </Trans>
      </h1>

      <ProfileTab locale={locale} activePath={MON_ESPACE_ACTIONS_PATH} />

      {/* No computation for the latest simulation: no simulation at all, or one
          the model no longer supports. Nothing can be personalized. */}
      {personalizedActionsCatalogue.assessmentStatus === null ? (
        <NoResultsBlock locale={locale} />
      ) : (
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
            topActions={personalizedActionsCatalogue.topActions}
            actions={personalizedActionsCatalogue.actions}
            assessmentStatus={personalizedActionsCatalogue.assessmentStatus}
            themes={themes}
            locale={locale}
            from="mon-espace"
          />
        </div>
      )}
    </div>
  )
}
