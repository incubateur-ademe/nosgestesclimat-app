import { Exception } from '../../../exception.ts'
import type { Action } from '../types/action.ts'

export class ActionAssessmentPublicodesException extends Exception<{
  action?: Pick<Action, 'id' | 'ruleId'>
  dottedName?: string
}> {}
