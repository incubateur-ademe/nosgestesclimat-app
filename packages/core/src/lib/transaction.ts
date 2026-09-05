import { prisma } from '../prisma/client.ts'
import type { Prisma } from '../prisma/generated/client.ts'
import type { ErrorWithCode } from './errors.ts'
import type { Failure, Result } from './result.ts'
import { failure } from './result.ts'

export type Transaction = Prisma.TransactionClient

/** Any result shape, whatever data a successful callback carries */
type AnyResult = Result<void, ErrorWithCode>

/**
 * Runs `cb` in a transaction and rolls it back when it returns a failure,
 * that failure being returned to the caller.
 * When a `transaction` is given, `cb` joins it instead of opening a new one
 * and the rollback is left to whoever owns it.
 */
export const transaction = async <R extends AnyResult>(
  cb: (transaction: Transaction) => Promise<R>,
  transaction?: Transaction
): Promise<R> => {
  if (transaction) return cb(transaction)

  try {
    return await prisma.$transaction(async (tx) => {
      const result = await cb(tx)
      // Throw to force prisma to rollback transaction
      if (!result.success) throw new Rollback(result)
      return result
    })
  } catch (e) {
    // The rolled back failure is the one `cb` returned.
    // Due to `throw`, typesafety is lost and cast necessary
    if (e instanceof Rollback) return failure(e.failure.error) as R

    // Still let non domain errors "panic"
    throw e
  }
}

/** Carries a failure result out of prisma's callback to trigger a rollback */
class Rollback<Err extends ErrorWithCode = ErrorWithCode> extends Error {
  public readonly failure: Failure<Err>

  constructor(failure: Failure<Err>) {
    super('transaction rollback')
    this.name = this.constructor.name
    this.failure = failure
  }
}
