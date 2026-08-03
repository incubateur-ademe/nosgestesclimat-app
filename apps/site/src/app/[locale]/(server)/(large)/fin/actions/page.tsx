import ActionsPage from '@/components/actions/pages/ActionsPage'
import NoResultsBlock from '@/components/dashboard/NoResultsBlock'
import Trans from '@/components/translation/trans/TransServer'
import { ACTIONS_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { getUserSession } from '@/services/auth/get-user-session'
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

  const [actionsCatalogue, themes] = await Promise.all([
    getPersonalizedActionsCatalogue(user.id, locale),
    getThemes(locale),
  ])

  // No computation for the latest simulation: no simulation at all, or one the
  // model no longer supports. Nothing can be personalized, so invite a retest.
  if (actionsCatalogue.assessmentStatus === null) {
    return <NoResultsBlock locale={locale} />
  }

  return (
    <ActionsPage
      title={
        <Trans locale={locale} i18nKey="actions.listPage.title">
          Vos actions personnalisées pour diminuer votre empreinte
        </Trans>
      }
      description={
        <Trans locale={locale} i18nKey="actions.listPage.description">
          Ces actions sont personnalisées selon vos réponses au test. Choisissez
          celles qui vous semblent atteignables et lancez-vous !
        </Trans>
      }
      topActions={actionsCatalogue.topActions}
      actions={actionsCatalogue.actions}
      assessmentStatus={actionsCatalogue.assessmentStatus}
      themes={themes}
      locale={locale}
      from="fin"
    />
  )
}
