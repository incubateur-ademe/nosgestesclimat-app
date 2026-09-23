import { DomainError } from '../../../lib/errors.ts'

export class SessionCryptoException extends DomainError<'session_crypto'> {
  constructor(message = 'Invalid session token') {
    super('session_crypto', message)
  }
}
