import type { Action, PersonalizedAction } from '@/types/actions'
import type {
  Action as ActionEntity,
  PersonalizedAction as PersonalizedActionEntity,
} from '@nosgestesclimat/core/features/actions/types/action'

export function toActionDto(action: ActionEntity): Action {
  const {
    id,
    title,
    slug,
    trackingId,
    language,
    longDescription,
    theme,
    ruleId,
    media,
    tips,
    financialIncentives,
    furtherExplore,
    metadata,
    publishedAt,
  } = action
  return {
    id,
    title,
    slug,
    trackingId,
    language,
    longDescription,
    theme,
    ruleId,
    media,
    tips,
    financialIncentives,
    furtherExplore,
    metadata,
    publishedAt,
  }
}

export function toPersonalizedActionDto(
  action: PersonalizedActionEntity
): PersonalizedAction {
  const baseAction = toActionDto(action)
  const { choice, assessment } = action

  return {
    ...baseAction,
    choice: choice
      ? {
          id: choice.id,
          userId: choice.userId,
          actionId: choice.actionId,
          type: choice.type,
          chosenAt: choice.chosenAt,
        }
      : null,
    assessment: assessment
      ? {
          id: assessment.id,
          simulationId: assessment.simulationId,
          actionId: assessment.actionId,
          applicable: assessment.applicable,
          impact: assessment.impact,
        }
      : null,
  }
}
