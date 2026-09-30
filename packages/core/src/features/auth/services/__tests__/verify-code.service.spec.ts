import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transaction } from '../../../../lib/transaction.ts'
import { prisma } from '../../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../../prisma/generated/client.ts'
import { InvalidVerificationCodeError } from '../../errors/login.error.ts'
import { verificationCodeFactory } from '../../factories/verification-code.factory.ts'
import { verifyCode } from '../verify-code.service.ts'

describe('verifyCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await prisma.verificationCode.deleteMany()
  })

  it('succeeds for a valid code', async () => {
    const verificationCode = await verificationCodeFactory.create()

    const result = await verifyCode({
      email: verificationCode.email,
      code: verificationCode.code,
      usage: VerificationCodeUsage.login,
    })

    expect.assert(result.success)
    expect(result.data).toEqual(verificationCode)
  })

  it('fails with an InvalidVerificationCodeError when no code was ever requested', async () => {
    const result = await verifyCode({
      email: faker.internet.email().toLocaleLowerCase(),
      code: faker.number.int({ min: 100000, max: 999999 }).toString(),
      usage: VerificationCodeUsage.login,
    })

    expect.assert(!result.success)
    expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
  })

  it('fails when the code does not match the one sent', async () => {
    const verificationCode = await verificationCodeFactory.create({
      code: '123456',
    })

    const result = await verifyCode({
      email: verificationCode.email,
      code: '654321',
      usage: VerificationCodeUsage.login,
    })

    expect.assert(!result.success)
    expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
  })

  it('fails when the code is expired', async () => {
    const verificationCode = await verificationCodeFactory.create({
      expirationDate: new Date(Date.now() - 1000),
    })

    const result = await verifyCode({
      email: verificationCode.email,
      code: verificationCode.code,
      usage: VerificationCodeUsage.login,
    })

    expect.assert(!result.success)
    expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
  })

  it('fails when the code was issued for another usage', async () => {
    const verificationCode = await verificationCodeFactory.create({
      usage: VerificationCodeUsage.newsletter,
    })

    const result = await verifyCode({
      email: verificationCode.email,
      code: verificationCode.code,
      usage: VerificationCodeUsage.login,
    })

    expect.assert(!result.success)
    expect(result.error).toBeInstanceOf(InvalidVerificationCodeError)
  })

  it('joins a caller transaction when one is given', async () => {
    const verificationCode = await verificationCodeFactory.create()

    let result: Awaited<ReturnType<typeof verifyCode>> | undefined
    await transaction(async (session) => {
      result = await verifyCode(
        {
          email: verificationCode.email,
          code: verificationCode.code,
          usage: VerificationCodeUsage.login,
        },
        { session }
      )
    })

    expect.assert(result?.success)
  })
})
