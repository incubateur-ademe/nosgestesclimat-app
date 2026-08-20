import { prisma } from '@nosgestesclimat/core/prisma/client'
import { isPrismaErrorNotFound } from '@nosgestesclimat/core/prisma/utils'
import { randomUUID } from 'crypto'
import type { CookieOptions } from 'express'
import jwt from 'jsonwebtoken'
import {
  type VerificationCode,
  VerificationCodeMode,
  type VerifiedUser,
} from '../../adapters/prisma/generated.ts'
import { defaultVerifiedUserSelection } from '../../adapters/prisma/selection.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { config } from '../../config.ts'
import { ForbiddenException } from '../../core/errors/ForbiddenException.ts'
import { InvalidVerificationCodeException } from '../../core/errors/InvalidVerificationCodeException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import type { Locales } from '../../core/i18n/constant.ts'
import {
  createOrUpdateVerifiedUser,
  fetchVerifiedUser,
} from '../users/users.repository.ts'
import type { LoginDto } from './authentication.validator.ts'
import { AccountCreatedEvent } from './events/AccountCreated.event.ts'
import { LoginEvent } from './events/Login.event.ts'
import {
  findLatestVerificationCodeForEmail,
  findValidVerificationCodesForEmail,
  findVerificationCode,
  findVerificationCodeIgnoringExpiration,
  invalidateVerificationCode,
} from './verification-codes.repository.ts'

export const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 61 // 2 months

export function getCookieOptions(origin: string): CookieOptions {
  const domain = new URL(origin).hostname
  const secure = !origin.startsWith('http://localhost')
  return {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'strict', // Because ngc can be embeded in iframes
    partitioned: secure,
    domain,
  }
}

export const COOKIE_NAME = config.security.cookie.name

export const generateRandomVerificationCode = () =>
  Math.floor(
    Math.pow(10, 5) + Math.random() * (Math.pow(10, 6) - Math.pow(10, 5) - 1)
  ).toString()

/**
 * Reads back the codes stored for that email to tell *why* the lookup missed.
 *
 * Runs on the rejection path only, and never throws: a failed diagnosis must not
 * replace the rejection the caller is about to answer with.
 */
const diagnoseVerificationCodeRejection = async (
  { email, code }: Pick<VerificationCode, 'email' | 'code'>,
  { session }: { session?: Session } = {}
): Promise<InvalidVerificationCodeException> => {
  try {
    const diagnosisStartedAt = new Date()

    const [submittedCode, latestCode, validCodes] = await transaction(
      (session) =>
        Promise.all([
          findVerificationCodeIgnoringExpiration({ email, code }, { session }),
          findLatestVerificationCodeForEmail({ email }, { session }),
          findValidVerificationCodesForEmail({ email }, { session }),
        ]),
      session || prisma
    )
    const validVerificationCodeIds = validCodes.map(({ id }) => id)

    // Given code exists for this email but expired
    if (submittedCode) {
      return new InvalidVerificationCodeException('expired', {
        verificationCodeId: submittedCode.id,
        createdAt: submittedCode.createdAt,
        expirationDate: submittedCode.expirationDate,
        latestExpired: submittedCode.expirationDate < diagnosisStartedAt,
        validVerificationCodeIds,
      })
    }

    // Given code doesn't exist, compare with latest code for debugging purpose.
    // The latest code may itself be expired: it only tells us a code was
    // requested at some point, not that the user had a valid one to use -
    // validVerificationCodeIds carries that second, more actionable signal.
    if (latestCode) {
      return new InvalidVerificationCodeException('mismatch', {
        latestVerificationCodeId: latestCode.id,
        latestCreatedAt: latestCode.createdAt,
        latestExpirationDate: latestCode.expirationDate,
        latestExpired: latestCode.expirationDate < diagnosisStartedAt,
        validVerificationCodeIds,
      })
    }

    // No code was ever issued for this email, not even one that already expired
    return new InvalidVerificationCodeException('never_requested')
  } catch (e) {
    return new InvalidVerificationCodeException('unknown', {
      diagnosisError: e instanceof Error ? e.message : String(e),
    })
  }
}

export const verifyCode = async (
  verificationCode: Pick<VerificationCode, 'email' | 'code'>,
  { session }: { session?: Session } = {}
) => {
  try {
    return await transaction(
      (session) => findVerificationCode(verificationCode, { session }),
      session || prisma
    )
  } catch (e) {
    if (isPrismaErrorNotFound(e)) {
      throw await diagnoseVerificationCodeRejection(verificationCode, {
        session,
      })
    }
    throw e
  }
}

export const login = async ({
  loginDto,
  locale,
  sessionUserId,
}: {
  loginDto: LoginDto
  locale: Locales
  /**
   * The current session's userId, forwarded by the site's `fetchServer` as
   * the `x-user-id` header. The login route only accepts requests carrying
   * the shared `x-internal-key`, so this id comes from the signed session
   * cookie - not from the browser. The server relies on it to enforce the
   * "one session userId = one account" invariant.
   */
  sessionUserId?: string
}) => {
  const { user, mode, token } = await createAccountOrSignin({
    loginDto,
    sessionUserId,
  })

  const loginEvent = new LoginEvent({
    user,
    previousUserId: sessionUserId,
    mode,
    locale,
  })

  EventBus.emit(loginEvent)

  await EventBus.once(loginEvent)

  return { token, user, mode }
}

export function createToken(user: Pick<VerifiedUser, 'id' | 'email'>) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    config.security.jwt.secret,
    {
      expiresIn: COOKIE_MAX_AGE,
    }
  )
}

/**
 * Returns the verified account that already owns `userId`, unless it is the
 * account identified by `email`.
 *
 * `VerifiedUser.id` is not unique in the schema - only `email` is the primary
 * key - so nothing in the database stops two accounts from sharing a userId.
 * The application enforces the "one session userId = one account" invariant
 * here, at every account entry point, by refusing to let an id belong to two
 * verified accounts.
 */
const findOtherVerifiedAccountWithUserId = (
  { userId, email }: { userId: string; email: string },
  { session }: { session: Session }
) =>
  session.verifiedUser.findFirst({
    where: { id: userId, NOT: { email } },
    select: { email: true },
  })

export async function createAccountOrSignin({
  loginDto,
  sessionUserId,
}: {
  loginDto: LoginDto
  sessionUserId?: string
}) {
  const verificationCode = await verifyCode(loginDto)

  const [user, mode] = await transaction(async (session) => {
    // Try SignIn first
    const existingUser = await fetchVerifiedUser(
      {
        email: loginDto.email,
        select: defaultVerifiedUserSelection,
      },
      { session }
    )

    if (existingUser) {
      // SignIn: the existing account's own id wins - never generate a fresh
      // one. Only refuse when the session's userId already belongs to another
      // verified account: the login event reconciles the session's data
      // (previousUserId) into this account, which would move that other
      // account's data over and delete its user row.
      if (
        sessionUserId &&
        sessionUserId !== existingUser.id &&
        (await findOtherVerifiedAccountWithUserId(
          { userId: sessionUserId, email: loginDto.email },
          { session }
        ))
      ) {
        throw new ForbiddenException(
          'userId is already attached to another verified account'
        )
      }

      return [existingUser, VerificationCodeMode.signIn] as const
    }

    // SignUp: reuse the session userId as the account id only when it is
    // still a free anonymous identity - the anonymous user row is then
    // updated in place, keeping the user's data attached. When it already
    // belongs to another verified account (typically signing up a new email
    // while authenticated as another account), start a fresh identity so one
    // id never maps to several accounts.
    const otherAccountWithUserId = sessionUserId
      ? await findOtherVerifiedAccountWithUserId(
          { userId: sessionUserId, email: loginDto.email },
          { session }
        )
      : null

    const newUserId = otherAccountWithUserId
      ? randomUUID()
      : (sessionUserId ?? randomUUID())

    const { user: newUser } = await createOrUpdateVerifiedUser(
      {
        id: { id: newUserId, email: loginDto.email },
        user: loginDto,
        select: defaultVerifiedUserSelection,
      },
      { session }
    )

    await invalidateVerificationCode(verificationCode, { session })
    return [newUser, VerificationCodeMode.signUp] as const
  })

  if (mode === VerificationCodeMode.signUp) {
    const accountCreatedEvent = new AccountCreatedEvent({ user })
    EventBus.emit(accountCreatedEvent)
    await EventBus.once(accountCreatedEvent)
  }

  return { user, mode, token: createToken(user) }
}
