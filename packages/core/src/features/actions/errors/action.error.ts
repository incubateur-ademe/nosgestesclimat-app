import { DomainError } from '../../../lib/errors.ts'

export class ActionNotFoundError extends DomainError<'action_not_found'> {
  constructor() {
    super('action_not_found', 'Action introuvable')
  }
}
