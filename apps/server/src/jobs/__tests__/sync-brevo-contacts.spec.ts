import { faker } from '@faker-js/faker'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../adapters/prisma/client.js'
import { mswServer } from '../../core/__tests__/fixtures/server.fixture.js'
import { getOrganisationsBatchBrevoStats } from '../../features/organisations/organisations.repository.js'
import logger from '../../logger.js'
import { runSync, syncOrganisationToBrevo } from '../sync-brevo-contacts.js'

vi.mock('../../logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

const makeOrganisation = (
  overrides: {
    id?: string
    name?: string
    slug?: string
    type?: string
    administrators?: Array<{
      user: {
        id: string
        name: string | null
        email: string
        optedInForCommunications: boolean
      }
    }>
  } = {}
) => ({
  id: overrides.id ?? faker.string.uuid(),
  name: overrides.name ?? faker.company.name(),
  slug: overrides.slug ?? faker.lorem.slug(),
  type: overrides.type ?? 'company',
  administrators: overrides.administrators ?? [
    {
      user: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        optedInForCommunications: false,
      },
    },
  ],
})

const makeStats = (
  overrides: {
    lastPollParticipantsCount?: number
    pollsCreatedCount?: number
    organisationSimulationsCompletedCount?: number
    organisationLastSimulationDate?: Date | null
  } = {}
) => ({
  lastPollParticipantsCount: overrides.lastPollParticipantsCount ?? 0,
  pollsCreatedCount: overrides.pollsCreatedCount ?? 0,
  organisationSimulationsCompletedCount:
    overrides.organisationSimulationsCompletedCount ?? 0,
  organisationLastSimulationDate:
    overrides.organisationLastSimulationDate ?? null,
})

describe('syncOrganisationToBrevo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('When organisation has no administrator', () => {
    test('Then it logs a warning and returns without calling Brevo', async () => {
      const org = makeOrganisation({ administrators: [] })

      await syncOrganisationToBrevo(org, makeStats())

      expect(logger.warn).toHaveBeenCalledWith(
        `No administrator found for organisation ${org.id}`
      )
    })
  })

  describe('When organisation has 0 polls', () => {
    test('Then it sends pollsCreatedCount=0, simulationsCompleted=0 and no date', async () => {
      const org = makeOrganisation()
      const stats = makeStats({
        pollsCreatedCount: 0,
        organisationSimulationsCompletedCount: 0,
        organisationLastSimulationDate: null,
      })

      mswServer.use(
        brevoUpdateContact({
          expectBody: {
            email: org.administrators[0].user.email,
            attributes: expect.objectContaining({
              NUMBER_ORGANISATION_CREATED_POLLS: 0,
              NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 0,
            }),
            updateEnabled: true,
          },
        }),
        brevoRemoveFromList(27)
      )

      await syncOrganisationToBrevo(org, stats)

      expect(logger.info).toHaveBeenCalledWith(
        `Synced Brevo contact for organisation ${org.id} (${org.name})`
      )
    })
  })

  describe('When organisation has polls but no completed simulations', () => {
    test('Then it sends pollsCreatedCount > 0 and simulationsCompleted = 0', async () => {
      const org = makeOrganisation()
      const stats = makeStats({
        pollsCreatedCount: 5,
        organisationSimulationsCompletedCount: 0,
        organisationLastSimulationDate: null,
      })

      mswServer.use(
        brevoUpdateContact({
          expectBody: {
            email: org.administrators[0].user.email,
            attributes: expect.objectContaining({
              NUMBER_ORGANISATION_CREATED_POLLS: 5,
              NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 0,
            }),
            updateEnabled: true,
          },
        }),
        brevoRemoveFromList(27)
      )

      await syncOrganisationToBrevo(org, stats)

      expect(logger.info).toHaveBeenCalledWith(
        `Synced Brevo contact for organisation ${org.id} (${org.name})`
      )
    })
  })

  describe('When organisation has multiple polls and completed simulations', () => {
    test('Then it sends correct count and the most recent date', async () => {
      const org = makeOrganisation()
      const lastSimDate = new Date('2024-03-15')
      const stats = makeStats({
        lastPollParticipantsCount: 12,
        pollsCreatedCount: 3,
        organisationSimulationsCompletedCount: 42,
        organisationLastSimulationDate: lastSimDate,
      })

      mswServer.use(
        brevoUpdateContact({
          expectBody: {
            email: org.administrators[0].user.email,
            attributes: expect.objectContaining({
              LAST_POLL_PARTICIPANTS_NUMBER: 12,
              NUMBER_ORGANISATION_CREATED_POLLS: 3,
              NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 42,
              LAST_ORGANISATION_SIMULATION_DATE: '2024-03-15',
            }),
            updateEnabled: true,
          },
        }),
        brevoRemoveFromList(27)
      )

      await syncOrganisationToBrevo(org, stats)

      expect(logger.info).toHaveBeenCalledWith(
        `Synced Brevo contact for organisation ${org.id} (${org.name})`
      )
    })
  })

  describe('When administrator opted in for communications', () => {
    test('Then it sends listIds: [27] and no removeFromList call', async () => {
      const org = makeOrganisation({
        administrators: [
          {
            user: {
              id: faker.string.uuid(),
              name: faker.person.fullName(),
              email: faker.internet.email().toLowerCase(),
              optedInForCommunications: true,
            },
          },
        ],
      })

      mswServer.use(
        brevoUpdateContact({
          expectBody: expect.objectContaining({
            email: org.administrators[0].user.email,
            listIds: [27],
          }),
        })
      )

      await syncOrganisationToBrevo(org, makeStats())

      expect(logger.info).toHaveBeenCalledWith(
        `Synced Brevo contact for organisation ${org.id} (${org.name})`
      )
    })
  })

  describe('When Brevo API fails', () => {
    test('Then the error is thrown', async () => {
      const org = makeOrganisation()

      mswServer.use(brevoUpdateContact({ networkError: true }))

      await expect(syncOrganisationToBrevo(org, makeStats())).rejects.toThrow()
    })
  })

  describe('When stats are undefined', () => {
    test('Then it still syncs the contact with only basic attributes', async () => {
      const org = makeOrganisation()

      mswServer.use(
        brevoUpdateContact({
          expectBody: expect.objectContaining({
            email: org.administrators[0].user.email,
            attributes: expect.objectContaining({
              USER_ID: org.administrators[0].user.id,
              IS_ORGANISATION_ADMIN: true,
              ORGANISATION_NAME: org.name,
              ORGANISATION_SLUG: org.slug,
              OPT_IN: false,
              ORGANISATION_TYPE: org.type,
            }),
          }),
        }),
        brevoRemoveFromList(27)
      )

      await syncOrganisationToBrevo(org, undefined)

      expect(logger.info).toHaveBeenCalledWith(
        `Synced Brevo contact for organisation ${org.id} (${org.name})`
      )
    })
  })
})

describe('runSync', () => {
  describe('When there are no organisations in the database', () => {
    test('Then it returns processedCount=0 and errorCount=0', async () => {
      const result = await runSync({ session: prisma })

      expect(result).toEqual({ processedCount: 0, errorCount: 0 })
    })
  })
})

describe('getOrganisationsBatchBrevoStats', () => {
  afterEach(async () => {
    await prisma.simulationPoll.deleteMany()
    await prisma.simulation.deleteMany()
    await prisma.poll.deleteMany()
    await prisma.organisationAdministrator.deleteMany()
    await prisma.organisation.deleteMany()
    await prisma.user.deleteMany()
    await prisma.verifiedUser.deleteMany()
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
})
