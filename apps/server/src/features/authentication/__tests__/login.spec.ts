import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { VerificationCodeMode } from '../../../adapters/prisma/generated.js'
import {
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { Locales } from '../../../core/i18n/constant.js'
import logger from '../../../logger.js'
import { LOGIN_ROUTE } from './fixtures/login.fixture.js'
import { createVerificationCode } from './fixtures/verification-codes.fixture.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = LOGIN_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.verificationCode.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.user.deleteMany(),
    ])
  })

  describe('When logging in', () => {
    describe('And no data provided', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent.post(url).expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            userId: faker.string.alpha(34),
            email: faker.internet.email(),
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            userId: faker.string.uuid(),
            email: 'Je ne donne jamais mon email',
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid code', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            userId: faker.string.uuid(),
            email: faker.internet.email(),
            code: '42',
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And verification code does not exist', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .post(url)
          .send({
            userId: faker.string.uuid(),
            email: faker.internet.email(),
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And verification code does exist', () => {
      test(`Then it returns a ${StatusCodes.OK} response with a cookie`, async () => {
        const verificationCode = await createVerificationCode({ agent })

        const payload = {
          userId: faker.string.uuid(),
          email: verificationCode.email,
          code: verificationCode.code,
        }

        mswServer.use(brevoUpdateContact(), brevoSendEmail())

        const response = await agent
          .post(url)
          .send(payload)
          .expect(StatusCodes.OK)

        const [cookie] = response.headers['set-cookie']
        const token = cookie
          .split(';')
          .shift()
          ?.replace('ngc_server_auth_jwt=', '')
        await EventBus.flush()

        expect(jwt.decode(token!)).toEqual({
          userId: payload.userId,
          email: verificationCode.email,
          exp: expect.any(Number),
          iat: expect.any(Number),
        })
      })

      test('Then it updates brevo contact', async () => {
        const verificationCode = await createVerificationCode({ agent })

        const payload = {
          userId: faker.string.uuid(),
          email: verificationCode.email,
          code: verificationCode.code,
        }
        mswServer.use(
          brevoUpdateContact({
            expectBody: {
              email: verificationCode.email,
              attributes: {
                USER_ID: payload.userId,
              },
              updateEnabled: true,
            },
          }),
          brevoSendEmail()
        )

        await agent.post(url).send(payload).expect(StatusCodes.OK)

        await EventBus.flush()
      })

      describe('And is expired', () => {
        test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
          const verificationCode = await createVerificationCode({
            agent,
            expirationDate: dayjs().subtract(1, 'second').toDate(),
          })

          await agent
            .post(url)
            .send({
              email: verificationCode.email,
              code: verificationCode.code,
              userId: faker.string.uuid(),
            })
            .expect(StatusCodes.UNAUTHORIZED)
        })
      })

      describe(`And is ${VerificationCodeMode.signUp} mode`, () => {
        test('Then it creates the verified user', async () => {
          const { email, code } = await createVerificationCode({
            agent,
            mode: VerificationCodeMode.signUp,
          })

          const payload = {
            userId: faker.string.uuid(),
            email,
            code,
          }

          mswServer.use(brevoUpdateContact(), brevoSendEmail())

          await agent.post(url).send(payload).expect(StatusCodes.OK)

          const createdUser = await prisma.verifiedUser.findUnique({
            where: { email },
          })

          expect(createdUser).toEqual({
            email,
            id: payload.userId,
            name: null,
            optedInForCommunications: false,
            position: null,
            telephone: null,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
          await EventBus.flush()
        })

        test('Then it invalidates the verification code', async () => {
          const { email, code } = await createVerificationCode({
            agent,
            mode: VerificationCodeMode.signUp,
          })

          const payload = {
            userId: faker.string.uuid(),
            email,
            code,
          }

          mswServer.use(brevoUpdateContact(), brevoSendEmail())

          await agent.post(url).send(payload).expect(StatusCodes.OK)

          const [verificationCode] = await prisma.verificationCode.findMany({
            where: { email },
          })

          expect(
            Math.floor(
              (Date.now() - verificationCode.expirationDate.getTime()) / 1000
            )
          ).toBe(0)
          await EventBus.flush()
        })

        test('Then it sends a welcome email', async () => {
          const { email, code } = await createVerificationCode({
            agent,
            mode: VerificationCodeMode.signUp,
          })

          const payload = {
            email,
            code,
            userId: faker.string.uuid(),
          }

          mswServer.use(
            brevoUpdateContact({
              expectBody: {
                email,
                attributes: {
                  USER_ID: payload.userId,
                },
                updateEnabled: true,
              },
            }),
            brevoSendEmail({
              expectBody: {
                to: [
                  {
                    name: email,
                    email,
                  },
                ],
                templateId: 137,
                params: {
                  DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
                },
              },
            })
          )

          await agent.post(url).send(payload).expect(StatusCodes.OK)
          await EventBus.flush()
        })

        describe('And custom user origin (preprod)', () => {
          test('Then it sends a welcome email', async () => {
            const { email, code } = await createVerificationCode({
              agent,
              mode: VerificationCodeMode.signUp,
            })

            const payload = {
              userId: faker.string.uuid(),
              email,
              code,
            }

            mswServer.use(
              brevoUpdateContact({
                expectBody: {
                  email,
                  attributes: {
                    USER_ID: payload.userId,
                  },
                  updateEnabled: true,
                },
              }),
              brevoSendEmail({
                expectBody: {
                  to: [
                    {
                      name: email,
                      email,
                    },
                  ],
                  templateId: 137,
                  params: {
                    DASHBOARD_URL:
                      'https://preprod.nosgestesclimat.fr/mon-espace',
                  },
                },
              })
            )

            await agent
              .post(url)
              .set('origin', 'https://preprod.nosgestesclimat.fr')
              .send(payload)
              .expect(StatusCodes.OK)
          })
        })

        describe(`And ${Locales.en} locale`, () => {
          test('Then it sends a welcome email', async () => {
            const { email, code } = await createVerificationCode({
              agent,
              mode: VerificationCodeMode.signUp,
            })

            const payload = {
              userId: faker.string.uuid(),
              email,
              code,
            }

            mswServer.use(
              brevoUpdateContact({
                expectBody: {
                  email,
                  attributes: {
                    USER_ID: payload.userId,
                  },
                  updateEnabled: true,
                },
              }),
              brevoSendEmail({
                expectBody: {
                  to: [
                    {
                      name: email,
                      email,
                    },
                  ],
                  templateId: 139,
                  params: {
                    DASHBOARD_URL: 'https://nosgestesclimat.fr/mon-espace',
                  },
                },
              })
            )

            await agent
              .post(url)
              .send(payload)
              .query({ locale: Locales.en })
              .expect(StatusCodes.OK)
          })
        })
      })

      describe('And userId is already attached to another verified account', () => {
        let emailA: string
        let emailB: string
        let userIdA: string

        beforeEach(async () => {
          emailA = faker.internet.email().toLocaleLowerCase()
          emailB = faker.internet.email().toLocaleLowerCase()
          userIdA = faker.string.uuid()

          // Sign up user A with userIdA
          const signUpCodeA = await createVerificationCode({
            agent,
            verificationCode: { email: emailA },
            mode: VerificationCodeMode.signUp,
          })

          mswServer.use(brevoUpdateContact(), brevoSendEmail())

          await agent
            .post(url)
            .send({
              userId: userIdA,
              email: signUpCodeA.email,
              code: signUpCodeA.code,
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()

          // Sign up user B with a different userId
          const userIdB = faker.string.uuid()
          const signUpCodeB = await createVerificationCode({
            agent,
            verificationCode: { email: emailB },
            mode: VerificationCodeMode.signUp,
          })

          mswServer.use(brevoUpdateContact(), brevoSendEmail())

          await agent
            .post(url)
            .send({
              userId: userIdB,
              email: signUpCodeB.email,
              code: signUpCodeB.code,
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()
        })

        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const signInCode = await createVerificationCode({
            agent,
            verificationCode: { email: emailB },
            mode: VerificationCodeMode.signIn,
          })

          await agent
            .post(url)
            .send({
              userId: userIdA,
              email: signInCode.email,
              code: signInCode.code,
            })
            .expect(StatusCodes.FORBIDDEN)
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
            userId: faker.string.uuid(),
            email: faker.internet.email(),
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent.post(url).send({
          userId: faker.string.uuid(),
          email: faker.internet.email(),
          code: faker.number.int({ min: 100000, max: 999999 }).toString(),
        })

        expect(logger.error).toHaveBeenCalledWith('Login failed', databaseError)
      })
    })
  })
})
