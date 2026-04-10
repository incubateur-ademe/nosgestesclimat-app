import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { COOKIE_NAME } from '../../authentication/authentication.service.js'
import {
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
  FETCH_ORGANISATION_PUBLIC_POLL_SIMULATIONS_ROUTE,
} from './fixtures/organisations.fixture.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_ORGANISATION_PUBLIC_POLL_SIMULATIONS_ROUTE

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
    describe('When fetching a public organisation poll simulations', () => {
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
        let pollId: string
        let pollSlug: string

        beforeEach(async () => {
          const { cookie } = await login({ agent })
          const { id: organisationId } = await createOrganisation({
            agent,
            cookie,
          })
          ;({ id: pollId, slug: pollSlug } = await createOrganisationPoll({
            agent,
            cookie,
            organisationId,
          }))
        })

        describe('And he did not participate to the poll', () => {
          test(`Then it returns a ${StatusCodes.OK} response with an empty list`, async () => {
            const response = await agent
              .get(
                url
                  .replace(':pollIdOrSlug', pollId)
                  .replace(':userId', faker.string.uuid())
              )
              .expect(StatusCodes.OK)

            expect(response.body).toEqual([])
          })
        })

        describe('And he did participate to the poll', () => {
          let simulation: Awaited<
            ReturnType<typeof createOrganisationPollSimulation>
          >
          let _simulationPolls: unknown
          let _groups: unknown
          let _situation: unknown
          let _foldedSteps: unknown
          let _actionChoices: unknown
          let userId: string

          beforeEach(async () => {
            ;({
              polls: _simulationPolls,
              groups: _groups,
              situation: _situation,
              foldedSteps: _foldedSteps,
              actionChoices: _actionChoices,
              ...simulation
            } = await createOrganisationPollSimulation({
              agent,
              pollId,
            }))
            ;({
              user: { id: userId },
            } = simulation)
          })

          test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
            const response = await agent
              .get(
                url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
              )
              .expect(StatusCodes.OK)

            expect(response.body).toEqual([simulation])
          })

          describe('And using poll slug', () => {
            test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
              const response = await agent
                .get(
                  url
                    .replace(':pollIdOrSlug', pollSlug)
                    .replace(':userId', userId)
                )
                .expect(StatusCodes.OK)

              expect(response.body).toEqual([simulation])
            })
          })

          describe('And another participant joins', () => {
            let simulation2: Awaited<
              ReturnType<typeof createOrganisationPollSimulation>
            >
            let _user2: unknown
            let _foldedSteps2: unknown
            let _situation2: unknown
            let _actionChoices2: unknown

            beforeEach(async () => {
              ;({
                polls: _simulationPolls,
                groups: _groups,
                user: _user2,
                situation: _situation2,
                foldedSteps: _foldedSteps2,
                actionChoices: _actionChoices2,
                ...simulation2
              } = await createOrganisationPollSimulation({
                agent,
                pollId,
              }))
            })

            test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
              const response = await agent
                .get(
                  url
                    .replace(':pollIdOrSlug', pollId)
                    .replace(':userId', userId)
                )
                .expect(StatusCodes.OK)

              expect(response.body).toEqual(
                expect.arrayContaining([
                  simulation,
                  { ...simulation2, user: { name: null } },
                ])
              )
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
            'Public poll simulations fetch failed',
            databaseError
          )
        })
      })
    })
  })

  describe('And invalid cookie on his organisation space', () => {
    describe('When fetching his organisation public poll simulations', () => {
      describe('And poll does exist', () => {
        let pollId: string

        beforeEach(async () => {
          const { cookie } = await login({ agent })
          const { id: organisationId } = await createOrganisation({
            agent,
            cookie,
          })
          ;({ id: pollId } = await createOrganisationPoll({
            agent,
            cookie,
            organisationId,
          }))
        })

        test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
          const response = await agent
            .get(
              url
                .replace(':pollIdOrSlug', pollId)
                .replace(':userId', faker.string.uuid())
            )
            .set('cookie', `${COOKIE_NAME}=invalid cookie`)
            .expect(StatusCodes.OK)

          expect(response.body).toEqual([])
        })

        describe('And a participant joins', () => {
          beforeEach(async () =>
            createOrganisationPollSimulation({
              agent,
              pollId,
            })
          )

          test.skip(`Then it returns a ${StatusCodes.OK} response with an empty list`, async () => {
            const response = await agent
              .get(
                url
                  .replace(':pollIdOrSlug', pollId)
                  .replace(':userId', faker.string.uuid())
              )
              .set('cookie', `${COOKIE_NAME}=invalid cookie`)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual([])
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

    describe('When fetching his organisation public poll simulations', () => {
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

        test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
          const response = await agent
            .get(
              url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
            )
            .set('cookie', cookie)
            .expect(StatusCodes.OK)

          expect(response.body).toEqual([])
        })

        describe('And using poll slug', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
            const response = await agent
              .get(
                url
                  .replace(':pollIdOrSlug', pollSlug)
                  .replace(':userId', userId)
              )
              .set('cookie', cookie)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual([])
          })
        })

        describe('And participants do their simulation', () => {
          let simulations: Awaited<
            ReturnType<typeof createOrganisationPollSimulation>
          >[]

          beforeEach(async () => {
            simulations = []
            while (simulations.length < 3) {
              const {
                groups: _groups,
                situation: _situation,
                foldedSteps: _foldedSteps,
                actionChoices: _actionChoices,
                ...simulation
              } = await createOrganisationPollSimulation({
                agent,
                pollId,
              })

              simulations.push(simulation)
            }
          })

          test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
            const response = await agent
              .get(
                url
                  .replace(':pollIdOrSlug', pollSlug)
                  .replace(':userId', userId)
              )
              .set('cookie', cookie)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual(
              expect.arrayContaining(
                simulations.map(({ polls: _polls, ...simulation }) => ({
                  ...simulation,
                  user: { name: null },
                }))
              )
            )
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
            'Public poll simulations fetch failed',
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

      describe('And participants do their simulation', () => {
        let simulations: Awaited<
          ReturnType<typeof createOrganisationPollSimulation>
        >[]

        beforeEach(async () => {
          ;({ cookie, userId } = await login({
            agent,
          }))

          simulations = []
          while (simulations.length < 3) {
            const {
              groups: _groups,
              situation: _situation,
              foldedSteps: _foldedSteps,
              actionChoices: _actionChoices,
              ...simulation
            } = await createOrganisationPollSimulation({
              agent,
              pollId,
            })

            simulations.push(simulation)
          }
        })

        test(`Then it returns a ${StatusCodes.OK} response with the simulations list`, async () => {
          const response = await agent
            .get(
              url.replace(':pollIdOrSlug', pollId).replace(':userId', userId)
            )
            .set('cookie', cookie)
            .expect(StatusCodes.OK)

          expect(response.body).toEqual(
            expect.arrayContaining(
              simulations.map(({ polls: _polls, ...simulation }) => ({
                ...simulation,
                user: { name: null },
              }))
            )
          )
        })
      })
    })
  })
})
