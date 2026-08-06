import { prisma } from '@nosgestesclimat/core/prisma/client'
import { isPrismaErrorNotFound } from '@nosgestesclimat/core/prisma/utils'
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
}: {
  loginDto: LoginDto
  locale: Locales
}) => {
  const { user, mode, token } = await createAccountOrSignin(loginDto)

  const loginEvent = new LoginEvent({
    user,
    previousUserId: loginDto.userId,
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

export async function createAccountOrSignin(loginDto: LoginDto) {
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

    // A session userId must map to at most one verified account. Reusing a
    // userId already attached to a different verified account would silently
    // create duplicate accounts sharing the same id on signup (the `id`
    // column of VerifiedUser is not unique), and is already rejected on
    // signin. Enforce the invariant on both paths.
    if (existingUser?.id !== loginDto.userId) {
      const conflictingUser = await session.verifiedUser.findFirst({
        where: {
          id: loginDto.userId,
          NOT: { email: loginDto.email },
        },
        select: { email: true },
      })

      if (conflictingUser) {
        throw new ForbiddenException(
          'userId is already attached to another verified account'
        )
      }
    }

    if (existingUser) {
      return [existingUser, VerificationCodeMode.signIn] as const
    }

    // SignUp if user doesn't exist
    const { user: newUser } = await createOrUpdateVerifiedUser(
      {
        id: { id: loginDto.userId, email: loginDto.email },
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
