import { DomainError } from '../../../lib/errors.ts'
import type { Action } from '../types/action.ts'

export class ActionAssessmentPublicodesException extends DomainError<'action_assessment_publicodes'> {
  public readonly action?: Pick<Action, 'id' | 'ruleId'>
  public readonly dottedName?: string

  constructor(params: {
    message: string
    action?: Pick<Action, 'id' | 'ruleId'>
    dottedName?: string
    cause?: unknown
  }) {
    super('action_assessment_publicodes', params.message)
    this.action = params.action
    this.dottedName = params.dottedName
    if (params.cause !== undefined) {
      this.cause = params.cause
    }
  }
}
