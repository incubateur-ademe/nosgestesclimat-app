import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import type supertest from 'supertest'
import { vi } from 'vitest'
import {
  ApiScopeName,
  type IntegrationApiScope,
  type IntegrationWhitelist,
  type PrismaClient,
} from '../../../../../../adapters/prisma/generated.js'
import { brevoSendEmail } from '../../../../../../adapters/brevo/__tests__/fixtures/server.fixture.js'
import { prisma } from '../../../../../../adapters/prisma/client.js'
import {
  mswServer,
  resetMswServer,
} from '../../../../../../core/__tests__/fixtures/server.fixture.js'
import { EventBus } from '../../../../../../core/event-bus/event-bus.js'
import * as authenticationService from '../../../../../authentication/authentication.service.js'

type TestAgent = ReturnType<typeof supertest>

export const GENERATE_API_TOKEN_ROUTE = '/integrations-api/v1/tokens'

export const RECOVER_API_TOKEN_ROUTE = '/integrations-api/v1/tokens'

export const REFRESH_API_TOKEN_ROUTE = '/integrations-api/v1/tokens/refresh'

const apiScopeNames = Object.values(ApiScopeName)

export const randomApiScopeName = (scopes = apiScopeNames) =>
  scopes[Math.floor(Math.random() * scopes.length)]

export const createIntegrationEmailWhitelist = ({
  prisma,
  apiScope = {},
  integrationWhitelist = {},
}: {
  apiScope?: Partial<IntegrationApiScope>
  integrationWhitelist?: Partial<
    Pick<IntegrationWhitelist, 'emailPattern' | 'description'>
  >
  prisma: PrismaClient
}) => {
  const apiScopeData = {
    name: ApiScopeName.ngc,
    description: 'Scope for test',
    ...apiScope,
  }

  const integrationEmailWhitelistData = {
    emailPattern: faker.internet.email().toLocaleLowerCase(),
    description: 'Pattern for test',
    ...integrationWhitelist,
  }

  return prisma.integrationWhitelist.create({
    data: {
      ...integrationEmailWhitelistData,
      apiScope: {
        connectOrCreate: {
          where: {
            name: apiScopeData.name,
          },
          create: {
            ...apiScopeData,
          },
        },
      },
    },
    select: {
      emailPattern: true,
      description: true,
      apiScope: {
        select: {
          name: true,
          description: true,
        },
      },
    },
  })
}

export const generateApiToken = async ({
  code,
  agent,
  email,
  expirationDate,
  ...emailWhiteListParams
}: {
  code?: string
  expirationDate?: Date
  email?: string
  apiScope?: Partial<IntegrationApiScope>
  integrationWhitelist?: Partial<
    Pick<IntegrationWhitelist, 'emailPattern' | 'description'>
  >
  prisma: PrismaClient
  agent: TestAgent
}) => {
  code = code || faker.number.int({ min: 100000, max: 999999 }).toString()

  const emailWhitelist =
    await createIntegrationEmailWhitelist(emailWhiteListParams)

  vi.mocked(
    authenticationService
  ).generateRandomVerificationCode.mockReturnValueOnce(code)

  const payload = {
    email: email || emailWhitelist.emailPattern,
  }

  mswServer.use(brevoSendEmail())

  const response = await agent
    .post(GENERATE_API_TOKEN_ROUTE)
    .send(payload)
    .expect(StatusCodes.CREATED)

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
    emailWhitelist,
    ...response.body,
    ...payload,
    code,
  }
}

export const recoverApiToken = async ({
  apiScope,
  prisma,
  agent,
  email: userEmail,
}: {
  email?: string
  apiScope?: Partial<IntegrationApiScope>
  prisma: PrismaClient
  agent: TestAgent
}) => {
  const { code, email, emailWhitelist } = await generateApiToken({
    apiScope,
    prisma,
    agent,
    email: userEmail,
  })

  const response = await agent
    .get(RECOVER_API_TOKEN_ROUTE)
    .query({
      email,
      code,
    })
    .expect(StatusCodes.OK)

  await EventBus.flush()

  return {
    ...response.body,
    emailWhitelist,
    email,
    code,
  }
}
