import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { brevoSendEmail } from '../../../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../../../adapters/prisma/transaction.js'
import app from '../../../../../app.js'
import { mswServer } from '../../../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../../../core/event-bus/event-bus.js'
import logger from '../../../../../logger.js'
import * as authenticationService from '../../../../authentication/authentication.service.js'
import {
  createIntegrationEmailWhitelist,
  GENERATE_API_TOKEN_ROUTE,
} from './fixtures/authentication.fixtures.js'

describe('Given a NGC integrations API user', () => {
  const agent = supertest(app)
  const url = GENERATE_API_TOKEN_ROUTE

  afterEach(async () => {
    await prisma.integrationWhitelist.deleteMany()
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.integrationApiScope.deleteMany(),
    ])
  })

  describe('When asking for an API token', () => {
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
            email: 'Je ne donne jamais mon email',
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And email is not whitelisted', () => {
      test(`Then it returns a ${StatusCodes.CREATED} response`, async () => {
        await agent
          .post(url)
          .send({
            email: faker.internet.email(),
          })
          .expect(StatusCodes.CREATED)
      })
    })

    describe('And email is whitelisted', () => {
      let code: string
      let email: string

      beforeEach(async () => {
        ;({ emailPattern: email } = await createIntegrationEmailWhitelist({
          prisma,
        }))
        code = faker.number.int({ min: 100000, max: 999999 }).toString()
        vi.mocked(
          authenticationService
        ).generateRandomVerificationCode.mockReturnValueOnce(code)
      })

      test(`Then it returns a ${StatusCodes.CREATED} response`, async () => {
        mswServer.use(brevoSendEmail())

        await agent
          .post(url)
          .send({
            email,
          })
          .expect(StatusCodes.CREATED)
      })

      // @TODO if we keep api portal
      test.skip('Then it stores a verification code valid 1 hour in database', async () => {
        mswServer.use(brevoSendEmail())

        const now = Date.now()
        const oneHour = 1000 * 60 * 60

        await agent
          .post(url)
          .send({
            email,
          })
          .expect(StatusCodes.CREATED)

        const createdVerificationCode = await prisma.verificationCode.findFirst(
          {
            where: {
              email,
            },
          }
        )

        expect(createdVerificationCode).toMatchObject({
          id: expect.any(String),
          code,
          email,
          mode: null,
          expirationDate: expect.any(Date),
          userId: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })

        // Hopefully code gets created under 1 second
        expect(
          Math.floor(
            (createdVerificationCode!.expirationDate.getTime() -
              now -
              oneHour) /
              1000
          )
        ).toBe(0)
      })

      // @TODO if we keep api portal
      test.skip('Then it sends an email to recover the API token', async () => {
        mswServer.use(
          brevoSendEmail({
            expectBody: {
              to: [
                {
                  name: email,
                  email,
                },
              ],
              templateId: 116,
              params: {
                API_TOKEN_URL: `https://nosgestesclimat.fr/integrations-api/v1/tokens?code=${code}&email=${encodeURIComponent(email)}`,
              },
            },
          })
        )

        await agent
          .post(url)
          .send({
            email,
          })
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
      })

      describe('And custom user origin (preprod)', () => {
        test.skip('Then it sends a join email', async () => {
          mswServer.use(
            brevoSendEmail({
              expectBody: {
                to: [
                  {
                    name: email,
                    email,
                  },
                ],
                templateId: 116,
                params: {
                  API_TOKEN_URL: `https://preprod.nosgestesclimat.fr/integrations-api/v1/tokens?code=${code}&email=${encodeURIComponent(email)}`,
                },
              },
            })
          )

          await agent
            .post(url)
            .set('origin', 'https://preprod.nosgestesclimat.fr')
            .send({
              email,
            })
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })
      })
    })

    describe('And email domain whitelist', () => {
      let code: string
      let email: string

      beforeEach(async () => {
        email = faker.internet.email().toLocaleLowerCase()
        const [, emailDomain] = email.split('@')
        await createIntegrationEmailWhitelist({
          integrationWhitelist: {
            emailPattern: `*@${emailDomain}`,
          },
          prisma,
        })
        code = faker.number.int({ min: 100000, max: 999999 }).toString()
        vi.mocked(
          authenticationService
        ).generateRandomVerificationCode.mockReturnValueOnce(code)
      })

      test(`Then it returns a ${StatusCodes.CREATED} response`, async () => {
        mswServer.use(brevoSendEmail())

        await agent
          .post(url)
          .send({
            email,
          })
          .expect(StatusCodes.CREATED)
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
            email: faker.internet.email(),
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .post(url)
          .send({
            email: faker.internet.email(),
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'API token generation failed',
          databaseError
        )
      })
    })
  })
})
