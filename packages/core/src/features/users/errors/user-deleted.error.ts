import { DomainError } from '../../../lib/errors.ts'

export class UserDeletedError extends DomainError<'user_deleted'> {
  public readonly userId?: string

  constructor(params: { message: string; userId: string }) {
    super('user_deleted', params.message)
    this.userId = params.userId
  }
}
