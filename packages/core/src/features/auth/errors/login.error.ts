import { DomainError } from '../../../lib/errors.ts'

export class InvalidVerificationCodeError extends DomainError<'invalid_verification_code'> {
  constructor() {
    super('invalid_verification_code', 'Code de vérification invalide')
  }
}

export type LoginError = InvalidVerificationCodeError
