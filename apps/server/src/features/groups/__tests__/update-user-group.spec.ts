import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { brevoUpdateContact } from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { getSimulationPayload } from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import type { GroupUpdateDto } from '../groups.validator.js'
import {
  createGroup,
  UPDATE_USER_GROUP_ROUTE,
} from './fixtures/groups.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = UPDATE_USER_GROUP_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.groupAdministrator.deleteMany(),
      prisma.groupParticipant.deleteMany(),
    ])
    await Promise.all([prisma.user.deleteMany(), prisma.group.deleteMany()])
  })

  describe('When updating one of his groups', () => {
    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .put(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':userId', faker.string.alpha(34))
          )
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And group does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .put(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':userId', faker.string.uuid())
          )
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And group does exist', () => {
      let group: Awaited<ReturnType<typeof createGroup>>
      let groupId: string
      let administratorId: string

      beforeEach(async () => {
        group = await createGroup({ agent })
        ;({
          id: groupId,
          administrator: { id: administratorId },
        } = group)
      })

      test(`Then it returns a ${StatusCodes.OK} response with the updated group`, async () => {
        const payload: GroupUpdateDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
        }

        const response = await agent
          .put(
            url.replace(':userId', administratorId).replace(':groupId', groupId)
          )
          .send(payload)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({
          ...group,
          ...payload,
          updatedAt: expect.any(String),
        })
      })

      describe('And no data in the update', () => {
        test(`Then it returns a ${StatusCodes.OK} response with the unchanged group`, async () => {
          const response = await agent
            .put(
              url
                .replace(':userId', administratorId)
                .replace(':groupId', groupId)
            )
            .send({})
            .expect(StatusCodes.OK)

          expect(response.body).toEqual(group)
        })
      })
    })

    describe('And group does exist And administrator left his/her email', () => {
      let group: Awaited<ReturnType<typeof createGroup>>
      let groupId: string
      let groupCreatedAt: string
      let administratorId: string
      let administratorName: string
      let administratorEmail: string

      beforeEach(async () => {
        const simulation = getSimulationPayload()
        group = await createGroup({
          agent,
          group: {
            administrator: {
              userId: faker.string.uuid(),
              email: faker.internet.email(),
              name: faker.person.fullName(),
            },
            participants: [{ simulation }],
          },
        })
        ;({
          id: groupId,
          createdAt: groupCreatedAt,
          administrator: {
            id: administratorId,
            email: administratorEmail,
            name: administratorName,
          },
        } = group)
      })

      test(`Then it returns a ${StatusCodes.OK} response with the updated group`, async () => {
        const payload: GroupUpdateDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
        }

        mswServer.use(brevoUpdateContact())

        const response = await agent
          .put(
            url.replace(':userId', administratorId).replace(':groupId', groupId)
          )
          .send(payload)
          .expect(StatusCodes.OK)

        expect(response.body).toEqual({
          ...group,
          ...payload,
          updatedAt: expect.any(String),
        })
      })

      test('Then it updates group administrator in brevo', async () => {
        const payload: GroupUpdateDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
        }

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
          .put(
            url.replace(':userId', administratorId).replace(':groupId', groupId)
          )
          .send(payload)
          .expect(StatusCodes.OK)

        await EventBus.flush()
      })
    })

    describe('And group does exist And administrator left his/her email but did not join', () => {
      let group: Awaited<ReturnType<typeof createGroup>>
      let groupId: string
      let administratorId: string

      beforeEach(async () => {
        group = await createGroup({
          agent,
          group: {
            administrator: {
              userId: faker.string.uuid(),
              email: faker.internet.email(),
              name: faker.person.fullName(),
            },
          },
        })
        ;({
          id: groupId,
          administrator: { id: administratorId },
        } = group)
      })

      test('Then it does not update group administrator in brevo', async () => {
        const payload: GroupUpdateDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
        }

        await agent
          .put(
            url.replace(':userId', administratorId).replace(':groupId', groupId)
          )
          .send(payload)
          .expect(StatusCodes.OK)
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
          .put(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':userId', faker.string.uuid())
          )
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .put(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':userId', faker.string.uuid())
          )
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Group update failed',
          databaseError
        )
      })
    })
  })

  describe('When trying to update a group of another administrator', () => {
    let groupId: string

    beforeEach(async () => ({ id: groupId } = await createGroup({ agent })))

    test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
      await agent
        .put(
          url
            .replace(':groupId', groupId)
            .replace(':userId', faker.string.uuid())
        )
        .send({
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
        })
        .expect(StatusCodes.NOT_FOUND)
    })
  })
})
