import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { getSimulationPayload } from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import {
  createGroup,
  DELETE_USER_GROUP_ROUTE,
  joinGroup,
} from './fixtures/groups.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = DELETE_USER_GROUP_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.groupAdministrator.deleteMany(),
      prisma.groupParticipant.deleteMany(),
    ])
    await Promise.all([prisma.user.deleteMany(), prisma.group.deleteMany()])
  })

  describe('When deleting his group', () => {
    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .delete(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':userId', faker.string.alpha(34))
          )
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And group does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .delete(
            url
              .replace(':userId', faker.string.uuid())
              .replace(':groupId', faker.database.mongodbObjectId())
          )
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And a group does exist', () => {
      let groupId: string
      let administratorId: string

      beforeEach(
        async () =>
          ({
            id: groupId,
            administrator: { id: administratorId },
          } = await createGroup({ agent }))
      )

      test(`Then it returns a ${StatusCodes.NO_CONTENT} response`, async () => {
        await agent
          .delete(
            url.replace(':groupId', groupId).replace(':userId', administratorId)
          )
          .expect(StatusCodes.NO_CONTENT)
      })

      describe('And another participant joined leaving his email', () => {
        let participantUserEmail: string

        beforeEach(
          async () =>
            ({ email: participantUserEmail } = await joinGroup({
              agent,
              groupId,
              participant: {
                email: faker.internet.email(),
              },
            }))
        )

        test('Then it updates group participant in brevo', async () => {
          mswServer.use(
            brevoRemoveFromList(30, {
              expectBody: {
                emails: [participantUserEmail],
              },
            })
          )

          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':userId', administratorId)
            )
            .expect(StatusCodes.NO_CONTENT)

          await EventBus.flush()
        })
      })
    })

    describe('And a group does exist And administrator left his/her email', () => {
      let groupId: string
      let administratorId: string
      let administratorName: string
      let administratorEmail: string

      beforeEach(async () => {
        const simulation = getSimulationPayload()
        ;({
          id: groupId,
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
      })

      test('Then it updates group administrator in brevo', async () => {
        mswServer.use(
          brevoUpdateContact({
            expectBody: {
              email: administratorEmail,
              attributes: {
                USER_ID: administratorId,
                NUMBER_CREATED_GROUPS: 0,
                NUMBER_CREATED_GROUPS_WITH_ONE_PARTICIPANT: 0,
                PRENOM: administratorName,
              },
              updateEnabled: true,
            },
          }),
          brevoRemoveFromList(29, {
            expectBody: {
              emails: [administratorEmail],
            },
          })
        )

        await agent
          .delete(
            url.replace(':groupId', groupId).replace(':userId', administratorId)
          )
          .expect(StatusCodes.NO_CONTENT)

        await EventBus.flush()
      })
    })

    describe('And a group does exist And administrator left his/her email but did not join', () => {
      let groupId: string
      let administratorId: string

      beforeEach(
        async () =>
          ({
            id: groupId,
            administrator: { id: administratorId },
          } = await createGroup({
            agent,
            group: {
              administrator: {
                userId: faker.string.uuid(),
                email: faker.internet.email(),
                name: faker.person.fullName(),
              },
            },
          }))
      )

      test('Then it does not update group administrator in brevo', async () => {
        await agent
          .delete(
            url.replace(':groupId', groupId).replace(':userId', administratorId)
          )
          .expect(StatusCodes.NO_CONTENT)
      })
    })

    describe('And not group administrator', () => {
      let groupId: string
      let userId: string

      beforeEach(async () => {
        userId = faker.string.uuid()
        ;({ id: groupId } = await createGroup({
          agent,
        }))
      })

      test(`Then it returns a ${StatusCodes.NOT_FOUND} response`, async () => {
        await agent
          .delete(url.replace(':userId', userId!).replace(':groupId', groupId!))
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
          .delete(
            url
              .replace(':userId', faker.string.uuid())
              .replace(':groupId', faker.database.mongodbObjectId())
          )
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .delete(
            url
              .replace(':userId', faker.string.uuid())
              .replace(':groupId', faker.database.mongodbObjectId())
          )
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Group delete failed',
          databaseError
        )
      })
    })
  })
})
