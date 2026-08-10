import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import logger from '../../../logger.ts'
import {
  createSimulation,
  FETCH_USER_SIMULATION_ROUTE,
} from './fixtures/simulations.fixtures.ts'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_USER_SIMULATION_ROUTE

  afterEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('When fetching one of his simulations', () => {
    describe('And user is not authenticated', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(url.replace(':simulationId', faker.string.uuid()))
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid simulationId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url.replace(':simulationId', faker.string.alpha(34)))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And simulation does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .get(url.replace(':simulationId', faker.string.uuid()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And simulation belongs to another user', () => {
      let simulationId: string

      beforeEach(async () => {
        const simulation = await createSimulation({ agent })
        simulationId = simulation.id
      })

      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .get(url.replace(':simulationId', simulationId))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And simulation does exist and belongs to the user', () => {
      let simulation: Awaited<ReturnType<typeof createSimulation>>
      let simulationId: string
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()
        simulation = await createSimulation({ agent, userId })
        simulationId = simulation.id
      })

      test(`Then it returns a ${StatusCodes.OK} response with the simulation`, async () => {
        const response = await agent
          .get(url.replace(':simulationId', simulationId))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual(simulation)
      })
    })

    describe('And simulation is legacy (invalid computedResults shape)', () => {
      let legacySimulationId: string
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()

        // Creates the user through the API
        await createSimulation({ agent, userId })

        // Insert directly in the database a legacy simulation (bypassing the
        // POST validation, like simulations stored before the current
        // computedResults shape was introduced).
        legacySimulationId = faker.string.uuid()
        await prisma.simulation.create({
          data: {
            id: legacySimulationId,
            date: new Date('2024-02-01'),
            progression: 1,
            model: 'FR-fr-0.0.0',
            computedResults: {
              bilan: 1000,
              categories: { transport: 1000 },
            },
            actionChoices: {},
            situation: {},
            extendedSituation: {},
            foldedSteps: [],
            userId,
          },
        })
      })

      test(`Then it returns a ${StatusCodes.NOT_FOUND} error, as if it did not exist`, async () => {
        await agent
          .get(url.replace(':simulationId', legacySimulationId))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.NOT_FOUND)
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
          .get(url.replace(':simulationId', faker.string.uuid()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(url.replace(':simulationId', faker.string.uuid()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Simulation fetch failed',
          databaseError
        )
      })
    })
  })
})
