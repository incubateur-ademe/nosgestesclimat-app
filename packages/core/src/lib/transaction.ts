import { prisma } from '../prisma/client.ts'
import type { Prisma } from '../prisma/generated/client.ts'
import type { ErrorWithCode } from './errors.ts'
import type { Failure, Result } from './result.ts'
import { failure, success } from './result.ts'

export type Transaction = Prisma.TransactionClient

/** Any result shape, whatever data a successful callback carries */
type AnyResult = Result<void, ErrorWithCode>

/**
 * Runs `cb` in a transaction and rolls it back when it returns a failure,
 * that failure being returned to the caller.
 * When a `transaction` is given, `cb` joins it instead of opening a new one
 * and the rollback is left to whoever owns it.
 *
 * A callback that returns `void` is treated as a success, one that cannot fail.
 */
export function transaction(
  cb: (transaction: Transaction) => Promise<void>,
  transaction?: Transaction
): Promise<Result<void, never>>
export function transaction<R extends AnyResult>(
  cb: (transaction: Transaction) => Promise<R | void>,
  transaction?: Transaction
): Promise<R>
export async function transaction<R extends AnyResult>(
  cb: (transaction: Transaction) => Promise<R | void>,
  transaction?: Transaction
): Promise<R> {
  if (transaction) return normalise(await cb(transaction))

  try {
    return await prisma.$transaction(async (tx) => {
      const result = await cb(tx)
      // Throw to force prisma to rollback transaction
      if (result !== undefined && !result.success) throw new Rollback(result)
      return normalise(result)
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

/**
 * Normalises the callback's return value: a callback that returns nothing is
 * treated as a successful result.
 */
const normalise = <R extends AnyResult>(result: R | void): R =>
  (result === undefined ? success() : result) as R
