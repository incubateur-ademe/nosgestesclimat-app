'use server'
import logger from '@/logger/logger.server'
import { eraseUser } from '@nosgestesclimat/core/features/users/services/erase-user.service'
import { forbidden, unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'
import { logout } from '../auth/logout'

export async function deleteUserAccount() {
  return await logger.withSpan('site.action.deleteUserAccount', async () => {
    const session = await getUserSession()

    if (!session) {
      unauthorized()
    }

    if (!session.isAuth) {
      forbidden()
    }

    await eraseUser(session.id)

    await logout()
  })()
}
