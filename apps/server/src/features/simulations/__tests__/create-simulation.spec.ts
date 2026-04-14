import { faker } from '@faker-js/faker'
import modelPackage from '@incubateur-ademe/nosgestesclimat/package.json' with { type: 'json' }
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import {
  PollDefaultAdditionalQuestionType,
  SimulationAdditionalQuestionAnswerType,
  VerificationCodeMode,
} from '../../../adapters/prisma/generated.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { Locales } from '../../../core/i18n/constant.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { createVerificationCode } from '../../authentication/__tests__/fixtures/verification-codes.fixture.js'
import type { SimulationCreateInputDto } from '../simulations.validator.js'
import {
  CREATE_SIMULATION_ROUTE,
  createSimulation,
  FETCH_USER_SIMULATIONS_ROUTE,
  getRandomTestCase,
} from './fixtures/simulations.fixtures.js'

const defaultModelVersion = modelPackage.version
  .match(/^(\d+\.\d+\.\d+)/)!
  .pop()

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_SIMULATION_ROUTE
  const { computedResults, nom, situation, extendedSituation } =
    getRandomTestCase()

  afterEach(async () => {
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verificationCode.deleteMany(),
      prisma.verifiedUser.deleteMany(),
    ])
  })

  describe(`And ${nom} persona situation`, () => {
    describe('When creating his simulation', () => {
      describe('And no data provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', faker.string.uuid()))
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid user id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', faker.database.mongodbObjectId()))
            .send({
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid user email', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', faker.string.uuid()))
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
            .post(url.replace(':userId', faker.string.uuid()))
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
            .post(url.replace(':userId', faker.string.uuid()))
            .send({
              id: faker.string.uuid(),
              progression: 1,
              computedResults,
              situation: null,
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
            .post(url.replace(':userId', faker.string.uuid()))
            .send({
              id: faker.string.uuid(),
              situation,
              progression: 1,
              extendedSituation,
              computedResults: null,
              user: {
                name: nom,
              },
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation`, async () => {
        const userId = faker.string.uuid()
        const expected = {
          id: faker.string.uuid(),
          model: `FR-fr-${defaultModelVersion}`,
          situation,
          progression: 1,
          computedResults,
        }
        const payload: SimulationCreateInputDto = {
          ...expected,
          extendedSituation,
        }

        const response = await agent
          .post(url.replace(':userId', userId))
          .send(payload)
          .expect(StatusCodes.CREATED)

        expect(response.body).toEqual({
          ...expected,
          date: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          actionChoices: {},
          additionalQuestionsAnswers: [],
          foldedSteps: [],
          polls: [],
          groups: [],
          user: {
            id: userId,
            email: null,
            name: null,
          },
        })
      })

      test('Then it stores a simulation in database', async () => {
        const userId = faker.string.uuid()
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
          brevoRemoveFromList(22),
          brevoRemoveFromList(32),
          brevoRemoveFromList(36),
          brevoRemoveFromList(40),
          brevoRemoveFromList(41),
          brevoRemoveFromList(42)
        )

        const {
          body: { id },
        } = await agent
          .post(url.replace(':userId', userId))
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
          polls: [],
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

      describe('And updating it', () => {
        let userId: string
        let payload: SimulationCreateInputDto

        beforeEach(async () => {
          userId = faker.string.uuid()
          payload = {
            id: faker.string.uuid(),
            model: `FR-fr-${defaultModelVersion}`,
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
            additionalQuestionsAnswers: [
              {
                type: SimulationAdditionalQuestionAnswerType.default,
                key: PollDefaultAdditionalQuestionType.birthdate,
                answer: '1970-01-01',
              },
              {
                type: SimulationAdditionalQuestionAnswerType.default,
                key: PollDefaultAdditionalQuestionType.postalCode,
                answer: '00001',
              },
            ],
          }

          await agent
            .post(url.replace(':userId', userId))
            .send(payload)
            .expect(StatusCodes.CREATED)
        })

        test(`Then it returns ${StatusCodes.CREATED} response with updated simulation`, async () => {
          const response = await agent
            .post(url.replace(':userId', userId))
            .send(payload)
            .expect(StatusCodes.CREATED)

          const { extendedSituation: _, ...expected } = payload

          expect(response.body).toEqual({
            ...expected,
            date: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            actionChoices: {},
            foldedSteps: [],
            polls: [],
            groups: [],
            user: {
              id: userId,
              email: null,
              name: null,
            },
          })
        })

        test('Then it creates a new simulation state', async () => {
          await agent
            .post(url.replace(':userId', userId))
            .send(payload)
            .expect(StatusCodes.CREATED)

          expect(
            await prisma.simulationState.count({
              where: {
                simulationId: payload.id,
              },
            })
          ).toBe(2)
        })
      })
      describe('And leaving his/her email', () => {
        describe('And simulation finished', () => {
          test('Then it adds or updates contact in brevo', async () => {
            const date = new Date()
            const email = faker.internet.email().toLocaleLowerCase()
            const userId = faker.string.uuid()
            const payload: SimulationCreateInputDto = {
              id: faker.string.uuid(),
              date,
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
              user: {
                name: nom,
                email,
              },
            }

            mswServer.use(
              brevoUpdateContact({
                expectBody: {
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
                    PRENOM: nom,
                  },
                  updateEnabled: true,
                },
              }),
              brevoRemoveFromList(22, {
                expectBody: { emails: [email] },
              }),
              brevoRemoveFromList(32, {
                expectBody: { emails: [email] },
              }),
              brevoRemoveFromList(36, {
                expectBody: { emails: [email] },
              }),
              brevoRemoveFromList(40, {
                expectBody: { emails: [email] },
              }),
              brevoRemoveFromList(41, {
                expectBody: { emails: [email] },
              }),
              brevoRemoveFromList(42, {
                expectBody: { emails: [email] },
              })
            )

            await agent
              .post(url.replace(':userId', userId))
              .send(payload)
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })

          test('Then it sends a SIMULATION_COMPLETED email', async () => {
            const id = faker.string.uuid()
            const email = faker.internet.email().toLocaleLowerCase()
            const payload: SimulationCreateInputDto = {
              id,
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
                  templateId: 55,
                  params: {
                    SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                    LAST_SIMULATION_BILAN_FOOTPRINT: (
                      computedResults.carbone.bilan / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                      computedResults.carbone.categories.transport / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                      computedResults.carbone.categories.alimentation / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                      computedResults.carbone.categories.logement / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_DIVERS_FOOTPRINT: (
                      computedResults.carbone.categories.divers / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_SERVICES_FOOTPRINT: (
                      computedResults.carbone.categories['services sociétaux'] /
                      1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_BILAN_WATER: Math.round(
                      computedResults.eau.bilan / 365
                    ).toString(),
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(22),
              brevoRemoveFromList(32),
              brevoRemoveFromList(36),
              brevoRemoveFromList(40),
              brevoRemoveFromList(41),
              brevoRemoveFromList(42)
            )

            await agent
              .post(url.replace(':userId', faker.string.uuid()))
              .send(payload)
              .query({ sendEmail: true })
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })

          describe('And custom user origin (preprod)', () => {
            test('Then it sends a SIMULATION_COMPLETED email', async () => {
              const id = faker.string.uuid()
              const email = faker.internet.email().toLocaleLowerCase()
              const payload: SimulationCreateInputDto = {
                id,
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
                    templateId: 55,
                    params: {
                      SIMULATION_URL: `https://preprod.nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                      LAST_SIMULATION_BILAN_FOOTPRINT: (
                        computedResults.carbone.bilan / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                        computedResults.carbone.categories.transport / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                        computedResults.carbone.categories.alimentation / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                        computedResults.carbone.categories.logement / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_DIVERS_FOOTPRINT: (
                        computedResults.carbone.categories.divers / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_SERVICES_FOOTPRINT: (
                        computedResults.carbone.categories[
                          'services sociétaux'
                        ] / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_BILAN_WATER: Math.round(
                        computedResults.eau.bilan / 365
                      ).toString(),
                    },
                  },
                }),
                brevoUpdateContact(),
                brevoRemoveFromList(22),
                brevoRemoveFromList(32),
                brevoRemoveFromList(36),
                brevoRemoveFromList(40),
                brevoRemoveFromList(41),
                brevoRemoveFromList(42)
              )

              await agent
                .post(url.replace(':userId', faker.string.uuid()))
                .send(payload)
                .query({ sendEmail: true })
                .set('origin', 'https://preprod.nosgestesclimat.fr')
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })

          describe('And he subscribed to newsletters', () => {
            test('Then it adds or updates contact in brevo', async () => {
              const date = new Date()
              const email = faker.internet.email().toLocaleLowerCase()
              const userId = faker.string.uuid()
              const payload: SimulationCreateInputDto = {
                id: faker.string.uuid(),
                date,
                situation,
                progression: 1,
                computedResults,
                extendedSituation,
                user: {
                  name: nom,
                  email,
                },
              }

              mswServer.use(
                brevoUpdateContact({
                  expectBody: {
                    email,
                    listIds: [22, 32, 36, 40, 41, 42],
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
                        computedResults.carbone.categories[
                          'services sociétaux'
                        ] / 1000
                      ).toLocaleString('fr-FR', {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_BILAN_WATER: Math.round(
                        computedResults.eau.bilan / 365
                      ).toString(),
                      PRENOM: nom,
                    },
                    updateEnabled: true,
                  },
                })
              )

              await agent
                .post(url.replace(':userId', userId))
                .query({
                  'newsletters[]': [22, 32, 36, 40, 41, 42],
                })
                .send(payload)
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })

          describe('And he subscribed to one newsletter', () => {
            test('Then it adds or updates contact in brevo', async () => {
              const date = new Date()
              const email = faker.internet.email().toLocaleLowerCase()
              const userId = faker.string.uuid()
              const payload: SimulationCreateInputDto = {
                id: faker.string.uuid(),
                date,
                situation,
                progression: 1,
                computedResults,
                extendedSituation,
                user: {
                  name: nom,
                  email,
                },
              }

              mswServer.use(
                brevoUpdateContact({
                  expectBody: {
                    email,
                    listIds: [22],
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
                        computedResults.carbone.categories[
                          'services sociétaux'
                        ] / 1000
                      ).toLocaleString('fr-FR', {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_BILAN_WATER: Math.round(
                        computedResults.eau.bilan / 365
                      ).toString(),
                      PRENOM: nom,
                    },
                    updateEnabled: true,
                  },
                }),
                brevoRemoveFromList(32),
                brevoRemoveFromList(36),
                brevoRemoveFromList(40),
                brevoRemoveFromList(41),
                brevoRemoveFromList(42)
              )

              await agent
                .post(url.replace(':userId', userId))
                .query({
                  newsletters: 22,
                })
                .send(payload)
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })
        })

        describe('And simulation incomplete', () => {
          test('Then it adds or updates contact in brevo', async () => {
            const id = faker.string.uuid()
            const email = faker.internet.email().toLocaleLowerCase()
            const userId = faker.string.uuid()
            const payload: SimulationCreateInputDto = {
              id,
              situation,
              computedResults,
              progression: 0.5,
              extendedSituation,
              user: {
                email,
              },
            }

            mswServer.use(
              brevoUpdateContact({
                expectBody: {
                  email,
                  attributes: {
                    USER_ID: userId,
                  },
                  updateEnabled: true,
                },
              })
            )

            await EventBus.flush()

            await agent
              .post(url.replace(':userId', userId))
              .send(payload)
              .expect(StatusCodes.CREATED)
          })

          test('Then it sends a SIMULATION_IN_PROGRESS email', async () => {
            const id = faker.string.uuid()
            const email = faker.internet.email().toLocaleLowerCase()
            const payload: SimulationCreateInputDto = {
              id,
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
                    SIMULATION_URL: `https://nosgestesclimat.fr/simulateur/bilan?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=pause-test-en-cours`,
                  },
                },
              }),
              brevoUpdateContact()
            )

            await EventBus.flush()

            await agent
              .post(url.replace(':userId', faker.string.uuid()))
              .send(payload)
              .query({ sendEmail: true })
              .expect(StatusCodes.CREATED)
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
            .post(url.replace(':userId', faker.string.uuid()))
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
          await agent.post(url.replace(':userId', faker.string.uuid())).send({
            id: faker.string.uuid(),
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
          })

          expect(logger.error).toHaveBeenCalledWith(
            'Simulation creation failed',
            databaseError
          )
        })
      })
    })

    describe('When signing up creating his simulation', () => {
      let code: string
      let email: string
      let userId: string
      beforeEach(async () => {
        ;({ code, email } = await createVerificationCode({ agent }))
        userId = faker.string.uuid()
      })

      describe('And no data provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', userId))
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid user id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', faker.database.mongodbObjectId()))
            .send({
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            })
            .query({
              code,
              email,
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid simulation id', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', userId))
            .send({
              id: faker.database.mongodbObjectId(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            })
            .query({
              code,
              email,
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid situation', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', userId))
            .send({
              id: faker.string.uuid(),
              progression: 1,
              computedResults,
              situation: null,
              extendedSituation,
            })
            .query({
              code,
              email,
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid computedResults', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', userId))
            .send({
              id: faker.string.uuid(),
              situation,
              progression: 1,
              extendedSituation,
              computedResults: null,
            })
            .query({
              code,
              email,
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid verification code', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', userId))
            .send({
              id: faker.string.uuid(),
              progression: 1,
              computedResults,
              situation,
              extendedSituation,
            })
            .query({
              code: '42',
              email,
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid email', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url.replace(':userId', userId))
            .send({
              id: faker.string.uuid(),
              progression: 1,
              computedResults,
              situation,
              extendedSituation,
            })
            .query({
              code,
              email: 'Je ne donne jamais mon email',
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And verification code does not exist', () => {
        test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
          await agent
            .post(url.replace(':userId', userId))
            .send({
              id: faker.string.uuid(),
              progression: 1,
              computedResults,
              situation,
              extendedSituation,
            })
            .query({
              code: faker.number.int({ min: 100000, max: 999999 }).toString(),
              email,
            })
            .expect(StatusCodes.UNAUTHORIZED)
        })
      })

      test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation and a cookie`, async () => {
        const expected = {
          id: faker.string.uuid(),
          model: `FR-fr-${defaultModelVersion}`,
          situation,
          progression: 1,
          computedResults,
        }
        const payload: SimulationCreateInputDto = {
          ...expected,
          extendedSituation,
        }

        mswServer.use(
          brevoUpdateContact(),
          brevoRemoveFromList(22),
          brevoRemoveFromList(32),
          brevoRemoveFromList(36),
          brevoRemoveFromList(40),
          brevoRemoveFromList(41),
          brevoRemoveFromList(42)
        )

        const response = await agent
          .post(url.replace(':userId', userId))
          .query({
            code,
            email,
          })
          .send(payload)
          .expect(StatusCodes.CREATED)

        expect(response.body).toEqual({
          ...expected,
          date: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          actionChoices: {},
          additionalQuestionsAnswers: [],
          foldedSteps: [],
          polls: [],
          groups: [],
          user: {
            id: userId,
            email,
            name: null,
            position: null,
            telephone: null,
            optedInForCommunications: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const [cookie] = response.headers['set-cookie']
        const userToken = cookie
          .split(';')
          .shift()
          ?.replace('ngc_server_auth_jwt=', '')

        expect(jwt.decode(userToken!)).toEqual({
          userId,
          email,
          exp: expect.any(Number),
          iat: expect.any(Number),
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
          brevoUpdateContact(),
          brevoRemoveFromList(22),
          brevoRemoveFromList(32),
          brevoRemoveFromList(36),
          brevoRemoveFromList(40),
          brevoRemoveFromList(41),
          brevoRemoveFromList(42)
        )

        const {
          body: { id },
        } = await agent
          .post(url.replace(':userId', userId))
          .query({
            code,
            email,
          })
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
              },
            },
            states: true,
            verifiedUser: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                optedInForCommunications: true,
                telephone: true,
              },
            },
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
          polls: [],
          states: [
            {
              id: expect.any(String),
              date: expect.any(Date),
              simulationId: id,
              progression: 1,
            },
          ],
          verifiedUser: {
            email,
            id: userId,
            name: null,
            position: null,
            telephone: null,
            optedInForCommunications: false,
          },
          user: {
            email,
            id: userId,
            name: null,
          },
        })
      })

      test('Then it adds or updates contact in brevo', async () => {
        const date = new Date()
        const payload: SimulationCreateInputDto = {
          id: faker.string.uuid(),
          date,
          situation,
          progression: 1,
          computedResults,
          extendedSituation,
          actionChoices: {
            myAction: true,
          },
          foldedSteps: [],
        }

        mswServer.use(
          brevoUpdateContact({
            expectBody: {
              email,
              listIds: [22, 32, 36, 40, 41, 42],
              attributes: {
                USER_ID: userId,
                LAST_SIMULATION_DATE: date.toISOString(),
                ACTIONS_SELECTED_NUMBER: 1,
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
          })
        )

        await agent
          .post(url.replace(':userId', userId))
          .query({
            'newsletters[]': [22, 32, 36, 40, 41, 42],
            email,
            code,
          })
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
      })

      describe('And asking for email', () => {
        test('Then it sends an email', async () => {
          const id = faker.string.uuid()
          const payload: SimulationCreateInputDto = {
            id,
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
                templateId: 138,
                params: {
                  SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                  DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
                  LAST_SIMULATION_BILAN_FOOTPRINT: (
                    computedResults.carbone.bilan / 1000
                  ).toLocaleString(Locales.fr, {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                    computedResults.carbone.categories.transport / 1000
                  ).toLocaleString(Locales.fr, {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                    computedResults.carbone.categories.alimentation / 1000
                  ).toLocaleString(Locales.fr, {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                    computedResults.carbone.categories.logement / 1000
                  ).toLocaleString(Locales.fr, {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_DIVERS_FOOTPRINT: (
                    computedResults.carbone.categories.divers / 1000
                  ).toLocaleString(Locales.fr, {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_SERVICES_FOOTPRINT: (
                    computedResults.carbone.categories['services sociétaux'] /
                    1000
                  ).toLocaleString(Locales.fr, {
                    maximumFractionDigits: 1,
                  }),
                  LAST_SIMULATION_BILAN_WATER: Math.round(
                    computedResults.eau.bilan / 365
                  ).toString(),
                },
              },
            }),
            brevoUpdateContact(),
            brevoRemoveFromList(22),
            brevoRemoveFromList(32),
            brevoRemoveFromList(36),
            brevoRemoveFromList(40),
            brevoRemoveFromList(41),
            brevoRemoveFromList(42)
          )

          await agent
            .post(url.replace(':userId', userId))
            .send(payload)
            .query({
              sendEmail: true,
              email,
              code,
            })
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })

        describe('And custom user origin (preprod)', () => {
          test('Then it sends an email', async () => {
            const id = faker.string.uuid()
            const payload: SimulationCreateInputDto = {
              id,
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
                  templateId: 138,
                  params: {
                    SIMULATION_URL: `https://preprod.nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                    DASHBOARD_URL:
                      'https://preprod.nosgestesclimat.fr/mon-espace',
                    LAST_SIMULATION_BILAN_FOOTPRINT: (
                      computedResults.carbone.bilan / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                      computedResults.carbone.categories.transport / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                      computedResults.carbone.categories.alimentation / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                      computedResults.carbone.categories.logement / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_DIVERS_FOOTPRINT: (
                      computedResults.carbone.categories.divers / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_SERVICES_FOOTPRINT: (
                      computedResults.carbone.categories['services sociétaux'] /
                      1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_BILAN_WATER: Math.round(
                      computedResults.eau.bilan / 365
                    ).toString(),
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(22),
              brevoRemoveFromList(32),
              brevoRemoveFromList(36),
              brevoRemoveFromList(40),
              brevoRemoveFromList(41),
              brevoRemoveFromList(42)
            )

            await agent
              .post(url.replace(':userId', userId))
              .send(payload)
              .query({
                sendEmail: true,
                email,
                code,
              })
              .set('origin', 'https://preprod.nosgestesclimat.fr')
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })
        })

        describe(`And ${Locales.en} locale`, () => {
          test('Then it sends an email', async () => {
            const id = faker.string.uuid()
            const payload: SimulationCreateInputDto = {
              id,
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
                  templateId: 140,
                  params: {
                    SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                    DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
                    LAST_SIMULATION_BILAN_FOOTPRINT: (
                      computedResults.carbone.bilan / 1000
                    ).toLocaleString(Locales.en, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                      computedResults.carbone.categories.transport / 1000
                    ).toLocaleString(Locales.en, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                      computedResults.carbone.categories.alimentation / 1000
                    ).toLocaleString(Locales.en, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                      computedResults.carbone.categories.logement / 1000
                    ).toLocaleString(Locales.en, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_DIVERS_FOOTPRINT: (
                      computedResults.carbone.categories.divers / 1000
                    ).toLocaleString(Locales.en, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_SERVICES_FOOTPRINT: (
                      computedResults.carbone.categories['services sociétaux'] /
                      1000
                    ).toLocaleString(Locales.en, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_BILAN_WATER: Math.round(
                      computedResults.eau.bilan / 365
                    ).toString(),
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(22),
              brevoRemoveFromList(32),
              brevoRemoveFromList(36),
              brevoRemoveFromList(40),
              brevoRemoveFromList(41),
              brevoRemoveFromList(42)
            )

            await agent
              .post(url.replace(':userId', userId))
              .send(payload)
              .query({
                locale: Locales.en,
                sendEmail: true,
                email,
                code,
              })
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })
        })
      })
    })

    describe('Given an already verified user', () => {
      let email: string
      let existingUserId: string

      beforeEach(async () => {
        const loginResult = await login({ agent })
        email = loginResult.email
        existingUserId = loginResult.userId
      })

      describe('When signing in creating his simulation from a new device', () => {
        let code: string
        let newDeviceUserId: string

        beforeEach(async () => {
          ;({ code } = await createVerificationCode({
            agent,
            verificationCode: { email },
            mode: VerificationCodeMode.signIn,
          }))

          newDeviceUserId = faker.string.uuid()
        })

        test('Then it returns the simulation linked to existing user', async () => {
          const expected = {
            id: faker.string.uuid(),
            model: `FR-fr-${defaultModelVersion}`,
            situation,
            progression: 1,
            computedResults,
          }
          const payload: SimulationCreateInputDto = {
            ...expected,
            extendedSituation,
          }

          // signIn mode: only brevoUpdateContact, no brevoSendEmail (no welcome email)
          mswServer.use(
            brevoUpdateContact(),
            brevoRemoveFromList(22),
            brevoRemoveFromList(32),
            brevoRemoveFromList(36),
            brevoRemoveFromList(40),
            brevoRemoveFromList(41),
            brevoRemoveFromList(42)
          )

          const response = await agent
            .post(url.replace(':userId', newDeviceUserId))
            .query({
              code,
              email,
            })
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()

          expect(response.body.user).toEqual({
            id: existingUserId,
            email,
            name: null,
            position: null,
            telephone: null,
            optedInForCommunications: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })

          const [cookie] = response.headers['set-cookie']
          const userToken = cookie
            .split(';')
            .shift()
            ?.replace('ngc_server_auth_jwt=', '')

          expect(jwt.decode(userToken!)).toEqual({
            userId: existingUserId,
            email,
            exp: expect.any(Number),
            iat: expect.any(Number),
          })
        })

        describe('And another device has an unverified simulation with same email', () => {
          let otherDeviceUserId: string
          let otherSimulation: Awaited<ReturnType<typeof createSimulation>>

          beforeEach(async () => {
            otherDeviceUserId = faker.string.uuid()
            otherSimulation = await createSimulation({
              agent,
              userId: otherDeviceUserId,
              simulation: { user: { email } },
            })
          })

          test('Then it does not trigger user data sync', async () => {
            const payload: SimulationCreateInputDto = {
              id: faker.string.uuid(),
              situation,
              progression: 1,
              computedResults,
              extendedSituation,
            }

            mswServer.use(
              brevoUpdateContact(),
              brevoRemoveFromList(22),
              brevoRemoveFromList(32),
              brevoRemoveFromList(36),
              brevoRemoveFromList(40),
              brevoRemoveFromList(41),
              brevoRemoveFromList(42)
            )

            await agent
              .post(url.replace(':userId', newDeviceUserId))
              .query({
                code,
                email,
              })
              .send(payload)
              .expect(StatusCodes.CREATED)

            await EventBus.flush()

            // The other device's simulation should NOT have been synced
            // (sync only happens on account creation, not on sign in)
            const otherDeviceResponse = await agent
              .get(
                FETCH_USER_SIMULATIONS_ROUTE.replace(
                  ':userId',
                  otherDeviceUserId
                )
              )
              .expect(StatusCodes.OK)

            expect(otherDeviceResponse.body).toHaveLength(1)
            expect(otherDeviceResponse.body[0].id).toBe(otherSimulation.id)
          })
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

      describe('When creating his simulation', () => {
        describe('And no data provided', () => {
          test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
            await agent
              .post(url.replace(':userId', userId))
              .set('cookie', cookie)
              .expect(StatusCodes.BAD_REQUEST)
          })
        })

        describe('And invalid user id', () => {
          test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
            await agent
              .post(url.replace(':userId', faker.database.mongodbObjectId()))
              .set('cookie', cookie)
              .send({
                id: faker.string.uuid(),
                situation,
                progression: 1,
                computedResults,
                extendedSituation,
              })
              .expect(StatusCodes.BAD_REQUEST)
          })
        })

        describe('And invalid simulation id', () => {
          test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
            await agent
              .post(url.replace(':userId', userId))
              .set('cookie', cookie)
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
              .post(url.replace(':userId', userId))
              .set('cookie', cookie)
              .send({
                id: faker.string.uuid(),
                progression: 1,
                computedResults,
                situation: null,
                extendedSituation,
              })
              .expect(StatusCodes.BAD_REQUEST)
          })
        })

        describe('And invalid computedResults', () => {
          test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
            await agent
              .post(url.replace(':userId', userId))
              .set('cookie', cookie)
              .send({
                id: faker.string.uuid(),
                situation,
                progression: 1,
                extendedSituation,
                computedResults: null,
              })
              .expect(StatusCodes.BAD_REQUEST)
          })
        })

        test(`Then it returns a ${StatusCodes.CREATED} response with the created simulation and a cookie`, async () => {
          const expected = {
            id: faker.string.uuid(),
            model: `FR-fr-${defaultModelVersion}`,
            situation,
            progression: 1,
            computedResults,
          }
          const payload: SimulationCreateInputDto = {
            ...expected,
            extendedSituation,
          }

          mswServer.use(
            brevoUpdateContact(),
            brevoRemoveFromList(22),
            brevoRemoveFromList(32),
            brevoRemoveFromList(36),
            brevoRemoveFromList(40),
            brevoRemoveFromList(41),
            brevoRemoveFromList(42)
          )

          const response = await agent
            .post(url.replace(':userId', userId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            ...expected,
            date: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            actionChoices: {},
            additionalQuestionsAnswers: [],
            foldedSteps: [],
            polls: [],
            groups: [],
            user: {
              id: userId,
              email,
              name: null,
              position: null,
              telephone: null,
              optedInForCommunications: false,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          })

          const [responseCookie] = response.headers['set-cookie']
          const userToken = responseCookie
            .split(';')
            .shift()
            ?.replace('ngc_server_auth_jwt=', '')

          expect(jwt.decode(userToken!)).toEqual({
            userId,
            email,
            exp: expect.any(Number),
            iat: expect.any(Number),
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
            brevoUpdateContact(),
            brevoRemoveFromList(22),
            brevoRemoveFromList(32),
            brevoRemoveFromList(36),
            brevoRemoveFromList(40),
            brevoRemoveFromList(41),
            brevoRemoveFromList(42)
          )

          const {
            body: { id },
          } = await agent
            .post(url.replace(':userId', userId))
            .set('cookie', cookie)
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
                },
              },
              states: true,
              verifiedUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  position: true,
                  optedInForCommunications: true,
                  telephone: true,
                },
              },
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
            polls: [],
            states: [
              {
                id: expect.any(String),
                date: expect.any(Date),
                simulationId: id,
                progression: 1,
              },
            ],
            verifiedUser: {
              email,
              id: userId,
              name: null,
              position: null,
              telephone: null,
              optedInForCommunications: false,
            },
            user: {
              email,
              id: userId,
              name: null,
            },
          })
        })

        test('Then it adds or updates contact in brevo', async () => {
          const date = new Date()
          const payload: SimulationCreateInputDto = {
            id: faker.string.uuid(),
            date,
            situation,
            progression: 1,
            computedResults,
            extendedSituation,
            actionChoices: {
              myAction: true,
            },
            foldedSteps: [],
          }

          mswServer.use(
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [22, 32, 36, 40, 41, 42],
                attributes: {
                  USER_ID: userId,
                  LAST_SIMULATION_DATE: date.toISOString(),
                  ACTIONS_SELECTED_NUMBER: 1,
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
            })
          )

          await agent
            .post(url.replace(':userId', userId))
            .set('cookie', cookie)
            .query({
              'newsletters[]': [22, 32, 36, 40, 41, 42],
            })
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })

        describe('And asking for email', () => {
          test('Then it sends an email', async () => {
            const id = faker.string.uuid()
            const payload: SimulationCreateInputDto = {
              id,
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
                  templateId: 138,
                  params: {
                    SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                    DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
                    LAST_SIMULATION_BILAN_FOOTPRINT: (
                      computedResults.carbone.bilan / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                      computedResults.carbone.categories.transport / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                      computedResults.carbone.categories.alimentation / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                      computedResults.carbone.categories.logement / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_DIVERS_FOOTPRINT: (
                      computedResults.carbone.categories.divers / 1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_SERVICES_FOOTPRINT: (
                      computedResults.carbone.categories['services sociétaux'] /
                      1000
                    ).toLocaleString(Locales.fr, {
                      maximumFractionDigits: 1,
                    }),
                    LAST_SIMULATION_BILAN_WATER: Math.round(
                      computedResults.eau.bilan / 365
                    ).toString(),
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(22),
              brevoRemoveFromList(32),
              brevoRemoveFromList(36),
              brevoRemoveFromList(40),
              brevoRemoveFromList(41),
              brevoRemoveFromList(42)
            )

            await agent
              .post(url.replace(':userId', userId))
              .set('cookie', cookie)
              .send(payload)
              .query({
                sendEmail: true,
              })
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })

          describe('And custom user origin (preprod)', () => {
            test('Then it sends an email', async () => {
              const id = faker.string.uuid()
              const payload: SimulationCreateInputDto = {
                id,
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
                    templateId: 138,
                    params: {
                      SIMULATION_URL: `https://preprod.nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                      DASHBOARD_URL:
                        'https://preprod.nosgestesclimat.fr/mon-espace',
                      LAST_SIMULATION_BILAN_FOOTPRINT: (
                        computedResults.carbone.bilan / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                        computedResults.carbone.categories.transport / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                        computedResults.carbone.categories.alimentation / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                        computedResults.carbone.categories.logement / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_DIVERS_FOOTPRINT: (
                        computedResults.carbone.categories.divers / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_SERVICES_FOOTPRINT: (
                        computedResults.carbone.categories[
                          'services sociétaux'
                        ] / 1000
                      ).toLocaleString(Locales.fr, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_BILAN_WATER: Math.round(
                        computedResults.eau.bilan / 365
                      ).toString(),
                    },
                  },
                }),
                brevoUpdateContact(),
                brevoRemoveFromList(22),
                brevoRemoveFromList(32),
                brevoRemoveFromList(36),
                brevoRemoveFromList(40),
                brevoRemoveFromList(41),
                brevoRemoveFromList(42)
              )

              await agent
                .post(url.replace(':userId', userId))
                .set('cookie', cookie)
                .send(payload)
                .query({
                  sendEmail: true,
                })
                .set('origin', 'https://preprod.nosgestesclimat.fr')
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })

          describe(`And ${Locales.en} locale`, () => {
            test('Then it sends an email', async () => {
              const id = faker.string.uuid()
              const payload: SimulationCreateInputDto = {
                id,
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
                    templateId: 140,
                    params: {
                      SIMULATION_URL: `https://nosgestesclimat.fr/fin?sid=${id}&mtm_campaign=email-automatise&mtm_kwd=fin-retrouver-simulation`,
                      DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
                      LAST_SIMULATION_BILAN_FOOTPRINT: (
                        computedResults.carbone.bilan / 1000
                      ).toLocaleString(Locales.en, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_TRANSPORTS_FOOTPRINT: (
                        computedResults.carbone.categories.transport / 1000
                      ).toLocaleString(Locales.en, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_ALIMENTATION_FOOTPRINT: (
                        computedResults.carbone.categories.alimentation / 1000
                      ).toLocaleString(Locales.en, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_LOGEMENT_FOOTPRINT: (
                        computedResults.carbone.categories.logement / 1000
                      ).toLocaleString(Locales.en, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_DIVERS_FOOTPRINT: (
                        computedResults.carbone.categories.divers / 1000
                      ).toLocaleString(Locales.en, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_SERVICES_FOOTPRINT: (
                        computedResults.carbone.categories[
                          'services sociétaux'
                        ] / 1000
                      ).toLocaleString(Locales.en, {
                        maximumFractionDigits: 1,
                      }),
                      LAST_SIMULATION_BILAN_WATER: Math.round(
                        computedResults.eau.bilan / 365
                      ).toString(),
                    },
                  },
                }),
                brevoUpdateContact(),
                brevoRemoveFromList(22),
                brevoRemoveFromList(32),
                brevoRemoveFromList(36),
                brevoRemoveFromList(40),
                brevoRemoveFromList(41),
                brevoRemoveFromList(42)
              )

              await agent
                .post(url.replace(':userId', userId))
                .set('cookie', cookie)
                .send(payload)
                .query({
                  locale: Locales.en,
                  sendEmail: true,
                })
                .expect(StatusCodes.CREATED)

              await EventBus.flush()
            })
          })
        })
      })
    })
  })
})
