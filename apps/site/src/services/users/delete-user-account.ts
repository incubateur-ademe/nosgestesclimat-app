'use server'
import logger from '@/logger/logger.server'
import { deleteUser } from '@nosgestesclimat/core/features/users/services/delete-user.service'
import { forbidden, unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'

export async function deleteUserAccount() {
  return logger.withSpan(
    'site.action.deleteUserAccount',
    async ({ logger }) => {
      const session = await getUserSession()

      if (!session) {
        unauthorized()
      }

      if (!session.isAuth) {
        forbidden()
      }

      logger.info('Deleting user account', { userId: session.id })

      await deleteUser(session.id)
    }
  )()
}
