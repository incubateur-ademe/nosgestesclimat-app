import { DomainError } from '../../../lib/errors.ts'

export class TokenExpiredException extends DomainError<'token_expired'> {
  constructor(message = 'Token expired') {
    super('token_expired', message)
  }
}
