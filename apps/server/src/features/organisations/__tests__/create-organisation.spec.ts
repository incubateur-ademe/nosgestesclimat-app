import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import slugify from 'slugify'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  brevoRemoveFromList,
  brevoSendEmail,
  brevoUpdateContact,
} from '../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { connectUpdateContact } from '../../../adapters/connect/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../adapters/prisma/client.js'
import { OrganisationType } from '../../../adapters/prisma/generated.js'
import * as prismaTransactionAdapter from '../../../adapters/prisma/transaction.js'
import app from '../../../app.js'
import { mswServer } from '../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../core/event-bus/event-bus.js'
import { Locales } from '../../../core/i18n/constant.js'
import logger from '../../../logger.js'
import { login } from '../../authentication/__tests__/fixtures/login.fixture.js'
import { COOKIE_NAME } from '../../authentication/authentication.service.js'
import type { OrganisationCreateDto } from '../organisations.validator.js'
import {
  CREATE_ORGANISATION_ROUTE,
  createOrganisation,
  randomOrganisationType,
} from './fixtures/organisations.fixture.js'

describe('Given a NGC user', () => {
  const agent = supertest(app)
  const url = CREATE_ORGANISATION_ROUTE

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
    describe('When creating his organisation', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent.post(url).expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })

  describe('And invalid cookie', () => {
    describe('When creating his organisation', () => {
      test(`Then it returns a ${StatusCodes.UNAUTHORIZED} error`, async () => {
        await agent
          .post(url)
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
      ;({ cookie, email, userId } = await login({ agent }))
    })

    describe('When creating his organisation', () => {
      describe('And no data provided', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url)
            .set('cookie', cookie)
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      describe('And invalid name', () => {
        test(`Then it returns a ${StatusCodes.BAD_REQUEST} error`, async () => {
          await agent
            .post(url)
            .set('cookie', cookie)
            .send({
              name: '',
              type: randomOrganisationType(),
            })
            .expect(StatusCodes.BAD_REQUEST)

          await agent
            .post(url)
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
            .post(url)
            .set('cookie', cookie)
            .send({
              name: faker.company.name(),
              type: 'my-invalid-organisationType',
            })
            .expect(StatusCodes.BAD_REQUEST)
        })
      })

      test(`Then it returns a ${StatusCodes.CREATED} response with the created organisation`, async () => {
        const payload = {
          name: faker.company.name(),
        }

        mswServer.use(
          brevoSendEmail(),
          brevoUpdateContact(),
          brevoRemoveFromList(27),
          connectUpdateContact()
        )

        const response = await agent
          .post(url)
          .set('cookie', cookie)
          .send(payload)
          .expect(StatusCodes.CREATED)

        expect(response.body).toEqual({
          ...payload,
          type: OrganisationType.other,
          id: expect.any(String),
          slug: slugify.default(payload.name.toLowerCase(), { strict: true }),
          hasCustomQuestionEnabled: false,
          numberOfCollaborators: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          polls: [],
          administrators: [
            {
              id: expect.any(String),
              userId,
              email,
              name: null,
              position: null,
              telephone: null,
              optedInForCommunications: false,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ],
        })
      })

      test('Then it stores an organisation in database', async () => {
        const administratorPayload = {
          name: faker.person.fullName(),
          optedInForCommunications: true,
          position: faker.person.jobDescriptor(),
          telephone: faker.phone.number(),
        }
        const payload: OrganisationCreateDto = {
          name: faker.company.name(),
          type: randomOrganisationType(),
          numberOfCollaborators: faker.number.int({ max: 100 }),
          administrators: [administratorPayload],
        }

        mswServer.use(
          brevoSendEmail(),
          brevoUpdateContact(),
          connectUpdateContact()
        )

        const {
          body: { id },
        } = await agent
          .post(url)
          .set('cookie', cookie)
          .send(payload)
          .expect(StatusCodes.CREATED)

        const createdOrganisation = await prisma.organisation.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            numberOfCollaborators: true,
            administrators: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    position: true,
                    telephone: true,
                    optedInForCommunications: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
            polls: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        expect(createdOrganisation).toEqual({
          ...payload,
          id,
          slug: slugify.default(payload.name.toLowerCase(), { strict: true }),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          polls: [],
          administrators: [
            {
              id: expect.any(String),
              user: {
                ...administratorPayload,
                id: userId,
                email,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
              },
            },
          ],
        })
      })

      test('Then it adds or updates the contact in connect', async () => {
        const administratorPayload = {
          optedInForCommunications: true,
          name: faker.person.fullName(),
          position: 'Manager',
        }
        const payload: OrganisationCreateDto = {
          name: faker.company.name(),
          type: randomOrganisationType(),
          administrators: [administratorPayload],
        }

        mswServer.use(
          brevoSendEmail(),
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
          .post(url)
          .set('cookie', cookie)
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
      })

      test('Then it sends a creation email', async () => {
        const administratorPayload = {
          optedInForCommunications: true,
          name: faker.person.fullName(),
        }
        const payload = {
          name: faker.company.name(),
          type: randomOrganisationType(),
          administrators: [administratorPayload],
        }

        mswServer.use(
          brevoSendEmail({
            expectBody: {
              to: [
                {
                  name: email,
                  email,
                },
              ],
              templateId: 70,
              params: {
                ADMINISTRATOR_NAME: administratorPayload.name,
                ORGANISATION_NAME: payload.name,
                DASHBOARD_URL: `https://nosgestesclimat.fr/organisations/${slugify.default(payload.name.toLowerCase(), { strict: true })}?mtm_campaign=email-automatise&mtm_kwd=orga-admin-creation`,
              },
            },
          }),
          brevoUpdateContact(),
          connectUpdateContact()
        )

        await agent
          .post(url)
          .set('cookie', cookie)
          .send(payload)
          .expect(StatusCodes.CREATED)

        await EventBus.flush()
      })

      describe('And custom user origin (preprod)', () => {
        test('Then it sends a creation email', async () => {
          const administratorPayload = {
            optedInForCommunications: true,
            name: faker.person.fullName(),
          }
          const payload = {
            name: faker.company.name(),
            type: randomOrganisationType(),
            administrators: [administratorPayload],
          }

          mswServer.use(
            brevoSendEmail({
              expectBody: {
                to: [
                  {
                    name: email,
                    email,
                  },
                ],
                templateId: 70,
                params: {
                  ADMINISTRATOR_NAME: administratorPayload.name,
                  ORGANISATION_NAME: payload.name,
                  DASHBOARD_URL: `https://preprod.nosgestesclimat.fr/organisations/${slugify.default(payload.name.toLowerCase(), { strict: true })}?mtm_campaign=email-automatise&mtm_kwd=orga-admin-creation`,
                },
              },
            }),
            brevoUpdateContact(),
            connectUpdateContact()
          )

          await agent
            .post(url)
            .set('cookie', cookie)
            .send(payload)
            .set('origin', 'https://preprod.nosgestesclimat.fr')
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })
      })

      describe(`And ${Locales.en} locale`, () => {
        test('Then it sends a creation email', async () => {
          const administratorPayload = {
            optedInForCommunications: true,
            name: faker.person.fullName(),
          }
          const payload = {
            name: faker.company.name(),
            type: randomOrganisationType(),
            administrators: [administratorPayload],
          }

          mswServer.use(
            brevoSendEmail({
              expectBody: {
                to: [
                  {
                    name: email,
                    email,
                  },
                ],
                templateId: 124,
                params: {
                  ADMINISTRATOR_NAME: administratorPayload.name,
                  ORGANISATION_NAME: payload.name,
                  DASHBOARD_URL: `https://nosgestesclimat.fr/organisations/${slugify.default(payload.name.toLowerCase(), { strict: true })}?mtm_campaign=email-automatise&mtm_kwd=orga-admin-creation`,
                },
              },
            }),
            brevoUpdateContact(),
            connectUpdateContact()
          )

          await agent
            .post(url)
            .set('cookie', cookie)
            .send(payload)
            .query({
              locale: Locales.en,
            })
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })
      })

      describe('administrator has firstname and lastname', () => {
        test('Then it sends a creation email', async () => {
          const administratorPayload = {
            optedInForCommunications: true,
            name: `${faker.person.firstName()}\n_\n${faker.person.lastName()}`,
          }
          const payload = {
            name: faker.company.name(),
            type: randomOrganisationType(),
            administrators: [administratorPayload],
          }

          mswServer.use(
            brevoSendEmail({
              expectBody: {
                to: [
                  {
                    name: email,
                    email,
                  },
                ],
                templateId: 70,
                params: {
                  ADMINISTRATOR_NAME: administratorPayload.name
                    .split('\n_\n')
                    .join(' '),
                  ORGANISATION_NAME: payload.name,
                  DASHBOARD_URL: `https://nosgestesclimat.fr/organisations/${slugify.default(payload.name.toLowerCase(), { strict: true })}?mtm_campaign=email-automatise&mtm_kwd=orga-admin-creation`,
                },
              },
            }),
            brevoUpdateContact(),
            connectUpdateContact()
          )

          await agent
            .post(url)
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })
      })

      describe('And opt in for communications', () => {
        test('Then it adds or updates organisation administrator in brevo', async () => {
          const administratorPayload = {
            optedInForCommunications: true,
            name: faker.person.fullName(),
            position: 'Manager',
          }
          const payload: OrganisationCreateDto = {
            name: faker.company.name(),
            type: randomOrganisationType(),
            administrators: [administratorPayload],
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact({
              expectBody: {
                email,
                listIds: [27],
                attributes: {
                  USER_ID: userId,
                  IS_ORGANISATION_ADMIN: true,
                  ORGANISATION_NAME: payload.name,
                  ORGANISATION_SLUG: slugify.default(
                    payload.name.toLowerCase(),
                    {
                      strict: true,
                    }
                  ),
                  LAST_POLL_PARTICIPANTS_NUMBER: 0,
                  OPT_IN: true,
                  PRENOM: administratorPayload.name,
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
            .post(url)
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })
      })

      describe('And opt out for communications', () => {
        test('Then it adds or updates organisation administrator in brevo', async () => {
          const administratorPayload = {
            optedInForCommunications: false,
            name: faker.person.fullName(),
            position: 'Manager',
          }
          const payload: OrganisationCreateDto = {
            name: faker.company.name(),
            type: randomOrganisationType(),
            administrators: [administratorPayload],
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact({
              expectBody: {
                email,
                attributes: {
                  USER_ID: userId,
                  IS_ORGANISATION_ADMIN: true,
                  ORGANISATION_NAME: payload.name,
                  ORGANISATION_SLUG: slugify.default(
                    payload.name.toLowerCase(),
                    {
                      strict: true,
                    }
                  ),
                  LAST_POLL_PARTICIPANTS_NUMBER: 0,
                  OPT_IN: false,
                  PRENOM: administratorPayload.name,
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
            .post(url)
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          await EventBus.flush()
        })
      })

      describe('And an organisation already does exist for the user', () => {
        beforeEach(async () => {
          await createOrganisation({ agent, cookie })
        })

        test(`Then it returns a ${StatusCodes.FORBIDDEN} error`, async () => {
          const response = await agent
            .post(url)
            .set('cookie', cookie)
            .send({
              name: faker.company.name(),
              type: randomOrganisationType(),
            })
            .expect(StatusCodes.FORBIDDEN)

          expect(response.text).toEqual(
            "Forbidden ! An organisation with this administrator's email already exists."
          )
        })
      })

      describe('And an organisation already does exists with the same name', () => {
        let name: string

        beforeEach(async () => {
          name = faker.company.name()
          const { cookie } = await login({
            agent,
          })
          await createOrganisation({ agent, cookie, organisation: { name } })
        })

        test(`Then it returns a ${StatusCodes.CREATED} response with the created organisation and an incremented slug`, async () => {
          const payload: OrganisationCreateDto = {
            name,
            type: randomOrganisationType(),
            administrators: [
              {
                optedInForCommunications: true,
              },
            ],
          }

          mswServer.use(
            brevoSendEmail(),
            brevoUpdateContact(),
            connectUpdateContact()
          )

          const response = await agent
            .post(url)
            .set('cookie', cookie)
            .send(payload)
            .expect(StatusCodes.CREATED)

          expect(response.body).toEqual({
            ...payload,
            id: expect.any(String),
            slug: `${slugify.default(payload.name.toLowerCase(), { strict: true })}-1`,
            numberOfCollaborators: null,
            hasCustomQuestionEnabled: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            polls: [],
            administrators: [
              {
                id: expect.any(String),
                userId,
                email,
                name: null,
                position: null,
                telephone: null,
                optedInForCommunications: true,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
            ],
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
            .post(url)
            .set('cookie', cookie)
            .send({
              name: faker.company.name(),
              type: randomOrganisationType(),
            })
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        })

        test('Then it logs the exception', async () => {
          await agent.post(url).set('cookie', cookie).send({
            name: faker.company.name(),
            type: randomOrganisationType(),
          })

          expect(logger.error).toHaveBeenCalledWith(
            'Organisation creation failed',
            databaseError
          )
        })
      })
    })
  })
})
