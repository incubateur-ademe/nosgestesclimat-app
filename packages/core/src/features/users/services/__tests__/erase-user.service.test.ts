import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { refreshTokenFactory } from '../../../auth/factories/refresh-token.factory.ts'
import { findAllRefreshTokenByUserId } from '../../../auth/repositories/refresh-token.repository.ts'
import { groupFactory } from '../../../groups/factories/group.factory.ts'
import { organisationFactory } from '../../../organisations/factories/organisation.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { findUserById } from '../../repositories/users.repository.ts'
import { eraseUser } from '../erase-user.service.ts'

describe('eraseUser', () => {
  afterEach(async () => {
    await emptyDatabase(prisma)
  })

  describe('Given a verified account with a simulation, groups, an organisation and a session', () => {
    let userId: string
    let email: string
    let simulationCount: number
    let administeredGroupId: string
    let joinedGroupId: string

    beforeEach(async () => {
      const user = await userFactory
        .verified()
        .create({ name: faker.person.fullName() })
      userId = user.id
      email = user.email

      const otherUser = await userFactory.verified().create()

      await organisationFactory.withAdministrator(user).create()
      await refreshTokenFactory.params({ userId }).create()
      await simulationFactory.params({ userId }).completed().create()

      // A group the user runs: creating one makes its administrator a
      // participant too, and someone else took part in it.
      administeredGroupId = (
        await groupFactory
          .withAdministrator(userId)
          .withParticipant({ userId })
          .withParticipant({ userId: otherUser.id })
          .create()
      ).id

      // A group the user joined, run by someone else.
      joinedGroupId = (
        await groupFactory
          .withAdministrator(otherUser.id)
          .withParticipant({ userId })
          .create()
      ).id

      simulationCount = await prisma.simulation.count({ where: { userId } })

      await eraseUser(userId)
    })

    it('strips the identity and makes the account unreadable', async () => {
      const erasedUser = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
      expect(erasedUser).toMatchObject({
        deletedAt: expect.any(Date),
        email: null,
        name: null,
      })
      expect(await findUserById(userId)).toBeNull()
    })

    it('deletes the verified record', async () => {
      expect(
        await prisma.verifiedUser.findFirst({ where: { id: userId } })
      ).toBeNull()
    })

    it('deletes the organisation administrations', async () => {
      expect(
        await prisma.organisationAdministrator.findFirst({
          where: { userEmail: email },
        })
      ).toBeNull()
    })

    it('revokes the sessions', async () => {
      expect(await findAllRefreshTokenByUserId(userId)).toEqual([])
    })

    it('deletes the groups the user administers, participants included', async () => {
      expect(
        await prisma.group.findUnique({ where: { id: administeredGroupId } })
      ).toBeNull()
      expect(
        await prisma.groupParticipant.count({
          where: { groupId: administeredGroupId },
        })
      ).toBe(0)
      expect(
        await prisma.groupAdministrator.count({
          where: { groupId: administeredGroupId },
        })
      ).toBe(0)
    })

    it('removes the user from the groups they joined, keeping those groups', async () => {
      expect(
        await prisma.group.findUnique({ where: { id: joinedGroupId } })
      ).not.toBeNull()
      expect(await prisma.groupParticipant.count({ where: { userId } })).toBe(0)
    })

    it('keeps the statistical trace: the simulations', async () => {
      expect(await prisma.simulation.count({ where: { userId } })).toBe(
        simulationCount
      )
    })
  })

  it('fails silently when erasing an unknown user', async () => {
    await expect(eraseUser(faker.string.uuid())).resolves.toBeUndefined()
  })
})
