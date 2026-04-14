import type { CookieOptions } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../../adapters/prisma/client.js'
import {
  type VerificationCode,
  VerificationCodeMode,
  type VerifiedUser,
} from '../../adapters/prisma/generated.js'
import { defaultVerifiedUserSelection } from '../../adapters/prisma/selection.js'
import type { Session } from '../../adapters/prisma/transaction.js'
import { transaction } from '../../adapters/prisma/transaction.js'
import { config } from '../../config.js'
import { EntityNotFoundException } from '../../core/errors/EntityNotFoundException.js'
import { ForbiddenException } from '../../core/errors/ForbiddenException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import type { Locales } from '../../core/i18n/constant.js'
import { isPrismaErrorNotFound } from '../../core/typeguards/isPrismaError.js'
import {
  createOrUpdateVerifiedUser,
  fetchVerifiedUser,
} from '../users/users.repository.js'
import type { LoginDto } from './authentication.validator.js'
import { AccountCreatedEvent } from './events/AccountCreated.event.js'
import { LoginEvent } from './events/Login.event.js'
import {
  findVerificationCode,
  invalidateVerificationCode,
} from './verification-codes.repository.js'

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
      throw new EntityNotFoundException('VerificationCode not found')
    }
    throw e
  }
}

export const login = async ({
  loginDto,
  locale,
  origin,
}: {
  loginDto: LoginDto
  locale: Locales
  origin: string
}) => {
  const { user, mode, token } = await createAccountOrSignin(loginDto)

  const loginEvent = new LoginEvent({
    user,
    previousUserId: loginDto.userId,
    mode,
    locale,
    origin,
  })

  EventBus.emit(loginEvent)

  await EventBus.once(loginEvent)

  return { token, user }
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

    if (existingUser) {
      // Reject login if the anonymous session userId is already attached
      // to a different verified account
      if (existingUser.id !== loginDto.userId) {
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

      return [existingUser, VerificationCodeMode.signIn] as const
    }

    // SignUp if user doesn't exist
    const { user: newUser } = await createOrUpdateVerifiedUser(
      {
        id: loginDto,
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
