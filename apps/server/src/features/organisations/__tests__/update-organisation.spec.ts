import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import { connectUpdateContact } from '../../../adapters/connect/__tests__/fixtures/server.fixture.ts'
import { prisma } from '../../../adapters/prisma/client.ts'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.ts'
import app from '../../../app.ts'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../core/event-bus/event-bus.ts'
import logger from '../../../logger.ts'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.ts'
import { COOKIE_NAME } from '../../authentication/authentication.service.ts'
import type { OrganisationUpdateDto } from '../organisations.validator.ts'
import {
  createOrganisation,
  randomOrganisationType,
  UPDATE_ORGANISATION_ROUTE,
} from './fixtures/organisations.fixture.ts'

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
                    OPT_IN: true,
                    ORGANISATION_TYPE: payload.type,
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
                    OPT_IN: false,
                    ORGANISATION_TYPE: payload.type,
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
          'Forbidden ! Cannot update administrator email.'
        )
      })
    })
  })
})
