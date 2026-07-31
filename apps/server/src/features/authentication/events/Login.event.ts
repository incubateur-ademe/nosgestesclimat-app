import type {
  VerificationCodeMode,
  VerifiedUser,
} from '../../../adapters/prisma/generated.ts'
import { EventBusEvent } from '../../../core/event-bus/event.ts'
import type { Locales } from '../../../core/i18n/constant.ts'
export class LoginEvent extends EventBusEvent<{
  user: Pick<VerifiedUser, 'id' | 'email'>
  previousUserId: string
  mode: VerificationCodeMode
  locale: Locales
}> {
  name = 'LoginEvent'
}
