import dayjs from 'dayjs'
import { VerificationCodeMode } from '../../adapters/prisma/generated.ts'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { ConflictException } from '../../core/errors/ConflictException.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import type { Locales } from '../../core/i18n/constant.ts'
import { isPrismaErrorNotFound } from '../../core/typeguards/isPrismaError.ts'
import { fetchVerifiedUser } from '../users/users.repository.ts'
import { generateRandomVerificationCode } from './authentication.service.ts'
import { VerificationCodeCreatedEvent } from './events/VerificationCodeCreated.event.ts'
import { createUserVerificationCode } from './verification-codes.repository.ts'
import type { VerificationCodeCreateDto } from './verification-codes.validator.ts'

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
