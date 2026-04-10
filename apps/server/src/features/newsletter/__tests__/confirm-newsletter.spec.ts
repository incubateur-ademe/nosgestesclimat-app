import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
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
import {
  mswServer,
  resetMswServer,
} from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import * as authenticationService from '../../authentication/authentication.service.js'

vi.mock('../../../adapters/prisma/transaction', async () => ({
  ...(await vi.importActual('../../../adapters/prisma/transaction')),
}))

const createNewsletterSubscriptionRequest = async ({
  agent,
  email,
  listIds,
  code,
  expirationDate,
}: {
  agent: ReturnType<typeof supertest>
  email?: string
  listIds?: number[]
  code?: string
  expirationDate?: Date
}) => {
  code = code || faker.number.int({ min: 100000, max: 999999 }).toString()
  email = email || faker.internet.email().toLocaleLowerCase()
  listIds = listIds || [ListIds.MAIN_NEWSLETTER]

  vi.mocked(
    authenticationService
  ).generateRandomVerificationCode.mockReturnValueOnce(code)

  mswServer.use(brevoSendEmail())

  await agent
    .post('/newsletters/v1/inscription')
    .send({
      email,
      listIds,
    })
    .expect(StatusCodes.OK)

  if (expirationDate) {
    await prisma.verificationCode.updateMany({
      data: {
        expirationDate,
      },
    })
  }

  await EventBus.flush()

  resetMswServer()

  vi.mocked(authenticationService).generateRandomVerificationCode.mockRestore()

  return {
    email,
    listIds,
    code,
  }
}

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = '/newsletters/v1/confirmation'

  afterEach(async () => {
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When confirming newsletter subscription', () => {
    describe('And invalid code', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({
            code: 'invalid',
            email: faker.internet.email(),
            origin: 'https://nosgestesclimat.fr',
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            email: 'invalid-email',
            origin: 'https://nosgestesclimat.fr',
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid origin (not a valid URL)', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            email: faker.internet.email(),
            origin: 'invalid-origin',
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid origin (not a base URL)', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            email: faker.internet.email(),
            origin: 'https://nosgestesclimat.fr/some-path',
            listIds: [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid listIds (not in allowed newsletters)', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .get(url)
          .query({
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            email: faker.internet.email(),
            origin: 'https://nosgestesclimat.fr',
            listIds: [999],
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

      test('Then it redirects to an error page', async () => {
        const response = await agent
          .get(url)
          .query({
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            email: faker.internet.email().toLocaleLowerCase(),
            origin: 'https://nosgestesclimat.fr',
            'listIds[]': [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.MOVED_TEMPORARILY)

        expect(response.get('location')).toBe(
          'https://nosgestesclimat.fr/newsletter-confirmation?success=false&status=500'
        )
      })

      test('Then it logs the exception', async () => {
        await agent
          .get(url)
          .query({
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            email: faker.internet.email().toLocaleLowerCase(),
            origin: 'https://nosgestesclimat.fr',
            'listIds[]': [ListIds.MAIN_NEWSLETTER],
          })
          .expect(StatusCodes.MOVED_TEMPORARILY)

        expect(logger.error).toHaveBeenCalledWith(
          'Newsletter confirmation failed',
          databaseError
        )
      })
    })
  })

  describe('With an ongoing newsletter subscription request', () => {
    let listIds: number[]
    let email: string
    let code: string

    describe('And main newsletter', () => {
      beforeEach(async () => {
        ;({ email, listIds, code } = await createNewsletterSubscriptionRequest({
          agent,
        }))
      })

      describe('When clicking the confirmation email link', () => {
        test('Then it redirects to a success page', async () => {
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

          const response = await agent
            .get(url)
            .query({
              code,
              email,
              'listIds[]': listIds,
              origin: 'https://nosgestesclimat.fr',
            })
            .expect(StatusCodes.MOVED_TEMPORARILY)

          expect(response.get('location')).toBe(
            'https://nosgestesclimat.fr/newsletter-confirmation?success=true'
          )
        })

        describe('And custom user origin (preprod)', () => {
          test('Then it redirects to a success page on preprod', async () => {
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

            const response = await agent
              .get(url)
              .query({
                code,
                email,
                'listIds[]': listIds,
                origin: 'https://preprod.nosgestesclimat.fr',
              })
              .expect(StatusCodes.MOVED_TEMPORARILY)

            expect(response.get('location')).toBe(
              'https://preprod.nosgestesclimat.fr/newsletter-confirmation?success=true'
            )
          })
        })
      })
    })

    describe('And several newsletters', () => {
      beforeEach(async () => {
        ;({ email, listIds, code } = await createNewsletterSubscriptionRequest({
          agent,
          listIds: [
            ListIds.MAIN_NEWSLETTER,
            ListIds.LOGEMENT_NEWSLETTER,
            ListIds.TRANSPORT_NEWSLETTER,
          ],
        }))
      })

      describe('When clicking the confirmation email link', () => {
        test('Then it redirects to a success page', async () => {
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
                listIds: [
                  ListIds.MAIN_NEWSLETTER,
                  ListIds.LOGEMENT_NEWSLETTER,
                  ListIds.TRANSPORT_NEWSLETTER,
                ],
                attributes: {},
                updateEnabled: true,
              },
            })
          )

          const response = await agent
            .get(url)
            .query({
              code,
              email,
              'listIds[]': listIds,
              origin: 'https://nosgestesclimat.fr',
            })
            .expect(StatusCodes.MOVED_TEMPORARILY)

          expect(response.get('location')).toBe(
            'https://nosgestesclimat.fr/newsletter-confirmation?success=true'
          )
        })
      })
    })

    describe('And user already has a brevo contact with some subscribed newsletters', () => {
      beforeEach(async () => {
        ;({ email, listIds, code } = await createNewsletterSubscriptionRequest({
          agent,
          listIds: [ListIds.LOGEMENT_NEWSLETTER],
        }))
      })

      describe('When clicking the confirmation email link', () => {
        test('Then it unsubscribes from old newsletters and subscribes to new ones', async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: {
                    id: faker.number.int(),
                    email,
                    listIds: [ListIds.MAIN_NEWSLETTER],
                    attributes: {},
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
                listIds: expect.arrayContaining([ListIds.LOGEMENT_NEWSLETTER]),
                attributes: {},
                updateEnabled: true,
              },
            })
          )

          const response = await agent
            .get(url)
            .query({
              code,
              email,
              'listIds[]': listIds,
              origin: 'https://nosgestesclimat.fr',
            })
            .expect(StatusCodes.MOVED_TEMPORARILY)

          expect(response.get('location')).toBe(
            'https://nosgestesclimat.fr/newsletter-confirmation?success=true'
          )
        })
      })
    })
  })

  describe('With an expired newsletter subscription request', () => {
    let listIds: number[]
    let email: string
    let code: string

    beforeEach(async () => {
      ;({ email, listIds, code } = await createNewsletterSubscriptionRequest({
        agent,
        expirationDate: dayjs().subtract(1, 'second').toDate(),
      }))
    })

    describe('When clicking the confirmation email link', () => {
      test('Then it redirects to an error page with 404 status', async () => {
        const response = await agent
          .get(url)
          .query({
            code,
            email,
            'listIds[]': listIds,
            origin: 'https://nosgestesclimat.fr',
          })
          .expect(StatusCodes.MOVED_TEMPORARILY)

        expect(response.get('location')).toBe(
          'https://nosgestesclimat.fr/newsletter-confirmation?success=false&status=404'
        )
      })
    })
  })

  describe('With a non-existent verification code', () => {
    describe('When clicking the confirmation email link', () => {
      test('Then it redirects to an error page with 404 status', async () => {
        const response = await agent
          .get(url)
          .query({
            code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            email: faker.internet.email().toLocaleLowerCase(),
            'listIds[]': [ListIds.MAIN_NEWSLETTER],
            origin: 'https://nosgestesclimat.fr',
          })
          .expect(StatusCodes.MOVED_TEMPORARILY)

        expect(response.get('location')).toBe(
          'https://nosgestesclimat.fr/newsletter-confirmation?success=false&status=404'
        )
      })
    })
  })
})
