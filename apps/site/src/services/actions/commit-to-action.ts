'use server'

import { commitToAction as _commitToAction } from '@nosgestesclimat/core/features/actions/services/commit-to-action.service'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { updateTag } from 'next/cache'
import { unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'
import {
  CommitToActionPayloadSchema,
  type CommitToActionPayload,
} from './commit-to-action-payload.schema'

export async function commitToAction(
  payload: CommitToActionPayload,
  cacheTagToUpdate: string
) {
  const session = await getUserSession()
  if (!session) unauthorized()

  const parsed = validatePayload(CommitToActionPayloadSchema, payload)
  if (!parsed.success) return parsed

  const actionId = parsed.data

  const result = await _commitToAction({
    actionId,
    userId: session.id,
  })

  if (!result.success) return result

  updateTag(cacheTagToUpdate)

  return result
}
