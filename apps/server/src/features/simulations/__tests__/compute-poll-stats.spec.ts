import { faker } from '@faker-js/faker'
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import { simulationSelection } from '../../../adapters/prisma/selection.js'
import { redis } from '../../../adapters/redis/client.js'
import { KEYS } from '../../../adapters/redis/constant.js'
import app from '../../../app.js'
import { config } from '../../../config.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { Locales } from '../../../core/i18n/constant.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import {
  createOrganisation,
  createOrganisationPoll,
} from '../../organisations/__tests__/fixtures/organisations.fixture.js'
import { SimulationUpsertedAsyncEvent } from '../events/SimulationUpserted.event.js'
import * as simulationRepository from '../simulations.repository.js'
import { ComputedResultSchema } from '../simulations.validator.js'
import { getRandomTestCase } from './fixtures/simulations.fixtures.js'

vi.mock('../simulations.repository', async () => ({
  ...(await vi.importActual('../simulations.repository')),
}))

describe('Given a poll participation', () => {
  const agent = supertest(app)

  afterEach(async () => {
    await EventBus.flush()
    await Promise.all([
      prisma.organisationAdministrator.deleteMany(),
      prisma.simulationPoll.deleteMany(),
    ])
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When worker handles the async event', () => {
    let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
    let event: SimulationUpsertedAsyncEvent

    beforeEach(async () => {
      const { cookie } = await login({ agent })
      const organisation = await createOrganisation({ agent, cookie })

      poll = await createOrganisationPoll({
        organisationId: organisation.id,
        cookie,
        agent,
      })

      const user = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          email: faker.internet.email().toLocaleLowerCase(),
        },
      })

      const { computedResults, situation, extendedSituation } =
        getRandomTestCase()

      const simulation = await prisma.simulation.create({
        data: {
          id: faker.string.uuid(),
          actionChoices: {},
          computedResults,
          date: new Date(),
          progression: 1,
          situation,
          extendedSituation,
          polls: {
            create: {
              pollId: poll.id,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        select: simulationSelection,
      })

      event = new SimulationUpsertedAsyncEvent({
        origin: config.app.origin,
        locale: Locales.fr,
        sendEmail: false,
        updated: false,
        created: true,
        organisation,
        simulation,
        poll,
        user,
      })
    })

    test('Then it should compute the funfacts', async () => {
      EventBus.emit(event)

      await EventBus.once(event)

      poll = await prisma.poll.findUniqueOrThrow({
        where: {
          id: poll.id,
        },
      })

      expect(poll.funFacts).toEqual(
        Object.fromEntries(
          Object.entries(modelFunFacts).map(([k]) => [k, expect.any(Number)])
        )
      )
    })

    test('Then it should populate the redis cache', async () => {
      EventBus.emit(event)

      await EventBus.once(event)

      const rawCache = await redis.get(`${KEYS.pollsStatsResults}:${poll.id}`)
      const cache = JSON.parse(rawCache!)

      expect(cache).toEqual({
        computedResults: event.attributes.simulation.computedResults,
        simulationCount: 1,
        funFactValues: Object.fromEntries(
          Object.entries(modelFunFacts).map(([_, v]) => [v, expect.any(Number)])
        ),
      })

      expect(
        ComputedResultSchema.safeParse(cache.computedResults).error
      ).toBeUndefined()
    })

    describe('And redis cache already exists', () => {
      beforeEach(async () => {
        await redis.set(
          `${KEYS.pollsStatsResults}:${poll.id}`,
          JSON.stringify({
            simulationCount: 0,
            funFactValues: Object.fromEntries(
              Object.entries(modelFunFacts).map(([_, v]) => [v, 0])
            ),
          })
        )

        vi.spyOn(
          simulationRepository,
          'batchPollSimulations'
        ).mockRejectedValueOnce(new Error('Should not be called'))
      })

      afterEach(() => {
        vi.spyOn(simulationRepository, 'batchPollSimulations').mockRestore()
      })

      test('Then it should not loop over the simulations table', async () => {
        EventBus.emit(event)

        await EventBus.once(event)

        poll = await prisma.poll.findUniqueOrThrow({
          where: {
            id: poll.id,
          },
        })

        expect(poll.funFacts).toEqual(
          Object.fromEntries(
            Object.entries(modelFunFacts).map(([k]) => [k, expect.any(Number)])
          )
        )
      })

      describe('And simulation has not been inserted but updated', () => {
        beforeEach(() => {
          event = new SimulationUpsertedAsyncEvent({
            ...event.attributes,
            updated: true,
            created: false,
          })
        })

        test('Then it should loop over the simulations table', async () => {
          EventBus.emit(event)

          await EventBus.once(event)

          expect(logger.error).toHaveBeenCalledWith(
            'Poll funFacts update failed',
            expect.any(TypeError)
          )
        })
      })
    })

    describe('And poll has no real time stats', () => {
      beforeEach(async () => {
        await prisma.poll.update({
          where: {
            id: poll.id,
          },
          data: {
            computeRealTimeStats: false,
          },
        })
      })

      test('Then it should compute the funfacts', async () => {
        EventBus.emit(event)

        await EventBus.once(event)

        poll = await prisma.poll.findUniqueOrThrow({
          where: {
            id: poll.id,
          },
        })

        expect(poll.funFacts).toBeNull()
      })
    })
  })
})
