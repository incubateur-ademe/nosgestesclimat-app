import { EventBusEvent } from '../../../core/event-bus/event.js'
import type { Locales } from '../../../core/i18n/constant.js'
import type { VerificationCodeCreateDto } from '../verification-codes.validator.js'

export class VerificationCodeCreatedEvent extends EventBusEvent<{
  verificationCode: VerificationCodeCreateDto & { code: string }
  locale: Locales
  origin: string
}> {
  name = 'VerificationCodeCreatedEvent'
}
