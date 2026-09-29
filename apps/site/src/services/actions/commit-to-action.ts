'use server'

import { commitToAction as _commitToAction } from '@nosgestesclimat/core/features/actions/services/commit-to-action.service'
import { updateTag } from 'next/cache'
import { unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'

export async function commitToAction(
  actionId: string,
  cacheTagToUpdate: string
) {
  const session = await getUserSession()
  if (!session) unauthorized()

  const result = await _commitToAction({
    actionId,
    userId: session.id,
  })

  updateTag(cacheTagToUpdate)

  return result
}
