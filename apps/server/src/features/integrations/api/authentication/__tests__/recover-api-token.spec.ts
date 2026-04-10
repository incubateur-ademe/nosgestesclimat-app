import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiScopeName } from '../../../../../adapters/prisma/generated.js'
import { prisma } from '../../../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../../../adapters/prisma/transaction.js'
import app from '../../../../../app.js'
import logger from '../../../../../logger.js'
import {
  generateApiToken,
  RECOVER_API_TOKEN_ROUTE,
} from './fixtures/authentication.fixtures.js'

vi.mock('../../../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../../../adapters/prisma/transaction')),
}))

describe('Given a NGC integrations API user', () => {
  const agent = supertest(app)
  const url = RECOVER_API_TOKEN_ROUTE

  afterEach(async () => {
    await prisma.integrationWhitelist.deleteMany()
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.integrationApiScope.deleteMany(),
    ])
  })

  describe('When recovering an API token', () => {
    describe('And invalid email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({
            email: 'Je ne donne jamais mon email',
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid code', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({
            email: faker.internet.email(),
            code: '42',
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And verification code does not exist', () => {
      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .get(url)
          .query({
            email: faker.internet.email(),
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And verification code is expired', () => {
      let email: string
      let code: string

      beforeEach(async () => {
        ;({ email, code } = await generateApiToken({
          expirationDate: dayjs().subtract(1, 'second').toDate(),
          prisma,
          agent,
        }))
      })

      test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
        await agent
          .get(url)
          .query({
            email,
            code,
          })
          .expect(StatusCodes.NOT_FOUND)
      })
    })

    describe('And verification code does exist', () => {
      let email: string
      let code: string

      beforeEach(async () => {
        ;({ email, code } = await generateApiToken({
          apiScope: {
            name: ApiScopeName.ngc,
          },
          prisma,
          agent,
        }))
      })

      test(`Then it returns a ${StatusCodes.OK} response with tokens`, async () => {
        const {
          body: { token, refreshToken },
        } = await agent
          .get(url)
          .query({
            email,
            code,
          })
          .expect(StatusCodes.OK)

        expect(jwt.decode(token)).toEqual({
          scopes: [ApiScopeName.ngc],
          email,
          exp: expect.any(Number),
          iat: expect.any(Number),
        })

        expect(jwt.decode(refreshToken)).toEqual({
          scopes: ['refresh-token'],
          email,
          exp: expect.any(Number),
          iat: expect.any(Number),
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
          .get(url)
          .query({
            email: faker.internet.email(),
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(url)
          .query({
            email: faker.internet.email(),
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Recover API token failed',
          databaseError
        )
      })
    })
  })
})
