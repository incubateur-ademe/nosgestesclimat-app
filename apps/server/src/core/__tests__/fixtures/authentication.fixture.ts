import { faker } from '@faker-js/faker'
import { createOrUpdateVerifiedUser } from '@nosgestesclimat/core/features/users/repositories/verified-users.repository'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { VerificationCodeUsage } from '@nosgestesclimat/core/prisma/generated/client'
import dayjs from 'dayjs'
import { config } from '../../../config.ts'

/**
 * Builds the internal-proxy authentication headers expected by the
 * authentification middleware.
 *
 * In production the session cookie is validated by the proxy, which forwards
 * the resolved user as `x-user-id` (+ `x-user-email` for verified users)
 * alongside the shared `x-internal-key`. Tests target the internal API
 * directly, so they forward those headers themselves.
 */
export const authHeaders = ({
  userId,
  email,
}: {
  userId: string
  email?: string
}) => ({
  'x-internal-key': config.security.internalApiKey,
  'x-user-id': userId,
  ...(email ? { 'x-user-email': email } : {}),
})

/**
 * Seeds a verified user (the `user` + `verifiedUser` rows the login flow
 * creates) and returns the identity the internal-proxy auth headers carry.
 */
export const login = async () => {
  const userId = faker.string.uuid()
  const email = faker.internet.email().toLocaleLowerCase()

  await createOrUpdateVerifiedUser(
    { id: { id: userId, email }, user: { email } },
    { session: prisma }
  )

  return { email, userId }
}

/**
 * Seeds a valid verification code row and returns it, as the code creation
 * flow would.
 */
export const createVerificationCode = async ({
  email,
  code = faker.number.int({ min: 100000, max: 999999 }).toString(),
  expirationDate = dayjs().add(1, 'hour').toDate(),
  usage = VerificationCodeUsage.login,
}: {
  email: string
  code?: string
  expirationDate?: Date
  usage?: VerificationCodeUsage
}) => {
  await prisma.verificationCode.create({
    data: {
      email,
      code,
      expirationDate,
      usage,
    },
  })

  return { email, code }
}
