import type { Action, PersonalizedAction } from '../types/action.ts'

export function isPersonalizedAction(
  action:
    | Pick<PersonalizedAction, 'id' | 'ruleId' | 'assessment'>
    | Pick<Action, 'id' | 'ruleId'>
): action is PersonalizedAction {
  return 'assessment' in action
}
