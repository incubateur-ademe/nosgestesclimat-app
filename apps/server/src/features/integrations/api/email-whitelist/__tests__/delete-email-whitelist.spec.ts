import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiScopeName } from '../../../../../adapters/prisma/generated.js'
import { prisma } from '../../../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../../../adapters/prisma/transaction.js'
import app from '../../../../../app.js'
import { config } from '../../../../../config.js'
import logger from '../../../../../logger.js'
import {
  randomApiScopeName,
  recoverApiToken,
} from '../../authentication/__tests__/fixtures/authentication.fixtures.js'
import {
  createEmailWhitelist,
  DELETE_EMAIL_WHITELIST_ROUTE,
} from './fixtures/email-whitelist.fixture.js'

describe('Given a NGC integrations API user', () => {
  const agent = supertest(app)
  const url = DELETE_EMAIL_WHITELIST_ROUTE

  afterEach(async () => {
    await prisma.integrationWhitelist.deleteMany()
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.integrationApiScope.deleteMany(),
    ])
  })

  describe('When deleting an Email Whitelist', () => {
    describe('And not authenticated', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.delete(url).expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid token', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .delete(url)
          .set('authorization', 'Bearer invalid token')
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And expired token', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        const token = jwt.sign(
          { email: faker.internet.email(), scopes: [randomApiScopeName()] },
          config.security.jwt.secret,
          {
            expiresIn: -1,
          }
        )

        await agent
          .delete(url)
          .set('authorization', `Bearer ${token}`)
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe.each(
      Object.values(ApiScopeName)
        .filter((scopeName) => scopeName != ApiScopeName.ngc)
        .map((scope) => ({ scope }))
    )('And valid $scope token', ({ scope }) => {
      let whitelistId: string
      let token: string

      beforeEach(async () => {
        ;({ token } = await recoverApiToken({
          apiScope: { name: scope },
          prisma,
          agent,
        }))
      })

      describe.each(
        Object.values(ApiScopeName)
          .filter((scopeName) => scopeName != scope)
          .map((forbiddenScope) => ({ forbiddenScope }))
      )('And whitelist has $forbiddenScope scope', ({ forbiddenScope }) => {
        beforeEach(async () => {
          const { token: ngcToken } = await recoverApiToken({
            prisma,
            agent,
          })
          ;({ id: whitelistId } = await createEmailWhitelist({
            agent,
            prisma,
            token: ngcToken,
            emailWhitelist: {
              scope: forbiddenScope,
            },
          }))
        })

        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .delete(url.replace(':whitelistId', whitelistId))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe(`And whitelist has ${scope} scope`, () => {
        beforeEach(async () => {
          ;({ id: whitelistId } = await createEmailWhitelist({
            agent,
            token,
            prisma,
            emailWhitelist: {
              scope,
            },
          }))
        })

        test(`Then it return a ${StatusCodes.NO_CONTENT} response`, async () => {
          const { body } = await agent
            .delete(url.replace(':whitelistId', whitelistId))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.NO_CONTENT)

          expect(body).toEqual({})
        })
      })
    })

    describe(`And valid ${ApiScopeName.ngc} token`, () => {
      let token: string

      beforeEach(async () => {
        ;({ token } = await recoverApiToken({
          prisma,
          agent,
        }))
      })

      describe('And invalid whitelistId', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .delete(url.replace(':whitelistId', faker.string.alpha(34)))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And whitelist does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .delete(url.replace(':whitelistId', faker.string.uuid()))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And whitelist does exist', () => {
        let whitelistId: string

        beforeEach(async () => {
          ;({ id: whitelistId } = await createEmailWhitelist({
            agent,
            token,
            prisma,
          }))
        })

        test(`Then it return a ${StatusCodes.NO_CONTENT} response`, async () => {
          const { body } = await agent
            .delete(url.replace(':whitelistId', whitelistId))
            .set('authorization', `Bearer ${token}`)
            .expect(StatusCodes.NO_CONTENT)

          expect(body).toEqual({})
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
              .delete(url.replace(':whitelistId', faker.string.uuid()))
              .set('authorization', `Bearer ${token}`)
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)
          })

          test('Then it logs the exception', async () => {
            await agent
              .delete(url.replace(':whitelistId', faker.string.uuid()))
              .set('authorization', `Bearer ${token}`)
              .expect(StatusCodes.INTERNAL_SERVER_ERROR)

            expect(logger.error).toHaveBeenCalledWith(
              'Email Whitelist deletion failed',
              databaseError
            )
          })
        })
      })
    })
  })
})
