import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import { VerificationCodeUsage } from '../../../prisma/generated/client.ts'
import type { VerificationCode } from '../types/verification-code.ts'

export const verificationCodeFactory = Factory.define<VerificationCode>(
  ({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.verificationCode.create({
        data: {
          id: data.id,
          email: data.email,
          usage: data.usage,
          code: data.code,
          expirationDate: data.expirationDate,
        },
      })
      return data
    })

    return {
      id: faker.string.uuid(),
      email: faker.internet.email().toLocaleLowerCase(),
      usage: VerificationCodeUsage.login,
      code: faker.number.int({ min: 100000, max: 999999 }).toString(),
      expirationDate: new Date(Date.now() + 1000 * 60 * 60),
    }
  }
)
