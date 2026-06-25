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
  FETCH_ORGANISATION_ROUTE,
} from './fixtures/organisations.fixture.ts'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = FETCH_ORGANISATION_ROUTE

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
    describe('When fetching his organisation', () => {
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
    describe('When fetching his organisation', () => {
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

    describe('When fetching his organisation', () => {
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
        let organisation: Awaited<ReturnType<typeof createOrganisation>>

        beforeEach(
          async () =>
            (organisation = await createOrganisation({ agent, userId, email }))
        )

        test(`Then it returns a ${StatusCodes.OK} response with a list containing the organisation`, async () => {
          const response = await agent
            .get(url.replace(':organisationIdOrSlug', organisation.id))
            .set(authHeaders({ userId, email }))
            .expect(StatusCodes.OK)

          expect(response.body).toEqual(organisation)
        })

        describe('And using organisation slug', () => {
          test(`Then it returns a ${StatusCodes.OK} response with a list containing the organisation`, async () => {
            const response = await agent
              .get(url.replace(':organisationIdOrSlug', organisation.slug))
              .set(authHeaders({ userId, email }))
              .expect(StatusCodes.OK)

            expect(response.body).toEqual(organisation)
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
            'Organisation fetch failed',
            databaseError
          )
        })
      })
    })
  })
})
