import { faker } from '@faker-js/faker'
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  PollDefaultAdditionalQuestionType,
  SimulationAdditionalQuestionAnswerType,
} from '../../../adapters/prisma/generated.js'
import {
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { Locales } from '../../../core/i18n/constant.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import {
  CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE,
  createOrganisation,
  createOrganisationPoll,
  createOrganisationPollSimulation,
} from '../../organisations/__tests__/fixtures/organisations.fixture.js'
import type { SimulationCreateInputDto } from '../simulations.validator.js'
import { getRandomTestCase } from './fixtures/simulations.fixtures.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_ORGANISATION_PUBLIC_POLL_SIMULATION_ROUTE
  const { computedResults, nom, situation, extendedSituation } =
    getRandomTestCase()

  afterEach(async () => {
    await EventBus.flush()
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

  describe(`And ${nom} persona situation`, () => {
    describe('When creating a simulation in a poll ', () => {
      describe('And invalid user Id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', faker.string.alpha(34))
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And no data provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid user email', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .send({
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
              user: {
                name: nom,
                email: 'Je ne donne jamais mon email',
              },
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid simulation id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .send({
              id: faker.database.mongodbObjectId(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
              user: {
                name: nom,
              },
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid situation', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .send({
              id: faker.string.uuid(),
              situation: null,
              progression: 1,
              computedResults,
              extendedSituation,
              user: {
                name: nom,
              },
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid computedResults', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .send({
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults: null,
              extendedSituation,
              user: {
                name: nom,
              },
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And poll does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
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
        let organisationId: string
        let organisationSlug: string
        let organisationName: string
        let administratorEmail: string
        let administratorId: string
        let userId: string
        let pollId: string
        let pollSlug: string
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>

        beforeEach(async () => {
          const { cookie } = await login({ agent })
          ;({
            id: organisationId,
            name: organisationName,
            slug: organisationSlug,
            administrators: [
              { userId: administratorId, email: administratorEmail },
            ],
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
          userId = faker.string.uuid()
        })

        test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
          const expected = {
            id: faker.string.uuid(),
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
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
            .send(payload)
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            ...expected,
            date: expect.any(String),
            model: 'FR-fr-0.0.0',
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
            },
          })
        })

        test('Then it stores a simulation in database', async () => {
          const payload: SimulationCreateInputDto = {
            id: faker.string.uuid(),
            date: new Date(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
            actionChoices: {
              myAction: true,
            },
            // foldedSteps: ['myStep'], // Cannot do that with PG lite
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
            user: {
              name: nom,
              email: faker.internet.email().toLocaleLowerCase(),
            },
          }
          mswServer.use(
            brevoUpdateContact(),
            brevoRemoveFromList(27),
            brevoSendEmail()
          )
          const {
            body: { id },
          } = await agent
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
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
              ...payload.user,
              id: userId,
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
                  LAST_POLL_PARTICIPANTS_NUMBER: 1,
                  OPT_IN: false,
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
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
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
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
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
              Object.entries(modelFunFacts).map(([k]) => [
                k,
                expect.any(Number),
              ])
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
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
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

        describe('And using organisation and poll slugs', () => {
          test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
            const expected = {
              id: faker.string.uuid(),
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
              .post(
                url
                  .replace(':userId', userId)
                  .replace(':pollIdOrSlug', pollSlug)
              )
              .send(payload)
              .expect(StatusCodes.CREATED)

            expect(response.body).toEqual({
              ...expected,
              date: expect.any(String),
              model: 'FR-fr-0.0.0',
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
              },
            })
          })
        })

        describe('And leaving his/her email', () => {
          test('Then it adds or updates contacts in brevo', async () => {
            const date = new Date()
            const email = faker.internet.email().toLocaleLowerCase()
            const payload: SimulationCreateInputDto = {
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
              date,
              user: {
                email,
              },
            }

            const contactBodies: unknown[] = []

            mswServer.use(
              brevoSendEmail(),
              brevoRemoveFromList(27),
              brevoUpdateContact({
                storeBodies: contactBodies,
              })
            )

            await agent
              .post(
                url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
              )
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
                    LAST_POLL_PARTICIPANTS_NUMBER: 1,
                    OPT_IN: false,
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

          test('Then it sends a creation email', async () => {
            const email = faker.internet.email().toLocaleLowerCase()
            const payload: SimulationCreateInputDto = {
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
              user: {
                email,
              },
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
                    DETAILED_VIEW_URL: `https://nosgestesclimat.fr/organisations/${organisationSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=orga-invite-campagne`,
                    SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${payload.id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(27)
            )

            await agent
              .post(
                url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
              )
              .send(payload)
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })

          describe('And incomplete simulation', () => {
            test('Then it sends a continuation email', async () => {
              const email = faker.internet.email().toLocaleLowerCase()
              const payload: SimulationCreateInputDto = {
                id: faker.string.uuid(),
                situation,
                computedResults,
                progression: 0.5,
                extendedSituation,
                user: {
                  email,
                },
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
                    templateId: 102,
                    params: {
                      SIMULATION_URL: `https://nosgestesclimat.fr/simulateur/bilan?sid=${payload.id}&mtm_campaign=email-automatise&mtm_kwd=pause-test-en-cours`,
                    },
                  },
                }),
                brevoUpdateContact(),
                brevoRemoveFromList(27)
              )

              await agent
                .post(
                  url
                    .replace(':userId', userId)
                    .replace(':pollIdOrSlug', pollId)
                )
                .send(payload)
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })

          describe('And custom user origin (preprod)', () => {
            test('Then it sends a creation email', async () => {
              const email = faker.internet.email().toLocaleLowerCase()
              const payload: SimulationCreateInputDto = {
                id: faker.string.uuid(),
                situation,
                progression: 1,
                computedResults,
                extendedSituation,
                user: {
                  email,
                },
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
                .post(
                  url
                    .replace(':userId', userId)
                    .replace(':pollIdOrSlug', pollId)
                )
                .set('origin', 'https://preprod.nosgestesclimat.fr')
                .send(payload)
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })

          describe(`And ${Locales.en} locale`, () => {
            test('Then it sends a creation email', async () => {
              const email = faker.internet.email().toLocaleLowerCase()
              const payload: SimulationCreateInputDto = {
                id: faker.string.uuid(),
                situation,
                progression: 1,
                computedResults,
                extendedSituation,
                user: {
                  email,
                },
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
                      DETAILED_VIEW_URL: `https://nosgestesclimat.fr/organisations/${organisationSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=orga-invite-campagne`,
                      SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${payload.id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                    },
                  },
                }),
                brevoUpdateContact(),
                brevoRemoveFromList(27)
              )

              await agent
                .post(
                  url
                    .replace(':userId', userId)
                    .replace(':pollIdOrSlug', pollId)
                )
                .send(payload)
                .query({
                  locale: Locales.en,
                })
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })

          describe('And joining twice', () => {
            let simulation: Awaited<
              ReturnType<typeof createOrganisationPollSimulation>
            >

            beforeEach(async () => {
              simulation = await createOrganisationPollSimulation({
                agent,
                pollId,
                simulation: {
                  user: {
                    email: faker.internet.email(),
                  },
                },
              })
            })

            test('Then it does not send email twice', async () => {
              const {
                createdAt: _1,
                updatedAt: _2,
                polls: _3,
                user,
                ...payload
              } = simulation
              const { id: _4, name: _5, ...userPayload } = user

              mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

              await agent
                .post(
                  url
                    .replace(':userId', user.id)
                    .replace(':pollIdOrSlug', pollId)
                )
                .send({
                  ...payload,
                  user: userPayload,
                })
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })

            describe('And from another device', () => {
              test('Then it does not send email twice', async () => {
                const {
                  createdAt: _1,
                  updatedAt: _2,
                  polls: _3,
                  user,
                  ...payload
                } = simulation
                const { id: _4, name: _5, ...userPayload } = user

                mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

                await agent
                  .post(
                    url
                      .replace(':userId', user.id)
                      .replace(':pollIdOrSlug', pollId)
                  )
                  .send({
                    ...payload,
                    user: userPayload,
                  })
                  .expect(StatusCodes.CREATED)

                await EventBus.flush()
              })
            })
          })
        })
      })

      describe('And poll does exist And administrator opt in for communications', () => {
        let organisationId: string
        let organisationSlug: string
        let organisationName: string
        let administratorEmail: string
        let administratorId: string
        let pollId: string
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
        let userId: string

        beforeEach(async () => {
          const { cookie } = await login({ agent })
          ;({
            id: organisationId,
            name: organisationName,
            slug: organisationSlug,
            administrators: [
              { userId: administratorId, email: administratorEmail },
            ],
          } = await createOrganisation({
            agent,
            cookie,
            organisation: {
              administrators: [
                {
                  optedInForCommunications: true,
                },
              ],
            },
          }))
          poll = await createOrganisationPoll({
            agent,
            cookie,
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
                  LAST_POLL_PARTICIPANTS_NUMBER: 1,
                  OPT_IN: true,
                },
                updateEnabled: true,
              },
            })
          )

          await agent
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
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
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
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
            .post(
              url
                .replace(':userId', faker.string.uuid())
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
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
    })

    describe('And logged in', () => {
      let cookie: string
      let email: string
      let userId: string

      beforeEach(async () => {
        ;({ cookie, email, userId } = await login({ agent }))
      })

      describe('And poll does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .post(
              url
                .replace(':userId', userId)
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set('cookie', cookie)
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
        let organisationId: string
        let organisationName: string
        let organisationSlug: string
        let administratorId: string
        let administratorEmail: string
        let pollId: string
        let pollSlug: string
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>

        beforeEach(async () => {
          const { cookie } = await login({ agent })
          ;({
            id: organisationId,
            name: organisationName,
            slug: organisationSlug,
            administrators: [
              { userId: administratorId, email: administratorEmail },
            ],
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

        test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
          const expected = {
            id: faker.string.uuid(),
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
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            ...expected,
            date: expect.any(String),
            model: 'FR-fr-0.0.0',
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
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
            actionChoices: {
              myAction: true,
            },
            // foldedSteps: ['myStep'], // Cannot do that with PG lite
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
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          const createdSimulation = await prisma.simulation.findUnique({
            where: {
              id,
            },
            select: {
              id: true,
              date: true,
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
              ...payload.user,
              id: userId,
              email,
            },
            verifiedUser: {
              ...payload.user,
              id: userId,
              email,
            },
          })
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
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
            .set('cookie', cookie)
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
                  LAST_POLL_PARTICIPANTS_NUMBER: 1,
                  OPT_IN: false,
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

        test('Then it sends a creation email', async () => {
          const payload: SimulationCreateInputDto = {
            id: faker.string.uuid(),
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
                  DETAILED_VIEW_URL: `https://nosgestesclimat.fr/organisations/${organisationSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=orga-invite-campagne`,
                  SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${payload.id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                },
              },
            }),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          await agent
            .post(
              url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
            )
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })

        describe('And joining twice', () => {
          let simulation: Awaited<
            ReturnType<typeof createOrganisationPollSimulation>
          >

          beforeEach(async () => {
            simulation = await createOrganisationPollSimulation({
              agent,
              pollId,
              cookie,
            })
          })

          test('Then it does not send email twice', async () => {
            const {
              createdAt: _1,
              updatedAt: _2,
              polls: _3,
              user: _4,
              ...payload
            } = simulation

            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            await agent
              .post(
                url.replace(':userId', userId).replace(':pollIdOrSlug', pollId)
              )
              .set('cookie', cookie)
              .send(payload)
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })
        })
      })
    })
  })
})
