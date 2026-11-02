import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { emptyDatabase } from '../../../../test-utils/empty-database.ts'
import { createTestLogger } from '../../../../test-utils/logger.ts'
import { actionFactory } from '../../../actions/factories/action.factory.ts'
import { commitToAction } from '../../../actions/services/commit-to-action.service.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { createReconcileSimulationsAfterLogin } from '../reconcile-simulations-after-login.service.ts'

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

const logger = createTestLogger()

describe('reconcileSimulationsAfterLogin', () => {
  afterEach(async () => {
    vi.clearAllMocks()
    await emptyDatabase(prisma)
  })

  describe('Given the session userId is already the verified user id', () => {
    it('keeps the simulations under the same userId', async () => {
      const user = await userFactory.verified().create()
      const simulation = await simulationFactory
        .params({ userId: user.id })
        .create()

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: user.id,
        preExistingUserId: user.id,
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

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: user.id,
        preExistingUserId: faker.string.uuid(),
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

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: verifiedUser.id,
        preExistingUserId: anonymousUser.id,
      })

      const simulations = await prisma.simulation.findMany({
        where: { userId: verifiedUser.id },
        select: { id: true },
      })

      expect(simulations.map(({ id }) => id)).toContain(anonymousSimulation.id)
    })

    it('leaves the anonymous session without any simulations', async () => {
      const verifiedUser = await userFactory.verified().create()
      const anonymousUser = await userFactory.create()
      await simulationFactory.params({ userId: anonymousUser.id }).create()

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: verifiedUser.id,
        preExistingUserId: anonymousUser.id,
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

  describe('Given the anonymous user has action choices', () => {
    it('transfers the anonymous action choices to the verified user', async () => {
      const verifiedUser = await userFactory.verified().create()
      const anonymousUser = await userFactory.create()
      const action = await actionFactory.create()

      await commitToAction({
        userId: anonymousUser.id,
        actionId: action.id,
      })

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: verifiedUser.id,
        preExistingUserId: anonymousUser.id,
      })

      expect(
        await prisma.actionChoice.findMany({
          where: { userId: verifiedUser.id },
          select: { actionId: true, type: true },
        })
      ).toEqual([{ actionId: action.id, type: 'committed' }])
      expect(
        await prisma.user.findUnique({ where: { id: anonymousUser.id } })
      ).toBeNull()
    })

    it('keeps the verified account choice when both users chose the same action', async () => {
      const verifiedUser = await userFactory.verified().create()
      const anonymousUser = await userFactory.create()
      const action = await actionFactory.create()

      await Promise.all([
        commitToAction({
          userId: verifiedUser.id,
          actionId: action.id,
        }),
        commitToAction({
          userId: anonymousUser.id,
          actionId: action.id,
        }),
      ])

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: verifiedUser.id,
        preExistingUserId: anonymousUser.id,
      })

      expect(
        await prisma.actionChoice.findMany({
          where: { userId: verifiedUser.id },
          select: { actionId: true, type: true },
        })
      ).toEqual([{ actionId: action.id, type: 'committed' }])
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

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: verifiedUser.id,
        preExistingUserId: anonymousUser.id,
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

      await createReconcileSimulationsAfterLogin({ logger })({
        userId: verifiedUser.id,
        preExistingUserId: anonymousUser.id,
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
