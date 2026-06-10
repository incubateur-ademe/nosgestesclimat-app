import ActionsPage from '@/components/actions/pages/ActionsPage'
import { LegacyActionPage } from '@/components/results/LegacyActionPage'
import Trans from '@/components/translation/trans/TransServer'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'
import type { Locale } from '@/i18nConfig'
import { getPersonalizedActionsCatalogue } from '@/services/actions/get-personalized-actions-catalogue'
import { getThemes } from '@/services/actions/get-themes'
import { hasActionV2Rollout } from '@/services/actions/has-action-v2-rollout'
import { getUserSession } from '@/services/auth/get-user-session'
import { getCompletedSimulations } from '@/services/simulations/get-completed-simulations'
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
  const flag = user && (await hasActionV2Rollout(user.id))

  if (!flag) {
    return <LegacyResultatsActionsPage locale={locale} />
  }

  const [actionsCatalogue, themes] = await Promise.all([
    getPersonalizedActionsCatalogue(user.id),
    getThemes(),
  ])

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
    />
  )
}

async function LegacyResultatsActionsPage({
  locale,
}: {
  locale: Locale
}) {
  const simulations = await getCompletedSimulations({ pageSize: 1 })

  return <LegacyActionPage simulations={simulations} locale={locale} />
}
