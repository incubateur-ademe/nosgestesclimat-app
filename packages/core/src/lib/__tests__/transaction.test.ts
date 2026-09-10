import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../prisma/client.ts'
import { DomainError } from '../errors.ts'
import { failure, success } from '../result.ts'
import { transaction } from '../transaction.ts'

/** A stand-in domain error used only to exercise the failure path of `transaction`. */
class TestError extends DomainError<'test_error'> {
  constructor(message: string = 'test error') {
    super('test_error', message)
  }
}

describe('transaction', () => {
  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  it('commits the callback writes and returns its success result', async () => {
    const id = randomUUID()

    const result = await transaction(async (tx) => {
      await tx.user.create({ data: { id } })
      return success()
    })

    expect(result).toEqual({ success: true })
    await expect(
      prisma.user.findUnique({ where: { id } })
    ).resolves.toMatchObject({ id })
  })

  it('rolls back the callback writes and returns its failure result', async () => {
    const id = randomUUID()
    const error = new TestError('nope')

    const result = await transaction(async (tx) => {
      await tx.user.create({ data: { id } })
      return failure(error)
    })

    expect(result).toEqual({ success: false, error })
    await expect(prisma.user.findUnique({ where: { id } })).resolves.toBeNull()
  })

  it('joins the transaction passed as argument instead of opening a new one', async () => {
    const id = randomUUID()
    let receivedTx: unknown
    let innerResult: unknown

    const result = await transaction(async (tx) => {
      innerResult = await transaction(async (joined) => {
        receivedTx = joined
        await joined.user.create({ data: { id } })
        return success()
      }, tx)
      return success()
    })

    expect(result).toEqual({ success: true })
    expect(innerResult).toEqual({ success: true })
    expect(receivedTx).not.toBeUndefined()
    await expect(
      prisma.user.findUnique({ where: { id } })
    ).resolves.toMatchObject({ id })
  })

  it('does not roll back when joining a passed transaction', async () => {
    const id = randomUUID()
    const error = new TestError('nope')
    let innerResult: unknown

    const result = await transaction(async (tx) => {
      // The inner failure is returned to the caller, who owns the transaction
      // and decides whether to roll back. Here we choose to commit.
      innerResult = await transaction(async (joined) => {
        await joined.user.create({ data: { id } })
        return failure(error)
      }, tx)
      return success()
    })

    expect(result).toEqual({ success: true })
    expect(innerResult).toEqual({ success: false, error })
    await expect(
      prisma.user.findUnique({ where: { id } })
    ).resolves.toMatchObject({ id })
  })

  it('rolls back when the parent returns the inner failure', async () => {
    const id = randomUUID()
    const error = new TestError('nope')

    const result = await transaction(async (tx) => {
      // The inner failure propagates up and becomes the parent's result,
      // causing the parent to roll back as well.
      return await transaction(async (joined) => {
        await joined.user.create({ data: { id } })
        return failure(error)
      }, tx)
    })

    expect(result).toEqual({ success: false, error })
    await expect(prisma.user.findUnique({ where: { id } })).resolves.toBeNull()
  })

  it('rethrows non-domain errors thrown by the callback', async () => {
    const boom = new Error('boom')

    await expect(transaction(() => Promise.reject(boom))).rejects.toBe(boom)
  })
})
