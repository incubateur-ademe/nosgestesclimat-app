import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { randomBytes } from 'node:crypto'
import { prisma } from '../../../prisma/client.ts'
import { hashToken } from '../helpers/hash-token.ts'

class RefreshTokenFactory extends Factory<{
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}> {
  expired() {
    return this.params({
      expiresAt: new Date(Date.now() - 60_000),
    })
  }
}

export const refreshTokenFactory = RefreshTokenFactory.define(
  ({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.refreshToken.create({
        data: {
          id: data.id,
          userId: data.userId,
          token: hashToken(data.token),
          expiresAt: data.expiresAt,
          createdAt: data.createdAt,
        },
      })
      return data
    })

    const token = randomBytes(32).toString('base64url')

    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      token,
      expiresAt: faker.date.future(),
      createdAt: faker.date.recent(),
    }
  }
)

