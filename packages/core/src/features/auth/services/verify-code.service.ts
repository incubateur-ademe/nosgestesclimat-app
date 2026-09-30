import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { InvalidVerificationCodeError } from '../errors/login.error.ts'
import { findVerificationCode } from '../repositories/verification-codes.repository.ts'
import type { VerificationCode } from '../types/verification-code.ts'

/**
 * Looks up a valid (non-expired) verification code issued for the given
 * usage. A lookup miss is the expected invalid-code signal.
 */
export const verifyCode = async (
  verificationCode: Pick<VerificationCode, 'email' | 'code' | 'usage'>,
  { session }: { session?: Transaction } = {}
): Promise<Result<VerificationCode, InvalidVerificationCodeError>> => {
  // A single read opens no transaction of its own: it joins the caller's
  // transaction when there is one, and reads on the client otherwise.
  const found = await findVerificationCode(verificationCode, { session })

  if (!found) {
    return failure(new InvalidVerificationCodeError())
  }

  return success(found)
}
