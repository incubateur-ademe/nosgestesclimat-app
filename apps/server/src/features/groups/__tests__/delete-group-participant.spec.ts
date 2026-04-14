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
  DELETE_PARTICIPANT_ROUTE,
  joinGroup,
} from './fixtures/groups.fixture.js'

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

  describe("When trying to leave another administrator's group", () => {
    describe('And group does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .delete(
            url
              .replace(':groupId', faker.database.mongodbObjectId())
              .replace(':participantId', faker.string.uuid())
              .replace(':userId', faker.string.uuid())
          )
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And group does exist', () => {
      let groupId: string

      beforeEach(async () => ({ id: groupId } = await createGroup({ agent })))

      describe('And invalid user id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':participantId', faker.string.uuid())
                .replace(':userId', faker.string.alpha(34))
            )
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid participant id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':participantId', faker.string.alpha(34))
                .replace(':userId', faker.string.uuid())
            )
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And he did not join', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':participantId', faker.string.uuid())
                .replace(':userId', faker.string.uuid())
            )
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And he did join', () => {
        let participantId: string
        let userId: string

        beforeEach(
          async () =>
            ({ id: participantId, userId } = await joinGroup({
              agent,
              groupId,
            }))
        )

        test(`Then it returns a ${StatusCodes.NO_CONTENT} response`, async () => {
          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':participantId', participantId)
                .replace(':userId', userId)
            )
            .expect(StatusCodes.NO_CONTENT)
        })

        describe('And database failure', () => {
          const databaseError = new Error('Something went wrong')

          beforeEach(() => {
            vi.spyOn(
              prismaTransactionAdapter,
              'transaction'
            ).mockRejectedValueOnce(databaseError)
          })

          afterEach(() => {
            vi.spyOn(prismaTransactionAdapter, 'transaction').mockRestore()
          })

          test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} error`, async () => {
            await agent
              .delete(
                url
                  .replace(':groupId', faker.database.mongodbObjectId())
                  .replace(':participantId', faker.string.uuid())
                  .replace(':userId', faker.string.uuid())
              )
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)
          })

          test('Then it logs the exception', async () => {
            await agent
              .delete(
                url
                  .replace(':groupId', faker.database.mongodbObjectId())
                  .replace(':participantId', faker.string.uuid())
                  .replace(':userId', faker.string.uuid())
              )
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)

            expect(logger.error).toHaveBeenCalledWith(
              'Participant deletion failed',
              databaseError
            )
          })
        })
      })

      describe('And he did join leaving his/her email', () => {
        let participantId: string
        let userId: string
        let participantUserEmail: string

        beforeEach(
          async () =>
            ({
              id: participantId,
              userId,
              email: participantUserEmail,
            } = await joinGroup({
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
                .replace(':participantId', participantId)
                .replace(':userId', userId)
            )
            .expect(StatusCodes.NO_CONTENT)

          await EventBus.flush()
        })
      })
    })

    describe('And group does exist And administrator left his/her email', () => {
      let groupId: string
      let groupCreatedAt: string
      let administratorId: string
      let administratorName: string
      let administratorEmail: string

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
      })

      describe('And he did join', () => {
        let participantId: string
        let userId: string

        beforeEach(
          async () =>
            ({ id: participantId, userId } = await joinGroup({
              agent,
              groupId,
            }))
        )

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
                .replace(':userId', userId)
            )
            .expect(StatusCodes.NO_CONTENT)

          await EventBus.flush()
        })
      })
    })

    describe('And group does exist And administrator left his/her email but did not join', () => {
      let groupId: string

      beforeEach(
        async () =>
          ({ id: groupId } = await createGroup({
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

      describe('And he did join', () => {
        let participantId: string
        let userId: string

        beforeEach(
          async () =>
            ({ id: participantId, userId } = await joinGroup({
              agent,
              groupId,
            }))
        )

        test('Then it updates group administrator in brevo', async () => {
          await agent
            .delete(
              url
                .replace(':groupId', groupId)
                .replace(':participantId', participantId)
                .replace(':userId', userId)
            )
            .expect(StatusCodes.NO_CONTENT)
        })
      })
    })
  })

  describe("When trying to remove another participant from another administrator's group", () => {
    let userId: string
    let groupId: string
    let participantId: string

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
      ;({ userId } = await joinGroup({ agent, groupId }))
    })

    test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
      const response = await agent
        .delete(
          url
            .replace(':groupId', groupId)
            .replace(':participantId', participantId)
            .replace(':userId', userId)
        )
        .expect(StatusCodes.FORBIDDEN)

      expect(response.text).toEqual(
        'Forbidden ! You cannot remove other participants from this group.'
      )
    })
  })

  describe('When trying to leave his own group', () => {
    let userId: string
    let groupId: string
    let participantId: string

    beforeEach(
      async () =>
        ({
          id: groupId,
          participants: [{ id: participantId, userId }],
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
            .replace(':userId', userId)
        )
        .expect(StatusCodes.FORBIDDEN)

      expect(response.text).toEqual(
        'Forbidden ! Administrator cannot leave group, delete it instead.'
      )
    })
  })

  describe('When trying to remove participants from his own group', () => {
    let userId: string
    let groupId: string
    let participantId: string

    beforeEach(async () => {
      ;({
        id: groupId,
        administrator: { id: userId },
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
            .replace(':userId', userId)
        )
        .expect(StatusCodes.NO_CONTENT)
    })
  })
})
