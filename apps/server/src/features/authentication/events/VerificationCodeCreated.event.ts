import { EventBusEvent } from '../../../core/event-bus/event.ts'
import type { Locales } from '../../../core/i18n/constant.ts'
import type { VerificationCodeCreateDto } from '../verification-codes.validator.ts'

export class VerificationCodeCreatedEvent extends EventBusEvent<{
  verificationCode: VerificationCodeCreateDto & { code: string }
  locale: Locales
}> {
  name = 'VerificationCodeCreatedEvent'
}
