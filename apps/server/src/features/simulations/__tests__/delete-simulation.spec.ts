import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import logger from '../../../logger.ts'
import { createGroup } from '../../groups/__tests__/fixtures/groups.fixture.ts'
import {
  createSimulation,
  DELETE_SIMULATION_ROUTE,
} from './fixtures/simulations.fixtures.ts'

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
          .delete(url.replace(':simulationId', faker.string.uuid()))
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid simulationId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .delete(url.replace(':simulationId', faker.string.alpha(34)))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And simulation does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .delete(url.replace(':simulationId', faker.string.uuid()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And simulation was created by another user', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        const simulation = await createSimulation({
          agent,
          userId: faker.string.uuid(),
        })
        simulationIds.push(simulation.id)

        await agent
          .delete(url.replace(':simulationId', simulation.id))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And simulation does exist and belongs to user', () => {
      let simulationId: string
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()
        const simulation = await createSimulation({ agent, userId })
        simulationId = simulation.id
        simulationIds.push(simulation.id)
      })

      test(`Then it returns a ${StatusCodes.ACCEPTED} response`, async () => {
        await agent
          .delete(url.replace(':simulationId', simulationId))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.ACCEPTED)
      })

      test('Then the simulation userId is null', async () => {
        await agent
          .delete(url.replace(':simulationId', simulationId))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.ACCEPTED)

        const simulation = await prisma.simulation.findUniqueOrThrow({
          where: { id: simulationId },
          select: { userId: true },
        })

        expect(simulation.userId).toBeNull()
      })

      test('Then the group participants are deleted', async () => {
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
          .delete(url.replace(':simulationId', simulationId))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.ACCEPTED)

        const groupParticipants = await prisma.groupParticipant.findMany({
          where: {
            groupId: group.id,
            userId,
          },
        })

        expect(groupParticipants.length).toBe(0)
      })
    })

    describe('And database failure', () => {
      const databaseError = new Error('Something went wrong')

      afterEach(() => {
        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRestore()
      })

      test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
        const userId = faker.string.uuid()
        const simulation = await createSimulation({ agent, userId })
        simulationIds.push(simulation.id)

        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRejectedValueOnce(
          databaseError
        )

        await agent
          .delete(url.replace(':simulationId', simulation.id))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        const userId = faker.string.uuid()
        const simulation = await createSimulation({ agent, userId })
        simulationIds.push(simulation.id)

        vi.spyOn(prismaTransactionAdapter, 'transaction').mockRejectedValueOnce(
          databaseError
        )

        await agent
          .delete(url.replace(':simulationId', simulation.id))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Simulation deletion failed',
          databaseError
        )
      })
    })
  })
})
