import { DomainError } from '../../../lib/errors.ts'
import type { UserAlreadyDeletedError } from '../../users/errors/user-already-deleted.ts'

export class InvalidVerificationCodeError extends DomainError<'invalid_verification_code'> {
  constructor() {
    super('invalid_verification_code', 'Code de vérification invalide')
  }
}

export type LoginError = InvalidVerificationCodeError | UserAlreadyDeletedError
