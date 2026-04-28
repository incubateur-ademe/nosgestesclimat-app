import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import logger from '../../../logger.js'
import { getSimulationPayload } from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import {
  createGroup,
  FETCH_USER_GROUPS_ROUTE,
  joinGroup,
} from './fixtures/groups.fixture.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_USER_GROUPS_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.groupAdministrator.deleteMany(),
      prisma.groupParticipant.deleteMany(),
    ])
    await Promise.all([prisma.user.deleteMany(), prisma.group.deleteMany()])
  })

  describe('When fetching his groups', () => {
    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url.replace(':userId', faker.string.alpha(34)))
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And no group does exist', () => {
      test(`Then it returns a ${StatusCodes.OK} response with an empty list`, async () => {
        const response = await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual([])
      })
    })

    describe('And a group does exist', () => {
      let group: Awaited<ReturnType<typeof createGroup>>
      let userId: string

      beforeEach(async () => {
        group = await createGroup({ agent })
        ;({
          administrator: { id: userId },
        } = group)
      })

      test(`Then it returns a ${StatusCodes.OK} response with a list containing the group`, async () => {
        const response = await agent
          .get(url.replace(':userId', userId))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual([group])
      })
    })

    describe('And multiple groups do exist', () => {
      let group1: Awaited<ReturnType<typeof createGroup>>
      let user1Id: string
      let simulationUser1: ReturnType<typeof getSimulationPayload>
      let participant1Group1Id: string
      let participant2Group1Id: string
      let group2: Awaited<ReturnType<typeof createGroup>>
      let user2Id: string
      let simulationUser2: ReturnType<typeof getSimulationPayload>
      let participant1Group2Id: string
      let participant2Group2Id: string

      beforeEach(async () => {
        // User 1 group
        user1Id = faker.string.uuid()
        simulationUser1 = getSimulationPayload()
        group1 = await createGroup({
          agent,
          group: {
            administrator: {
              userId: user1Id,
              name: faker.person.fullName(),
              email: faker.internet.email(),
            },
            participants: [{ simulation: simulationUser1 }],
          },
        })
        ;({
          participants: [{ id: participant1Group1Id }],
        } = group1)

        user2Id = faker.string.uuid()

        // User 2 joins user 1 group
        simulationUser2 = getSimulationPayload()
        ;({ id: participant2Group1Id } = await joinGroup({
          agent,
          groupId: group1.id,
          participant: {
            userId: user2Id,
            simulation: simulationUser2,
          },
        }))

        // User 2 group
        group2 = await createGroup({
          agent,
          group: {
            administrator: {
              userId: user2Id,
              name: faker.person.fullName(),
              email: faker.internet.email(),
            },
            participants: [{ simulation: simulationUser2 }],
          },
        })
        ;({
          participants: [{ id: participant2Group2Id }],
        } = group2)

        // User 1 joins user 2 group
        ;({ id: participant1Group2Id } = await joinGroup({
          agent,
          groupId: group2.id,
          participant: {
            userId: user1Id,
            name: group1.administrator.name,
            simulation: simulationUser1,
          },
        }))
      }, 10000)

      test(`Then it returns a ${StatusCodes.OK} response with a list containing the groups`, async () => {
        const response = await agent
          .get(url.replace(':userId', user1Id))
          .expect(StatusCodes.OK)

        expect(response.body).toEqual([
          {
            id: group1.id,
            name: group1.name,
            emoji: group1.emoji,
            administrator: {
              ...group1.administrator,
              updatedAt: expect.any(String),
            },
            participants: [
              {
                ...group1.administrator,
                id: participant1Group1Id,
                userId: group1.administrator.id,
                simulation: {
                  ...simulationUser1,
                  date: expect.any(String),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  polls: [],
                  foldedSteps: [],
                  actionChoices: {},
                  additionalQuestionsAnswers: [],
                },
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
              {
                id: participant2Group1Id,
                name: group2.administrator.name,
                simulation: {
                  ...simulationUser2,
                  date: expect.any(String),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  polls: [],
                  foldedSteps: [],
                  actionChoices: {},
                  additionalQuestionsAnswers: [],
                },
              },
            ],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          {
            id: group2.id,
            name: group2.name,
            emoji: group2.emoji,
            administrator: {
              name: group2.administrator.name,
            },
            participants: [
              {
                id: participant2Group2Id,
                name: group2.administrator.name,
                simulation: {
                  ...simulationUser2,
                  date: expect.any(String),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  polls: [],
                  foldedSteps: [],
                  actionChoices: {},
                  additionalQuestionsAnswers: [],
                },
              },
              {
                ...group1.administrator,
                id: participant1Group2Id,
                userId: group1.administrator.id,
                simulation: {
                  ...simulationUser1,
                  date: expect.any(String),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  polls: [],
                  foldedSteps: [],
                  actionChoices: {},
                  additionalQuestionsAnswers: [],
                },
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
            ],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ])
      })

      describe('And filtering the list by groupIds', () => {
        test(`Then it returns a ${StatusCodes.OK} response with a list containing the filtered groups`, async () => {
          const response = await agent
            .get(url.replace(':userId', user1Id))
            .query({
              'groupIds[]': [group1.id],
            })
            .expect(StatusCodes.OK)

          expect(response.body).toEqual([
            {
              id: group1.id,
              name: group1.name,
              emoji: group1.emoji,
              administrator: {
                ...group1.administrator,
                updatedAt: expect.any(String),
              },
              participants: [
                {
                  ...group1.administrator,
                  id: participant1Group1Id,
                  userId: group1.administrator.id,
                  simulation: {
                    ...simulationUser1,
                    date: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    polls: [],
                    foldedSteps: [],
                    actionChoices: {},
                    additionalQuestionsAnswers: [],
                  },
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                },
                {
                  id: participant2Group1Id,
                  name: group2.administrator.name,
                  simulation: {
                    ...simulationUser2,
                    date: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    polls: [],
                    foldedSteps: [],
                    actionChoices: {},
                    additionalQuestionsAnswers: [],
                  },
                },
              ],
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ])
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
          .get(url.replace(':userId', faker.string.uuid()))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(url.replace(':userId', faker.string.uuid()))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Groups fetch failed',
          databaseError
        )
      })
    })
  })
})
