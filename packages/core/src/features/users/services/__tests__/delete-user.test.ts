import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { success } from '../../../../lib/result.ts'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { refreshTokenFactory } from '../../../auth/factories/refresh-token.factory.ts'
import { verificationCodeFactory } from '../../../auth/factories/verification-code.factory.ts'
import { findAllRefreshTokenByUserId } from '../../../auth/repositories/refresh-token.repository.ts'
import { createSession } from '../../../auth/services/create-session.service.ts'
import { createLogin } from '../../../auth/services/login.service.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import {
  createOrUpdateUser,
  findUserById,
} from '../../repositories/users.repository.ts'
import type { User } from '../../types/user.ts'
import { deleteUser } from '../delete-user.ts'

const logger = createTestLogger()
const sendEmail = vi.fn().mockResolvedValue(success())
const addOrUpdateContact = vi.fn().mockResolvedValue(success())
const origin = 'https://nosgestesclimat.test'

describe('deleteUser', () => {
  const login = createLogin({
    logger,
    sendEmail,
    addOrUpdateContact,
    origin,
    backgroundTaskRunner: () => {},
  })

  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  it('should set a deletedAt property to a deleted user', async () => {
    const user = await userFactory.verified().create()

    await deleteUser(user.id)

    const userFromDB = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    })

    expect(userFromDB?.deletedAt).toBeDefined()
  })

  it('should delete the verified user, the organisation administrator and the refresh tokens linked to the user deleted', async () => {
    const user = await userFactory.verified().create()
    await organisationFactory.withAdministrator(user).create()
    await refreshTokenFactory
      .params({
        userId: user.id,
      })
      .create()

    await deleteUser(user.id)

    const verifiedUserFromDB = await prisma.verifiedUser.findFirst({
      where: {
        id: user.id,
      },
    })
    const organisationAdministratorFromDB =
      await prisma.organisationAdministrator.findFirst({
        where: {
          id: user.id,
        },
      })
    const refreshTokens = await findAllRefreshTokenByUserId(user.id)

    expect(verifiedUserFromDB).toBeNull()
    expect(organisationAdministratorFromDB).toBeNull()
    expect(refreshTokens).toEqual([])
  })

  it('should delete a logged in user, leading to a new verified user creation if the user signs up', async () => {
    const user = await userFactory.create()
    const userWithoutDates = getUserWithoutDates(user)
    const userEmail = faker.internet.email()

    const verifiedUser1 = await createOrUpdateUser({
      ...userWithoutDates,
      email: userEmail,
      type: 'verified',
    })
    const verificationCode1 = await verificationCodeFactory.create({
      email: verifiedUser1.email,
    })
    const result1 = await login({
      email: verifiedUser1.email,
      code: verificationCode1.code,
      locale: 'fr',
      intent: 'create-account',
    })
    const sessionCreationResult1 = await createSession(verifiedUser1.id)

    expect.assert(result1.success)
    expect(sessionCreationResult1).toHaveProperty('accessToken')
    expect(sessionCreationResult1).toHaveProperty('refreshToken')

    const refreshTokensBeforeDeletion = await findAllRefreshTokenByUserId(
      verifiedUser1.id
    )
    expect(refreshTokensBeforeDeletion).toHaveLength(1)

    await deleteUser(user.id)

    const refreshTokensAfterDeletion = await findAllRefreshTokenByUserId(
      verifiedUser1.id
    )
    expect(refreshTokensAfterDeletion).toHaveLength(0)

    // Sign-in again after deletion
    const verifiedUser2 = await createOrUpdateUser({
      ...user,
      email: userEmail,
      type: 'verified',
    })
    const verificationCode2 = await verificationCodeFactory.create({
      email: verifiedUser2.email,
    })
    const result2 = await login({
      email: verifiedUser2.email,
      code: verificationCode2.code,
      locale: 'fr',
      intent: 'create-account',
    })

    expect.assert(result2.success)

    const verifiedUser2FromDB = await prisma.verifiedUser.findUniqueOrThrow({
      where: { email: userEmail },
    })

    expect(verifiedUser2FromDB?.createdAt.getTime()).toBeGreaterThan(
      verifiedUser1?.createdAt.getTime()
    )
  })

  it('should fail silently when trying to delete an unexisting user', async () => {
    await expect(deleteUser(faker.string.uuid())).resolves.toBeUndefined()
  })

  it('should succeed when trying to delete an unverified user', async () => {
    const user = await userFactory.create()

    await expect(deleteUser(user.id)).resolves.toBeUndefined()

    const userFromDB = await findUserById(user.id)
    expect(userFromDB?.deletedAt).toBeDefined()
  })
})

function getUserWithoutDates(
  user: User
): Omit<User, 'createdAt' | 'updatedAt'> {
  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...userWithoutDates
  } = user

  return userWithoutDates
}
