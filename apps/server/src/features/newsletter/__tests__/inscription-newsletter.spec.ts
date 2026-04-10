import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoGetContact,
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { ListIds } from '../../../adapters/brevo/constant.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import * as authenticationService from '../../authentication/authentication.service.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = '/newsletters/v1/inscription'

  afterEach(async () => {
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When subscribing to newsletters', () => {
    describe('And invalid email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            email: 'invalid-email',
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid listIds (not in allowed newsletters)', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            email: faker.internet.email(),
            listIds: [999],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid listIds (negative number)', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            email: faker.internet.email(),
            listIds: [-1],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And missing email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And missing listIds', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .post(url)
          .send({
            email: faker.internet.email(),
          })
          .expect(StatusCodes.BAD_REQUEST)
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
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .post(url)
          .send({
            email: faker.internet.email(),
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'Newsletter inscription failed',
          databaseError
        )
      })
    })
  })

  describe('And user is NOT authenticated', () => {
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

    describe('When subscribing to a single newsletter', () => {
      test(`Then it sends a confirmation email and returns a ${StatusCodes.OK} response`, async () => {
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
              templateId: 118,
              params: {
                NEWSLETTER_CONFIRMATION_URL: expect.stringContaining(
                  `code=${code}`
                ),
              },
            },
          })
        )

        const { body } = await agent
          .post(url)
          .send({
            email,
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()

        expect(body).toEqual({
          email,
          listIds: [ListIds.MAIN_NEWSLETTER],
        })
      })

      test('Then it stores a verification code valid 1 day in database', async () => {
        const email = faker.internet.email().toLocaleLowerCase()

        mswServer.use(brevoSendEmail())

        const now = Date.now()
        const oneDay = 1000 * 60 * 60 * 24

        await agent
          .post(url)
          .send({
            email,
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()

        const [verificationCode] = await prisma.verificationCode.findMany()

        expect(verificationCode).toMatchObject({
          id: expect.any(String),
          code,
          email,
          mode: null,
          expirationDate: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })

        // Hopefully code gets created under 1 second
        expect(
          Math.floor(
            (verificationCode.expirationDate.getTime() - now - oneDay) / 1000
          )
        ).toBe(0)
      })
    })

    describe('When subscribing to multiple newsletters', () => {
      test(`Then it sends a confirmation email and returns a ${StatusCodes.OK} response`, async () => {
        const email = faker.internet.email().toLocaleLowerCase()
        const listIds = [
          ListIds.MAIN_NEWSLETTER,
          ListIds.TRANSPORT_NEWSLETTER,
          ListIds.LOGEMENT_NEWSLETTER,
        ]

        mswServer.use(
          brevoSendEmail({
            expectBody: {
              to: [
                {
                  name: email,
                  email,
                },
              ],
              templateId: 118,
              params: {
                NEWSLETTER_CONFIRMATION_URL: expect.stringContaining(
                  `code=${code}`
                ),
              },
            },
          })
        )

        const { body } = await agent
          .post(url)
          .send({
            email,
            listIds,
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()

        expect(body).toEqual({
          email,
          listIds,
        })
      })
    })

    describe('And custom origin (preprod)', () => {
      test(`Then it sends a confirmation email with correct origin and returns a ${StatusCodes.OK} response`, async () => {
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
              templateId: 118,
              params: {
                NEWSLETTER_CONFIRMATION_URL: expect.stringContaining(
                  encodeURIComponent('https://preprod.nosgestesclimat.fr')
                ),
              },
            },
          })
        )

        const { body } = await agent
          .post(url)
          .set('origin', 'https://preprod.nosgestesclimat.fr')
          .send({
            email,
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.OK)

        await EventBus.flush()

        expect(body).toEqual({
          email,
          listIds: [ListIds.MAIN_NEWSLETTER],
        })
      })
    })
  })

  describe('And user is authenticated', () => {
    let email: string
    let userId: string
    let cookie: string

    beforeEach(async () => {
      ;({ cookie, email, userId } = await login({
        agent,
      }))
    })

    describe('When subscribing with a different email than the logged in user', () => {
      test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
        const differentEmail = faker.internet.email().toLocaleLowerCase()

        const { body } = await agent
          .post(url)
          .set('cookie', cookie)
          .send({
            email: differentEmail,
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.FORBIDDEN)

        expect(body).toEqual({ message: 'Email mismatch' })
      })
    })

    describe('When subscribing with the same email as the logged in user', () => {
      describe('And no existing Brevo contact', () => {
        test(`Then it directly updates newsletters in Brevo and returns a ${StatusCodes.OK} response`, async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: {
                    code: 'document_not_found',
                    message: 'Contact does not exist',
                  },
                  status: StatusCodes.NOT_FOUND,
                },
              ],
            }),
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [ListIds.MAIN_NEWSLETTER],
                attributes: {},
                updateEnabled: true,
              },
            })
          )

          const { body } = await agent
            .post(url)
            .set('cookie', cookie)
            .send({
              email,
              listIds: [ListIds.MAIN_NEWSLETTER],
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()

          expect(body).toEqual({
            email,
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
        })
      })

      describe('And existing Brevo contact with no newsletters', () => {
        test(`Then it directly updates newsletters in Brevo and returns a ${StatusCodes.OK} response`, async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: {
                    id: faker.number.int(),
                    email,
                    listIds: [],
                    attributes: {
                      USER_ID: userId,
                    },
                  },
                },
              ],
            }),
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [
                  ListIds.MAIN_NEWSLETTER,
                  ListIds.TRANSPORT_NEWSLETTER,
                ],
                attributes: {},
                updateEnabled: true,
              },
            })
          )

          const { body } = await agent
            .post(url)
            .set('cookie', cookie)
            .send({
              email,
              listIds: [ListIds.MAIN_NEWSLETTER, ListIds.TRANSPORT_NEWSLETTER],
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()

          expect(body).toEqual({
            email,
            listIds: [ListIds.MAIN_NEWSLETTER, ListIds.TRANSPORT_NEWSLETTER],
          })
        })
      })

      describe('And existing Brevo contact with some newsletters', () => {
        test('Then it unsubscribes from old newsletters and subscribes to new ones', async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: {
                    id: faker.number.int(),
                    email,
                    listIds: [
                      ListIds.MAIN_NEWSLETTER,
                      ListIds.TRANSPORT_NEWSLETTER,
                    ],
                    attributes: {
                      USER_ID: userId,
                    },
                  },
                },
              ],
            }),
            brevoRemoveFromList(ListIds.TRANSPORT_NEWSLETTER, {
              expectBody: {
                emails: [email],
              },
            }),
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [ListIds.MAIN_NEWSLETTER],
                attributes: {},
                updateEnabled: true,
              },
            })
          )

          const { body } = await agent
            .post(url)
            .set('cookie', cookie)
            .send({
              email,
              listIds: [ListIds.MAIN_NEWSLETTER],
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()

          expect(body).toEqual({
            email,
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
        })
      })

      describe('And unsubscribing from all newsletters (empty listIds)', () => {
        test('Then it removes user from all newsletters', async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: {
                    id: faker.number.int(),
                    email,
                    listIds: [
                      ListIds.MAIN_NEWSLETTER,
                      ListIds.TRANSPORT_NEWSLETTER,
                      ListIds.LOGEMENT_NEWSLETTER,
                    ],
                    attributes: {
                      USER_ID: userId,
                    },
                  },
                },
              ],
            }),
            brevoRemoveFromList(ListIds.MAIN_NEWSLETTER, {
              expectBody: {
                emails: [email],
              },
            }),
            brevoRemoveFromList(ListIds.TRANSPORT_NEWSLETTER, {
              expectBody: {
                emails: [email],
              },
            }),
            brevoRemoveFromList(ListIds.LOGEMENT_NEWSLETTER, {
              expectBody: {
                emails: [email],
              },
            }),
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [],
                attributes: {},
                updateEnabled: true,
              },
            })
          )

          const { body } = await agent
            .post(url)
            .set('cookie', cookie)
            .send({
              email,
              listIds: [],
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()

          expect(body).toEqual({
            email,
            listIds: [],
          })
        })
      })

      describe('And contact has technical newsletters (not in reachable list)', () => {
        test('Then it does not unsubscribe from technical newsletters', async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: {
                    id: faker.number.int(),
                    email,
                    listIds: [
                      ListIds.MAIN_NEWSLETTER,
                      ListIds.GROUP_CREATED,
                      ListIds.GROUP_JOINED,
                    ],
                    attributes: {
                      USER_ID: userId,
                    },
                  },
                },
              ],
            }),
            brevoRemoveFromList(ListIds.MAIN_NEWSLETTER, {
              expectBody: {
                emails: [email],
              },
            }),
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [],
                attributes: {},
                updateEnabled: true,
              },
            })
          )

          const { body } = await agent
            .post(url)
            .set('cookie', cookie)
            .send({
              email,
              listIds: [],
            })
            .expect(StatusCodes.OK)

          await EventBus.flush()

          expect(body).toEqual({
            email,
            listIds: [],
          })
        })
      })
    })
  })
})
