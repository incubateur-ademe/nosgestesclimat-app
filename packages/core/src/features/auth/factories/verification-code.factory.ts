import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { VerificationCodeMode } from '../../../prisma/generated/client.ts'

export type VerificationCodeRow = {
  id: string
  email: string
  mode: VerificationCodeMode | null
  code: string
  expirationDate: Date
  createdAt: Date
  updatedAt: Date
}

export const verificationCodeFactory = Factory.define<VerificationCodeRow>(
  ({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.verificationCode.create({
        data: {
          id: data.id,
          email: data.email,
          mode: data.mode,
          code: data.code,
          expirationDate: data.expirationDate,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      })
      return data
    })

    return {
      id: faker.string.uuid(),
      email: faker.internet.email().toLocaleLowerCase(),
      mode: null,
      code: faker.number.int({ min: 100000, max: 999999 }).toString(),
      expirationDate: new Date(Date.now() + 1000 * 60 * 60),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }
  }
)
