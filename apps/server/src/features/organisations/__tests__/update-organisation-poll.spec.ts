import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import { PollDefaultAdditionalQuestionType } from '../../../adapters/prisma/generated.ts'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../core/event-bus/event-bus.ts'
import logger from '../../../logger.ts'
import type { OrganisationPollUpdateDto } from '../organisations.validator.ts'
import {
  createOrganisation,
  createOrganisationPoll,
  UPDATE_ORGANISATION_POLL_ROUTE,
} from './fixtures/organisations.fixture.ts'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = UPDATE_ORGANISATION_POLL_ROUTE

  afterEach(async () => {
    await prisma.organisationAdministrator.deleteMany()
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('And no authentication', () => {
    describe('When updating one of his organisation poll', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .put(
            url
              .replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
              .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
          )
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And not a verified user', () => {
    describe('When updating one of his organisation poll', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .put(
            url
              .replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
              .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
          )
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And a verified user', () => {
    let email: string
    let userId: string

    beforeEach(() => {
      userId = faker.string.uuid()
      email = faker.internet.email()
    })

    describe('When updating one of his organisation poll', () => {
      describe('And invalid name', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
              name: '',
            })
            .expect(StatusCodes.BAD_REQUEST)

          await agent
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
              name: faker.string.alpha(151),
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid defaultAdditionalQuestions', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
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
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
              customAdditionalQuestions: [{}],
            })
            .expect(StatusCodes.BAD_REQUEST)

          await agent
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
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

      describe('And poll does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And poll does exist', () => {
        let organisationId: string
        let organisationName: string
        let organisationSlug: string
        let organisationType: string
        let pollId: string
        let pollSlug: string
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>

        beforeEach(async () => {
          ;({
            id: organisationId,
            name: organisationName,
            slug: organisationSlug,
            type: organisationType,
          } = await createOrganisation({
            agent,
            userId,
            email,
          }))

          poll = await createOrganisationPoll({
            agent,
            userId,
            email,
            organisationId,
          })
          ;({ id: pollId, slug: pollSlug } = poll)
        })

        test(`Then it returns a ${StatusCodes.OK} response with the updated poll`, async () => {
          const payload: OrganisationPollUpdateDto = {
            name: faker.company.buzzNoun(),
          }

          mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

          const response = await agent
            .put(
              url
                .replace(':organisationIdOrSlug', organisationId)
                .replace(':pollIdOrSlug', pollId)
            )
            .set(authHeaders({ userId, email }))
            .send(payload)
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            ...poll,
            ...payload,
            updatedAt: expect.any(String),
          })
        })

        describe('And no data in the update', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the unchanged poll`, async () => {
            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            const response = await agent
              .put(
                url
                  .replace(':organisationIdOrSlug', organisationId)
                  .replace(':pollIdOrSlug', pollId)
              )
              .set(authHeaders({ userId, email }))
              .send({})
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              ...poll,
              updatedAt: expect.any(String),
            })
          })
        })

        test('Then it updates organisation administrator in brevo', async () => {
          const payload: OrganisationPollUpdateDto = {
            name: faker.company.buzzNoun(),
          }

          mswServer.use(
            brevoUpdateContact({
              expectBody: {
                email,
                attributes: {
                  USER_ID: userId,
                  IS_ORGANISATION_ADMIN: true,
                  ORGANISATION_NAME: organisationName,
                  ORGANISATION_SLUG: organisationSlug,
                  OPT_IN: false,
                  ORGANISATION_TYPE: organisationType,
                },
                updateEnabled: true,
              },
            }),
            brevoRemoveFromList(27)
          )

          await agent
            .put(
              url
                .replace(':organisationIdOrSlug', organisationId)
                .replace(':pollIdOrSlug', pollId)
            )
            .set(authHeaders({ userId, email }))
            .send(payload)
            .expect(StatusCodes.OK)

          await EventBus.flush()
        })

        describe('And using organisation and poll slugs', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the updated poll`, async () => {
            const payload: OrganisationPollUpdateDto = {
              name: faker.company.buzzNoun(),
            }

            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            const response = await agent
              .put(
                url
                  .replace(':organisationIdOrSlug', organisationSlug)
                  .replace(':pollIdOrSlug', pollSlug)
              )
              .set(authHeaders({ userId, email }))
              .send(payload)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              ...poll,
              ...payload,
              updatedAt: expect.any(String),
            })
          })
        })

        describe('And updating defaultAdditionalQuestions', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the updated group`, async () => {
            const payload: OrganisationPollUpdateDto = {
              defaultAdditionalQuestions: [
                PollDefaultAdditionalQuestionType.postalCode,
              ],
            }

            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            let response = await agent
              .put(
                url
                  .replace(':organisationIdOrSlug', organisationId)
                  .replace(':pollIdOrSlug', pollId)
              )
              .set(authHeaders({ userId, email }))
              .send(payload)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              ...poll,
              ...payload,
              updatedAt: expect.any(String),
            })

            payload.defaultAdditionalQuestions = [
              PollDefaultAdditionalQuestionType.birthdate,
            ]

            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            response = await agent
              .put(
                url
                  .replace(':organisationIdOrSlug', organisationId)
                  .replace(':pollIdOrSlug', pollId)
              )
              .set(authHeaders({ userId, email }))
              .send(payload)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              ...poll,
              ...payload,
              updatedAt: expect.any(String),
            })
          })
        })
      })

      describe('And poll does exist And administrator opt in for communications', () => {
        let organisationId: string
        let organisationName: string
        let organisationSlug: string
        let organisationType: string
        let pollId: string
        let poll: Awaited<ReturnType<typeof createOrganisationPoll>>

        beforeEach(async () => {
          ;({
            id: organisationId,
            name: organisationName,
            slug: organisationSlug,
            type: organisationType,
          } = await createOrganisation({
            agent,
            userId,
            email,
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
            userId,
            email,
            organisationId,
          })
          ;({ id: pollId } = poll)
        })

        test('Then it updates organisation administrator in brevo', async () => {
          const payload: OrganisationPollUpdateDto = {
            name: faker.company.buzzNoun(),
          }

          mswServer.use(
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [27],
                attributes: {
                  USER_ID: userId,
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
            .put(
              url
                .replace(':organisationIdOrSlug', organisationId)
                .replace(':pollIdOrSlug', pollId)
            )
            .set(authHeaders({ userId, email }))
            .send(payload)
            .expect(StatusCodes.OK)

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
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
              name: faker.company.buzzNoun(),
            })
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .put(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set(authHeaders({ userId, email }))
            .send({
              name: faker.company.buzzNoun(),
            })
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Poll update failed',
            databaseError
          )
        })
      })
    })
  })
})
