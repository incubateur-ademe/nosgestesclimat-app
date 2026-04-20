import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import { brevoSendEmail } from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import {
  VerificationCodeMode,
  type VerifiedUser,
} from '../../../adapters/prisma/generated.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { Locales } from '../../../core/i18n/constant.js'
import logger from '../../../logger.js'
import * as authenticationService from '../authentication.service.js'
import type { VerificationCodeCreateDto } from '../verification-codes.validator.js'
import { CREATE_VERIFICATION_CODE_ROUTE } from './fixtures/verification-codes.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_VERIFICATION_CODE_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.verifiedUser.deleteMany(),
    ])
  })

  describe('When creating a verification-code', () => {
    let code: string

    beforeEach(() => {
      code = faker.number.int({ min: 100000, max: 999999 }).toString()
      vi.mocked(
        authenticationService
      ).generateRandomVerificationCode.mockReturnValueOnce(code)
    })

    afterEach(() => {
      vi.mocked(
        authenticationService
      ).generateRandomVerificationCode.mockRestore()
    })

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

    test(`Then it returns a ${StatusCodes.CREATED} response with the created verification code`, async () => {
      const payload = {
        email: faker.internet.email().toLocaleLowerCase(),
      }

      mswServer.use(brevoSendEmail())

      const response = await agent
        .post(url)
        .send(payload)
        .expect(StatusCodes.CREATED)

      expect(response.body).toEqual({
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        expirationDate: expect.any(String),
        ...payload,
      })
    })

    test('Then it stores a verification code valid 1 hour in database', async () => {
      const payload: VerificationCodeCreateDto = {
        email: faker.internet.email().toLocaleLowerCase(),
      }

      mswServer.use(brevoSendEmail())

      const now = Date.now()
      const oneHour = 1000 * 60 * 60

      await agent.post(url).send(payload)

      const createdVerificationCode = await prisma.verificationCode.findFirst({
        where: {
          email: payload.email,
        },
      })

      expect(createdVerificationCode).toMatchObject({
        id: expect.any(String),
        code,
        mode: null,
        expirationDate: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        ...payload,
      })

      // Hopefully code gets created under 1 second
      expect(
        Math.floor(
          (createdVerificationCode!.expirationDate.getTime() - now - oneHour) /
            1000
        )
      ).toBe(0)
    })

    // eslint-disable-next-line vitest/expect-expect
    test('Then it sends an email with the code', async () => {
      const email = faker.internet.email().toLocaleLowerCase()

      mswServer.use(
        brevoSendEmail({
          expectBody: {
            to: [
              {
                name: email,
                email,
              },
            ],
            templateId: 66,
            params: {
              VERIFICATION_CODE: code,
            },
          },
        })
      )

      await agent.post(url).send({
        email,
      })

      await EventBus.flush()
    })

    describe(`And ${Locales.en} locale`, () => {
      // eslint-disable-next-line vitest/expect-expect
      test('Then it sends an email with the code', async () => {
        const email = faker.internet.email().toLocaleLowerCase()

        mswServer.use(
          brevoSendEmail({
            expectBody: {
              to: [
                {
                  name: email,
                  email,
                },
              ],
              templateId: 125,
              params: {
                VERIFICATION_CODE: code,
              },
            },
          })
        )

        await agent
          .post(url)
          .send({
            email,
          })
          .query({
            locale: Locales.en,
          })

        await EventBus.flush()
      })
    })

    describe(`And ${VerificationCodeMode.signUp} mode`, () => {
      describe('And new user', () => {
        test(`Then it returns a ${StatusCodes.CREATED} response with the created verification code`, async () => {
          const payload = {
            email: faker.internet.email().toLocaleLowerCase(),
          }

          mswServer.use(brevoSendEmail())

          const response = await agent
            .post(url)
            .send(payload)
            .query({
              mode: VerificationCodeMode.signUp,
            })
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            expirationDate: expect.any(String),
            ...payload,
          })
        })

        test('Then it stores a verification code valid 1 hour in database', async () => {
          const payload = {
            email: faker.internet.email().toLocaleLowerCase(),
          }

          mswServer.use(brevoSendEmail())

          const now = Date.now()
          const oneHour = 1000 * 60 * 60

          await agent
            .post(url)
            .send(payload)
            .query({
              mode: VerificationCodeMode.signUp,
            })
            .expect(StatusCodes.CREATED)

          const [verificationCode] = await prisma.verificationCode.findMany()

          expect(verificationCode).toMatchObject({
            ...payload,
            id: expect.any(String),
            code,
            mode: VerificationCodeMode.signUp,
            expirationDate: expect.any(Date),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })

          // Hopefully code gets created under 1 second
          expect(
            Math.floor(
              (verificationCode.expirationDate.getTime() - now - oneHour) / 1000
            )
          ).toBe(0)
        })
      })

      describe('And existing user', () => {
        let user: Pick<VerifiedUser, 'id' | 'email'>

        beforeEach(async () => {
          user = {
            email: faker.internet.email().toLocaleLowerCase(),
            id: faker.string.uuid(),
          }

          await prisma.verifiedUser.create({
            data: user,
          })
        })

        test(`Then it returns a ${StatusCodes.CONFLICT} error`, async () => {
          const payload = {
            email: user.email,
          }

          await agent
            .post(url)
            .send(payload)
            .query({
              mode: VerificationCodeMode.signUp,
            })
            .expect(StatusCodes.CONFLICT)
        })
      })
    })

    describe(`And ${VerificationCodeMode.signIn} mode`, () => {
      describe('And new user', () => {
        test(`Then it returns a ${StatusCodes.CONFLICT} error`, async () => {
          const payload = {
            email: faker.internet.email().toLocaleLowerCase(),
          }

          await agent
            .post(url)
            .send(payload)
            .query({
              mode: VerificationCodeMode.signIn,
            })
            .expect(StatusCodes.CONFLICT)
        })
      })

      describe('And existing user', () => {
        let user: Pick<VerifiedUser, 'id' | 'email'>

        beforeEach(async () => {
          user = {
            id: faker.string.uuid(),
            email: faker.internet.email().toLocaleLowerCase(),
          }

          await prisma.verifiedUser.create({
            data: user,
          })
        })

        test(`Then it returns a ${StatusCodes.CREATED} response with the created verification code`, async () => {
          const payload = {
            email: user.email,
          }

          mswServer.use(brevoSendEmail())

          const response = await agent
            .post(url)
            .send(payload)
            .query({
              mode: VerificationCodeMode.signIn,
            })
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            expirationDate: expect.any(String),
            ...payload,
          })
        })

        test('Then it stores a verification code valid 1 hour in database', async () => {
          const payload = {
            email: user.email,
          }

          mswServer.use(brevoSendEmail())

          const now = Date.now()
          const oneHour = 1000 * 60 * 60

          await agent
            .post(url)
            .send(payload)
            .query({
              mode: VerificationCodeMode.signIn,
            })
            .expect(StatusCodes.CREATED)

          const [verificationCode] = await prisma.verificationCode.findMany()

          expect(verificationCode).toMatchObject({
            ...payload,
            id: expect.any(String),
            code,
            mode: VerificationCodeMode.signIn,
            expirationDate: expect.any(Date),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })

          // Hopefully code gets created under 1 second
          expect(
            Math.floor(
              (verificationCode.expirationDate.getTime() - now - oneHour) / 1000
            )
          ).toBe(0)
        })
      })
    })
    describe('And several times', () => {
      let payload: VerificationCodeCreateDto
      let email: string
      beforeAll(() => {
        email = faker.internet.email()
      })
      beforeEach(async () => {
        payload = {
          email,
        }

        mswServer.use(brevoSendEmail())

        await agent.post(url).send(payload).expect(StatusCodes.CREATED)
      })

      test(`Then it returns a ${StatusCodes.TOO_MANY_REQUESTS} error`, async () => {
        await agent
          .post(url)
          .send(payload)
          .expect(StatusCodes.TOO_MANY_REQUESTS)
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
        await agent.post(url).send({
          email: faker.internet.email(),
        })

        expect(logger.error).toHaveBeenCalledWith(
          'VerificationCode creation failed',
          databaseError
        )
      })
    })
  })
})
