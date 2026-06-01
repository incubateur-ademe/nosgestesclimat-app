import type {
  ActionAssessment,
  ActionChoice,
  Action as ActionEntity,
} from '@nosgestesclimat/core/features/actions/types/action'

export type Action = Pick<
  ActionEntity,
  | 'id'
  | 'title'
  | 'slug'
  | 'trackingId'
  | 'language'
  | 'longDescription'
  | 'theme'
  | 'ruleId'
  | 'media'
  | 'tips'
  | 'financialIncentives'
  | 'furtherExplore'
  | 'metadata'
  | 'publishedAt'
>

export interface PersonalizedAction extends Action {
  choice: Pick<
    ActionChoice,
    'id' | 'userId' | 'actionId' | 'type' | 'chosenAt'
  > | null
  assessment: Pick<
    ActionAssessment,
    'simulationId' | 'actionId' | 'applicable' | 'impact' | 'id'
  >
}
