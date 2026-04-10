import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { getSimulationPayload } from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import type { GroupCreateInputDto } from '../groups.validator.js'
import { CREATE_GROUP_ROUTE } from './fixtures/groups.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_GROUP_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.groupAdministrator.deleteMany(),
      prisma.groupParticipant.deleteMany(),
    ])
    await Promise.all([prisma.user.deleteMany(), prisma.group.deleteMany()])
  })

  describe('When creating his group', () => {
    describe('And no data provided', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent.post(url).expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.uuid(),
              email: 'Je ne donne jamais mon email',
              name: faker.person.fullName(),
            },
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid administrator id', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.alpha(34),
              name: faker.person.fullName(),
            },
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid participant simulation id', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.uuid(),
              name: faker.person.fullName(),
            },
            participants: [
              {
                simulation: {
                  ...getSimulationPayload(),
                  id: faker.string.alpha(34),
                },
              },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid participant simulation situation', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.uuid(),
              name: faker.person.fullName(),
            },
            participants: [
              {
                simulation: {
                  ...getSimulationPayload(),
                  situation: null,
                },
              },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid participant simulation computedResults', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.uuid(),
              name: faker.person.fullName(),
            },
            participants: [
              {
                simulation: {
                  ...getSimulationPayload(),
                  computedResults: null,
                },
              },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And trying to add another participant than himself', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.uuid(),
              name: faker.person.fullName(),
            },
            participants: [
              {
                userId: faker.string.uuid(),
                name: faker.person.fullName(),
                simulation: getSimulationPayload(),
              },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And trying to add another simulation for himself', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.uuid(),
              name: faker.person.fullName(),
            },
            participants: [
              {
                simulation: getSimulationPayload(),
              },
              {
                simulation: getSimulationPayload(),
              },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And he does not have a simulation', () => {
      test(`Then it returns a ${StatusCodes.CREATED} response with the created group`, async () => {
        const userId = faker.string.uuid()
        const name = faker.person.fullName()
        const payload: GroupCreateInputDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
          administrator: {
            userId,
            name,
          },
        }

        const response = await agent
          .post(url)
          .send(payload)
          .expect(StatusCodes.CREATED)

        expect(response.body).toEqual({
          ...payload,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          participants: [],
          administrator: {
            id: userId,
            name,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            email: null,
          },
        })
      })

      test('Then it stores a group in database', async () => {
        const userId = faker.string.uuid()
        const email = faker.internet.email().toLocaleLowerCase()
        const name = faker.person.fullName()
        const payload: GroupCreateInputDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
          administrator: {
            userId,
            email,
            name,
          },
        }

        const {
          body: { id },
        } = await agent.post(url).send(payload).expect(StatusCodes.CREATED)

        const createdGroup = await prisma.group.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
            emoji: true,
            administrator: {
              select: {
                user: true,
              },
            },
            participants: {
              select: {
                user: true,
              },
            },
            updatedAt: true,
            createdAt: true,
          },
        })

        expect(createdGroup).toEqual({
          ...payload,
          id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          administrator: {
            user: {
              id: userId,
              name,
              email,
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
            },
          },
          participants: [],
        })
      })

      describe('And leaving his/her email', () => {
        test('Then it does not send a creation email', async () => {
          const email = faker.internet.email().toLocaleLowerCase()
          const userId = faker.string.uuid()
          const name = faker.person.fullName()
          const payload: GroupCreateInputDto = {
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId,
              email,
              name,
            },
          }

          await agent.post(url).send(payload).expect(StatusCodes.CREATED)
        })

        test('Then it does not add or update administrator contact in brevo', async () => {
          const email = faker.internet.email().toLocaleLowerCase()
          const userId = faker.string.uuid()
          const name = faker.person.fullName()
          const payload: GroupCreateInputDto = {
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId,
              email,
              name,
            },
          }

          await agent.post(url).send(payload).expect(StatusCodes.CREATED)
        })
      })
    })

    describe('And he does have a simulation', () => {
      test(`Then it returns a ${StatusCodes.CREATED} response with the created group`, async () => {
        const userId = faker.string.uuid()
        const name = faker.person.fullName()
        const simulation = getSimulationPayload()
        const payload: GroupCreateInputDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
          administrator: {
            userId,
            name,
          },
          participants: [
            {
              simulation,
            },
          ],
        }

        const response = await agent
          .post(url)
          .send(payload)
          .expect(StatusCodes.CREATED)

        expect(response.body).toEqual({
          ...payload,
          id: expect.any(String),
          administrator: {
            id: userId,
            name,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            email: null,
          },
          participants: [
            {
              id: expect.any(String),
              ...payload.administrator,
              email: null,
              simulation: {
                ...simulation,
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
        })
      })

      test('Then it stores a group in database', async () => {
        const userId = faker.string.uuid()
        const email = faker.internet.email().toLocaleLowerCase()
        const name = faker.person.fullName()
        const simulation = getSimulationPayload()
        const payload: GroupCreateInputDto = {
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
          administrator: {
            userId,
            email,
            name,
          },
          participants: [
            {
              simulation,
            },
          ],
        }

        mswServer.use(brevoSendEmail(), brevoUpdateContact())

        const {
          body: { id },
        } = await agent.post(url).send(payload).expect(StatusCodes.CREATED)

        const createdGroup = await prisma.group.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
            emoji: true,
            administrator: {
              select: {
                user: true,
              },
            },
            participants: {
              select: {
                id: true,
                simulationId: true,
                user: true,
              },
            },
            updatedAt: true,
            createdAt: true,
          },
        })

        expect(createdGroup).toEqual({
          ...payload,
          id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          administrator: {
            user: {
              id: userId,
              name,
              email,
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
            },
          },
          participants: [
            {
              id: expect.any(String),
              simulationId: simulation.id,
              user: {
                id: userId,
                name,
                email,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
              },
            },
          ],
        })
      })

      describe('And leaving his/her email', () => {
        test('Then it adds or updates group administrator in brevo', async () => {
          const date = new Date()
          const email = faker.internet.email().toLocaleLowerCase()
          const userId = faker.string.uuid()
          const name = faker.person.fullName()
          const simulation = getSimulationPayload({ date })
          const { computedResults } = simulation
          const payload: GroupCreateInputDto = {
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId,
              email,
              name,
            },
            participants: [
              {
                simulation,
              },
            ],
          }

          const contactBodies: unknown[] = []

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact({
              storeBodies: contactBodies,
            })
          )

          await agent.post(url).send(payload).expect(StatusCodes.CREATED)

          await EventBus.flush()

          expect(contactBodies).toEqual(
            expect.arrayContaining([
              {
                email,
                listIds: [29],
                attributes: {
                  USER_ID: userId,
                  NUMBER_CREATED_GROUPS: 1,
                  LAST_GROUP_CREATION_DATE: expect.any(String),
                  NUMBER_CREATED_GROUPS_WITH_ONE_PARTICIPANT: 1,
                  PRENOM: name,
                },
                updateEnabled: true,
              },
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
                  PRENOM: name,
                },
                updateEnabled: true,
              },
            ])
          )
        })

        test('Then it sends a creation email', async () => {
          const email = faker.internet.email().toLocaleLowerCase()
          const userId = faker.string.uuid()
          const name = faker.person.fullName()
          const simulation = getSimulationPayload()
          const payload: GroupCreateInputDto = {
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId,
              email,
              name,
            },
            participants: [
              {
                simulation,
              },
            ],
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
                templateId: 57,
                params: {
                  GROUP_URL: expect.stringMatching(
                    new RegExp(
                      '^https:\\/\\/nosgestesclimat\\.fr\\/amis\\/resultats\\?groupId=[a-zA-Z0-9_]+&mtm_campaign=email-automatise&mtm_kwd=groupe-admin-voir-classement$'
                    )
                  ),
                  SHARE_URL: expect.stringMatching(
                    new RegExp(
                      '^https:\\/\\/nosgestesclimat\\.fr\\/amis\\/invitation\\?groupId=[a-zA-Z0-9_]+&mtm_campaign=email-automatise&mtm_kwd=groupe-admin-url-partage$'
                    )
                  ),
                  DELETE_URL: expect.stringMatching(
                    new RegExp(
                      `^https:\\/\\/nosgestesclimat\\.fr\\/amis\\/supprimer\\?groupId=[a-zA-Z0-9_]+&userId=${userId}&mtm_campaign=email-automatise&mtm_kwd=groupe-admin-delete$`
                    )
                  ),
                  GROUP_NAME: payload.name,
                  NAME: name,
                },
              },
            }),
            brevoUpdateContact()
          )

          await agent.post(url).send(payload).expect(StatusCodes.CREATED)

          await EventBus.flush()
        })

        describe('And custom user origin (preprod)', () => {
          test('Then it sends a creation email', async () => {
            const email = faker.internet.email().toLocaleLowerCase()
            const userId = faker.string.uuid()
            const name = faker.person.fullName()
            const simulation = getSimulationPayload()
            const payload: GroupCreateInputDto = {
              name: faker.company.name(),
              emoji: faker.internet.emoji(),
              administrator: {
                userId,
                email,
                name,
              },
              participants: [
                {
                  simulation,
                },
              ],
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
                  templateId: 57,
                  params: {
                    GROUP_URL: expect.stringMatching(
                      new RegExp(
                        '^https:\\/\\/preprod\\.nosgestesclimat\\.fr\\/amis\\/resultats\\?groupId=[a-zA-Z0-9_]+&mtm_campaign=email-automatise&mtm_kwd=groupe-admin-voir-classement$'
                      )
                    ),
                    SHARE_URL: expect.stringMatching(
                      new RegExp(
                        '^https:\\/\\/preprod\\.nosgestesclimat\\.fr\\/amis\\/invitation\\?groupId=[a-zA-Z0-9_]+&mtm_campaign=email-automatise&mtm_kwd=groupe-admin-url-partage$'
                      )
                    ),
                    DELETE_URL: expect.stringMatching(
                      new RegExp(
                        `^https:\\/\\/preprod\\.nosgestesclimat\\.fr\\/amis\\/supprimer\\?groupId=[a-zA-Z0-9_]+&userId=${userId}&mtm_campaign=email-automatise&mtm_kwd=groupe-admin-delete$`
                      )
                    ),

                    GROUP_NAME: payload.name,
                    NAME: name,
                  },
                },
              }),
              brevoUpdateContact()
            )

            await agent
              .post(url)
              .set('origin', 'https://preprod.nosgestesclimat.fr')
              .send(payload)
              .expect(StatusCodes.CREATED)

            await EventBus.flush()
          })
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
          .post(url)
          .send({
            name: faker.company.name(),
            emoji: faker.internet.emoji(),
            administrator: {
              userId: faker.string.uuid(),
              name: faker.person.fullName(),
            },
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent.post(url).send({
          name: faker.company.name(),
          emoji: faker.internet.emoji(),
          administrator: {
            userId: faker.string.uuid(),
            name: faker.person.fullName(),
          },
        })

        expect(logger.error).toHaveBeenCalledWith(
          'Group creation failed',
          databaseError
        )
      })
    })
  })
})
