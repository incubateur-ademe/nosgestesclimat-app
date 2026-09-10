import ActionsPage from '@/components/actions/pages/ActionsPage'
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

  return (
    <ActionsPage
      title={
        <Trans locale={locale} i18nKey="actions.mySuggestions.title">
          Construire mon plan d'actions
        </Trans>
      }
      description={
        <Trans locale={locale} i18nKey="actions.mySuggestions.description">
          Ces actions sont personnalisées selon vos réponses au test.
          <br />
          Choisissez celles qui vous semblent atteignables et lancez-vous&nbsp;!
        </Trans>
      }
      topActions={personnalizedActionsCatalogue.topActions}
      actions={personnalizedActionsCatalogue.actions}
      themes={themes}
      locale={locale}
      from="index"
      textOverrides={{
        highestImpactSectionDescription: (
          <Trans
            locale={locale}
            i18nKey="actions.components.highestImpactActionsSection.publicDescription">
            Le top 3 des actions qui permettent de limiter ou réduire ses
            émissions de CO<sub>2</sub>
          </Trans>
        ),
      }}
    />
  )
}
