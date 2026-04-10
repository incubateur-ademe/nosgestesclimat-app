import { faker } from '@faker-js/faker'
import { AxiosError } from 'axios'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { ZodError } from 'zod'
import { brevoGetContact } from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { getBrevoContact } from './fixtures/users.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = '/users/v1/me/contact'

  afterEach(async () => {
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When fetching the contact info', () => {
    describe('And user is not authenticated', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.get(url).expect(StatusCodes.UNAUTHORIZED)
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

      test(`Then it returns a ${StatusCodes.OK} response with the mapped user contact`, async () => {
        const contactId = faker.number.int()
        const listIds = [faker.number.int(), faker.number.int()]

        mswServer.use(
          brevoGetContact(email, {
            customResponses: [
              {
                body: getBrevoContact({
                  email,
                  id: contactId,
                  attributes: {
                    USER_ID: userId,
                  },
                  listIds,
                }),
              },
            ],
          })
        )

        const { body } = await agent
          .get(url)
          .set('Cookie', cookie)
          .expect(StatusCodes.OK)

        await EventBus.flush()

        expect(body).toEqual({
          id: contactId,
          email,
          listIds,
        })
      })

      describe('And user contact does not exist in Brevo', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: {
                    code: 'document_not_found',
                    message: 'List ID does not exist',
                  },
                  status: StatusCodes.NOT_FOUND,
                },
              ],
            })
          )

          await agent
            .get(url)
            .set('Cookie', cookie)
            .expect(StatusCodes.NOT_FOUND)

          await EventBus.flush()
        })
      })

      describe('And network error', () => {
        test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} response`, async () => {
          mswServer.use(brevoGetContact(email, { networkError: true }))

          const { body } = await agent
            .get(url)
            .set('Cookie', cookie)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          await EventBus.flush()

          expect(body).toEqual({})
        })
      })

      describe('And brevo is down', () => {
        test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} response after retries and logs the exception`, async () => {
          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
                { status: StatusCodes.INTERNAL_SERVER_ERROR },
              ],
            })
          )

          const { body } = await agent
            .get(url)
            .set('Cookie', cookie)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          await EventBus.flush()

          expect(body).toEqual({})
          expect(logger.error).toHaveBeenCalledWith(
            'User contact fetch failed',
            expect.any(AxiosError)
          )
        })
      })

      describe('And brevo interface changes', () => {
        test(`Then it returns a ${StatusCodes.INTERNAL_SERVER_ERROR} response and logs the exception`, async () => {
          mswServer.use(
            brevoGetContact(email, { customResponses: [{ body: {} }] })
          )

          const { body } = await agent
            .get(url)
            .set('Cookie', cookie)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          await EventBus.flush()

          expect(body).toEqual({})
          expect(logger.error).toHaveBeenCalledWith(
            'User contact fetch failed',
            expect.any(ZodError)
          )
        })
      })
    })
  })
})
