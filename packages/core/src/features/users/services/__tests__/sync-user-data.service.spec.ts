import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, it } from 'vitest'
import { prisma } from '../../../../prisma/client.ts'
import { pollFactory } from '../../../polls/factories/poll.factory.ts'
import { simulationFactory } from '../../../simulations/factories/simulation.factory.ts'
import { userFactory } from '../../factories/user.factory.ts'
import { syncUserData } from '../sync-user-data.service.ts'

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

// Legacy anonymous user: unverified, but with an email set.
const createLegacyUserWithEmail = async (email: string) =>
  prisma.user.create({
    data: {
      id: faker.string.uuid(),
      email,
      name: faker.person.fullName(),
    },
    select: { id: true, name: true, email: true },
  })

describe('syncUserData', () => {
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
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  describe('Given no anonymous user shares the verified email', () => {
    it('leaves the verified account untouched', async () => {
      const user = await userFactory.verified().create()
      await simulationFactory.params({ userId: user.id }).create()

      await syncUserData({
        user: { id: user.id, email: user.email },
        verified: true,
      })

      const verifiedUser = await prisma.verifiedUser.findUnique({
        where: { email: user.email },
      })

      expect(verifiedUser).not.toBeNull()
      expect(
        await prisma.simulation.findMany({ where: { userId: user.id } })
      ).toHaveLength(1)
    })
  })

  describe('Given an anonymous user shares the verified email', () => {
    it('merges their simulations into the verified account', async () => {
      const verifiedUser = await userFactory.verified().create()
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)
      const legacySimulation = await simulationFactory
        .params({ userId: legacyUser.id })
        .create()

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
      })

      const simulations = await prisma.simulation.findMany({
        where: { userId: verifiedUser.id },
        select: { id: true, userEmail: true },
      })

      expect(simulations.map(({ id }) => id)).toContain(legacySimulation.id)
      expect(simulations[0].userEmail).toBe(verifiedUser.email)
      expect(
        await prisma.user.findUnique({ where: { id: legacyUser.id } })
      ).toBeNull()
    })

    it('adopts the legacy user profile on the user row', async () => {
      const verifiedUser = await userFactory.verified().create()
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
      })

      const user = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
        select: { name: true, email: true },
      })

      expect(user).toEqual({
        name: legacyUser.name,
        email: verifiedUser.email,
      })
    })

    it('backfills the verified account name from the legacy user', async () => {
      const verifiedUser = await userFactory.verified().create({ name: null })
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
      })

      const verifiedUserRow = await prisma.verifiedUser.findUnique({
        where: { email: verifiedUser.email },
        select: { name: true },
      })

      expect(verifiedUserRow?.name).toBe(legacyUser.name)
    })

    it('keeps the verified account name when it is already set', async () => {
      const verifiedUser = await userFactory
        .verified()
        .create({ name: faker.person.fullName() })
      await createLegacyUserWithEmail(verifiedUser.email)

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
      })

      const verifiedUserRow = await prisma.verifiedUser.findUnique({
        where: { email: verifiedUser.email },
        select: { name: true },
      })

      expect(verifiedUserRow?.name).toBe(verifiedUser.name)
    })

    it('drops the legacy group participation when the verified user already participates in the group', async () => {
      const verifiedUser = await userFactory.verified().create()
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)
      const verifiedSimulation = await simulationFactory
        .params({ userId: verifiedUser.id })
        .create()
      const legacySimulation = await simulationFactory
        .params({ userId: legacyUser.id })
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
          userId: legacyUser.id,
          simulationId: legacySimulation.id,
        }),
      ])

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
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

    it('moves the legacy group participation when the verified user does not participate in the group', async () => {
      const verifiedUser = await userFactory.verified().create()
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)
      const legacySimulation = await simulationFactory
        .params({ userId: legacyUser.id })
        .create()
      const group = await createGroup()
      await createGroupParticipant({
        groupId: group.id,
        userId: legacyUser.id,
        simulationId: legacySimulation.id,
      })

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
      })

      const participants = await prisma.groupParticipant.findMany({
        where: { groupId: group.id },
        select: { userId: true },
      })

      expect(participants).toEqual([{ userId: verifiedUser.id }])
    })

    it('moves the legacy group administrator rights to the verified user', async () => {
      const verifiedUser = await userFactory.verified().create()
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)
      const group = await createGroup()
      await prisma.groupAdministrator.create({
        data: { groupId: group.id, userId: legacyUser.id },
        select: { userId: true },
      })

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
      })

      const administrator = await prisma.groupAdministrator.findUnique({
        where: { groupId: group.id },
        select: { userId: true },
      })

      expect(administrator?.userId).toBe(verifiedUser.id)
    })

    it('keeps a single participation per poll, on the latest simulation', async () => {
      const verifiedUser = await userFactory.verified().create()
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)
      const poll = await pollFactory.create()
      const legacySimulation = await simulationFactory
        .params({ userId: legacyUser.id, createdAt: faker.date.past() })
        .withPollId(poll.id)
        .create()
      const newerSimulation = await simulationFactory
        .params({ userId: legacyUser.id })
        .withPollId(poll.id)
        .create()

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
        verified: true,
      })

      const pollParticipations = await prisma.simulationPoll.findMany({
        where: { pollId: poll.id },
        select: { simulationId: true },
      })

      expect(pollParticipations).toEqual([{ simulationId: newerSimulation.id }])
      expect(pollParticipations[0].simulationId).not.toBe(legacySimulation.id)
    })
  })

  describe('Given the user is not verified', () => {
    it('moves the simulations without attaching an email', async () => {
      const verifiedUser = await userFactory.verified().create()
      const legacyUser = await createLegacyUserWithEmail(verifiedUser.email)
      await simulationFactory.params({ userId: legacyUser.id }).create()

      await syncUserData({
        user: { id: verifiedUser.id, email: verifiedUser.email },
      })

      const simulations = await prisma.simulation.findMany({
        where: { userId: verifiedUser.id },
        select: { userEmail: true },
      })

      expect(simulations).toHaveLength(1)
      expect(simulations[0].userEmail).toBeNull()
    })
  })
})
