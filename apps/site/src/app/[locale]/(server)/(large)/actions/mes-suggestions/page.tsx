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
  title: t(
    'actions.actionPlanPage.metaTitle',
    'Mes suggestions - Nos Gestes Climat'
  ),
  description: t(
    'actions.actionPlanPage.metaDescription',
    "Mes suggestions personnalisées d'actions à mettre en place pour réduire mon empreinte carbone avec Nos Gestes Climat"
  ),
  alternates: {
    canonical: '/actions/mes-suggestions',
  },
})

export default async function MySuggestionsPage({ params }: DefaultPageProps) {
  const { locale } = await params

  const user = await getUserSession()

  if (!user) {
    redirect(ACTIONS_PATH)
  }

  const [personnalizedActionsCatalogue, themes] = await Promise.all([
    getPersonalizedActionsCatalogue(user.id, locale),
    getThemes(locale),
  ])

  // No finished simulation: nothing to personalize from.
  if (personnalizedActionsCatalogue.assessmentStatus === null) {
    return <NoResultsBlock locale={locale} />
  }

  return (
    <ActionsPage
      otherActionsTitle={
        <Trans
          locale={locale}
          i18nKey="actions.mySuggestions.otherActionsTitle">
          Toutes vos actions, classées par catégorie
        </Trans>
      }
      otherActionsDescription={
        <Trans
          locale={locale}
          i18nKey="actions.mySuggestions.otherActionsDescription">
          Ces actions sont personnalisées selon vos réponses au test. Choisissez
          celles qui vous semblent atteignables et ajoutez-les à votre plan
          d’action !
        </Trans>
      }
      topActions={personnalizedActionsCatalogue.topActions}
      actions={personnalizedActionsCatalogue.actions}
      themes={themes}
      locale={locale}
      from="index"
      assessmentStatus={personnalizedActionsCatalogue.assessmentStatus}
    />
  )
}
