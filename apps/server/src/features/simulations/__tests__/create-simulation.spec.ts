import { faker } from '@faker-js/faker'
import modelPackage from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import {
  PollDefaultAdditionalQuestionType,
  SimulationAdditionalQuestionAnswerType,
} from '../../../adapters/prisma/generated.ts'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../core/event-bus/event-bus.ts'
import logger from '../../../logger.ts'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.ts'
import type { SimulationCreateInputDto } from '../simulations.validator.ts'
import {
  CREATE_SIMULATION_ROUTE,
  getRandomTestCase,
} from './fixtures/simulations.fixtures.ts'

const defaultModelVersion = modelPackage.version
  .match(/^(\d+\.\d+\.\d+)/)!
  .pop()

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_SIMULATION_ROUTE
  const { computedResults, situation, extendedSituation } = getRandomTestCase()

  afterEach(async () => {
    // Simulation.user is onDelete: SetNull, so simulations must be removed
    // explicitly (deleting the user would only orphan them).
    await prisma.simulation.deleteMany()
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When creating his simulation', () => {
    describe('And no authentication headers', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.post(url).expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And no data provided', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid simulation id', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.database.mongodbObjectId(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid situation', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            progression: 1,
            computedResults,
            situation: null,
            extendedSituation,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid computedResults', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            extendedSituation,
            computedResults: null,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And verified user does not exist in database', () => {
      test('Then it does not create a verified user', async () => {
        const userId = faker.string.uuid()
        const email = faker.internet.email()

        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          model: `FR-fr-${defaultModelVersion}`,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
        }

        await agent
          .post(url)
          .set(authHeaders({ userId, email }))
          .send(payload)
          .expect(StatusCodes.UNAUTHORIZED)

        await EventBus.flush()

        const [userCount, verifiedUserCount] = await Promise.all([
          prisma.user.count({ where: { id: userId } }),
          prisma.verifiedUser.count({
            where: { OR: [{ id: userId }, { email }] },
          }),
        ])

        expect(userCount).toBe(0)
        expect(verifiedUserCount).toBe(0)
      })
    })

    describe('And user does not exist', () => {
      test('Then it creates the user alongside the simulation', async () => {
        const userId = faker.string.uuid()

        // Verify user does not exist before
        expect(await prisma.user.count({ where: { id: userId } })).toBe(0)

        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          model: `FR-fr-${defaultModelVersion}`,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
          actionChoices: {},
          foldedSteps: [],
          additionalQuestionsAnswers: [],
        }

        const response = await agent
          .post(url)
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        // Verify user was created
        expect(await prisma.user.count({ where: { id: userId } })).toBe(1)

        expect(response.body).toEqual({
          id: payload.id,
          model: payload.model,
          date: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          progression: payload.progression,
          actionChoices: payload.actionChoices,
          additionalQuestionsAnswers: payload.additionalQuestionsAnswers,
          foldedSteps: payload.foldedSteps,
          polls: [],
          groups: [],
          user: {
            id: userId,
            email: null,
            name: null,
            ageRange: null,
          },
          situation: payload.situation,
          computedResults: payload.computedResults,
        })

        const createdSimulation = await prisma.simulation.findUnique({
          where: { id: payload.id },
          select: {
            id: true,
            model: true,
            date: true,
            situation: true,
            foldedSteps: true,
            progression: true,
            actionChoices: true,
            computedResults: true,
            extendedSituation: true,
            additionalQuestionsAnswers: {
              select: { key: true, answer: true, type: true },
            },
            polls: { select: { pollId: true } },
            states: true,
            user: { select: { id: true, name: true, email: true } },
            createdAt: true,
            updatedAt: true,
          },
        })

        expect(createdSimulation).toEqual({
          ...payload,
          createdAt: expect.any(Date),
          date: expect.any(Date),
          updatedAt: expect.any(Date),
          polls: [],
          states: [
            {
              id: expect.any(String),
              date: expect.any(Date),
              simulationId: payload.id,
              progression: 1,
            },
          ],
          user: { id: userId, email: null, name: null },
        })
      })
    })

    describe('And anonymous user already exists', () => {
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()
        await prisma.user.create({ data: { id: userId } })
      })

      test('Then it creates the simulation linked to the existing user', async () => {
        const expected = {
          id: faker.string.uuid(),
          model: `FR-fr-${defaultModelVersion}`,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
        }

        const response = await agent
          .post(url)
          .set(authHeaders({ userId }))
          .send(expected)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        // Verify user was NOT duplicated
        expect(await prisma.user.count({ where: { id: userId } })).toBe(1)

        // Verify response
        expect(response.body.user).toEqual({
          id: userId,
          email: null,
          name: null,
          ageRange: null,
        })

        // Verify simulation stored with link to existing user
        const createdSimulation = await prisma.simulation.findUnique({
          where: { id: expected.id },
          select: { id: true, userId: true },
        })

        expect(createdSimulation).toEqual({
          id: expected.id,
          userId,
        })
      })
    })

    describe('And updating it', () => {
      let userId: string
      let payload: SimulationCreateInputDto

      beforeEach(async () => {
        userId = faker.string.uuid()
        payload = {
          id: faker.string.uuid(),
          model: `FR-fr-${defaultModelVersion}`,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
          additionalQuestionsAnswers: [
            {
              type: SimulationAdditionalQuestionAnswerType.default,
              key: PollDefaultAdditionalQuestionType.birthdate,
              answer: '1970-01-01',
            },
            {
              type: SimulationAdditionalQuestionAnswerType.default,
              key: PollDefaultAdditionalQuestionType.postalCode,
              answer: '00001',
            },
          ],
        }

        await agent
          .post(url)
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
      })

      test(`Then it returns ${StatusCodes.CREATED} response with updated simulation`, async () => {
        const response = await agent
          .post(url)
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        const { extendedSituation: _, ...expected } = payload

        expect(response.body).toEqual({
          ...expected,
          date: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          actionChoices: {},
          foldedSteps: [],
          polls: [],
          groups: [],
          user: {
            id: userId,
            email: null,
            name: null,
            ageRange: null,
          },
        })
      })

      test('Then it creates a new simulation state', async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        expect(
          await prisma.simulationState.count({
            where: {
              simulationId: payload.id,
            },
          })
        ).toBe(2)
      })
    })

    describe('And the simulation belongs to another user', () => {
      let ownerId: string
      let simulationId: string
      let payload: SimulationCreateInputDto

      beforeEach(async () => {
        ownerId = faker.string.uuid()
        simulationId = faker.string.uuid()

        await agent
          .post(url)
          .set(authHeaders({ userId: ownerId }))
          .send({
            id: simulationId,
            situation,
            progression: 0,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        payload = {
          id: simulationId,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
        }
      })

      test(`Then it returns a ${StatusCodes.FORBIDDEN} error and does not update the simulation`, async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send(payload)
          .expect(StatusCodes.FORBIDDEN)

        const simulation = await prisma.simulation.findUniqueOrThrow({
          where: { id: simulationId },
          select: { userId: true, progression: true },
        })

        expect(simulation).toEqual({ userId: ownerId, progression: 0 })
      })
    })

    describe('And the simulation is orphaned (its account was deleted)', () => {
      let simulationId: string
      let payload: SimulationCreateInputDto

      beforeEach(async () => {
        simulationId = faker.string.uuid()

        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: simulationId,
            situation,
            progression: 0,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        await prisma.simulation.update({
          where: { id: simulationId },
          data: { userId: null },
        })

        payload = {
          id: simulationId,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
        }
      })

      test(`Then it returns a ${StatusCodes.FORBIDDEN} error and does not attach the simulation to the requesting user`, async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send(payload)
          .expect(StatusCodes.FORBIDDEN)

        const simulation = await prisma.simulation.findUniqueOrThrow({
          where: { id: simulationId },
          select: { userId: true },
        })

        expect(simulation.userId).toBeNull()
      })
    })

    describe('And the user already has a simulation', () => {
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()

        await agent
          .post(url)
          .set(authHeaders({ userId }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
      })

      test('Then it creates a second simulation linked to the same user', async () => {
        const id = faker.string.uuid()

        const response = await agent
          .post(url)
          .set(authHeaders({ userId }))
          .send({
            id,
            model: `FR-fr-${defaultModelVersion}`,
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        expect(response.body.id).toBe(id)
        expect(response.body.user).toEqual({
          id: userId,
          email: null,
          name: null,
          ageRange: null,
        })

        // Both simulations belong to the same, single (non-duplicated) user row
        expect(await prisma.simulation.count({ where: { userId } })).toBe(2)
        expect(await prisma.user.count({ where: { id: userId } })).toBe(1)
      })
    })

    describe('And the user is verified', () => {
      let email: string
      let userId: string

      beforeEach(async () => {
        ;({ email, userId } = await login({ agent }))
      })

      test(`Then it returns a ${StatusCodes.CREATED} response with the simulation linked to the verified user`, async () => {
        const expected = {
          id: faker.string.uuid(),
          model: `FR-fr-${defaultModelVersion}`,
          situation,
          progression: 1,
          computedResults,
        }

        mswServer.use(
          brevoUpdateContact(),
          brevoRemoveFromList(22, { invalid: true }),
          brevoRemoveFromList(32, { invalid: true }),
          brevoRemoveFromList(36, { invalid: true }),
          brevoRemoveFromList(40, { invalid: true }),
          brevoRemoveFromList(41, { invalid: true }),
          brevoRemoveFromList(42, { invalid: true })
        )

        const response = await agent
          .post(url)
          .set(authHeaders({ userId, email }))
          .send({ ...expected, extendedSituation })
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        expect(response.body).toEqual({
          ...expected,
          date: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          actionChoices: {},
          additionalQuestionsAnswers: [],
          foldedSteps: [],
          polls: [],
          groups: [],
          user: {
            id: userId,
            email,
            name: null,
            optedInForCommunications: false,
            position: null,
            telephone: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const createdSimulation = await prisma.simulation.findUniqueOrThrow({
          where: { id: expected.id },
          select: {
            user: { select: { id: true } },
            verifiedUser: { select: { id: true, email: true } },
          },
        })

        expect(createdSimulation).toEqual({
          user: { id: userId },
          verifiedUser: { id: userId, email },
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
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .post(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })

        expect(logger.error).toHaveBeenCalledWith(
          'Simulation creation failed',
          databaseError
        )
      })
    })
  })
})
