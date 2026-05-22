import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import logger from '../../../logger.ts'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.ts'
import { COOKIE_NAME } from '../../authentication/authentication.service.ts'
import {
  createOrganisation,
  createOrganisationPoll,
  FETCH_ORGANISATION_POLL_ROUTE,
} from './fixtures/organisations.fixture.ts'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_ORGANISATION_POLL_ROUTE

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
    describe('When fetching one of his organisation poll', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(
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

  describe('And invalid cookie', () => {
    describe('When fetching one of his organisation poll', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(
            url
              .replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
              .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
          )
          .set('cookie', `${COOKIE_NAME}=invalid cookie`)
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And logged in', () => {
    let cookie: string

    beforeEach(async () => {
      ;({ cookie } = await login({ agent }))
    })

    describe('When fetching one of his organisation poll', () => {
      describe('And organisation does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .get(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set('cookie', cookie)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And organisation does exist', () => {
        let organisationId: string
        let organisationSlug: string

        beforeEach(
          async () =>
            ({ id: organisationId, slug: organisationSlug } =
              await createOrganisation({
                agent,
                cookie,
              }))
        )

        describe('And poll does not exist in the organisation', () => {
          test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
            await agent
              .get(
                url
                  .replace(':organisationIdOrSlug', organisationId)
                  .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
              )
              .set('cookie', cookie)
              .expect(StatusCodes.NOT_FOUND)
          })
        })

        describe('And poll does exist in the organisation', () => {
          let poll: Awaited<ReturnType<typeof createOrganisationPoll>>
          let pollId: string
          let pollSlug: string

          beforeEach(async () => {
            poll = await createOrganisationPoll({
              agent,
              cookie,
              organisationId,
            })
            ;({ id: pollId, slug: pollSlug } = poll)
          })

          test(`Then it returns a ${StatusCodes.OK} response with the poll`, async () => {
            const response = await agent
              .get(
                url
                  .replace(':organisationIdOrSlug', organisationId)
                  .replace(':pollIdOrSlug', pollId)
              )
              .set('cookie', cookie)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual(poll)
          })

          describe('And using organisation and poll slugs', () => {
            test(`Then it returns a ${StatusCodes.OK} response with the poll`, async () => {
              const response = await agent
                .get(
                  url
                    .replace(':organisationIdOrSlug', organisationSlug)
                    .replace(':pollIdOrSlug', pollSlug)
                )
                .set('cookie', cookie)
                .expect(StatusCodes.OK)

              expect(response.body).toEqual(poll)
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
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set('cookie', cookie)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(
              url
                .replace(
                  ':organisationIdOrSlug',
                  faker.database.mongodbObjectId()
                )
                .replace(':pollIdOrSlug', faker.database.mongodbObjectId())
            )
            .set('cookie', cookie)

          expect(logger.error).toHaveBeenCalledWith(
            'Poll fetch failed',
            databaseError
          )
        })
      })
    })
  })
})
