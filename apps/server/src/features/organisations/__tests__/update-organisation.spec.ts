import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { connectUpdateContact } from '../../../adapters/connect/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { createVerificationCode } from '../../authentication/__tests__/fixtures/verification-codes.fixture.js'
import { COOKIE_NAME } from '../../authentication/authentication.service.js'
import type { OrganisationUpdateDto } from '../organisations.validator.js'
import {
  createOrganisation,
  randomOrganisationType,
  UPDATE_ORGANISATION_ROUTE,
} from './fixtures/organisations.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = UPDATE_ORGANISATION_ROUTE

  afterEach(async () => {
    await prisma.organisationAdministrator.deleteMany()
    await Promise.all([
      prisma.organisation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.verifiedUser.deleteMany(),
      prisma.verificationCode.deleteMany(),
    ])
  })

  describe('And logged out', () => {
    describe('When updating his organisation', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .put(
            url.replace(
              ':organisationIdOrSlug',
              faker.database.mongodbObjectId()
            )
          )
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And invalid cookie', () => {
    describe('When updating his organisation', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .put(
            url.replace(
              ':organisationIdOrSlug',
              faker.database.mongodbObjectId()
            )
          )
          .set('cookie', `${COOKIE_NAME}=invalid cookie`)
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And logged in', () => {
    let cookie: string
    let userId: string
    let email: string

    beforeEach(async () => {
      ;({ cookie, userId, email } = await login({ agent }))
    })

    describe('When updating his organisation', () => {
      describe('And invalid name', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: '',
              type: randomOrganisationType(),
            })
            .expect(StatusCodes.BAD_REQUEST)

          await agent
            .put(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.string.alpha(101),
              type: randomOrganisationType(),
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid type', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.name(),
              type: 'my-invalid-organisationType',
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid administrator email', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .put(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.name(),
              type: randomOrganisationType(),
              administrators: [
                {
                  email: 'Je ne donne jamais mon email',
                },
              ],
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And organisation does not exist', () => {
        test(`Then it returns a ${StatusCodes.NOT_FOUND} error`, async () => {
          await agent
            .put(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .expect(StatusCodes.NOT_FOUND)
        })
      })

      describe('And organisation does exist', () => {
        let organisation: Awaited<ReturnType<typeof createOrganisation>>
        let organisationId: string
        let organisationSlug: string

        beforeEach(async () => {
          organisation = await createOrganisation({ agent, cookie })
          ;({ id: organisationId, slug: organisationSlug } = organisation)
        })

        test(`Then it returns a ${StatusCodes.OK} response with the updated organisation`, async () => {
          const payload: OrganisationUpdateDto = {
            name: faker.company.name(),
            type: randomOrganisationType(),
            numberOfCollaborators: faker.number.int({ max: 100 }),
          }

          mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

          const response = await agent
            .put(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.OK)

          expect(response.body).toEqual({
            ...organisation,
            ...payload,
            updatedAt: expect.any(String),
          })
        })

        describe('And update administrator opt in for communications', () => {
          test('Then it updates organisation administrator in brevo', async () => {
            const payload: OrganisationUpdateDto = {
              name: faker.company.name(),
              type: randomOrganisationType(),
              numberOfCollaborators: faker.number.int({ max: 100 }),
              administrators: [
                {
                  optedInForCommunications: true,
                },
              ],
            }

            mswServer.use(
              brevoUpdateContact({
                expectBody: {
                  email,
                  listIds: [27],
                  attributes: {
                    USER_ID: userId,
                    IS_ORGANISATION_ADMIN: true,
                    ORGANISATION_NAME: payload.name,
                    ORGANISATION_SLUG: organisation.slug,
                    LAST_POLL_PARTICIPANTS_NUMBER: 0,
                    OPT_IN: true,
                    ORGANISATION_TYPE: payload.type,
                    NUMBER_ORGANISATION_CREATED_POLLS: 0,
                    NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 0,
                    LAST_ORGANISATION_SIMULATION_DATE: undefined,
                  },
                  updateEnabled: true,
                },
              }),
              connectUpdateContact()
            )

            await agent
              .put(url.replace(':organisationIdOrSlug', organisationId))
              .set('cookie', cookie)
              .send(payload)
              .expect(StatusCodes.OK)

            await EventBus.flush()
          })
        })

        describe('And update administrator opt out for communications', () => {
          test('Then it updates organisation administrator in brevo', async () => {
            const payload: OrganisationUpdateDto = {
              name: faker.company.name(),
              type: randomOrganisationType(),
              numberOfCollaborators: faker.number.int({ max: 100 }),
              administrators: [
                {
                  optedInForCommunications: false,
                },
              ],
            }

            mswServer.use(
              brevoUpdateContact({
                expectBody: {
                  email,
                  attributes: {
                    USER_ID: userId,
                    IS_ORGANISATION_ADMIN: true,
                    ORGANISATION_NAME: payload.name,
                    ORGANISATION_SLUG: organisation.slug,
                    LAST_POLL_PARTICIPANTS_NUMBER: 0,
                    OPT_IN: false,
                    ORGANISATION_TYPE: payload.type,
                    NUMBER_ORGANISATION_CREATED_POLLS: 0,
                    NUMBER_ORGANISATION_COMPLETED_SIMULATIONS: 0,
                    LAST_ORGANISATION_SIMULATION_DATE: undefined,
                  },
                  updateEnabled: true,
                },
              }),
              brevoRemoveFromList(27, {
                expectBody: {
                  emails: [email],
                },
              }),
              connectUpdateContact()
            )

            await agent
              .put(url.replace(':organisationIdOrSlug', organisationId))
              .set('cookie', cookie)
              .send(payload)
              .expect(StatusCodes.OK)

            await EventBus.flush()
          })
        })

        describe('And no data in the update', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the unchanged group`, async () => {
            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            const response = await agent
              .put(url.replace(':organisationIdOrSlug', organisationId))
              .set('cookie', cookie)
              .send({})
              .expect(StatusCodes.OK)

            expect(response.body).toEqual(organisation)
          })
        })

        describe('And using the organisation slug', () => {
          test(`Then it returns a ${StatusCodes.OK} response with the updated organisation`, async () => {
            const payload: OrganisationUpdateDto = {
              name: faker.company.name(),
              type: randomOrganisationType(),
              numberOfCollaborators: faker.number.int({ max: 100 }),
            }

            mswServer.use(brevoUpdateContact(), brevoRemoveFromList(27))

            const response = await agent
              .put(url.replace(':organisationIdOrSlug', organisationSlug))
              .set('cookie', cookie)
              .send(payload)
              .expect(StatusCodes.OK)

            expect(response.body).toEqual({
              ...organisation,
              ...payload,
              updatedAt: expect.any(String),
            })
          })
        })
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
            .put(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.name(),
              type: randomOrganisationType(),
            })
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent
            .put(
              url.replace(
                ':organisationIdOrSlug',
                faker.database.mongodbObjectId()
              )
            )
            .set('cookie', cookie)
            .send({
              name: faker.company.name(),
              type: randomOrganisationType(),
            })
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)

          expect(logger.error).toHaveBeenCalledWith(
            'Organisation update failed',
            databaseError
          )
        })
      })
    })

    describe('When updating administrator email', () => {
      let organisation: Awaited<ReturnType<typeof createOrganisation>>
      let organisationId: string

      beforeEach(async () => {
        organisation = await createOrganisation({ agent, cookie })
        ;({ id: organisationId } = organisation)
      })

      describe('And no verification code', () => {
        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const payload: OrganisationUpdateDto = {
            administrators: [
              {
                email: faker.internet.email(),
              },
            ],
          }

          const response = await agent
            .put(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.FORBIDDEN)

          expect(response.text).toEqual(
            'Forbidden ! Cannot update administrator email without a verification code.'
          )
        })
      })

      describe('And invalid verification code', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          const payload: OrganisationUpdateDto = {
            administrators: [
              {
                email: faker.internet.email(),
              },
            ],
          }

          await agent
            .put(url.replace(':organisationIdOrSlug', organisationId))
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
          const payload: OrganisationUpdateDto = {
            administrators: [
              {
                email: faker.internet.email(),
              },
            ],
          }

          const response = await agent
            .put(url.replace(':organisationIdOrSlug', organisationId))
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
        let email: string
        let code: string

        beforeEach(async () => {
          email = faker.internet.email().toLocaleLowerCase()
          ;({ code } = await createVerificationCode({
            agent,
            verificationCode: { email },
          }))
        })

        test(`Then it returns a ${StatusCodes.OK} response with the updated organisation and a new cookie`, async () => {
          const administratorPayload = {
            email,
            name: faker.person.fullName(),
            telephone: faker.phone.number(),
            position: faker.person.jobDescriptor(),
            optedInForCommunications: true,
          }
          const payload: OrganisationUpdateDto = {
            administrators: [administratorPayload],
          }

          mswServer.use(brevoUpdateContact(), connectUpdateContact())

          const response = await agent
            .put(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .query({
              code,
            })
            .send(payload)
            .expect(StatusCodes.OK)

          const [existingAdministrator] = organisation.administrators
          expect(response.body).toEqual({
            ...organisation,
            administrators: [
              {
                ...existingAdministrator,
                ...administratorPayload,
                updatedAt: expect.any(String),
              },
            ],
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
            email,
            exp: expect.any(Number),
            iat: expect.any(Number),
          })
        })

        test('Then it adds or updates the contact in connect', async () => {
          const administratorPayload = {
            email,
            name: faker.person.fullName(),
            telephone: faker.phone.number(),
            position: faker.person.jobDescriptor(),
            optedInForCommunications: true,
          }
          const payload: OrganisationUpdateDto = {
            administrators: [administratorPayload],
          }

          mswServer.use(
            brevoUpdateContact(),
            connectUpdateContact({
              expectBody: {
                email,
                nom: administratorPayload.name,
                fonction: administratorPayload.position,
                source: 'Nos gestes Climat',
              },
            })
          )

          await agent
            .put(url.replace(':organisationIdOrSlug', organisationId))
            .set('cookie', cookie)
            .query({
              code,
            })
            .send(payload)
            .expect(StatusCodes.OK)

          await EventBus.flush()
        })

        describe('And Organisation does exist for the target email', () => {
          beforeEach(async () => {
            const { cookie } = await login({
              agent,
              verificationCode: { email },
            })
            await createOrganisation({ agent, cookie })
          })

          test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
            const payload: OrganisationUpdateDto = {
              administrators: [
                {
                  email,
                },
              ],
            }

            const response = await agent
              .put(url.replace(':organisationIdOrSlug', organisationId))
              .set('cookie', cookie)
              .query({
                code,
              })
              .send(payload)
              .expect(StatusCodes.FORBIDDEN)

            expect(response.text).toEqual(
              'Forbidden ! This email already belongs to another organisation.'
            )
          })
        })
      })
    })
  })
})
