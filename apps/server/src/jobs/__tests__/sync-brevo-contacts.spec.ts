import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import supertest from 'supertest'
import { afterEach, describe, expect, test } from 'vitest'
import { brevoUpdateContact } from '../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import app from '../../app.js'
import { mswServer } from '../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import {
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
} from '../../features/organisations/__tests__/fixtures/organisations.fixture.js'
import logger from '../../logger.js'
import { runSync } from '../sync-brevo-contacts.js'

const agent = supertest(app)

afterEach(async () => {
  await EventBus.flush()
  await prisma.simulationPoll.deleteMany()
  await prisma.simulation.deleteMany()
  await prisma.poll.deleteMany()
  await prisma.organisationAdministrator.deleteMany()
  await prisma.organisation.deleteMany()
  await prisma.verifiedUser.deleteMany()
  await prisma.user.deleteMany()
  await prisma.verificationCode.deleteMany()
})

describe('runSync', () => {
  describe('When there are no organisations', () => {
    test('Then it returns zero counts', async () => {
      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 0, errorCount: 0 })
    })
  })

  describe('When organisation has no polls', () => {
    test('Then it syncs zero counts for all stats', async () => {
      await createOrganisation({ agent })

      const contactBodies: unknown[] = []
      mswServer.use(brevoUpdateContact({ storeBodies: contactBodies }))

      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 1, errorCount: 0 })
      expect(contactBodies).toHaveLength(1)
      expect(contactBodies[0]).toEqual({
        email: expect.any(String),
        attributes: {
          ORGANISATION_TYPE: expect.any(String),
          NUMBER_ORGANISATION_CREATED_POLLS: 0,
          NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 0,
          LAST_POLL_PARTICIPANTS_NUMBER: 0,
        },
        updateEnabled: true,
      })
    })
  })

  describe('When organisation has polls but no simulations', () => {
    test('Then it syncs the correct poll count and zeros for simulations', async () => {
      const userId = faker.string.uuid()
      const email = faker.internet.email()
      const { id: organisationId } = await createOrganisation({
        agent,
        userId,
        email,
      })

      await createOrganisationPoll({ agent, userId, email, organisationId })
      await createOrganisationPoll({ agent, userId, email, organisationId })

      const contactBodies: unknown[] = []
      mswServer.use(brevoUpdateContact({ storeBodies: contactBodies }))

      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 1, errorCount: 0 })
      expect(contactBodies).toHaveLength(1)
      expect(contactBodies[0]).toEqual({
        email: expect.any(String),
        attributes: {
          ORGANISATION_TYPE: expect.any(String),
          NUMBER_ORGANISATION_CREATED_POLLS: 2,
          NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 0,
          LAST_POLL_PARTICIPANTS_NUMBER: 0,
        },
        updateEnabled: true,
      })
    })
  })

  describe('When organisation has polls with completed simulations', () => {
    test('Then it syncs correct counts and the last simulation date', async () => {
      const userId = faker.string.uuid()
      const email = faker.internet.email()
      const { id: organisationId } = await createOrganisation({
        agent,
        userId,
        email,
      })

      const poll = await createOrganisationPoll({
        agent,
        userId,
        email,
        organisationId,
      })

      await createOrganisationPollSimulation({
        agent,
        pollId: poll.id,
      })
      await createOrganisationPollSimulation({
        agent,
        pollId: poll.id,
      })

      const contactBodies: unknown[] = []
      mswServer.use(brevoUpdateContact({ storeBodies: contactBodies }))

      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 1, errorCount: 0 })
      expect(contactBodies).toHaveLength(1)
      expect(contactBodies[0]).toEqual({
        email: expect.any(String),
        attributes: {
          ORGANISATION_TYPE: expect.any(String),
          NUMBER_ORGANISATION_CREATED_POLLS: 1,
          NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 2,
          LAST_POLL_PARTICIPANTS_NUMBER: 2,
          LAST_ORGANISATION_SIMULATION_DATE: expect.any(String),
        },
        updateEnabled: true,
      })
    })
  })

  describe('When multiple organisations exist', () => {
    test('Then it syncs all organisations independently', async () => {
      const admin1 = {
        userId: faker.string.uuid(),
        email: faker.internet.email(),
      }
      const { id: orgId1 } = await createOrganisation({
        agent,
        ...admin1,
      })
      const poll1 = await createOrganisationPoll({
        agent,
        ...admin1,
        organisationId: orgId1,
      })
      await createOrganisationPollSimulation({
        agent,
        pollId: poll1.id,
      })

      const admin2 = {
        userId: faker.string.uuid(),
        email: faker.internet.email(),
      }
      const { id: orgId2 } = await createOrganisation({
        agent,
        ...admin2,
      })
      const poll2 = await createOrganisationPoll({
        agent,
        ...admin2,
        organisationId: orgId2,
      })
      await createOrganisationPollSimulation({
        agent,
        pollId: poll2.id,
      })
      await createOrganisationPollSimulation({
        agent,
        pollId: poll2.id,
      })

      const contactBodies: unknown[] = []
      mswServer.use(brevoUpdateContact({ storeBodies: contactBodies }))

      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 2, errorCount: 0 })
      expect(contactBodies).toHaveLength(2)

      const bodies = contactBodies as Array<{
        email: string
        attributes: Record<string, unknown>
        updateEnabled: boolean
      }>

      for (const body of bodies) {
        expect(body.updateEnabled).toBe(true)
        expect(body.attributes.ORGANISATION_TYPE).toEqual(expect.any(String))
      }

      const counts = bodies.map((b) => ({
        polls: b.attributes.NUMBER_ORGANISATION_CREATED_POLLS,
        simulations: b.attributes.NUMBER_ORGANISATION_COMPLETED_SIMULATIONS,
        participants: b.attributes.LAST_POLL_PARTICIPANTS_NUMBER,
      }))

      expect(counts).toEqual(
        expect.arrayContaining([
          { polls: 1, simulations: 1, participants: 1 },
          { polls: 1, simulations: 2, participants: 2 },
        ])
      )
    })
  })

  describe('When organisation has no administrator', () => {
    test('Then it logs a warning and still counts it as processed', async () => {
      await createOrganisation({ agent })

      const orgWithoutAdmin = await prisma.organisation.create({
        data: {
          id: faker.string.uuid(),
          name: 'no-admin-org',
          slug: faker.lorem.slug(),
          type: 'company',
        },
      })

      const contactBodies: unknown[] = []
      mswServer.use(brevoUpdateContact({ storeBodies: contactBodies }))

      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 2, errorCount: 0 })
      expect(contactBodies).toHaveLength(1)
      expect(logger.warn).toHaveBeenCalledWith(
        `No administrator found for organisation ${orgWithoutAdmin.id}`
      )
    })
  })

  describe('When Brevo API fails', () => {
    test('Then it retries and counts the error', async () => {
      const { id: organisationId } = await createOrganisation({
        agent,
      })

      mswServer.use(brevoUpdateContact({ networkError: true }))

      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 0, errorCount: 1 })
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to sync Brevo contact for organisation ${organisationId}`,
        expect.objectContaining({ error: expect.any(Error) })
      )
    })
  })
})
