import dayjs from 'dayjs'
import { VerificationCodeMode } from '../../adapters/prisma/generated.js'
import type { Session } from '../../adapters/prisma/transaction.js'
import { transaction } from '../../adapters/prisma/transaction.js'
import { ConflictException } from '../../core/errors/ConflictException.js'
import { EventBus } from '../../core/event-bus/event-bus.js'
import type { Locales } from '../../core/i18n/constant.js'
import { isPrismaErrorNotFound } from '../../core/typeguards/isPrismaError.js'
import { fetchVerifiedUser } from '../users/users.repository.js'
import { generateRandomVerificationCode } from './authentication.service.js'
import { VerificationCodeCreatedEvent } from './events/VerificationCodeCreated.event.js'
import { createUserVerificationCode } from './verification-codes.repository.js'
import type { VerificationCodeCreateDto } from './verification-codes.validator.js'

const checkSignMode = async (
  { email, mode }: { email: string; mode: VerificationCodeMode },
  { session }: { session: Session }
) => {
  try {
    await fetchVerifiedUser({ email }, { session, orThrow: true })
    if (mode === VerificationCodeMode.signUp) {
      throw new ConflictException('User already exists')
    }
  } catch (e) {
    if (!isPrismaErrorNotFound(e)) {
      throw e
    }
    if (mode === VerificationCodeMode.signIn) {
      throw new ConflictException('User does not exist')
    }
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
) => {
  return transaction(async (session) => {
    if (mode) {
      await checkSignMode(
        { email: verificationCodeDto.email, mode },
        { session }
      )
    }

    const { verificationCode, code } = await generateVerificationCode(
      { verificationCodeDto, mode },
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

    return verificationCode
  }, parentSession)
}
