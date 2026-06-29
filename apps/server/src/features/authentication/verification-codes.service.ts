import dayjs from 'dayjs'
import type { Session } from '../../adapters/prisma/transaction.ts'
import { transaction } from '../../adapters/prisma/transaction.ts'
import { EventBus } from '../../core/event-bus/event-bus.ts'
import type { Locales } from '../../core/i18n/constant.ts'
import { generateRandomVerificationCode } from './authentication.service.ts'
import { VerificationCodeCreatedEvent } from './events/VerificationCodeCreated.event.ts'
import { createUserVerificationCode } from './verification-codes.repository.ts'
import type { VerificationCodeCreateDto } from './verification-codes.validator.ts'

export const generateVerificationCode = async (
  {
    verificationCodeDto,
    expirationDate = dayjs().add(1, 'hour').toDate(),
  }: {
    verificationCodeDto: VerificationCodeCreateDto
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
  }: {
    verificationCodeDto: Pick<VerificationCodeCreateDto, 'email'>
    origin: string
    locale: Locales
  },
  { session: parentSession }: { session?: Session } = {}
): Promise<{ email: string; expirationDate: Date }> => {
  const expirationDate = dayjs().add(1, 'hour').toDate()
  return transaction(async (session) => {
    const { verificationCode, code } = await generateVerificationCode(
      { verificationCodeDto, expirationDate },
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
