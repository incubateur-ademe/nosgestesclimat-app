import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { reconcileSimulationsAfterLogin } from '../reconcile-simulations-after-login.service.ts'

const createGroup = async () =>
  prisma.group.create({
    data: { name: faker.company.name(), emoji: 'globe' },
    select: { id: true },
  })

const createGroupParticipant = ({
  groupId,
  userId,
  simulationId,
}: {
  groupId: string
  userId: string
  simulationId: string
}) =>
  prisma.groupParticipant.create({
    data: { groupId, userId, simulationId },
    select: { userId: true },
  })

describe('reconcileSimulationsAfterLogin', () => {
  afterEach(async () => {
    await Promise.all([
      prisma.simulationPoll.deleteMany(),
      prisma.groupParticipant.deleteMany(),
      prisma.groupAdministrator.deleteMany(),
      prisma.simulation.deleteMany(),
    ])
    await Promise.all([
      prisma.verifiedUser.deleteMany(),
      prisma.group.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  describe('Given the session userId is already the verified user id', () => {
    it('keeps the simulations under the same userId', async () => {
      const user = await userFactory.verified().create()
      const simulation = await simulationFactory
        .params({ userId: user.id })
        .create()

      await reconcileSimulationsAfterLogin({
        user: { id: user.id, email: user.email },
        previousUserId: user.id,
      })

      const simulations = await prisma.simulation.findMany({
        where: { userId: user.id },
        select: { id: true },
      })

      expect(simulations).toHaveLength(1)
      expect(simulations[0].id).toBe(simulation.id)
    })
  })

  describe('Given the previous user does not exist', () => {
    it('leaves the verified account untouched', async () => {
      const user = await userFactory.verified().create()
      await simulationFactory.params({ userId: user.id }).create()

      await reconcileSimulationsAfterLogin({
        user: { id: user.id, email: user.email },
        previousUserId: faker.string.uuid(),
      })

      expect(
        await prisma.user.findUnique({ where: { id: user.id } })
      ).not.toBeNull()
      expect(
        await prisma.simulation.findMany({ where: { userId: user.id } })
      ).toHaveLength(1)
    })
  })

  describe('Given the user has simulations on their anonymous session and signs in', () => {
    it('transfers the anonymous simulations to the verified user', async () => {
      const verifiedUser = await userFactory.verified().create()
      const anonymousUser = await userFactory.create()
      const anonymousSimulation = await simulationFactory
        .params({ userId: anonymousUser.id })
        .create()

      await reconcileSimulationsAfterLogin({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        previousUserId: anonymousUser.id,
      })

      const simulations = await prisma.simulation.findMany({
        where: { userId: verifiedUser.id },
        select: { id: true, userEmail: true },
      })

      expect(simulations.map(({ id }) => id)).toContain(anonymousSimulation.id)
      expect(simulations[0].userEmail).toBe(verifiedUser.email)
    })

    it('leaves the anonymous session without any simulations', async () => {
      const verifiedUser = await userFactory.verified().create()
      const anonymousUser = await userFactory.create()
      await simulationFactory.params({ userId: anonymousUser.id }).create()

      await reconcileSimulationsAfterLogin({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        previousUserId: anonymousUser.id,
      })

      expect(
        await prisma.simulation.findMany({
          where: { userId: anonymousUser.id },
        })
      ).toHaveLength(0)
      expect(
        await prisma.user.findUnique({ where: { id: anonymousUser.id } })
      ).toBeNull()
    })
  })

  describe('Given the anonymous user is a participant in a group', () => {
    it('migrates the group participation to the verified user', async () => {
      const verifiedUser = await userFactory.verified().create()
      const anonymousUser = await userFactory.create()
      const anonymousSimulation = await simulationFactory
        .params({ userId: anonymousUser.id })
        .create()
      const group = await createGroup()
      await createGroupParticipant({
        groupId: group.id,
        userId: anonymousUser.id,
        simulationId: anonymousSimulation.id,
      })

      await reconcileSimulationsAfterLogin({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        previousUserId: anonymousUser.id,
      })

      const participants = await prisma.groupParticipant.findMany({
        where: { groupId: group.id },
        select: { userId: true },
      })

      expect(participants).toEqual([{ userId: verifiedUser.id }])
    })

    it('drops the anonymous participation when the verified user already participates in the group', async () => {
      const verifiedUser = await userFactory.verified().create()
      const anonymousUser = await userFactory.create()
      const verifiedSimulation = await simulationFactory
        .params({ userId: verifiedUser.id })
        .create()
      const anonymousSimulation = await simulationFactory
        .params({ userId: anonymousUser.id })
        .create()
      const group = await createGroup()
      await Promise.all([
        createGroupParticipant({
          groupId: group.id,
          userId: verifiedUser.id,
          simulationId: verifiedSimulation.id,
        }),
        createGroupParticipant({
          groupId: group.id,
          userId: anonymousUser.id,
          simulationId: anonymousSimulation.id,
        }),
      ])

      await reconcileSimulationsAfterLogin({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        previousUserId: anonymousUser.id,
      })

      const participants = await prisma.groupParticipant.findMany({
        where: { groupId: group.id },
        select: { userId: true, simulationId: true },
      })

      expect(participants).toEqual([
        {
          userId: verifiedUser.id,
          simulationId: verifiedSimulation.id,
        },
      ])
    })
  })
})
