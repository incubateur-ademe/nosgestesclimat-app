import { faker } from '@faker-js/faker'
import modelPackage from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import {
  PollDefaultAdditionalQuestionType,
  SimulationAdditionalQuestionAnswerType,
} from '../../../adapters/prisma/generated.ts'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../core/event-bus/event-bus.ts'
import { Locales } from '../../../core/i18n/constant.ts'
import logger from '../../../logger.ts'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.ts'
import {
  CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE,
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
} from '../../organisations/__tests__/fixtures/organisations.fixture.ts'
import type { SimulationCreateInputDto } from '../simulations.validator.ts'
import { getRandomTestCase } from './fixtures/simulations.fixtures.ts'

const defaultModelVersion = modelPackage.version
  .match(/^(\d+\.\d+\.\d+)/)!
  .pop()
const model = `FR-fr-${defaultModelVersion}`

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE
  const { computedResults, situation, extendedSituation } = getRandomTestCase()

  afterEach(async () => {
    await EventBus.flush()
    await Promise.all([
      prisma.organisationAdministrator.deleteMany(),
      prisma.simulationPoll.deleteMany(),
      prisma.simulation.deleteMany(),
    ])
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When creating a simulation in a poll', () => {
    describe('And no authentication headers', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And no data provided', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid simulation id', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.database.mongodbObjectId(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid situation', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation: null,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid computedResults', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults: null,
            extendedSituation,
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And poll does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And poll does exist', () => {
      let organisationName: string
      let organisationSlug: string
      let organisationType: string
      let administratorEmail: string
      let administratorId: string
      let userId: string
      let pollId: string
      let pollSlug: string

      beforeEach(async () => {
        const adminUserId = faker.string.uuid()
        const adminEmail = faker.internet.email()
        let organisationId: string
        ;({
          id: organisationId,
          name: organisationName,
          slug: organisationSlug,
          type: organisationType,
          administrators: [
            { userId: administratorId, email: administratorEmail },
          ],
        } = await createOrganisation({
          agent,
          userId: adminUserId,
          email: adminEmail,
        }))

        const poll = await createOrganisationPoll({
          agent,
          userId: adminUserId,
          email: adminEmail,
          organisationId,
        })
        ;({ id: pollId, slug: pollSlug } = poll)
        userId = faker.string.uuid()
      })

      test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
        const expected = {
          id: faker.string.uuid(),
          model,
          situation,
          progression: 1,
          computedResults,
        }

        const payload: SimulationCreateInputDto = {
          ...expected,
          extendedSituation,
        }
        mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

        const response = await agent
          .post(url.replace(':pollIdOrSlug', pollId))
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        expect(response.body).toEqual({
          ...expected,
          date: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          actionChoices: {},
          additionalQuestionsAnswers: [],
          foldedSteps: [],
          polls: [
            {
              id: pollId,
              slug: pollSlug,
            },
          ],
          groups: [],
          user: {
            id: userId,
            email: null,
            name: null,
            ageRange: null,
          },
        })
      })

      test('Then it stores a simulation in database', async () => {
        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          date: new Date(),
          model,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
          actionChoices: {
            myAction: true,
          },
          foldedSteps: [],
          additionalQuestionsAnswers: [
            {
              type: SimulationAdditionalQuestionAnswerType.custom,
              key: 'myKey',
              answer: 'myAnswer',
            },
            {
              type: SimulationAdditionalQuestionAnswerType.default,
              key: PollDefaultAdditionalQuestionType.postalCode,
              answer: '00001',
            },
          ],
        }
        mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))
        const {
          body: { id },
        } = await agent
          .post(url.replace(':pollIdOrSlug', pollId))
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
        const createdSimulation = await prisma.simulation.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            date: true,
            model: true,
            situation: true,
            foldedSteps: true,
            progression: true,
            actionChoices: true,
            computedResults: true,
            extendedSituation: true,
            additionalQuestionsAnswers: {
              select: {
                key: true,
                answer: true,
                type: true,
              },
            },
            polls: {
              select: {
                pollId: true,
                poll: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
            states: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        })

        expect(createdSimulation).toEqual({
          ...payload,
          createdAt: expect.any(Date),
          date: expect.any(Date),
          updatedAt: expect.any(Date),
          polls: [
            {
              pollId,
              poll: {
                slug: pollSlug,
              },
            },
          ],
          states: [
            {
              id: expect.any(String),
              date: expect.any(Date),
              simulationId: id,
              progression: 1,
            },
          ],
          user: {
            id: userId,
            name: null,
            email: null,
          },
        })
      })

      test('Then it updates organisation administrator in brevo', async () => {
        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
        }
        mswServer.use(
          brevoUpdateContact({
            expectBody: {
              email: administratorEmail,
              attributes: {
                USER_ID: administratorId,
                IS_ORGANISATION_ADMIN: true,
                ORGANISATION_NAME: organisationName,
                ORGANISATION_SLUG: organisationSlug,
                OPT_IN: false,
                ORGANISATION_TYPE: organisationType,
              },
              updateEnabled: true,
            },
          }),
          brevoRemoveFromList(27, {
            expectBody: {
              emails: [administratorEmail],
            },
          })
        )

        await agent
          .post(url.replace(':pollIdOrSlug', pollId))
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
      })

      test('Then it updates poll fun facts', async () => {
        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
        }

        mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

        await agent
          .post(url.replace(':pollIdOrSlug', pollId))
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        const { funFacts } = await prisma.poll.findUniqueOrThrow({
          where: {
            id: pollId,
          },
          select: {
            funFacts: true,
          },
        })

        expect(funFacts).toEqual(
          Object.fromEntries(
            Object.entries(modelFunFacts).map(([k]) => [k, expect.any(Number)])
          )
        )
      })

      test('Then it does not update poll fun facts if simulation is incomplete', async () => {
        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          situation,
          progression: 0.5,
          computedResults,
          extendedSituation,
        }

        mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

        await agent
          .post(url.replace(':pollIdOrSlug', pollId))
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()

        const { funFacts } = await prisma.poll.findUniqueOrThrow({
          where: {
            id: pollId,
          },
          select: {
            funFacts: true,
          },
        })

        expect(funFacts).toBeNull()
      })

      describe('And using poll slug', () => {
        test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
          const expected = {
            id: faker.string.uuid(),
            model,
            situation,
            progression: 1,
            computedResults,
          }

          const payload: SimulationCreateInputDto = {
            ...expected,
            extendedSituation,
          }

          mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

          const response = await agent
            .post(url.replace(':pollIdOrSlug', pollSlug))
            .set(authHeaders({ userId }))
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()

          expect(response.body).toEqual({
            ...expected,
            date: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            actionChoices: {},
            additionalQuestionsAnswers: [],
            foldedSteps: [],
            polls: [
              {
                id: pollId,
                slug: pollSlug,
              },
            ],
            groups: [],
            user: {
              id: userId,
              email: null,
              name: null,
              ageRange: null,
            },
          })
        })
      })
    })

    describe('And poll does exist And administrator opt in for communications', () => {
      let organisationName: string
      let organisationSlug: string
      let organisationType: string
      let administratorEmail: string
      let administratorId: string
      let pollId: string
      let userId: string

      beforeEach(async () => {
        const adminUserId = faker.string.uuid()
        const adminEmail = faker.internet.email()
        let organisationId: string
        ;({
          id: organisationId,
          name: organisationName,
          slug: organisationSlug,
          type: organisationType,
          administrators: [
            { userId: administratorId, email: administratorEmail },
          ],
        } = await createOrganisation({
          agent,
          userId: adminUserId,
          email: adminEmail,
          organisation: {
            administrators: [
              {
                optedInForCommunications: true,
              },
            ],
          },
        }))

        const poll = await createOrganisationPoll({
          agent,
          userId: adminUserId,
          email: adminEmail,
          organisationId,
        })
        ;({ id: pollId } = poll)
        userId = faker.string.uuid()
      })

      test('Then it updates organisation administrator in brevo', async () => {
        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
        }

        mswServer.use(
          brevoUpdateContact({
            expectBody: {
              email: administratorEmail,
              listIds: [27],
              attributes: {
                USER_ID: administratorId,
                IS_ORGANISATION_ADMIN: true,
                ORGANISATION_NAME: organisationName,
                ORGANISATION_SLUG: organisationSlug,
                OPT_IN: true,
                ORGANISATION_TYPE: organisationType,
              },
              updateEnabled: true,
            },
          })
        )

        await agent
          .post(url.replace(':pollIdOrSlug', pollId))
          .set(authHeaders({ userId }))
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
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
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .post(url.replace(':pollIdOrSlug', faker.database.mongodbObjectId()))
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Poll simulation creation failed',
          databaseError
        )
      })
    })

    describe('And logged in', () => {
      let email: string
      let userId: string

      beforeEach(async () => {
        ;({ email, userId } = await login({ agent }))
      })

      describe('And poll does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .post(
              url.replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            })
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And poll does exist', () => {
        let organisationName: string
        let organisationSlug: string
        let organisationType: string
        let administratorEmail: string
        let administratorId: string
        let pollId: string
        let pollSlug: string

        beforeEach(async () => {
          const adminUserId = faker.string.uuid()
          const adminEmail = faker.internet.email()
          let organisationId: string
          ;({
            id: organisationId,
            name: organisationName,
            slug: organisationSlug,
            type: organisationType,
            administrators: [
              { userId: administratorId, email: administratorEmail },
            ],
          } = await createOrganisation({
            agent,
            userId: adminUserId,
            email: adminEmail,
          }))

          const poll = await createOrganisationPoll({
            agent,
            userId: adminUserId,
            email: adminEmail,
            organisationId,
          })
          ;({ id: pollId, slug: pollSlug } = poll)
        })

        test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
          const expected = {
            id: faker.string.uuid(),
            model,
            situation,
            progression: 1,
            computedResults,
          }

          const payload: SimulationCreateInputDto = {
            ...expected,
            extendedSituation,
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          const response = await agent
            .post(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId, email }))
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()

          expect(response.body).toEqual({
            ...expected,
            date: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            actionChoices: {},
            additionalQuestionsAnswers: [],
            foldedSteps: [],
            polls: [
              {
                id: pollId,
                slug: pollSlug,
              },
            ],
            groups: [],
            user: {
              id: userId,
              email,
              name: null,
              optedInForCommunications: false,
              position: null,
              telephone: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          })
        })

        test('Then it stores a simulation in database', async () => {
          const payload: SimulationCreateInputDto = {
            id: faker.string.uuid(),
            date: new Date(),
            model,
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
            actionChoices: {
              myAction: true,
            },
            foldedSteps: [],
            additionalQuestionsAnswers: [
              {
                type: SimulationAdditionalQuestionAnswerType.custom,
                key: 'myKey',
                answer: 'myAnswer',
              },
              {
                type: SimulationAdditionalQuestionAnswerType.default,
                key: PollDefaultAdditionalQuestionType.postalCode,
                answer: '00001',
              },
            ],
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          const {
            body: { id },
          } = await agent
            .post(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId, email }))
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()

          const createdSimulation = await prisma.simulation.findUnique({
            where: {
              id,
            },
            select: {
              id: true,
              date: true,
              model: true,
              situation: true,
              foldedSteps: true,
              progression: true,
              actionChoices: true,
              computedResults: true,
              extendedSituation: true,
              additionalQuestionsAnswers: {
                select: {
                  key: true,
                  answer: true,
                  type: true,
                },
              },
              polls: {
                select: {
                  pollId: true,
                  poll: {
                    select: {
                      slug: true,
                    },
                  },
                },
              },
              states: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
              verifiedUser: {
                select: {
                  id: true,
                  email: true,
                },
              },
              createdAt: true,
              updatedAt: true,
            },
          })

          expect(createdSimulation).toEqual({
            ...payload,
            createdAt: expect.any(Date),
            date: expect.any(Date),
            updatedAt: expect.any(Date),
            polls: [
              {
                pollId,
                poll: {
                  slug: pollSlug,
                },
              },
            ],
            states: [
              {
                id: expect.any(String),
                date: expect.any(Date),
                simulationId: id,
                progression: 1,
              },
            ],
            user: {
              id: userId,
              email,
            },
            verifiedUser: {
              id: userId,
              email,
            },
          })
        })

        test('Then it sends a creation email', async () => {
          const payload: SimulationCreateInputDto = {
            id: faker.string.uuid(),
            model,
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          }

          mswServer.use(
            brevoSendEmail({
              expectBody: {
                to: [
                  {
                    name: email,
                    email,
                  },
                ],
                templateId: 122,
                params: {
                  ORGANISATION_NAME: organisationName,
                  DETAILED_VIEW_URL: `https://nosgestesclimat.test/organisations/${organisationSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=orga-invite-campagne`,
                  SIMULATION_URL: `https://nosgestesclimat.test/fin?sid=${payload.id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                },
              },
            }),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          await agent
            .post(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId, email }))
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })

        test('Then it adds or updates contacts in brevo', async () => {
          const date = new Date()
          const payload: SimulationCreateInputDto = {
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
            date,
          }

          const contactBodies: unknown[] = []

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact({
              storeBodies: contactBodies,
            }),
            brevoRemoveFromList(27)
          )

          await agent
            .post(url.replace(':pollIdOrSlug', pollId))
            .set(authHeaders({ userId, email }))
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()

          expect(contactBodies).toEqual(
            expect.arrayContaining([
              {
                email,
                attributes: {
                  USER_ID: userId,
                  LAST_SIMULATION_DATE: date.toISOString(),
                  ACTIONS_SELECTED_NUMBER: 0,
                  LAST_SIMULATION_BILAN_FOOTPRINT: (
                    computedResults.carbone.bilan / 1000
                  ).toLocaleString('fr-FR', {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                    computedResults.carbone.categories.transport / 1000
                  ).toLocaleString('fr-FR', {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                    computedResults.carbone.categories.alimentation / 1000
                  ).toLocaleString('fr-FR', {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                    computedResults.carbone.categories.logement / 1000
                  ).toLocaleString('fr-FR', {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_DIVERS_FOOTPRINT: (
                    computedResults.carbone.categories.divers / 1000
                  ).toLocaleString('fr-FR', {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_SERVICES_FOOTPRINT: (
                    computedResults.carbone.categories['services sociétaux'] /
                    1000
                  ).toLocaleString('fr-FR', {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_BILAN_WATER: Math.round(
                    computedResults.eau.bilan / 365
                  ).toString(),
                },
                updateEnabled: true,
              },
              {
                attributes: {
                  IS_ORGANISATION_ADMIN: true,
                  OPT_IN: false,
                  ORGANISATION_TYPE: organisationType,
                  ORGANISATION_NAME: organisationName,
                  ORGANISATION_SLUG: organisationSlug,
                  USER_ID: administratorId,
                },
                email: administratorEmail,
                updateEnabled: true,
              },
            ])
          )
        })

        describe('And custom user origin (preprod)', () => {
          test('Then it sends a creation email', async () => {
            const payload: SimulationCreateInputDto = {
              id: faker.string.uuid(),
              model,
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            }

            mswServer.use(
              brevoSendEmail({
                expectBody: {
                  to: [
                    {
                      name: email,
                      email,
                    },
                  ],
                  templateId: 122,
                  params: {
                    ORGANISATION_NAME: organisationName,
                    DETAILED_VIEW_URL: `https://preprod.nosgestesclimat.fr/organisations/${organisationSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=orga-invite-campagne`,
                    SIMULATION_URL: `https://preprod.nosgestesclimat.fr/fin?sid=${payload.id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(27)
            )

            await agent
              .post(url.replace(':pollIdOrSlug', pollId))
              .set(authHeaders({ userId, email }))
              .set('origin', 'https://preprod.nosgestesclimat.fr')
              .send(payload)
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })
        })

        describe('And joining twice', () => {
          beforeEach(async () => {
            await createOrganisationPollSimulation({
              agent,
              pollId,
              userId,
              email,
            })
          })

          test('Then it does not send email twice', async () => {
            const payload: SimulationCreateInputDto = {
              id: faker.string.uuid(),
              model,
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            }

            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            await agent
              .post(url.replace(':pollIdOrSlug', pollId))
              .set(authHeaders({ userId, email }))
              .send(payload)
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })
        })

        describe(`And ${Locales.en} locale`, () => {
          test('Then it sends a creation email', async () => {
            const payload: SimulationCreateInputDto = {
              id: faker.string.uuid(),
              model,
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            }

            mswServer.use(
              brevoSendEmail({
                expectBody: {
                  to: [
                    {
                      name: email,
                      email,
                    },
                  ],
                  templateId: 123,
                  params: {
                    ORGANISATION_NAME: organisationName,
                    DETAILED_VIEW_URL: `https://nosgestesclimat.test/organisations/${organisationSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=orga-invite-campagne`,
                    SIMULATION_URL: `https://nosgestesclimat.test/fin?sid=${payload.id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(27)
            )

            await agent
              .post(url.replace(':pollIdOrSlug', pollId))
              .set(authHeaders({ userId, email }))
              .send(payload)
              .query({
                locale: Locales.en,
              })
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })
        })
      })
    })
  })
})
