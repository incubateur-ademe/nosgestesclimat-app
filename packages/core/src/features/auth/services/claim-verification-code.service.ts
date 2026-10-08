import type { Result } from '../../../lib/result.ts'
import { failure, success } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { transaction } from '../../../lib/transaction.ts'
import { InvalidVerificationCodeError } from '../errors/login.error.ts'
import {
  claimVerificationCode as claimVerificationCodeRepository,
  findValidVerificationCode,
} from '../repositories/verification-codes.repository.ts'
import type { VerificationCode } from '../types/verification-code.ts'

/**
 * Checks a valid (non-expired) verification code issued for the given usage
 * and invalidates it in the same breath: a success consumes the code, and
 * any concurrent or later claim on the same row loses - the code is
 * single-use. The lookup and the claim run in one transaction, joining the
 * caller's when there is one: the claim's atomic conditional update is the
 * authoritative check, leaving no read-then-write gap for a concurrent
 * request to exploit.
 */
export const claimVerificationCode = async (
  verificationCode: Pick<VerificationCode, 'email' | 'code' | 'usage'>,
  { session }: { session?: Transaction } = {}
): Promise<Result<VerificationCode, InvalidVerificationCodeError>> =>
  transaction(async (tx) => {
    // A lookup miss is the expected invalid-code signal.
    const found = await findValidVerificationCode(verificationCode, {
      session: tx,
    })

    if (!found) {
      return failure(new InvalidVerificationCodeError())
    }

    const claimed = await claimVerificationCodeRepository(
      { id: found.id, usage: verificationCode.usage },
      { session: tx }
    )

    if (!claimed) {
      return failure(new InvalidVerificationCodeError())
    }

    return success(found)
  }, session)
