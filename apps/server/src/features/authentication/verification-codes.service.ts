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

export const createVerificationCode = async (
  {
    verificationCodeDto,
    locale,
  }: {
    verificationCodeDto: Pick<VerificationCodeCreateDto, 'email'>
    locale: Locales
  },
  { session: parentSession }: { session?: Session } = {}
): Promise<{ id: string; email: string; expirationDate: Date }> => {
  const expirationDate = dayjs().add(1, 'hour').toDate()

  // The code must be committed *before* the email is handed to Brevo. Sending
  // inside the transaction means any later failure (a Brevo timeout, or the
  // call simply outliving the interactive transaction budget) rolls the row
  // back after Brevo has already accepted — and delivered — the message. The
  // user then holds a legitimate-looking code that does not exist in database,
  // and every attempt to use it comes back as "invalid".
  const { verificationCode, code } = await transaction(
    (session) =>
      generateVerificationCode(
        { verificationCodeDto, expirationDate },
        { session }
      ),
    parentSession
  )

  const verificationCodeCreatedEvent = new VerificationCodeCreatedEvent({
    verificationCode: {
      ...verificationCode,
      code,
    },
    locale,
  })

  EventBus.emit(verificationCodeCreatedEvent)

  await EventBus.once(verificationCodeCreatedEvent)

  return {
    id: verificationCode.id,
    email: verificationCode.email,
    expirationDate: verificationCode.expirationDate,
  }
}
