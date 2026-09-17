import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import type { Theme } from '@/types/themes'
import type { PersonalizedAction } from '@nosgestesclimat/core/features/actions/types/action'
import type { SimulationComputationStatus } from '@nosgestesclimat/core/features/simulation-computation/types/computation'
import ActionsPage from '../ActionsPage'

interface Props {
  locale: Locale
  personnalizedActionsCatalogue: {
    assessmentStatus: SimulationComputationStatus | null
    actions: PersonalizedAction[]
    topActions: PersonalizedAction[]
  }
  themes: Theme[]
}

export default function PersonnalizedActionsPage({
  locale,
  personnalizedActionsCatalogue,
  themes,
}: Props) {
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
    />
  )
}
