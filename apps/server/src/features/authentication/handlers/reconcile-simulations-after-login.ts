import { VerificationCodeMode } from '../../../adapters/prisma/generated.ts'
import type { Handler } from '../../../core/event-bus/handler.ts'
import { reconcileSimulationsAfterLogin as reconcileSimulations } from '../../users/users.service.ts'
import type { LoginEvent } from '../events/Login.event.ts'

export const reconcileSimulationsAfterLogin: Handler<LoginEvent> = ({
  attributes: { user, previousUserId, mode },
}) => {
  if (mode !== VerificationCodeMode.signIn) {
    return
  }

  // Skip reconciliation when the anon session userId is already the verified user's id
  if (previousUserId === user.id) {
    return
  }

  return reconcileSimulations({ user, previousUserId })
}
