import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import logger from '../../../logger.ts'
import {
  createOrganisation,
  createOrganisationPoll,
  FETCH_ORGANISATION_POLLS_ROUTE,
} from './fixtures/organisations.fixture.ts'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_ORGANISATION_POLLS_ROUTE

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
    describe('When fetching his organisation polls', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(
            url.replace(
              ':organisationIdOrSlug',
              faker.database.mongodbObjectId()
            )
          )
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And not a verified user', () => {
    describe('When fetching his organisation polls', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .get(
            url.replace(
              ':organisationIdOrSlug',
              faker.database.mongodbObjectId()
            )
          )
          .set(authHeaders({ userId: faker.string.uuid() }))
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And a verified user', () => {
    let userId: string
    let email: string

    beforeEach(() => {
      userId = faker.string.uuid()
      email = faker.internet.email()
    })

    describe('When fetching his organisation polls', () => {
      describe('And organisation does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .get(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set(authHeaders({ userId, email }))
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
                userId,
                email,
              }))
        )

        describe('And no poll in the organisation', () => {
          test(`Then it returns a ${StatusCodes.OK} response with an empty list`, async () => {
            const response = await agent
              .get(url.replace(':organisationIdOrSlug', organisationId))
              .set(authHeaders({ userId, email }))
              .expect(StatusCodes.OK)

            expect(response.body).toEqual([])
          })
        })

        describe('And poll does exist in the organisation', () => {
          let poll: Awaited<ReturnType<typeof createOrganisationPoll>>

          beforeEach(async () => {
            poll = await createOrganisationPoll({
              agent,
              userId,
              email,
              organisationId,
            })
          })

          test(`Then it returns a ${StatusCodes.OK} response with a list containing the poll`, async () => {
            const response = await agent
              .get(url.replace(':organisationIdOrSlug', organisationId))
              .set(authHeaders({ userId, email }))
              .expect(StatusCodes.OK)

            expect(response.body).toEqual([poll])
          })

          describe('And using organisation slug', () => {
            test(`Then it returns a ${StatusCodes.OK} response with a list containing the poll`, async () => {
              const response = await agent
                .get(url.replace(':organisationIdOrSlug', organisationSlug))
                .set(authHeaders({ userId, email }))
                .expect(StatusCodes.OK)

              expect(response.body).toEqual([poll])
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
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .get(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set(authHeaders({ userId, email }))

          expect(logger.error).toHaveBeenCalledWith(
            'Polls fetch failed',
            databaseError
          )
        })
      })
    })
  })
})
