import type {
  MaybePersonalizedAction,
  PersonalizedAction,
} from '@nosgestesclimat/core/features/actions/types/action'

function hasChoice(
  action: MaybePersonalizedAction | null
): action is PersonalizedAction {
  return !!action?.choice
}

export function getActionsWithChoice(
  actions: MaybePersonalizedAction[]
): PersonalizedAction[] {
  return actions.filter(hasChoice)
}
