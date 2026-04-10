import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'

import slugify from 'slugify'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import { PollDefaultAdditionalQuestionType } from '../../../adapters/prisma/generated.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { Locales } from '../../../core/i18n/constant.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { COOKIE_NAME } from '../../authentication/authentication.service.js'
import { type OrganisationPollCreateDto } from '../organisations.validator.js'
import {
  CREATE_ORGANISATION_POLL_ROUTE,
  createOrganisation,
  createOrganisationPoll,
} from './fixtures/organisations.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_ORGANISATION_POLL_ROUTE

  afterEach(async () => {
    await prisma.organisationAdministrator.deleteMany()
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('And logged out', () => {
    describe('When creating a poll in his organisation', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .post(
            url.replace(
              ':organisationIdOrSlug',
              faker.database.mongodbObjectId()
            )
          )
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And invalid cookie', () => {
    describe('When creating a poll in his organisation', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .post(
            url.replace(
              ':organisationIdOrSlug',
              faker.database.mongodbObjectId()
            )
          )
          .set('cookie', `${COOKIE_NAME}=invalid cookie`)
          .expect(StatusCodes.UNAUTHORIZED)
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

    describe('When creating a poll in his organisation', () => {
      describe('And no data provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid name', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: '',
            })
            .expect(StatusCodes.BAD_REQUEST)

          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.string.alpha(151),
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid defaultAdditionalQuestions', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.buzzNoun(),
              defaultAdditionalQuestions: [
                'my-invalid-pollDefaultAdditionalQuestionType',
              ],
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid customAdditionalQuestions', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.buzzNoun(),
              defaultAdditionalQuestions: [
                PollDefaultAdditionalQuestionType.birthdate,
              ],
              customAdditionalQuestions: [{}],
            })
            .expect(StatusCodes.BAD_REQUEST)

          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.buzzNoun(),
              defaultAdditionalQuestions: [
                PollDefaultAdditionalQuestionType.postalCode,
              ],
              customAdditionalQuestions: [
                {
                  question: 'Question 1',
                  isEnabled: true,
                },
                {
                  question: 'Question 2',
                  isEnabled: true,
                },
                {
                  question: 'Question 3',
                  isEnabled: true,
                },
                {
                  question: 'Question 4',
                  isEnabled: true,
                },
                {
                  question: 'Question 5',
                  isEnabled: true,
                },
              ],
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And organisation does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.buzzNoun(),
            })
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And organisation does exist', () => {
        let organisation: Awaited<ReturnType<typeof createOrganisation>>
        let _organisationPolls: unknown
        let organisationId: string
        let organisationName: string
        let organisationSlug: string

        beforeEach(async () => {
          ;({ polls: _organisationPolls, ...organisation } =
            await createOrganisation({
              agent,
              cookie,
            }))
          ;({
            id: organisationId,
            name: organisationName,
            slug: organisationSlug,
          } = organisation)
        })

        test(`Then it returns a ${StatusCodes.CREATED} response with the created poll`, async () => {
          const payload = {
            name: faker.company.buzzNoun(),
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          const response = await agent
            .post(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            ...payload,
            id: expect.any(String),
            organisation,
            slug: slugify.default(payload.name.toLowerCase(), { strict: true }),
            defaultAdditionalQuestions: [],
            customAdditionalQuestions: [],
            expectedNumberOfParticipants: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            computedResults: null,
            funFacts: null,
            simulations: {
              count: 0,
              finished: 0,
              hasParticipated: false,
            },
          })
        })

        test('Then it stores a poll in database', async () => {
          const payload: OrganisationPollCreateDto = {
            name: faker.company.buzzNoun(),
            defaultAdditionalQuestions: [
              PollDefaultAdditionalQuestionType.postalCode,
            ],
            customAdditionalQuestions: [
              {
                question: 'Est-ce que tu buildes ?',
                isEnabled: true,
              },
            ],
            expectedNumberOfParticipants: faker.number.int({ max: 100 }),
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          const {
            body: { id },
          } = await agent
            .post(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          const createdPoll = await prisma.poll.findUnique({
            where: {
              id,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              customAdditionalQuestions: true,
              defaultAdditionalQuestions: {
                select: {
                  type: true,
                },
              },
              computedResults: true,
              funFacts: true,
              organisationId: true,
              expectedNumberOfParticipants: true,
              createdAt: true,
              updatedAt: true,
            },
          })
          expect(createdPoll).toEqual({
            ...payload,
            id,
            computedResults: null,
            funFacts: null,
            slug: slugify.default(payload.name.toLowerCase(), { strict: true }),
            organisationId,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            defaultAdditionalQuestions: payload.defaultAdditionalQuestions?.map(
              (type) => ({ type })
            ),
          })
        })

        test('Then it updates organisation administrator in brevo', async () => {
          const payload: OrganisationPollCreateDto = {
            name: faker.company.buzzNoun(),
            defaultAdditionalQuestions: [
              PollDefaultAdditionalQuestionType.postalCode,
            ],
            customAdditionalQuestions: [
              {
                question: 'Est-ce que tu buildes ?',
                isEnabled: true,
              },
            ],
            expectedNumberOfParticipants: faker.number.int({ max: 100 }),
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact({
              expectBody: {
                email,
                attributes: {
                  USER_ID: userId,
                  IS_ORGANISATION_ADMIN: true,
                  ORGANISATION_NAME: organisationName,
                  ORGANISATION_SLUG: organisationSlug,
                  LAST_POLL_PARTICIPANTS_NUMBER: 0,
                  OPT_IN: false,
                },
                updateEnabled: true,
              },
            }),
            brevoRemoveFromList(27)
          )

          await agent
            .post(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })

        test('Then it sends a creation email', async () => {
          const payload = {
            name: faker.company.buzzNoun(),
          }

          const orgaSlug = slugify.default(organisation.name.toLowerCase(), {
            strict: true,
          })
          const pollSlug = slugify.default(payload.name.toLowerCase(), {
            strict: true,
          })

          const searchParams = new URLSearchParams()
          searchParams.set('mtm_campaign', `Organisation_${organisation.name}`)
          searchParams.set('mtm_kwd', payload.name)

          mswServer.use(
            brevoSendEmail({
              expectBody: {
                to: [
                  {
                    name: email,
                    email,
                  },
                ],
                templateId: 126,
                params: {
                  ADMINISTRATOR_NAME: null,
                  DASHBOARD_URL: `https://nosgestesclimat.fr/organisations/${orgaSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=poll-admin-creation`,
                  POLL_NAME: payload.name,
                  POLL_URL: `https://nosgestesclimat.fr/o/${orgaSlug}/${pollSlug}?${searchParams.toString()}`,
                },
              },
            }),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          await agent
            .post(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)
        })

        describe('And custom user origin (preprod)', () => {
          test('Then it sends a creation email', async () => {
            const payload = {
              name: faker.company.buzzNoun(),
            }

            const orgaSlug = slugify.default(organisation.name.toLowerCase(), {
              strict: true,
            })
            const pollSlug = slugify.default(payload.name.toLowerCase(), {
              strict: true,
            })

            const searchParams = new URLSearchParams()
            searchParams.set(
              'mtm_campaign',
              `Organisation_${organisation.name}`
            )
            searchParams.set('mtm_kwd', payload.name)

            mswServer.use(
              brevoSendEmail({
                expectBody: {
                  to: [
                    {
                      name: email,
                      email,
                    },
                  ],
                  templateId: 126,
                  params: {
                    ADMINISTRATOR_NAME: null,
                    DASHBOARD_URL: `https://preprod.nosgestesclimat.fr/organisations/${orgaSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=poll-admin-creation`,
                    POLL_NAME: payload.name,
                    POLL_URL: `https://preprod.nosgestesclimat.fr/o/${orgaSlug}/${pollSlug}?${searchParams.toString()}`,
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(27)
            )

            await agent
              .post(url.replace(':organisationIdOrSlug', organisationId))
              .set('cookie', cookie)
              .send(payload)
              .set('origin', 'https://preprod.nosgestesclimat.fr')
              .expect(StatusCodes.CREATED)
          })
        })

        describe(`And ${Locales.en} locale`, () => {
          test('Then it sends a creation email', async () => {
            const payload = {
              name: faker.company.buzzNoun(),
            }

            const orgaSlug = slugify.default(organisation.name.toLowerCase(), {
              strict: true,
            })
            const pollSlug = slugify.default(payload.name.toLowerCase(), {
              strict: true,
            })

            const searchParams = new URLSearchParams()
            searchParams.set(
              'mtm_campaign',
              `Organisation_${organisation.name}`
            )
            searchParams.set('mtm_kwd', payload.name)

            mswServer.use(
              brevoSendEmail({
                expectBody: {
                  to: [
                    {
                      name: email,
                      email,
                    },
                  ],
                  templateId: 127,
                  params: {
                    ADMINISTRATOR_NAME: null,
                    DASHBOARD_URL: `https://nosgestesclimat.fr/organisations/${orgaSlug}/campagnes/${pollSlug}?mtm_campaign=email-automatise&mtm_kwd=poll-admin-creation`,
                    POLL_NAME: payload.name,
                    POLL_URL: `https://nosgestesclimat.fr/o/${orgaSlug}/${pollSlug}?${searchParams.toString()}`,
                  },
                },
              }),
              brevoUpdateContact(),
              brevoRemoveFromList(27)
            )

            await agent
              .post(url.replace(':organisationIdOrSlug', organisationId))
              .set('cookie', cookie)
              .send(payload)
              .query({
                locale: Locales.en,
              })
              .expect(StatusCodes.CREATED)
          })
        })

        describe('And using the organisation slug', () => {
          test(`Then it returns a ${StatusCodes.CREATED} response with the created poll`, async () => {
            const payload = {
              name: faker.company.buzzNoun(),
            }

            mswServer.use(
              brevoSendEmail(),
              brevoUpdateContact(),
              brevoRemoveFromList(27)
            )

            const response = await agent
              .post(url.replace(':organisationIdOrSlug', organisationSlug))
              .set('cookie', cookie)
              .send(payload)
              .expect(StatusCodes.CREATED)

            expect(response.body).toEqual({
              ...payload,
              organisation,
              id: expect.any(String),
              slug: slugify.default(payload.name.toLowerCase(), {
                strict: true,
              }),
              defaultAdditionalQuestions: [],
              customAdditionalQuestions: [],
              expectedNumberOfParticipants: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              computedResults: null,
              funFacts: null,
              simulations: {
                count: 0,
                finished: 0,
                hasParticipated: false,
              },
            })
          })
        })
      })

      describe('And organisation does exist And administrator opt in for communications', () => {
        let organisationId: string
        let organisationName: string
        let organisationSlug: string

        beforeEach(
          async () =>
            ({
              id: organisationId,
              name: organisationName,
              slug: organisationSlug,
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
        )

        test('Then it updates organisation administrator in brevo', async () => {
          const payload: OrganisationPollCreateDto = {
            name: faker.company.buzzNoun(),
            defaultAdditionalQuestions: [
              PollDefaultAdditionalQuestionType.postalCode,
            ],
            customAdditionalQuestions: [
              {
                question: 'Est-ce que tu buildes ?',
                isEnabled: true,
              },
            ],
            expectedNumberOfParticipants: faker.number.int({ max: 100 }),
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [27],
                attributes: {
                  USER_ID: userId,
                  IS_ORGANISATION_ADMIN: true,
                  ORGANISATION_NAME: organisationName,
                  ORGANISATION_SLUG: organisationSlug,
                  LAST_POLL_PARTICIPANTS_NUMBER: 0,
                  OPT_IN: true,
                },
                updateEnabled: true,
              },
            })
          )

          await agent
            .post(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })
      })

      describe('And a poll with the same name already exists in the organisation', () => {
        let organisation: Awaited<ReturnType<typeof createOrganisation>>
        let _organisationPolls: unknown
        let organisationId: string
        let name: string

        beforeEach(async () => {
          ;({ polls: _organisationPolls, ...organisation } =
            await createOrganisation({
              agent,
              cookie,
            }))
          ;({ id: organisationId } = organisation)
          name = faker.company.buzzNoun()
          await createOrganisationPoll({
            agent,
            cookie,
            organisationId,
            poll: { name },
          })
        })

        test(`Then it returns a ${StatusCodes.CREATED} response with the created poll and an incremented slug`, async () => {
          const payload = {
            name,
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact(),
            brevoRemoveFromList(27)
          )

          const response = await agent
            .post(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            ...payload,
            organisation,
            id: expect.any(String),
            slug: `${slugify.default(payload.name.toLowerCase(), { strict: true })}-1`,
            defaultAdditionalQuestions: [],
            customAdditionalQuestions: [],
            expectedNumberOfParticipants: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            computedResults: null,
            funFacts: null,
            simulations: {
              count: 0,
              finished: 0,
              hasParticipated: false,
            },
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
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.buzzNoun(),
            })
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .post(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.buzzNoun(),
            })

          expect(logger.error).toHaveBeenCalledWith(
            'Poll creation failed',
            databaseError
          )
        })
      })
    })
  })
})
