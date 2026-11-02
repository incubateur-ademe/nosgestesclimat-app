import Trans from '@/components/translation/trans/TransServer'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import type {
  MaybePersonalizedAction,
  PersonalizedAction,
} from '@nosgestesclimat/core/features/actions/types/action'
import ChosenAction from './chosenActionsList/ChosenAction'
interface Props {
  actions: MaybePersonalizedAction[]
  hasCommittedToActions: boolean
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
            assessmentStatus={assessmentStatus}
          />
        ))}
      </ul>
    )
  }

  return (
    <p className="bg-secondary-50 mb-20 rounded-lg p-5 text-sm text-slate-600">
      <Trans i18nKey="actions.basket.informativeBlock.content">
        Votre sélection est vide
      </Trans>
    </p>
  )
}
