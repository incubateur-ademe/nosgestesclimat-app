import { faker } from '@faker-js/faker'
import { refreshTokenFactory } from '@nosgestesclimat/core/features/auth/factories/refresh-token.factory'
import { verificationCodeFactory } from '@nosgestesclimat/core/features/auth/factories/verification-code.factory'
import { groupFactory } from '@nosgestesclimat/core/features/groups/factories/group.factory'
import { organisationFactory } from '@nosgestesclimat/core/features/organisations/factories/organisation.factory'
import { simulationFactory } from '@nosgestesclimat/core/features/simulations/factories/simulation.factory'
import { userFactory } from '@nosgestesclimat/core/features/users/factories/user.factory'
import type { User } from '@nosgestesclimat/core/features/users/types/user'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { VerificationCodeUsage } from '@nosgestesclimat/core/prisma/generated/client'
import { emptyDatabase } from '@nosgestesclimat/core/test-utils/empty-database'
import { afterEach, describe, expect, it } from 'vitest'
import { addLastActivityAtToUser } from '../add-last-activity-at-to-user.ts'

interface UserFactorySetup {
  entity: string
  setupFactoryForTest: (user: User, updatedAt: Date) => Promise<void>
}

describe('addLastActivityAtToUser', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it("shouldn't update the lastActivityAt user prop if dry mode is enabled", async () => {
    const user = await userFactory.verified().create()

    await simulationFactory
      .params({
        updatedAt: faker.date.future(),
        userId: user.id,
      })
      .create()

    await addLastActivityAtToUser()

    const userFromDB = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    })

    expect(userFromDB?.lastActivityAt).toBeNull()
  })

  it("shouldn't modify an unverified user's lastActivityAt property", async () => {
    const user = await userFactory
      .params({
        updatedAt: faker.date.past(),
      })
      .create()

    await simulationFactory
      .params({
        updatedAt: new Date(),
        userId: user.id,
      })
      .create()

    await addLastActivityAtToUser({ dry: false })

    const userFromDB = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    })

    expect(userFromDB?.lastActivityAt).toBeNull()
  })

  it('should not update the lastActivityAt date of a verified user that already has one', async () => {
    const alreadyDefinedDate = faker.date.recent()

    const user = await userFactory
      .verified()
      .params({ lastActivityAt: alreadyDefinedDate })
      .create()

    await simulationFactory
      .params({
        userId: user.id,
      })
      .create()

    await addLastActivityAtToUser({ dry: false })

    const userFromDB = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    })

    expect(userFromDB?.lastActivityAt).toEqual(alreadyDefinedDate)
  })

  it.each(entitiesRelatedToVerifiedUserTestFactoriesSetup)(
    "should set a verified user's lastActivityAt property to the most recent linked $entity update date",
    async ({ setupFactoryForTest }) => {
      const targetDate = faker.date.future()

      const user = await userFactory
        .verified()
        .params({
          updatedAt: faker.date.past(),
        })
        .create()

      await setupFactoryForTest(user, targetDate)

      await addLastActivityAtToUser({ dry: false })

      const userFromDB = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
      })

      expect(userFromDB?.lastActivityAt).toEqual(targetDate)
    }
  )

  it("should set a verified user's lastActivityAt property to the most recent linked entity update date", async () => {
    const targetDate = faker.date.future()

    const user = await userFactory
      .verified()
      .params({
        updatedAt: faker.date.past(),
      })
      .create()
    await simulationFactory
      .params({
        userId: user.id,
      })
      .create()
    await refreshTokenFactory.params({ userId: user.id }).create()
    await groupFactory.withAdministrator(user.id).create()

    await groupFactory.withParticipant({ userId: user.id }).create()

    await organisationFactory
      .withAdministrator({ userEmail: user.email })
      .create()
    await verificationCodeFactory
      .params({ email: user.email, updatedAt: targetDate })
      .create()

    await addLastActivityAtToUser({ dry: false })

    const userFromDB = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    })

    expect(userFromDB?.lastActivityAt).toEqual(targetDate)
  })

  it('should ignore newsletter verification codes', async () => {
    const userUpdatedAt = faker.date.recent()
    const newsletterDate = faker.date.future()

    const user = await userFactory
      .verified()
      .params({
        updatedAt: userUpdatedAt,
      })
      .create()

    await verificationCodeFactory
      .params({
        email: user.email,
        usage: VerificationCodeUsage.newsletter,
        updatedAt: newsletterDate,
      })
      .create()

    await addLastActivityAtToUser({ dry: false })

    const userFromDB = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    })

    expect(userFromDB?.lastActivityAt).toEqual(userUpdatedAt)
  })

  it('should process every candidate across multiple batches', async () => {
    const targetDate = faker.date.future()

    const users = [
      await userFactory
        .verified()
        .params({ updatedAt: faker.date.past() })
        .create(),
      await userFactory
        .verified()
        .params({ updatedAt: faker.date.past() })
        .create(),
      await userFactory
        .verified()
        .params({ updatedAt: faker.date.past() })
        .create(),
    ]

    for (const user of users) {
      await simulationFactory
        .params({
          updatedAt: targetDate,
          userId: user.id,
        })
        .create()
    }

    await addLastActivityAtToUser({ dry: false, batchSize: 1 })

    const usersFromDB = await prisma.user.findMany({
      where: {
        id: { in: users.map((user) => user.id) },
      },
    })

    expect(usersFromDB).toHaveLength(users.length)

    for (const userFromDB of usersFromDB) {
      expect(userFromDB.lastActivityAt).toEqual(targetDate)
    }
  })
})

const entitiesRelatedToVerifiedUserTestFactoriesSetup: UserFactorySetup[] = [
  {
    entity: 'simulation',
    setupFactoryForTest: async (user, updatedAt) => {
      await simulationFactory
        .params({
          updatedAt: faker.date.recent(),
          userId: user.id,
        })
        .create()

      await simulationFactory
        .params({
          updatedAt,
          userId: user.id,
        })
        .create()
    },
  },
  {
    entity: 'refreshToken',
    setupFactoryForTest: async (user, createdAt) => {
      await refreshTokenFactory
        .params({ userId: user.id, createdAt: faker.date.recent() })
        .create()
      await refreshTokenFactory.params({ userId: user.id, createdAt }).create()
    },
  },
  {
    entity: 'group',
    setupFactoryForTest: async (user, updatedAt) => {
      await groupFactory
        .params({
          updatedAt: faker.date.recent(),
        })
        .withAdministrator(user.id)
        .create()

      await groupFactory
        .withAdministrator(user.id)
        .params({
          updatedAt,
        })
        .create()
    },
  },
  {
    entity: 'groupParticipant',
    setupFactoryForTest: async (user, updatedAt) => {
      await groupFactory
        .withParticipant({ userId: user.id, updatedAt: faker.date.recent() })
        .create()

      await groupFactory
        .withParticipant({ userId: user.id, updatedAt })
        .create()
    },
  },
  {
    entity: 'organisationAdministrator',
    setupFactoryForTest: async (user, updatedAt) => {
      if (!user.email) {
        throw Error(
          'User needs be verified and have an e-mail to create a verification code'
        )
      }
      await organisationFactory
        .withAdministrator({ userEmail: user.email, updatedAt })
        .create()
    },
  },
  {
    entity: 'verificationCode',
    setupFactoryForTest: async (user, updatedAt) => {
      if (!user.email) {
        throw Error(
          'User needs have a valid e-mail to create a verification code'
        )
      }
      await verificationCodeFactory
        .params({ email: user.email, updatedAt: faker.date.recent() })
        .create()
      await verificationCodeFactory
        .params({ email: user.email, updatedAt })
        .create()
    },
  },
]
