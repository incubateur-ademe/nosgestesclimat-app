import { faker } from '@faker-js/faker'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoDeleteContact,
  brevoGetContact,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import type { BrevoContactDto } from '../../../adapters/brevo/client.ts'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { authHeaders } from '../../../core/__tests__/fixtures/authentication.fixture.ts'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../core/event-bus/event-bus.ts'
import logger from '../../../logger.ts'
import { createVerificationCode } from '../../authentication/__tests__/fixtures/verification-codes.fixture.ts'
import { createSimulation } from '../../simulations/__tests__/fixtures/simulations.fixtures.ts'
import {
  createUser,
  getBrevoContact,
  UPDATE_USER_ROUTE,
} from './fixtures/users.fixture.ts'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = UPDATE_USER_ROUTE

  afterEach(async () => {
    await Promise.all([
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('When updating his/her profile', () => {
    describe('And not authenticated', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .put(url)
          .send({
            email: faker.internet.email(),
          })
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })

    describe('And invalid email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .put(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({
            email: 'Je ne donne jamais mon email',
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid verification code', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        const userId = faker.string.uuid()

        await agent
          .put(url)
          .set(authHeaders({ userId, email: faker.internet.email() }))
          .query({
            code: '42',
          })
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
          .put(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({})
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .put(url)
          .set(authHeaders({ userId: faker.string.uuid() }))
          .send({})
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'User update failed',
          databaseError
        )
      })
    })
  })

  describe('And an anonymous user', () => {
    describe('When updating profile without email', () => {
      describe('And user does not already exist', () => {
        test(`Then it returns a ${StatusCodes.OK} response with created user`, async () => {
          const userId = faker.string.uuid()

          const { body } = await agent
            .put(url)
            .set(authHeaders({ userId }))
            .send({})
            .expect(StatusCodes.OK)

          expect(body).toEqual({
            id: userId,
            email: null,
            name: null,
            ageRange: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        })

        describe('And name', () => {
          test(`Then it returns a ${StatusCodes.OK} response with created user`, async () => {
            const userId = faker.string.uuid()
            const name = faker.person.firstName()

            const { body } = await agent
              .put(url)
              .set(authHeaders({ userId }))
              .send({ name })
              .expect(StatusCodes.OK)

            expect(body).toEqual({
              id: userId,
              email: null,
              name,
              ageRange: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            })
          })
        })
      })

      describe('And user already exists', () => {
        let userId: string

        beforeEach(async () => {
          ;({
            user: { id: userId },
          } = await createSimulation({
            agent,
          }))
        })

        test(`Then it returns a ${StatusCodes.OK} response with updated user`, async () => {
          const { body } = await agent
            .put(url)
            .set(authHeaders({ userId }))
            .send({})
            .expect(StatusCodes.OK)

          expect(body).toEqual({
            id: userId,
            email: null,
            name: null,
            ageRange: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        })

        describe('And name', () => {
          test(`Then it returns a ${StatusCodes.OK} response with updated user`, async () => {
            const name = faker.person.firstName()

            const { body } = await agent
              .put(url)
              .set(authHeaders({ userId }))
              .send({ name })
              .expect(StatusCodes.OK)

            expect(body).toEqual({
              id: userId,
              email: null,
              name,
              ageRange: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            })
          })
        })
      })
    })

    describe('When updating profile with an email', () => {
      test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
        const userId = faker.string.uuid()
        const email = faker.internet.email().toLocaleLowerCase()

        const response = await agent
          .put(url)
          .set(authHeaders({ userId }))
          .send({ email })
          .expect(StatusCodes.FORBIDDEN)

        expect(response.text).toEqual(
          'Forbidden ! Cannot update email without a verified account.'
        )
      })

      describe('And user already exists', () => {
        let userId: string

        beforeEach(async () => {
          ;({
            user: { id: userId },
          } = await createSimulation({
            agent,
          }))
        })

        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const email = faker.internet.email().toLocaleLowerCase()

          const response = await agent
            .put(url)
            .set(authHeaders({ userId }))
            .send({ email })
            .expect(StatusCodes.FORBIDDEN)

          expect(response.text).toEqual(
            'Forbidden ! Cannot update email without a verified account.'
          )
        })
      })
    })
  })

  describe('And a verified user', () => {
    let email: string
    let userId: string
    let contact: BrevoContactDto

    beforeEach(() => {
      email = faker.internet.email().toLocaleLowerCase()
      userId = faker.string.uuid()

      contact = getBrevoContact({
        email,
        attributes: {
          USER_ID: userId,
        },
      })
    })

    describe('When updating name', () => {
      test(`Then it returns a ${StatusCodes.OK} response with updated user`, async () => {
        const name = faker.person.firstName()

        mswServer.use(
          brevoGetContact(email, {
            customResponses: [{ body: contact }, { body: contact }],
          }),
          brevoUpdateContact()
        )

        const { body } = await agent
          .put(url)
          .set(authHeaders({ userId, email }))
          .send({ name })
          .expect(StatusCodes.OK)

        await EventBus.flush()

        expect(body).toEqual({
          id: userId,
          email,
          name,
          contact: {
            email: contact.email,
            id: contact.id,
            listIds: contact.listIds,
          },
          optedInForCommunications: false,
          position: null,
          telephone: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      })
    })

    describe('When submitting their own (unchanged) email', () => {
      test(`Then it returns a ${StatusCodes.OK} response with updated user`, async () => {
        const name = faker.person.firstName()

        mswServer.use(
          brevoGetContact(email, {
            customResponses: [{ body: contact }, { body: contact }],
          }),
          brevoUpdateContact()
        )

        const { body } = await agent
          .put(url)
          .set(authHeaders({ userId, email }))
          .send({ email, name })
          .expect(StatusCodes.OK)

        await EventBus.flush()

        expect(body).toEqual({
          id: userId,
          email,
          name,
          contact: {
            email: contact.email,
            id: contact.id,
            listIds: contact.listIds,
          },
          optedInForCommunications: false,
          position: null,
          telephone: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      })
    })

    describe('When updating his/her email', () => {
      let newEmail: string

      beforeEach(async () => {
        newEmail = faker.internet.email().toLocaleLowerCase()

        // Seed the verified user so there is an existing account to update.
        await createUser({ agent, user: { id: userId, email } })
      })

      describe('And no verification code provided', () => {
        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const response = await agent
            .put(url)
            .set(authHeaders({ userId, email }))
            .send({ email: newEmail })
            .expect(StatusCodes.FORBIDDEN)

          expect(response.text).toEqual(
            'Forbidden ! Cannot update email without a verification code.'
          )
        })
      })

      describe('And invalid verification code', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(url)
            .set(authHeaders({ userId, email }))
            .query({
              code: '42',
            })
            .send({ email: newEmail })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And verification code does not exist', () => {
        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const response = await agent
            .put(url)
            .set(authHeaders({ userId, email }))
            .query({
              code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            })
            .send({ email: newEmail })
            .expect(StatusCodes.FORBIDDEN)

          expect(response.text).toEqual(
            'Forbidden ! Invalid verification code.'
          )
        })
      })

      describe('And verification code does exist', () => {
        let code: string

        beforeEach(async () => {
          ;({ code } = await createVerificationCode({
            agent,
            verificationCode: { email: newEmail },
          }))
        })

        test(`Then it returns a ${StatusCodes.OK} response with the updated user`, async () => {
          const newContact = getBrevoContact({
            email: newEmail,
            attributes: {
              USER_ID: userId,
            },
          })

          mswServer.use(
            brevoGetContact(email, {
              customResponses: [{ body: contact }],
            }),
            brevoGetContact(newEmail, {
              customResponses: [
                {
                  body: {
                    code: 'document_not_found',
                    message: 'List ID does not exist',
                  },
                  status: StatusCodes.NOT_FOUND,
                },
                {
                  body: newContact,
                },
              ],
            }),
            brevoDeleteContact(email),
            brevoUpdateContact()
          )

          const response = await agent
            .put(url)
            .set(authHeaders({ userId, email }))
            .query({
              code,
            })
            .send({ email: newEmail })
            .expect(StatusCodes.OK)

          await EventBus.flush()

          expect(response.body).toEqual({
            contact: {
              email: newEmail,
              id: expect.any(Number),
              listIds: [],
            },
            createdAt: expect.any(String),
            email: newEmail,
            id: userId,
            name: null,
            optedInForCommunications: false,
            position: null,
            telephone: null,
            updatedAt: expect.any(String),
          })
        })

        describe('And new email has existing brevo contact', () => {
          test(`Then it returns a ${StatusCodes.OK} response with updated user`, async () => {
            const newContact = getBrevoContact({
              email: newEmail,
              attributes: {
                USER_ID: faker.string.uuid(),
              },
            })

            mswServer.use(
              brevoGetContact(email, {
                customResponses: [{ body: contact }],
              }),
              brevoGetContact(newEmail, {
                customResponses: [{ body: newContact }, { body: newContact }],
              }),
              brevoDeleteContact(email),
              brevoUpdateContact()
            )

            const response = await agent
              .put(url)
              .set(authHeaders({ userId, email }))
              .query({
                code,
              })
              .send({ email: newEmail })
              .expect(StatusCodes.OK)

            await EventBus.flush()

            expect(response.body).toEqual({
              contact: {
                email: newEmail,
                id: newContact.id,
                listIds: newContact.listIds,
              },
              createdAt: expect.any(String),
              email: newEmail,
              id: userId,
              name: null,
              optedInForCommunications: false,
              position: null,
              telephone: null,
              updatedAt: expect.any(String),
            })
          })
        })
      })
    })
  })
})
