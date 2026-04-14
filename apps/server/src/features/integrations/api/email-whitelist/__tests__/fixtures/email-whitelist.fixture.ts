import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import type TestAgent from 'supertest/lib/agent.js'
import type { PrismaClient } from '../../../../../../adapters/prisma/generated.js'
import { EventBus } from '../../../../../../core/event-bus/event-bus.js'
import { randomApiScopeName } from '../../../authentication/__tests__/fixtures/authentication.fixtures.js'
import type { EmailWhitelistCreateDto } from '../../email-whitelist.contract.js'

export const CREATE_EMAIL_WHITELIST_ROUTE =
  '/integrations-api/v1/email-whitelists'

export const DELETE_EMAIL_WHITELIST_ROUTE =
  '/integrations-api/v1/email-whitelists/:whitelistId'

export const UPDATE_EMAIL_WHITELIST_ROUTE =
  '/integrations-api/v1/email-whitelists/:whitelistId'

export const FETCH_EMAIL_WHITELISTS_ROUTE =
  '/integrations-api/v1/email-whitelists'

export const createEmailWhitelist = async ({
  emailWhitelist = {},
  prisma,
  agent,
  token,
}: {
  emailWhitelist?: Partial<EmailWhitelistCreateDto>
  prisma: PrismaClient
  agent: TestAgent
  token: string
}) => {
  const scope = emailWhitelist.scope || randomApiScopeName()

  await prisma.integrationApiScope.upsert({
    where: {
      name: scope,
    },
    create: {
      name: scope,
      description: faker.lorem.sentence(),
    },
    update: {
      description: faker.lorem.sentence(),
    },
    select: {
      name: true,
    },
  })

  emailWhitelist = {
    scope,
    description: faker.lorem.sentence(),
    emailPattern: faker.internet.email().toLocaleLowerCase(),
    ...emailWhitelist,
  }

  const response = await agent
    .post(CREATE_EMAIL_WHITELIST_ROUTE)
    .set('authorization', `Bearer ${token}`)
    .send(emailWhitelist)
    .expect(StatusCodes.CREATED)

  await EventBus.flush()

  return response.body
}
