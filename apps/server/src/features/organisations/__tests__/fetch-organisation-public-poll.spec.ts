import { faker } from '@faker-js/faker'
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { deepMergeSubstract, deepMergeSum } from '../../../core/deep-merge.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { COOKIE_NAME } from '../../authentication/authentication.service.js'
import type { ComputedResultSchema } from '../../simulations/simulations.validator.js'
import {
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
  FETCH_ORGANISATION_PUBLIC_POLL_ROUTE,
} from './fixtures/organisations.fixture.js'

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

  describe('And logged out', () => {
    describe('When fetching a public organisation poll', () => {
      describe('And invalid userId', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .get(
              url
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
                .replace(':userId', faker.string.alpha(34))
            )
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And poll does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .get(
              url
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
                .replace(':userId', faker.string.uuid())
            )
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And poll does exist', () => {
        let organisationId: string
        let organisationName: string
        let organisationSlug: string
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
        let pollId: string
        let pollSlug: string

        beforeEach(async () => {
          const { cookie } = await login({ agent })
          ;({
            id: organisationId,
            slug: organisationSlug,
            name: organisationName,
          } = await createOrganisation({
            agent,
            cookie,
          }))
          poll = await createOrganisationPoll({
            agent,
            cookie,
            organisationId,
          })
          ;({ id: pollId, slug: pollSlug } = poll)
        })

        describe('And he did not participate to the poll', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the poll data`, async () => {
            const response = await agent
              .get(
                url
                  .replace(':pollIdOrSlug', pollId)
                  .replace(':userId', faker.string.uuid())
              )
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

        describe('And he did participate to the poll', () => {
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
              .get(
                url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
              )
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
                .get(
                  url
                    .replace(':pollIdOrSlug', pollSlug)
                    .replace(':userId', userId)
                )
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
            .get(
              url
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
                .replace(':userId', faker.string.uuid())
            )
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(
              url
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
                .replace(':userId', faker.string.uuid())
            )
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Public poll fetch failed',
            databaseError
          )
        })
      })
    })
  })

  describe('And invalid cookie on his organisation space', () => {
    describe('When fetching his organisation public poll', () => {
      describe('And poll does exist', () => {
        let userId: string
        let organisationId: string
        let organisationName: string
        let organisationSlug: string
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
        let pollId: string

        beforeEach(async () => {
          let cookie: string
          ;({ cookie, userId } = await login({ agent }))
          ;({
            id: organisationId,
            slug: organisationSlug,
            name: organisationName,
          } = await createOrganisation({
            agent,
            cookie,
          }))
          poll = await createOrganisationPoll({
            agent,
            cookie,
            organisationId,
          })
          ;({ id: pollId } = poll)
        })

        test(`Then it returns a ${StatusCodes.OK} response with the public poll data`, async () => {
          const response = await agent
            .get(
              url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
            )
            .set('cookie', `${COOKIE_NAME}=invalid cookie`)
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
    })
  })

  describe('And logged in on his organisation space', () => {
    let cookie: string
    let userId: string

    beforeEach(async () => {
      ;({ cookie, userId } = await login({ agent }))
    })

    describe('When fetching his organisation public poll', () => {
      describe('And poll does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .get(
              url
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
                .replace(':userId', userId)
            )
            .set('cookie', cookie)
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
            cookie,
          })
          const { id: organisationId } = organisation
          poll = await createOrganisationPoll({
            agent,
            cookie,
            organisationId,
          })
          ;({ id: pollId, slug: pollSlug } = poll)
        })

        test(`Then it returns a ${StatusCodes.OK} response with the private poll data`, async () => {
          const response = await agent
            .get(
              url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
            )
            .set('cookie', cookie)
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
              .get(
                url
                  .replace(':pollIdOrSlug', pollSlug)
                  .replace(':userId', userId)
              )
              .set('cookie', cookie)
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
              .get(
                url
                  .replace(':pollIdOrSlug', pollSlug)
                  .replace(':userId', userId)
              )
              .set('cookie', cookie)
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

          describe('And trying to access user information', () => {
            test.skip(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
              const [
                {
                  user: { id },
                },
              ] = simulations

              await agent
                .get(
                  url.replace(':pollIdOrSlug', pollId).replace(':userId', id)
                )
                .set('cookie', cookie)
                .expect(StatusCodes.FORBIDDEN)
            })
          })
        })
      })

      describe('And fetching another administrator poll', () => {
        let organisation: Awaited<ReturnType<typeof createOrganisation>>
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
        let pollId: string
        let pollSlug: string

        beforeEach(async () => {
          const { cookie } = await login({ agent })

          organisation = await createOrganisation({
            agent,
            cookie,
          })
          const { id: organisationId } = organisation
          poll = await createOrganisationPoll({
            agent,
            cookie,
            organisationId,
          })
          ;({ id: pollId, slug: pollSlug } = poll)
        })

        test(`Then it returns a ${StatusCodes.OK} response with the public poll data`, async () => {
          const response = await agent
            .get(
              url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
            )
            .set('cookie', cookie)
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
              .get(
                url
                  .replace(':pollIdOrSlug', pollSlug)
                  .replace(':userId', userId)
              )
              .set('cookie', cookie)
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
            .get(
              url
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
                .replace(':userId', userId)
            )
            .set('cookie', cookie)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(
              url
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
                .replace(':userId', userId)
            )
            .set('cookie', cookie)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Public poll fetch failed',
            databaseError
          )
        })
      })
    })
  })

  describe('And logged in on his organisation space with a different userId', () => {
    let cookie: string
    let userId: string

    describe('And poll does exist', () => {
      let organisation: Awaited<ReturnType<typeof createOrganisation>>
      let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
      let pollId: string

      beforeEach(async () => {
        ;({ cookie, userId } = await login({ agent }))

        organisation = await createOrganisation({
          agent,
          cookie,
        })
        const { id: organisationId } = organisation
        poll = await createOrganisationPoll({
          agent,
          cookie,
          organisationId,
        })
        ;({ id: pollId } = poll)
      })

      describe('When fetching his organisation public poll', () => {
        test(`Then it returns a ${StatusCodes.OK} response with the public poll data`, async () => {
          const response = await agent
            .get(
              url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
            )
            .set('cookie', cookie)
            .expect(StatusCodes.OK)

          const {
            organisation: {
              administrators: [administrator],
            },
          } = poll

          expect(response.body).toEqual({
            ...poll,
            organisation: {
              ...poll.organisation,
              administrators: [
                {
                  ...administrator,
                  userId,
                  updatedAt: expect.any(String),
                },
              ],
            },
          })
        })
      })
    })
  })
})
