import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import logger from '../../../logger.js'
import {
  createGroup,
  FETCH_USER_GROUP_ROUTE,
  joinGroup,
} from './fixtures/groups.fixture.js'

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
    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(
            url
              .replace(':userId', faker.string.alpha(34))
              .replace(':groupId', faker.database.mongodbObjectId())
          )
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And no group does exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .get(
            url
              .replace(':userId', faker.string.uuid())
              .replace(':groupId', faker.database.mongodbObjectId())
          )
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
          .get(url.replace(':userId', userId).replace(':groupId', groupId))
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
            .get(url.replace(':userId', userId).replace(':groupId', groupId))
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
          .get(
            url
              .replace(':userId', faker.string.uuid())
              .replace(':groupId', faker.database.mongodbObjectId())
          )
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(
            url
              .replace(':userId', faker.string.uuid())
              .replace(':groupId', faker.database.mongodbObjectId())
          )
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
          .get(
            url
              .replace(':userId', faker.string.uuid())
              .replace(':groupId', groupId)
          )
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
            .get(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':groupId', groupId)
            )
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
