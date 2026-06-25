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

    test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
      const userId = faker.string.uuid()
      const expected = {
        id: faker.string.uuid(),
        model: `FR-fr-${defaultModelVersion}`,
        situation,
        progression: 1,
        computedResults,
      }

      const response = await agent
        .post(url)
        .set(authHeaders({ userId }))
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
          email: null,
          name: null,
          ageRange: null,
        },
      })
    })

    test('Then it stores a simulation in database', async () => {
      const userId = faker.string.uuid()
      const payload: SimulationCreateInputDto = {
        id: faker.string.uuid(),
        date: new Date(),
        situation,
        progression: 1,
        computedResults,
        extendedSituation,
        actionChoices: {
          myAction: true,
        },
        foldedSteps: [],
        additionalQuestionsAnswers: [
          {
            type: SimulationAdditionalQuestionAnswerType.custom,
            key: 'myKey',
            answer: 'myAnswer',
          },
          {
            type: SimulationAdditionalQuestionAnswerType.default,
            key: PollDefaultAdditionalQuestionType.postalCode,
            answer: '00001',
          },
        ],
      }

      const {
        body: { id },
      } = await agent
        .post(url)
        .set(authHeaders({ userId }))
        .send(payload)
        .expect(StatusCodes.CREATED)

      await EventBus.flush()

      const createdSimulation = await prisma.simulation.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          date: true,
          situation: true,
          foldedSteps: true,
          progression: true,
          actionChoices: true,
          computedResults: true,
          extendedSituation: true,
          additionalQuestionsAnswers: {
            select: {
              key: true,
              answer: true,
              type: true,
            },
          },
          polls: {
            select: {
              pollId: true,
            },
          },
          states: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
            simulationId: id,
            progression: 1,
          },
        ],
        user: {
          id: userId,
          email: null,
          name: null,
        },
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
