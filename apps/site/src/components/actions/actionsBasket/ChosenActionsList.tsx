import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type {
  MaybePersonalizedAction,
  PersonalizedAction,
} from '@nosgestesclimat/core/features/actions/types/action'
import ChosenAction from './chosenActionsList/ChosenAction'
interface Props {
  actions: MaybePersonalizedAction[]
  hasCommittedToActions: boolean
  locale: Locale
  assessmentStatus: AssessmentStatus
}

function hasChoice(
  action: MaybePersonalizedAction
): action is PersonalizedAction {
  return !!action.choice
}

export default function ChosenActionsList({
  actions,
  hasCommittedToActions,
  locale,
  assessmentStatus,
}: Props) {
  if (hasCommittedToActions) {
    const chosenActions = actions.filter((action) => hasChoice(action))

    return (
      <ul className="mb-4 flex max-h-125 flex-col gap-2.5 overflow-auto">
        {chosenActions.map((action) => (
          <ChosenAction
            key={action.id}
            action={action}
            locale={locale}
            assessmentStatus={assessmentStatus}
          />
        ))}
      </ul>
    )
  }

  return (
    <p className="bg-secondary-50 mb-20 rounded-lg p-5 text-sm text-slate-600">
      <Trans i18nKey="actions.basket.informativeBlock.content" locale={locale}>
        Votre sélection est vide. Parcourez les catégories pour ajouter des
        actions que vous pourrez mettre en place.
      </Trans>
    </p>
  )
}
