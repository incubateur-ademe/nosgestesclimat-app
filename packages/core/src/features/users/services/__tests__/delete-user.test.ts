import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { refreshTokenFactory } from '../../../auth/factories/refresh-token.factory.ts'
import { findAllRefreshTokenByUserId } from '../../../auth/repositories/refresh-token.repository.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { deleteUser } from '../delete-user.ts'

describe('deleteUser', () => {
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
})
