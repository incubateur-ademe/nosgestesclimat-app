import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../../prisma/generated/client.ts'
import { verificationCodeFactory } from '../../factories/index.ts'
import {
  claimVerificationCode,
  createUserVerificationCode,
  findVerificationCode,
  invalidateVerificationCode,
} from '../verification-codes.repository.ts'

describe('verification-codes repository', () => {
  afterEach(async () => {
    await prisma.verificationCode.deleteMany()
  })

  describe('createUserVerificationCode', () => {
    it('persists the code row and returns it without the code itself', async () => {
      const payload = {
        email: faker.internet.email().toLocaleLowerCase(),
        code: faker.number.int({ min: 100000, max: 999999 }).toString(),
        expirationDate: new Date(Date.now() + 1000 * 60 * 60),
        usage: VerificationCodeUsage.login,
      }

      const createdVerificationCode = await createUserVerificationCode(
        payload,
        { session: prisma }
      )

      expect(createdVerificationCode).toEqual({
        id: expect.any(String),
        email: payload.email,
        expirationDate: payload.expirationDate,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      await expect(
        prisma.verificationCode.findFirst({
          where: { email: payload.email },
        })
      ).resolves.toMatchObject({
        id: createdVerificationCode.id,
        ...payload,
        mode: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })
  })

  describe('findVerificationCode', () => {
    it('returns the matching code while it is not expired', async () => {
      const verificationCode = await verificationCodeFactory.create()

      await expect(
        findVerificationCode(
          {
            email: verificationCode.email,
            code: verificationCode.code,
            usage: VerificationCodeUsage.login,
          },
          { session: prisma }
        )
      ).resolves.toEqual({
        id: verificationCode.id,
        email: verificationCode.email,
        mode: verificationCode.mode,
      })
    })

    it('does not return an expired code', async () => {
      const verificationCode = await verificationCodeFactory.create({
        expirationDate: new Date(Date.now() - 1000),
      })

      await expect(
        findVerificationCode(
          {
            email: verificationCode.email,
            code: verificationCode.code,
            usage: VerificationCodeUsage.login,
          },
          { session: prisma }
        )
      ).rejects.toThrow()
    })

    it('does not return a code issued for another email', async () => {
      const verificationCode = await verificationCodeFactory.create()

      await expect(
        findVerificationCode(
          {
            email: faker.internet.email().toLocaleLowerCase(),
            code: verificationCode.code,
            usage: VerificationCodeUsage.login,
          },
          { session: prisma }
        )
      ).rejects.toThrow()
    })

    it('does not return a code issued for another usage', async () => {
      const verificationCode = await verificationCodeFactory.create({
        usage: VerificationCodeUsage.newsletter,
      })

      await expect(
        findVerificationCode(
          {
            email: verificationCode.email,
            code: verificationCode.code,
            usage: VerificationCodeUsage.login,
          },
          { session: prisma }
        )
      ).rejects.toThrow()
    })
  })

  describe('claimVerificationCode', () => {
    it('claims a valid code once, expiring it', async () => {
      const verificationCode = await verificationCodeFactory.create()

      await expect(
        claimVerificationCode(
          { id: verificationCode.id, usage: VerificationCodeUsage.login },
          { session: prisma }
        )
      ).resolves.toBe(true)

      const [claimedCode] = await prisma.verificationCode.findMany({
        where: { id: verificationCode.id },
      })

      expect(claimedCode.expirationDate.getTime()).toBeLessThanOrEqual(
        Date.now()
      )
    })

    it('does not claim the same code twice', async () => {
      const verificationCode = await verificationCodeFactory.create()

      await claimVerificationCode(
        { id: verificationCode.id, usage: VerificationCodeUsage.login },
        { session: prisma }
      )

      await expect(
        claimVerificationCode(
          { id: verificationCode.id, usage: VerificationCodeUsage.login },
          { session: prisma }
        )
      ).resolves.toBe(false)
    })

    it('does not claim an expired code', async () => {
      const verificationCode = await verificationCodeFactory.create({
        expirationDate: new Date(Date.now() - 1000),
      })

      await expect(
        claimVerificationCode(
          { id: verificationCode.id, usage: VerificationCodeUsage.login },
          { session: prisma }
        )
      ).resolves.toBe(false)
    })

    it('does not claim a code issued for another usage', async () => {
      const verificationCode = await verificationCodeFactory.create({
        usage: VerificationCodeUsage.newsletter,
      })

      await expect(
        claimVerificationCode(
          { id: verificationCode.id, usage: VerificationCodeUsage.login },
          { session: prisma }
        )
      ).resolves.toBe(false)

      // The row is left untouched: the other usage can still consume it.
      await expect(
        prisma.verificationCode.findFirst({
          where: { id: verificationCode.id },
        })
      ).resolves.toMatchObject({
        expirationDate: verificationCode.expirationDate,
      })
    })
  })

  describe('invalidateVerificationCode', () => {
    it('expires the code so it can no longer be found', async () => {
      const verificationCode = await verificationCodeFactory.create()

      await invalidateVerificationCode(
        { id: verificationCode.id },
        { session: prisma }
      )

      await expect(
        findVerificationCode(
          {
            email: verificationCode.email,
            code: verificationCode.code,
            usage: VerificationCodeUsage.login,
          },
          { session: prisma }
        )
      ).rejects.toThrow()
    })
  })
})
