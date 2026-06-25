import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { brevoUpdateContact } from '../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../core/event-bus/event-bus.ts'
import logger from '../../../logger.ts'
import { getSimulationPayload } from '../../simulations/__tests__/fixtures/simulations.fixtures.ts'
import {
  createGroup,
  DELETE_PARTICIPANT_ROUTE,
  joinGroup,
} from './fixtures/groups.fixture.ts'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = DELETE_PARTICIPANT_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.groupAdministrator.deleteMany(),
      prisma.groupParticipant.deleteMany(),
    ])
    await Promise.all([prisma.user.deleteMany(), prisma.group.deleteMany()])
  })

  describe('When removing a participant', () => {
    describe('And no authentication', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .delete(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':participantId', faker.string.uuid())
          )
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And group does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .delete(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':participantId', faker.string.uuid())
          )
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And group does exist', () => {
      let groupId: string

      beforeEach(async () => ({ id: groupId } = await createGroup({ agent })))

      describe('And invalid participant id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':participantId', faker.string.alpha(34))
            )
            .set(authHeaders({ userId: faker.string.uuid() }))
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And participant did not join', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':participantId', faker.string.uuid())
            )
            .set(authHeaders({ userId: faker.string.uuid() }))
            .expect(StatusCodes.NOT_FOUND)
        })
      })
    })
  })

  describe('When leaving a group they joined', () => {
    let groupId: string
    let participantId: string
    let participantUserId: string

    beforeEach(async () => {
      ;({ id: groupId } = await createGroup({ agent }))
      ;({ id: participantId, userId: participantUserId } = await joinGroup({
        agent,
        groupId,
      }))
    })

    test(`Then it returns a ${StatusCodes.NO_CONTENT} response`, async () => {
      await agent
        .delete(
          url
            .replace(':groupId', groupId)
            .replace(':participantId', participantId)
        )
        .set(authHeaders({ userId: participantUserId }))
        .expect(StatusCodes.NO_CONTENT)
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
          .delete(
            url
              .replace(':groupId', groupId)
              .replace(':participantId', participantId)
          )
          .set(authHeaders({ userId: participantUserId }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .delete(
            url
              .replace(':groupId', groupId)
              .replace(':participantId', participantId)
          )
          .set(authHeaders({ userId: participantUserId }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Participant deletion failed',
          databaseError
        )
      })
    })
  })

  describe('When the administrator removes a participant from their own group', () => {
    let groupId: string
    let administratorId: string
    let participantId: string

    beforeEach(async () => {
      ;({
        id: groupId,
        administrator: { id: administratorId },
      } = await createGroup({
        agent,
        group: {
          participants: [
            {
              simulation: getSimulationPayload(),
            },
          ],
        },
      }))
      ;({ id: participantId } = await joinGroup({ agent, groupId }))
    })

    test(`Then it returns a ${StatusCodes.NO_CONTENT} response`, async () => {
      await agent
        .delete(
          url
            .replace(':groupId', groupId)
            .replace(':participantId', participantId)
        )
        .set(authHeaders({ userId: administratorId }))
        .expect(StatusCodes.NO_CONTENT)
    })
  })

  describe('When the administrator left their email', () => {
    let groupId: string
    let groupCreatedAt: string
    let administratorId: string
    let administratorName: string
    let administratorEmail: string
    let participantId: string

    beforeEach(async () => {
      const simulation = getSimulationPayload()
      ;({
        id: groupId,
        createdAt: groupCreatedAt,
        administrator: {
          id: administratorId,
          email: administratorEmail,
          name: administratorName,
        },
      } = await createGroup({
        agent,
        group: {
          administrator: {
            userId: faker.string.uuid(),
            email: faker.internet.email(),
            name: faker.person.fullName(),
          },
          participants: [{ simulation }],
        },
      }))
      ;({ id: participantId } = await joinGroup({ agent, groupId }))
    })

    test('Then it updates group administrator in brevo', async () => {
      mswServer.use(
        brevoUpdateContact({
          expectBody: {
            email: administratorEmail,
            listIds: [29],
            attributes: {
              USER_ID: administratorId,
              NUMBER_CREATED_GROUPS: 1,
              LAST_GROUP_CREATION_DATE: groupCreatedAt,
              NUMBER_CREATED_GROUPS_WITH_ONE_PARTICIPANT: 1,
              PRENOM: administratorName,
            },
            updateEnabled: true,
          },
        })
      )

      await agent
        .delete(
          url
            .replace(':groupId', groupId)
            .replace(':participantId', participantId)
        )
        .set(
          authHeaders({ userId: administratorId, email: administratorEmail })
        )
        .expect(StatusCodes.NO_CONTENT)

      await EventBus.flush()
    })
  })

  describe('When the administrator tries to leave their own group', () => {
    let groupId: string
    let administratorId: string
    let participantId: string

    beforeEach(
      async () =>
        ({
          id: groupId,
          administrator: { id: administratorId },
          participants: [{ id: participantId }],
        } = await createGroup({
          agent,
          group: {
            participants: [
              {
                simulation: getSimulationPayload(),
              },
            ],
          },
        }))
    )

    test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
      const response = await agent
        .delete(
          url
            .replace(':groupId', groupId)
            .replace(':participantId', participantId)
        )
        .set(authHeaders({ userId: administratorId }))
        .expect(StatusCodes.FORBIDDEN)

      expect(response.text).toEqual(
        'Forbidden ! Administrator cannot leave group, delete it instead.'
      )
    })
  })

  describe('When a participant tries to remove another participant', () => {
    let groupId: string
    let participantId: string
    let otherParticipantUserId: string

    beforeEach(async () => {
      ;({
        id: groupId,
        participants: [{ id: participantId }],
      } = await createGroup({
        agent,
        group: {
          participants: [
            {
              simulation: getSimulationPayload(),
            },
          ],
        },
      }))
      ;({ userId: otherParticipantUserId } = await joinGroup({
        agent,
        groupId,
      }))
    })

    test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
      const response = await agent
        .delete(
          url
            .replace(':groupId', groupId)
            .replace(':participantId', participantId)
        )
        .set(authHeaders({ userId: otherParticipantUserId }))
        .expect(StatusCodes.FORBIDDEN)

      expect(response.text).toEqual(
        'Forbidden ! You cannot remove other participants from this group.'
      )
    })
  })

  describe('When trying to remove a participant from another group', () => {
    let otherGroupId: string
    let participantId: string
    let administratorId: string

    beforeEach(async () => {
      // A group the connected user administrates
      ;({
        administrator: { id: administratorId },
      } = await createGroup({ agent }))

      // Another group, with a participant the connected user must not reach
      ;({ id: otherGroupId } = await createGroup({ agent }))
      ;({ id: participantId } = await joinGroup({
        agent,
        groupId: otherGroupId,
      }))
    })

    test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
      const response = await agent
        .delete(
          url
            .replace(':groupId', otherGroupId)
            .replace(':participantId', participantId)
        )
        .set(authHeaders({ userId: administratorId }))
        .expect(StatusCodes.FORBIDDEN)

      expect(response.text).toEqual(
        'Forbidden ! You cannot remove other participants from this group.'
      )
    })
  })
})
