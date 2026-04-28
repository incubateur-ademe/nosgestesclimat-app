import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { createGroup } from '../../groups/__tests__/fixtures/groups.fixture.js'
import {
  createSimulation,
  DELETE_SIMULATION_ROUTE,
} from './fixtures/simulations.fixtures.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = DELETE_SIMULATION_ROUTE
  const simulationIds: string[] = []

  afterEach(async () => {
    await Promise.all([
      prisma.groupParticipant.deleteMany(),
      prisma.groupAdministrator.deleteMany(),
      prisma.group.deleteMany(),
      prisma.simulation.deleteMany({
        where: { id: { in: simulationIds.splice(0) } },
      }),
      prisma.user.deleteMany(),
      prisma.verificationCode.deleteMany(),
      prisma.verifiedUser.deleteMany(),
    ])
  })

  describe('When deleting a simulation', () => {
    describe('And user is not authenticated', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .delete(
            url
              .replace(':simulationId', faker.string.uuid())
              .replace(':userId', faker.string.uuid())
          )
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        const { cookie } = await login({ agent })

        await agent
          .delete(
            url
              .replace(':simulationId', faker.string.uuid())
              .replace(':userId', faker.string.alpha(34))
          )
          .set('cookie', cookie)
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid simulationId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        const { cookie, userId } = await login({ agent })

        await agent
          .delete(
            url
              .replace(':simulationId', faker.string.alpha(34))
              .replace(':userId', userId)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And simulation does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        const { cookie, userId } = await login({ agent })

        await agent
          .delete(
            url
              .replace(':simulationId', faker.string.uuid())
              .replace(':userId', userId)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And simulation was created by another user', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        const { cookie, userId } = await login({ agent })
        const { cookie: otherCookie } = await login({
          agent,
        })
        const simulation = await createSimulation({
          agent,
          cookie,
        })
        simulationIds.push(simulation.id)
        await agent
          .delete(
            url
              .replace(':simulationId', simulation.id)
              .replace(':userId', userId)
          )
          .set('cookie', otherCookie)
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And a wrong userId is passed in the query params', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        const { cookie } = await login({ agent })
        const { userId: otherUserId } = await login({
          agent,
        })
        const simulation = await createSimulation({
          agent,
          cookie,
        })
        simulationIds.push(simulation.id)
        await agent
          .delete(
            url
              .replace(':simulationId', simulation.id)
              .replace(':userId', otherUserId)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.FORBIDDEN)
      })
    })

    describe('And simulation does exist and belongs to user', () => {
      let simulationId: string
      let userId: string
      let cookie: string

      beforeEach(async () => {
        const result = await login({ agent })
        cookie = result.cookie
        userId = result.userId
        const simulation = await createSimulation({ agent, cookie })
        simulationId = simulation.id
        simulationIds.push(simulation.id)
      })

      test(`Then it returns a ${StatusCodes.ACCEPTED} response`, async () => {
        await agent
          .delete(
            url
              .replace(':simulationId', simulationId)
              .replace(':userId', userId)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.ACCEPTED)
      })

      test('Then the simulation userId is null', async () => {
        await agent
          .delete(
            url
              .replace(':simulationId', simulationId)
              .replace(':userId', userId)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.ACCEPTED)

        const simulation = await prisma.simulation.findUniqueOrThrow({
          where: { id: simulationId },
          select: { userId: true },
        })

        expect(simulation.userId).toBeNull()
      })

      test('Then the group participants are soft-deleted (userId is null)', async () => {
        const group = await createGroup({
          agent,
          group: {
            administrator: {
              userId,
              name: faker.person.fullName(),
              email: faker.internet.email(),
            },
          },
        })

        await prisma.groupParticipant.create({
          data: {
            groupId: group.id,
            userId,
            simulationId,
          },
        })

        const participantsBefore = await prisma.groupParticipant.findMany({
          where: {
            groupId: group.id,
            userId,
          },
        })
        expect(participantsBefore.length).toBe(1)

        await agent
          .delete(
            url
              .replace(':simulationId', simulationId)
              .replace(':userId', userId)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.ACCEPTED)

        const groupParticipants = await prisma.groupParticipant.findMany({
          where: {
            groupId: group.id,
            simulationId,
          },
        })

        expect(groupParticipants.length).toBe(1)
        expect(groupParticipants[0].userId).toBeNull()
      })
    })

    describe('And database failure', () => {
      const databaseError = new Error('Something went wrong')

      afterEach(() => {
        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRestore()
      })

      test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
        const { cookie } = await login({ agent })
        const simulation = await createSimulation({ agent, cookie })
        simulationIds.push(simulation.id)

        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRejectedValueOnce(
          databaseError
        )

        await agent
          .delete(
            url
              .replace(':simulationId', simulation.id)
              .replace(':userId', simulation.user.id)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        const { cookie } = await login({ agent })
        const simulation = await createSimulation({ agent, cookie })
        simulationIds.push(simulation.id)

        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRejectedValueOnce(
          databaseError
        )

        await agent
          .delete(
            url
              .replace(':simulationId', simulation.id)
              .replace(':userId', simulation.user.id)
          )
          .set('cookie', cookie)
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Simulation deletion failed',
          databaseError
        )
      })
    })
  })
})
