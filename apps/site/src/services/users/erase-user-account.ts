'use server'
import { eraseContact } from '@/adapters/brevoClient'
import logger from '@/logger/logger.server'
import { eraseUser } from '@nosgestesclimat/core/features/users/services/erase-user.service'
import { forbidden, unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'

export async function eraseUserAccount() {
  return await logger.withSpan('site.action.eraseUserAccount', async () => {
    const session = await getUserSession()

    if (!session) {
      unauthorized()
    }

    if (!session.isAuth) {
      forbidden()
    }

    await eraseUser(session.id, { eraseContact })
  })()
}
