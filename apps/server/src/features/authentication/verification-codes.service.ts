import { isPrismaErrorNotFound } from '@nosgestesclimat/core/prisma/utils'
import dayjs from 'dayjs'
import { VerificationCodeMode } from '../../adapters/prisma/generated.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import type { Locales } from '../../core/i18n/constant.ts'
import { fetchVerifiedUser } from '../users/users.repository.ts'
import { generateRandomVerificationCode } from './authentication.service.ts'
import { VerificationCodeCreatedEvent } from './events/VerificationCodeCreated.event.ts'
import { createUserVerificationCode } from './verification-codes.repository.ts'
import type { VerificationCodeCreateDto } from './verification-codes.validator.ts'

/**
 * Tells whether the requested sign mode conflicts with the current user state
 * (signing up an existing user, or signing in a non-existing one).
 *
 * Returns a boolean instead of throwing so callers can fail silently and avoid
 * revealing whether an email is already registered.
 */
const hasSignModeConflict = async (
  { email, mode }: { email: string; mode: VerificationCodeMode },
  { session }: { session: Session }
): Promise<boolean> => {
  try {
    await fetchVerifiedUser({ email }, { session, orThrow: true })
    // User exists: only a conflict when trying to sign up
    return mode === VerificationCodeMode.signUp
  } catch (e) {
    if (!isPrismaErrorNotFound(e)) {
      throw e
    }
    // User does not exist: only a conflict when trying to sign in
    return mode === VerificationCodeMode.signIn
  }
}

export const generateVerificationCode = async (
  {
    verificationCodeDto,
    expirationDate = dayjs().add(1, 'hour').toDate(),
    mode,
  }: {
    verificationCodeDto: VerificationCodeCreateDto
    mode?: VerificationCodeMode
    expirationDate?: Date
  },
  { session }: { session?: Session } = {}
) => {
  const code = generateRandomVerificationCode()

  const verificationCode = await transaction(
    (session) =>
      createUserVerificationCode(
        {
          ...verificationCodeDto,
          mode,
          code,
          expirationDate,
        },
        { session }
      ),
    session
  )

  return { code, verificationCode }
}

export const createVerificationCode = (
  {
    verificationCodeDto,
    origin,
    locale,
    mode,
  }: {
    verificationCodeDto: Pick<VerificationCodeCreateDto, 'email'>
    origin: string
    locale: Locales
    mode?: VerificationCodeMode
  },
  { session: parentSession }: { session?: Session } = {}
): Promise<{ email: string; expirationDate: Date }> => {
  const expirationDate = dayjs().add(1, 'hour').toDate()
  return transaction(async (session) => {
    if (
      mode &&
      (await hasSignModeConflict(
        { email: verificationCodeDto.email, mode },
        { session }
      ))
    ) {
      // Silent failure: return a plausible result without creating a code nor
      // sending an email, so we never reveal whether the email is registered.
      return {
        email: verificationCodeDto.email,
        expirationDate,
      }
    }

    const { verificationCode, code } = await generateVerificationCode(
      { verificationCodeDto, mode, expirationDate },
      { session }
    )

    const verificationCodeCreatedEvent = new VerificationCodeCreatedEvent({
      verificationCode: {
        ...verificationCode,
        code,
      },
      locale,
      origin,
    })

    EventBus.emit(verificationCodeCreatedEvent)

    await EventBus.once(verificationCodeCreatedEvent)

    return {
      email: verificationCode.email,
      expirationDate: verificationCode.expirationDate,
    }
  }, parentSession)
}
