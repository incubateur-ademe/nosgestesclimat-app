import { DomainError } from '../../../lib/errors.ts'

export class UserAlreadyDeletedError extends DomainError<'user_already_deleted'> {
  public readonly userId?: string

  constructor(params: { message: string; userId?: string }) {
    super('user_already_deleted', params.message)
    this.userId = params.userId
  }
}
