import { faker } from '@faker-js/faker'
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { deepMergeSubstract, deepMergeSum } from '../../../core/deep-merge.ts'
import logger from '../../../logger.ts'
import type { ComputedResultSchema } from '../../simulations/simulations.validator.ts'
import {
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
  FETCH_ORGANISATION_PUBLIC_POLL_ROUTE,
} from './fixtures/organisations.fixture.ts'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_ORGANISATION_PUBLIC_POLL_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.organisationAdministrator.deleteMany(),
      prisma.simulationPoll.deleteMany(),
    ])
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When fetching a public organisation poll', () => {
    describe('And no authentication', () => {
      test(`Then it does not block the request and returns a ${StatusCodes.NOT_FOUND} error for an unknown poll`, async () => {
        await agent
          .get(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And poll does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .get(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
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
          .get(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Public poll fetch failed',
          databaseError
        )
      })
    })
  })

  describe('And not an administrator of the organisation', () => {
    let organisationId: string
    let organisationName: string
    let organisationSlug: string
    let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
    let pollId: string
    let pollSlug: string

    beforeEach(async () => {
      const administratorUserId = faker.string.uuid()
      const administratorEmail = faker.internet.email()
      ;({
        id: organisationId,
        slug: organisationSlug,
        name: organisationName,
      } = await createOrganisation({
        agent,
        userId: administratorUserId,
        email: administratorEmail,
      }))
      poll = await createOrganisationPoll({
        agent,
        userId: administratorUserId,
        email: administratorEmail,
        organisationId,
      })
      ;({ id: pollId, slug: pollSlug } = poll)
    })

    describe('When fetching the public organisation poll', () => {
      describe('And the user did not participate to the poll', () => {
        test(`Then it returns a ${StatusCodes.OK} response with the public poll data`, async () => {
          const response = await agent
            .get(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId: faker.string.uuid() }))
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            ...poll,
            organisation: {
              id: organisationId,
              slug: organisationSlug,
              name: organisationName,
            },
          })
        })
      })

      describe('And the user is not authenticated', () => {
        test(`Then it returns a ${StatusCodes.OK} response with the public poll data`, async () => {
          const response = await agent
            .get(url.replace(':pollIdOrSlug', pollId))
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            ...poll,
            organisation: {
              id: organisationId,
              slug: organisationSlug,
              name: organisationName,
            },
          })
        })
      })

      describe('And the user did participate to the poll', () => {
        let computedResults: ComputedResultSchema
        let userId: string

        beforeEach(async () => {
          ;({
            computedResults,
            user: { id: userId },
          } = await createOrganisationPollSimulation({
            agent,
            pollId,
          }))
        })

        test(`Then it returns a ${StatusCodes.OK} response with the poll data`, async () => {
          const response = await agent
            .get(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId }))
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            ...poll,
            organisation: {
              id: organisationId,
              slug: organisationSlug,
              name: organisationName,
            },
            simulations: {
              count: 1,
              finished: 1,
              hasParticipated: true,
            },
            progression: 1,
            computedResults,
            userComputedResults: computedResults,
            otherComputedResults: deepMergeSubstract(
              computedResults,
              computedResults
            ),
            funFacts: Object.fromEntries(
              Object.entries(modelFunFacts).map(([k]) => [
                k,
                expect.any(Number),
              ])
            ),
            updatedAt: expect.any(String),
          })
        })

        describe('And using poll slug', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the poll data`, async () => {
            const response = await agent
              .get(url.replace(':pollIdOrSlug', pollSlug))
              .set(authHeaders({ userId }))
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              ...poll,
              organisation: {
                id: organisationId,
                slug: organisationSlug,
                name: organisationName,
              },
              simulations: {
                count: 1,
                finished: 1,
                hasParticipated: true,
              },
              progression: 1,
              computedResults,
              userComputedResults: computedResults,
              otherComputedResults: deepMergeSubstract(
                computedResults,
                computedResults
              ),
              funFacts: Object.fromEntries(
                Object.entries(modelFunFacts).map(([k]) => [
                  k,
                  expect.any(Number),
                ])
              ),
              updatedAt: expect.any(String),
            })
          })
        })

        describe('And another user fetches the poll', () => {
          test(`Then it does not expose the participant computed results`, async () => {
            const response = await agent
              .get(url.replace(':pollIdOrSlug', pollId))
              .set(authHeaders({ userId: faker.string.uuid() }))
              .expect(StatusCodes.OK)

            expect(response.body.simulations).toEqual({
              count: 1,
              finished: 1,
              hasParticipated: false,
            })
            expect(response.body.userComputedResults).toBeUndefined()
          })
        })
      })
    })
  })

  describe('And the administrator of the organisation', () => {
    let userId: string
    let email: string

    beforeEach(() => {
      userId = faker.string.uuid()
      email = faker.internet.email()
    })

    describe('When fetching his organisation public poll', () => {
      describe('And poll does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .get(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And poll does exist', () => {
        let organisation: Awaited<ReturnType<typeof createOrganisation>>
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
        let pollId: string
        let pollSlug: string

        beforeEach(async () => {
          organisation = await createOrganisation({
            agent,
            userId,
            email,
          })
          const { id: organisationId } = organisation
          poll = await createOrganisationPoll({
            agent,
            userId,
            email,
            organisationId,
          })
          ;({ id: pollId, slug: pollSlug } = poll)
        })

        test(`Then it returns a ${StatusCodes.OK} response with the private poll data`, async () => {
          const response = await agent
            .get(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.OK)

          const { polls: _, ...expectedOrganisation } = organisation

          expect(response.body).toEqual({
            ...poll,
            organisation: expectedOrganisation,
          })
        })

        describe('And using poll slug', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the private poll data`, async () => {
            const response = await agent
              .get(url.replace(':pollIdOrSlug', pollSlug))
              .set(authHeaders({ userId, email }))
              .expect(StatusCodes.OK)

            const { polls: _, ...expectedOrganisation } = organisation

            expect(response.body).toEqual({
              ...poll,
              organisation: expectedOrganisation,
            })
          })
        })

        describe('And participants do their simulation', () => {
          let simulations: Awaited<
            ReturnType<typeof createOrganisationPollSimulation>
          >[]

          beforeEach(async () => {
            simulations = []
            while (simulations.length < 3) {
              simulations.push(
                await createOrganisationPollSimulation({
                  agent,
                  pollId,
                })
              )
            }
          })

          test(`Then it returns a ${StatusCodes.OK} response with the private poll data`, async () => {
            const response = await agent
              .get(url.replace(':pollIdOrSlug', pollSlug))
              .set(authHeaders({ userId, email }))
              .expect(StatusCodes.OK)

            const { polls: _, ...expectedOrganisation } = organisation

            expect(response.body).toEqual({
              ...poll,
              organisation: expectedOrganisation,
              simulations: {
                count: 3,
                finished: 3,
                hasParticipated: false,
              },
              computedResults: simulations.reduce(
                (acc, { computedResults }) =>
                  deepMergeSum(acc, computedResults),
                {}
              ),
              funFacts: Object.fromEntries(
                Object.entries(modelFunFacts).map(([k]) => [
                  k,
                  expect.any(Number),
                ])
              ),
              updatedAt: expect.any(String),
            })
          })
        })
      })

      describe('And fetching another administrator poll', () => {
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
        let pollId: string
        let pollSlug: string
        let organisation: Awaited<ReturnType<typeof createOrganisation>>

        beforeEach(async () => {
          const otherUserId = faker.string.uuid()
          const otherEmail = faker.internet.email()

          organisation = await createOrganisation({
            agent,
            userId: otherUserId,
            email: otherEmail,
          })
          const { id: organisationId } = organisation
          poll = await createOrganisationPoll({
            agent,
            userId: otherUserId,
            email: otherEmail,
            organisationId,
          })
          ;({ id: pollId, slug: pollSlug } = poll)
        })

        test(`Then it returns a ${StatusCodes.OK} response with the public poll data`, async () => {
          const response = await agent
            .get(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            ...poll,
            organisation: {
              id: organisation.id,
              name: organisation.name,
              slug: organisation.slug,
            },
          })
        })

        describe('And using poll slug', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the public poll data`, async () => {
            const response = await agent
              .get(url.replace(':pollIdOrSlug', pollSlug))
              .set(authHeaders({ userId, email }))
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              ...poll,
              organisation: {
                id: organisation.id,
                name: organisation.name,
                slug: organisation.slug,
              },
            })
          })
        })
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
            .get(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Public poll fetch failed',
            databaseError
          )
        })
      })
    })
  })
})
