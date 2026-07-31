import { EntityNotFoundException } from './EntityNotFoundException.ts'

/**
 * Why a submitted verification code was rejected.
 *
 * The lookup matches email, code and expiration at once, so a miss on its own
 * does not say whether the code was never requested, does not match, or simply
 * expired - which is precisely what tells a user mistake apart from a broken
 * code delivery.
 */
export type VerificationCodeRejection =
  /** The email never had any code issued to it, ever - not just none currently valid */
  | 'never_requested'
  /** A code exists for that email, current or past, but none matches the submitted one */
  | 'mismatch'
  /** The submitted code exists but its expiration date has passed */
  | 'expired'
  /** The reason itself could not be determined */
  | 'unknown'

export class InvalidVerificationCodeException extends EntityNotFoundException {
  readonly rejection: VerificationCodeRejection
  readonly context: Record<string, unknown>

  constructor(
    rejection: VerificationCodeRejection,
    context: Record<string, unknown> = {}
  ) {
    super(`VerificationCode not found (${rejection})`)
    this.name = 'InvalidVerificationCodeException'
    this.rejection = rejection
    this.context = context
  }
}
