import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import {
  createSimulation,
  FETCH_USER_SIMULATIONS_ROUTE,
  getSimulationPayload,
} from './fixtures/simulations.fixtures.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_USER_SIMULATIONS_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verificationCode.deleteMany(),
      prisma.verifiedUser.deleteMany(),
    ])
  })

  describe('When fetching his simulations', () => {
    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url.replace(':userId', faker.string.alpha(34)))
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid page queryParam', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .query({
            page: 0,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid pageSize queryParam', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .query({
            pageSize: 500,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid completedOnly queryParam', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .query({
            completedOnly: 'not-a-boolean',
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And no simulation exist', () => {
      test(`Then it returns a ${StatusCodes.OK} response with an empty list`, async () => {
        const response = await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual([])
      })
    })

    describe('And a simulation does exist', () => {
      let simulation: Awaited<ReturnType<typeof createSimulation>>
      let userId: string

      beforeEach(async () => {
        simulation = await createSimulation({ agent })
        ;({
          user: { id: userId },
        } = simulation)
      }, 5000)

      test(`Then it returns a ${StatusCodes.OK} response with a list containing the simulation`, async () => {
        const response = await agent
          .get(url.replace(':userId', userId))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual([simulation])
      })
    })

    describe('And several simulations exist with different dates', () => {
      let simulations: Awaited<ReturnType<typeof createSimulation>>[]
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()

        // Created in insertion order: older, newer, middle
        // to prove ordering is by date, not insertion order
        const olderSimulation = await createSimulation({
          agent,
          userId,
          simulation: getSimulationPayload({ date: new Date('2024-01-01') }),
        })

        const newerSimulation = await createSimulation({
          agent,
          userId,
          simulation: getSimulationPayload({ date: new Date('2024-06-01') }),
        })

        const middleSimulation = await createSimulation({
          agent,
          userId,
          simulation: getSimulationPayload({ date: new Date('2024-03-01') }),
        })

        // Expected order: newest date first
        simulations = [newerSimulation, middleSimulation, olderSimulation]
      })

      test(`Then it returns a ${StatusCodes.OK} response with simulations ordered by date descending`, async () => {
        const response = await agent
          .get(url.replace(':userId', userId))
          .expect(StatusCodes.OK)

        expect(response.body.map((s: { id: string }) => s.id)).toEqual(
          simulations.map((s) => s.id)
        )
      })
    })

    describe('And several simulations exist', () => {
      let simulations: Awaited<ReturnType<typeof createSimulation>>[]
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()
        simulations = []
        while (simulations.length < 3) {
          const simulation = await createSimulation({
            agent,
            userId,
          })

          simulations.unshift(simulation)
        }
      })

      describe('And page 1', () => {
        test(`Then it returns a ${StatusCodes.OK} response with a list containing the simulations and paginated headers`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .query({
              page: 1,
              pageSize: 2,
            })
            .expect(StatusCodes.OK)

          expect(response.body).toEqual(simulations.slice(0, 2))

          expect(response.headers).toEqual(
            expect.objectContaining({
              'x-page': '1',
              'x-page-size': '2',
              'x-page-items': '2',
              'x-total-pages': '2',
              'x-total-items': '3',
            })
          )
        })
      })

      describe('And page 2', () => {
        test(`Then it returns a ${StatusCodes.OK} response with a list containing the simulations and paginated headers`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .query({
              page: 2,
              pageSize: 2,
            })
            .expect(StatusCodes.OK)

          expect(response.body).toEqual(simulations.slice(2))

          expect(response.headers).toEqual(
            expect.objectContaining({
              'x-page': '2',
              'x-page-size': '2',
              'x-page-items': '1',
              'x-total-pages': '2',
              'x-total-items': '3',
            })
          )
        })
      })

      describe('And page 3', () => {
        test(`Then it returns a ${StatusCodes.OK} response with an empty list and paginated headers`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .query({
              page: 3,
              pageSize: 2,
            })
            .expect(StatusCodes.OK)

          expect(response.body).toEqual([])

          expect(response.headers).toEqual(
            expect.objectContaining({
              'x-page': '3',
              'x-page-size': '2',
              'x-page-items': '0',
              'x-total-pages': '2',
              'x-total-items': '3',
            })
          )
        })
      })
    })

    describe('And simulations with mixed progression exist', () => {
      let completedSimulation: Awaited<ReturnType<typeof createSimulation>>
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()

        await createSimulation({
          agent,
          userId,
          simulation: getSimulationPayload({ progression: 0.5 }),
        })

        completedSimulation = await createSimulation({
          agent,
          userId,
          simulation: getSimulationPayload({ progression: 1 }),
        })
      })

      describe('And completedOnly is true', () => {
        test(`Then it returns a ${StatusCodes.OK} response with only completed simulations`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .query({ completedOnly: true })
            .expect(StatusCodes.OK)

          expect(response.body).toHaveLength(1)
          expect(response.body[0].id).toEqual(completedSimulation.id)
          expect(response.body[0].progression).toEqual(1)
        })
      })

      describe('And completedOnly is false', () => {
        test(`Then it returns a ${StatusCodes.OK} response with all simulations`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .query({ completedOnly: false })
            .expect(StatusCodes.OK)

          expect(response.body).toHaveLength(2)
        })
      })

      describe('And completedOnly is not provided', () => {
        test(`Then it returns a ${StatusCodes.OK} response with all simulations`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .expect(StatusCodes.OK)

          expect(response.body).toHaveLength(2)
        })
      })
    })

    describe('And database failure', () => {
      const databaseError = new Error('Something went wrong')

      beforeEach(() => {
        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRejectedValueOnce(
          databaseError
        )
      })

      afterEach(() => {
        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRestore()
      })

      test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
        await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Simulations fetch failed',
          databaseError
        )
      })
    })
  })

  describe('And logged in', () => {
    let cookie: string
    let userId: string

    beforeEach(async () => {
      ;({ cookie, userId } = await login({ agent }))
    })

    describe('And no simulation exist', () => {
      test(`Then it returns a ${StatusCodes.OK} response with an empty list`, async () => {
        const response = await agent
          .get(url.replace(':userId', userId))
          .set('cookie', cookie)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual([])
      })
    })

    describe('And a simulation does exist', () => {
      let simulation: Awaited<ReturnType<typeof createSimulation>>

      beforeEach(async () => {
        simulation = await createSimulation({ agent, cookie })
      })

      test(`Then it returns a ${StatusCodes.OK} response with a list containing the simulation`, async () => {
        const response = await agent
          .get(url.replace(':userId', userId))
          .set('cookie', cookie)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual([simulation])
      })
    })

    describe('And several simulations exist', () => {
      let simulations: Awaited<ReturnType<typeof createSimulation>>[]
      let userLastUpdatedAt: string

      beforeEach(async () => {
        simulations = []
        while (simulations.length < 3) {
          const simulation = await createSimulation({
            agent,
            cookie,
          })

          userLastUpdatedAt = simulation.user.updatedAt

          simulations.unshift(simulation)
        }
      })

      describe('And page 1', () => {
        test(`Then it returns a ${StatusCodes.OK} response with a list containing the simulations and paginated headers`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .set('cookie', cookie)
            .query({
              page: 1,
              pageSize: 2,
            })
            .expect(StatusCodes.OK)

          expect(response.body).toEqual(
            simulations.slice(0, 2).map((simulation) => ({
              ...simulation,
              user: {
                ...simulation.user,
                updatedAt: userLastUpdatedAt,
              },
            }))
          )

          expect(response.headers).toEqual(
            expect.objectContaining({
              'x-page': '1',
              'x-page-size': '2',
              'x-page-items': '2',
              'x-total-pages': '2',
              'x-total-items': '3',
            })
          )
        })
      })

      describe('And page 2', () => {
        test(`Then it returns a ${StatusCodes.OK} response with a list containing the simulations and paginated headers`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .set('cookie', cookie)
            .query({
              page: 2,
              pageSize: 2,
            })
            .expect(StatusCodes.OK)

          expect(response.body).toEqual(
            simulations.slice(2).map((simulation) => ({
              ...simulation,
              user: {
                ...simulation.user,
                updatedAt: userLastUpdatedAt,
              },
            }))
          )

          expect(response.headers).toEqual(
            expect.objectContaining({
              'x-page': '2',
              'x-page-size': '2',
              'x-page-items': '1',
              'x-total-pages': '2',
              'x-total-items': '3',
            })
          )
        })
      })

      describe('And page 3', () => {
        test(`Then it returns a ${StatusCodes.OK} response with an empty list and paginated headers`, async () => {
          const response = await agent
            .get(url.replace(':userId', userId))
            .set('cookie', cookie)
            .query({
              page: 3,
              pageSize: 2,
            })
            .expect(StatusCodes.OK)

          expect(response.body).toEqual([])

          expect(response.headers).toEqual(
            expect.objectContaining({
              'x-page': '3',
              'x-page-size': '2',
              'x-page-items': '0',
              'x-total-pages': '2',
              'x-total-items': '3',
            })
          )
        })
      })
    })
  })
})
