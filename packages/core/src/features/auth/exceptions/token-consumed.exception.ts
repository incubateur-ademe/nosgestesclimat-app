import { DomainError } from '../../../lib/errors.ts'

export class TokenConsumedException extends DomainError<'token_consumed'> {
  constructor(message = 'Token already consumed') {
    super('token_consumed', message)
  }
}
