import { faker } from '@faker-js/faker'
import { StatusCodes } from 'http-status-codes'
import type supertest from 'supertest'
import { vi } from 'vitest'
import { brevoSendEmail } from '../../../../adapters/brevo/__tests__/fixtures/server.fixture.ts'
import { prisma } from '../../../../adapters/prisma/client.ts'
import type { VerificationCodeMode } from '../../../../adapters/prisma/generated.ts'
import { redis } from '../../../../adapters/redis/client.ts'
import { KEYS } from '../../../../adapters/redis/constant.ts'
import {
  mswServer,
  resetMswServer,
} from '../../../../core/__tests__/fixtures/server.fixture.ts'
import { EventBus } from '../../../../core/event-bus/event-bus.ts'
import * as authenticationService from '../../authentication.service.ts'
import type { VerificationCodeCreateDto } from '../../verification-codes.validator.ts'

type TestAgent = ReturnType<typeof supertest>

export const CREATE_VERIFICATION_CODE_ROUTE = '/verification-codes/v1'

export const createVerificationCode = async ({
  code,
  mode,
  agent,
  expirationDate,
  verificationCode: { email } = {},
}: {
  code?: string
  agent: TestAgent
  expirationDate?: Date
  mode?: VerificationCodeMode
  verificationCode?: Partial<VerificationCodeCreateDto>
}) => {
  code = code || faker.number.int({ min: 100000, max: 999999 }).toString()

  vi.mocked(
    authenticationService
  ).generateRandomVerificationCode.mockReturnValueOnce(code)

  const payload = {
    email: email || faker.internet.email(),
  }

  mswServer.use(brevoSendEmail())

  const response = await agent
    .post(CREATE_VERIFICATION_CODE_ROUTE)
    .send(payload)
    .query({
      mode,
    })
    .expect(StatusCodes.CREATED)

  await Promise.all([
    EventBus.flush(),
    new Promise<void>((res, rej) => {
      redis.keys(`${KEYS.rateLimitSameRequests}_*`, async (err, keys) =>
        err
          ? rej(err)
          : redis.del(keys || [], (err) => (err ? rej(err) : res()))
      )
    }),
    ...(expirationDate
      ? [
          prisma.verificationCode.updateMany({
            data: {
              expirationDate,
            },
          }),
        ]
      : []),
  ])

  resetMswServer()

  vi.mocked(authenticationService).generateRandomVerificationCode.mockRestore()

  return {
    ...response.body,
    code,
  }
}
