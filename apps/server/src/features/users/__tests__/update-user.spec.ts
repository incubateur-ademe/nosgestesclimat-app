import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoDeleteContact,
  brevoGetContact,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import type { BrevoContactDto } from '../../../adapters/brevo/client.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { createVerificationCode } from '../../authentication/__tests__/fixtures/verification-codes.fixture.js'
import { createSimulation } from '../../simulations/__tests__/fixtures/simulations.fixtures.js'
import {
  createUser,
  getBrevoContact,
  UPDATE_USER_ROUTE,
} from './fixtures/users.fixture.js'

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
    describe('And invalid userId', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .put(url.replace(':userId', faker.string.alpha(34)))
          .send({
            email: faker.internet.email(),
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('And invalid email', () => {
      test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
        await agent
          .put(url.replace(':userId', faker.string.uuid()))
          .send({
            email: 'Je ne donne jamais mon email',
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
          .put(url.replace(':userId', faker.string.uuid()))
          .send({})
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)
      })

      test('Then it logs the exception', async () => {
        await agent
          .put(url.replace(':userId', faker.string.uuid()))
          .send({})
          .expect(StatusCodes.INTERNAL_SERVER_ERROR)

        expect(logger.error).toHaveBeenCalledWith(
          'User update failed',
          databaseError
        )
      })
    })
  })

  describe('And logged out', () => {
    describe('When updating profile without email', () => {
      describe('And user does not already exist', () => {
        test(`Then it returns a ${StatusCodes.OK} response with created user`, async () => {
          const userId = faker.string.uuid()

          const { body } = await agent
            .put(url.replace(':userId', userId))
            .send({})
            .expect(StatusCodes.OK)

          expect(body).toEqual({
            id: userId,
            email: null,
            name: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        })

        describe('And name', () => {
          test(`Then it returns a ${StatusCodes.OK} response with created user`, async () => {
            const userId = faker.string.uuid()
            const name = faker.person.firstName()

            const { body } = await agent
              .put(url.replace(':userId', userId))
              .send({ name })
              .expect(StatusCodes.OK)

            expect(body).toEqual({
              id: userId,
              email: null,
              name,
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
            .put(url.replace(':userId', userId))
            .send({})
            .expect(StatusCodes.OK)

          expect(body).toEqual({
            id: userId,
            email: null,
            name: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        })

        describe('And name', () => {
          test(`Then it returns a ${StatusCodes.OK} response with updated user`, async () => {
            const name = faker.person.firstName()

            const { body } = await agent
              .put(url.replace(':userId', userId))
              .send({ name })
              .expect(StatusCodes.OK)

            expect(body).toEqual({
              id: userId,
              email: null,
              name,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            })
          })
        })
      })
    })

    describe('When updating profile with email', () => {
      describe('And user does not already exist', () => {
        test(`Then it returns a ${StatusCodes.ACCEPTED} response with created user`, async () => {
          const userId = faker.string.uuid()
          const email = faker.internet.email().toLocaleLowerCase()

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
            })
          )

          const { body } = await agent
            .put(url.replace(':userId', userId))
            .send({ email })
            .expect(StatusCodes.ACCEPTED)

          await EventBus.flush()

          expect(body).toEqual({
            id: userId,
            email,
            name: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        })

        describe('And name', () => {
          test(`Then it returns a ${StatusCodes.ACCEPTED} response with created user`, async () => {
            const userId = faker.string.uuid()
            const email = faker.internet.email().toLocaleLowerCase()
            const name = faker.person.firstName()

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
              })
            )

            const { body } = await agent
              .put(url.replace(':userId', userId))
              .send({ email, name })
              .expect(StatusCodes.ACCEPTED)

            await EventBus.flush()

            expect(body).toEqual({
              id: userId,
              email,
              name,
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

        describe('And has no email', () => {
          test(`Then it returns a ${StatusCodes.ACCEPTED} response with updated user`, async () => {
            const email = faker.internet.email().toLocaleLowerCase()

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
              })
            )

            const { body } = await agent
              .put(url.replace(':userId', userId))
              .send({ email })
              .expect(StatusCodes.ACCEPTED)

            await EventBus.flush()

            expect(body).toEqual({
              id: userId,
              email,
              name: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            })
          })

          describe('And name', () => {
            test(`Then it returns a ${StatusCodes.ACCEPTED} response with updated user`, async () => {
              const email = faker.internet.email().toLocaleLowerCase()
              const name = faker.person.firstName()

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
                })
              )

              const { body } = await agent
                .put(url.replace(':userId', userId))
                .send({ email, name })
                .expect(StatusCodes.ACCEPTED)

              await EventBus.flush()

              expect(body).toEqual({
                id: userId,
                email,
                name,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              })
            })
          })
        })

        describe('And has an email', () => {
          let email: string
          let contact: BrevoContactDto | undefined

          beforeEach(async () => {
            ;({
              user: { id: userId, email },
              contact,
            } = await createUser({
              agent,
              user: { email: faker.internet.email().toLocaleLowerCase() },
            }))
          })

          describe('When updating name only', () => {
            test(`Then it returns a ${StatusCodes.ACCEPTED} response with updated user`, async () => {
              const name = faker.person.firstName()

              mswServer.use(
                brevoGetContact(email, {
                  customResponses: [
                    {
                      body: contact,
                    },
                  ],
                })
              )

              const { body } = await agent
                .put(url.replace(':userId', userId))
                .send({ name })
                .expect(StatusCodes.ACCEPTED)

              await EventBus.flush()

              expect(body).toEqual({
                id: userId,
                email,
                name,
                contact: {
                  email: contact!.email,
                  id: contact!.id,
                  listIds: contact!.listIds,
                },
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              })
            })
          })

          describe('When updating email', () => {
            test(`Then it returns a ${StatusCodes.ACCEPTED} response with updated user`, async () => {
              const newEmail = faker.internet.email().toLocaleLowerCase()

              // Non-verified user trying to change email - email won't actually change
              // But both contacts are still fetched before the decision is made
              mswServer.use(
                brevoGetContact(newEmail, {
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
                brevoGetContact(email, {
                  customResponses: [
                    {
                      body: contact,
                    },
                  ],
                })
              )

              const { body } = await agent
                .put(url.replace(':userId', userId))
                .send({ email: newEmail })
                .expect(StatusCodes.ACCEPTED)

              await EventBus.flush()

              // Non-verified users cannot change email - it stays the same
              expect(body).toEqual({
                id: userId,
                email, // Email stays the same (old email)
                name: null,
                contact: {
                  email: contact!.email,
                  id: contact!.id,
                  listIds: contact!.listIds,
                },
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              })
            })
          })
        })
      })
    })
  })

  describe('And logged in', () => {
    let email: string
    let userId: string
    let cookie: string
    let contact: BrevoContactDto

    beforeEach(async () => {
      ;({ cookie, email, userId } = await login({
        agent,
      }))

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
            customResponses: [
              {
                body: contact,
              },
              {
                body: contact,
              },
            ],
          }),
          brevoUpdateContact()
        )

        const { body } = await agent
          .put(url.replace(':userId', userId))
          .set('cookie', cookie)
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

    describe('When updating his/her email', () => {
      describe('And no verification code provided', () => {
        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const payload = {
            email: faker.internet.email(),
          }

          const response = await agent
            .put(url.replace(':userId', userId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.FORBIDDEN)

          expect(response.text).toEqual(
            'Forbidden ! Cannot update email without a verification code.'
          )
        })
      })

      describe('And invalid verification code', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          const payload = {
            email: faker.internet.email(),
          }

          await agent
            .put(url.replace(':userId', userId))
            .set('cookie', cookie)
            .query({
              code: '42',
            })
            .send(payload)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And verification code does not exist', () => {
        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const payload = {
            email: faker.internet.email(),
          }

          const response = await agent
            .put(url.replace(':userId', userId))
            .set('cookie', cookie)
            .query({
              code: faker.number.int({ min: 100000, max: 999999 }).toString(),
            })
            .send(payload)
            .expect(StatusCodes.FORBIDDEN)

          expect(response.text).toEqual(
            'Forbidden ! Invalid verification code.'
          )
        })
      })

      describe('And verification code does exist', () => {
        let newEmail: string
        let code: string

        beforeEach(async () => {
          newEmail = faker.internet.email().toLocaleLowerCase()
          ;({ code } = await createVerificationCode({
            agent,
            verificationCode: { email: newEmail },
          }))
        })

        test(`Then it returns a ${StatusCodes.OK} response with the updated user and a new cookie`, async () => {
          const payload = {
            email: newEmail,
          }

          const newContact = getBrevoContact({
            email: newEmail,
            attributes: {
              USER_ID: userId,
            },
          })

          mswServer.use(
            brevoGetContact(email, {
              customResponses: [
                {
                  body: contact,
                },
              ],
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
            .put(url.replace(':userId', userId))
            .set('cookie', cookie)
            .query({
              code,
            })
            .send(payload)
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

          // Cookies are kept in supertest
          const [, newCookie] = response.headers['set-cookie']
          const token = newCookie
            .split(';')
            .shift()
            ?.replace('ngc_server_auth_jwt=', '')

          expect(jwt.decode(token!)).toEqual({
            userId,
            email: newEmail,
            exp: expect.any(Number),
            iat: expect.any(Number),
          })
        })

        describe('And new email has existing brevo contact', () => {
          test(`Then it returns a ${StatusCodes.OK} response with updated user`, async () => {
            const payload = {
              email: newEmail,
            }

            const newContact = getBrevoContact({
              email: newEmail,
              attributes: {
                USER_ID: faker.string.uuid(),
              },
            })

            mswServer.use(
              brevoGetContact(email, {
                customResponses: [
                  {
                    body: contact,
                  },
                ],
              }),
              brevoGetContact(newEmail, {
                customResponses: [
                  {
                    body: newContact,
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
              .put(url.replace(':userId', userId))
              .set('cookie', cookie)
              .query({
                code,
              })
              .send(payload)
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
