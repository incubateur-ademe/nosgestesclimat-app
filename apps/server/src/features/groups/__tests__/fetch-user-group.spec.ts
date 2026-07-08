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
  createGroup,
  FETCH_USER_GROUP_ROUTE,
  joinGroup,
} from './fixtures/groups.fixture.ts'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_USER_GROUP_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.groupAdministrator.deleteMany(),
      prisma.groupParticipant.deleteMany(),
    ])
    await Promise.all([prisma.user.deleteMany(), prisma.group.deleteMany()])
  })

  describe('When fetching one of his groups', () => {
    describe('And no authentication', () => {
      test(`Then it returns a ${StatusCodes.OK} response with the group`, async () => {
        const group = await createGroup({ agent })
        const response = await agent
          .get(url.replace(':groupId', group.id))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({
          ...group,
          administrator: {
            name: group.administrator.name,
          },
        })
      })

      test(`Then it returns a ${StatusCodes.NOT_FOUND} error for non-existent group`, async () => {
        await agent
          .get(url.replace(':groupId', faker.database.mongodbObjectId()))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And no group does exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .get(url.replace(':groupId', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And a group does exist', () => {
      let group: Awaited<ReturnType<typeof createGroup>>
      let groupId: string
      let userId: string

      beforeEach(async () => {
        group = await createGroup({ agent })
        ;({
          id: groupId,
          administrator: { id: userId },
        } = group)
      })

      test(`Then it returns a ${StatusCodes.OK} response with the group`, async () => {
        const response = await agent
          .get(url.replace(':groupId', groupId))
          .set(authHeaders({ userId }))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual(group)
      })

      describe('And he joined it', () => {
        let participant: Awaited<ReturnType<typeof joinGroup>>

        beforeEach(async () => {
          participant = await joinGroup({ agent, groupId })
          userId = participant.userId
        })

        test(`Then it returns a ${StatusCodes.OK} response with the group`, async () => {
          const response = await agent
            .get(url.replace(':groupId', groupId))
            .set(authHeaders({ userId }))
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            id: group.id,
            name: group.name,
            emoji: group.emoji,
            administrator: {
              name: group.administrator.name,
            },
            participants: [participant],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
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
          .get(url.replace(':groupId', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(url.replace(':groupId', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Group fetch failed',
          databaseError
        )
      })
    })
  })

  describe('And invited to join', () => {
    let group: Awaited<ReturnType<typeof createGroup>>
    let groupId: string

    beforeEach(async () => {
      group = await createGroup({ agent })
      ;({ id: groupId } = group)
    })

    describe('When fetching the group', () => {
      test(`Then it returns a ${StatusCodes.OK} response with the group`, async () => {
        const response = await agent
          .get(url.replace(':groupId', groupId))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({
          ...group,
          administrator: {
            name: group.administrator.name,
          },
        })
      })

      describe('And other participants joined', () => {
        let participants: Awaited<ReturnType<typeof joinGroup>>[]

        beforeEach(async () => {
          participants = await Promise.all([
            joinGroup({ agent, groupId }),
            joinGroup({ agent, groupId }),
          ])
        })

        test(`Then it returns a ${StatusCodes.OK} response with the group`, async () => {
          const response = await agent
            .get(url.replace(':groupId', groupId))
            .set(authHeaders({ userId: faker.string.uuid() }))
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            ...group,
            administrator: {
              name: group.administrator.name,
            },
            participants: participants.map(({ id, simulation, name }) => ({
              id,
              name,
              simulation,
            })),
          })
        })
      })
    })
  })
})
