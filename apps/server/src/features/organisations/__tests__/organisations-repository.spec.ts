import { faker } from '@faker-js/faker'
import { afterEach, describe, expect, test } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import { getOrganisationsBatchBrevoStats } from '../organisations.repository.js'

describe('getOrganisationsBatchBrevoStats', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisationAdministrator.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.verifiedUser.deleteMany()
    await prisma.user.deleteMany()
    await prisma.verificationCode.deleteMany()
  })

  describe('When there are no organisations', () => {
    test('Then it returns an empty array', async () => {
      const result = await getOrganisationsBatchBrevoStats({
        session: prisma,
      })

      expect(result).toEqual([])
    })
  })

  describe('When organisation has no polls', () => {
    test('Then it returns zeros for all stats', async () => {
      const email = faker.internet.email().toLowerCase()

      await prisma.verifiedUser.create({
        data: {
          email,
          id: faker.string.uuid(),
        },
      })

      const organisation = await prisma.organisation.create({
        data: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          slug: faker.lorem.slug(),
          type: 'company',
        },
      })

      await prisma.organisationAdministrator.create({
        data: {
          userEmail: email,
          organisationId: organisation.id,
        },
      })

      const result = await getOrganisationsBatchBrevoStats({
        session: prisma,
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        organisationId: organisation.id,
        pollsCreatedCount: 0,
        organisationSimulationsCompletedCount: 0,
        organisationLastSimulationDate: null,
        lastPollParticipantsCount: 0,
      })
    })
  })

  describe('When organisation has polls but no simulations', () => {
    test('Then it returns the correct polls count and zeros for simulation counts', async () => {
      const email = faker.internet.email().toLowerCase()

      await prisma.verifiedUser.create({
        data: {
          email,
          id: faker.string.uuid(),
        },
      })

      const organisation = await prisma.organisation.create({
        data: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          slug: faker.lorem.slug(),
          type: 'association',
        },
      })

      await prisma.organisationAdministrator.create({
        data: {
          userEmail: email,
          organisationId: organisation.id,
        },
      })

      await prisma.poll.create({
        data: {
          name: faker.company.buzzNoun(),
          slug: faker.lorem.slug(),
          organisationId: organisation.id,
          customAdditionalQuestions: [],
        },
      })

      await prisma.poll.create({
        data: {
          name: faker.company.buzzNoun(),
          slug: faker.lorem.slug(),
          organisationId: organisation.id,
          customAdditionalQuestions: [],
        },
      })

      const result = await getOrganisationsBatchBrevoStats({
        session: prisma,
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        organisationId: organisation.id,
        pollsCreatedCount: 2,
        organisationSimulationsCompletedCount: 0,
        organisationLastSimulationDate: null,
        lastPollParticipantsCount: 0,
      })
    })
  })

  describe('When organisation has polls with completed and uncompleted simulations', () => {
    test('Then it returns the correct counts and the most recent simulation date', async () => {
      const email = faker.internet.email().toLowerCase()

      await prisma.verifiedUser.create({
        data: {
          email,
          id: faker.string.uuid(),
        },
      })

      const organisation = await prisma.organisation.create({
        data: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          slug: faker.lorem.slug(),
          type: 'company',
        },
      })

      await prisma.organisationAdministrator.create({
        data: {
          userEmail: email,
          organisationId: organisation.id,
        },
      })

      const poll = await prisma.poll.create({
        data: {
          name: faker.company.buzzNoun(),
          slug: faker.lorem.slug(),
          organisationId: organisation.id,
          customAdditionalQuestions: [],
        },
      })

      // Completed simulation
      const completedSimulation = await prisma.simulation.create({
        data: {
          id: faker.string.uuid(),
          date: new Date('2024-03-15T00:00:00.000Z'),
          progression: 1,
          computedResults: {},
          actionChoices: {},
          situation: {},
          foldedSteps: [],
        },
      })

      await prisma.simulationPoll.create({
        data: {
          pollId: poll.id,
          simulationId: completedSimulation.id,
        },
      })

      // Uncompleted simulation (progression !== 1)
      const uncompletedSimulation = await prisma.simulation.create({
        data: {
          id: faker.string.uuid(),
          date: new Date('2024-04-01T00:00:00.000Z'),
          progression: 0.5,
          computedResults: {},
          actionChoices: {},
          situation: {},
          foldedSteps: [],
        },
      })

      await prisma.simulationPoll.create({
        data: {
          pollId: poll.id,
          simulationId: uncompletedSimulation.id,
        },
      })

      const result = await getOrganisationsBatchBrevoStats({
        session: prisma,
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        organisationId: organisation.id,
        pollsCreatedCount: 1,
        organisationSimulationsCompletedCount: 1,
        organisationLastSimulationDate: expect.any(Date),
        lastPollParticipantsCount: 2,
      })
    })
  })

  describe('When organisation has multiple polls with simulations', () => {
    test('Then it returns stats aggregated across all polls', async () => {
      const email = faker.internet.email().toLowerCase()

      await prisma.verifiedUser.create({
        data: {
          email,
          id: faker.string.uuid(),
        },
      })

      const organisation = await prisma.organisation.create({
        data: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          slug: faker.lorem.slug(),
          type: 'company',
        },
      })

      await prisma.organisationAdministrator.create({
        data: {
          userEmail: email,
          organisationId: organisation.id,
        },
      })

      // First poll with 2 completed simulations
      const firstPoll = await prisma.poll.create({
        data: {
          name: faker.company.buzzNoun(),
          slug: faker.lorem.slug(),
          organisationId: organisation.id,
          customAdditionalQuestions: [],
        },
      })

      const firstSim = await prisma.simulation.create({
        data: {
          id: faker.string.uuid(),
          date: new Date('2024-01-01T00:00:00.000Z'),
          progression: 1,
          computedResults: {},
          actionChoices: {},
          situation: {},
          foldedSteps: [],
        },
      })

      await prisma.simulationPoll.create({
        data: {
          pollId: firstPoll.id,
          simulationId: firstSim.id,
        },
      })

      const secondSim = await prisma.simulation.create({
        data: {
          id: faker.string.uuid(),
          date: new Date('2024-02-01T00:00:00.000Z'),
          progression: 1,
          computedResults: {},
          actionChoices: {},
          situation: {},
          foldedSteps: [],
        },
      })

      await prisma.simulationPoll.create({
        data: {
          pollId: firstPoll.id,
          simulationId: secondSim.id,
        },
      })

      // Second poll with 1 completed simulation (more recent)
      const secondPoll = await prisma.poll.create({
        data: {
          name: faker.company.buzzNoun(),
          slug: faker.lorem.slug(),
          organisationId: organisation.id,
          customAdditionalQuestions: [],
        },
      })

      const thirdSim = await prisma.simulation.create({
        data: {
          id: faker.string.uuid(),
          date: new Date('2024-03-01T00:00:00.000Z'),
          progression: 1,
          computedResults: {},
          actionChoices: {},
          situation: {},
          foldedSteps: [],
        },
      })

      await prisma.simulationPoll.create({
        data: {
          pollId: secondPoll.id,
          simulationId: thirdSim.id,
        },
      })

      const result = await getOrganisationsBatchBrevoStats({
        session: prisma,
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        organisationId: organisation.id,
        pollsCreatedCount: 2,
        organisationSimulationsCompletedCount: 3,
        organisationLastSimulationDate: expect.any(Date),
        lastPollParticipantsCount: 1,
      })
    })
  })

  describe('When multiple organisations exist', () => {
    test('Then it returns stats for each organisation', async () => {
      // Org 1 with a poll and a completed simulation
      const email1 = faker.internet.email().toLowerCase()

      await prisma.verifiedUser.create({
        data: {
          email: email1,
          id: faker.string.uuid(),
        },
      })

      const org1 = await prisma.organisation.create({
        data: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          slug: faker.lorem.slug(),
          type: 'company',
        },
      })

      await prisma.organisationAdministrator.create({
        data: {
          userEmail: email1,
          organisationId: org1.id,
        },
      })

      const org1Poll = await prisma.poll.create({
        data: {
          name: faker.company.buzzNoun(),
          slug: faker.lorem.slug(),
          organisationId: org1.id,
          customAdditionalQuestions: [],
        },
      })

      const org1Sim = await prisma.simulation.create({
        data: {
          id: faker.string.uuid(),
          date: new Date('2024-06-15T00:00:00.000Z'),
          progression: 1,
          computedResults: {},
          actionChoices: {},
          situation: {},
          foldedSteps: [],
        },
      })

      await prisma.simulationPoll.create({
        data: {
          pollId: org1Poll.id,
          simulationId: org1Sim.id,
        },
      })

      // Org 2 with no polls and no simulations
      const email2 = faker.internet.email().toLowerCase()

      await prisma.verifiedUser.create({
        data: {
          email: email2,
          id: faker.string.uuid(),
        },
      })

      const org2 = await prisma.organisation.create({
        data: {
          id: faker.string.uuid(),
          name: faker.company.name(),
          slug: faker.lorem.slug(),
          type: 'association',
        },
      })

      await prisma.organisationAdministrator.create({
        data: {
          userEmail: email2,
          organisationId: org2.id,
        },
      })

      const result = await getOrganisationsBatchBrevoStats({
        session: prisma,
      })

      expect(result).toHaveLength(2)

      const org1Stats = result.find((r) => r.organisationId === org1.id)
      expect(org1Stats).toBeDefined()
      expect(org1Stats).toMatchObject({
        organisationId: org1.id,
        pollsCreatedCount: 1,
        organisationSimulationsCompletedCount: 1,
        organisationLastSimulationDate: expect.any(Date),
        lastPollParticipantsCount: 1,
      })

      const org2Stats = result.find((r) => r.organisationId === org2.id)
      expect(org2Stats).toBeDefined()
      expect(org2Stats).toEqual({
        organisationId: org2.id,
        pollsCreatedCount: 0,
        organisationSimulationsCompletedCount: 0,
        organisationLastSimulationDate: null,
        lastPollParticipantsCount: 0,
      })
    })
  })
})
