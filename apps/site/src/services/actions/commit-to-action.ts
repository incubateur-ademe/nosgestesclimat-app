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
import { GET_PERSONALIZED_ACTIONS_CACHE_TAG } from './get-personalized-actions-catalogue'

export async function commitToAction(payload: CommitToActionPayload) {
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

  updateTag(GET_PERSONALIZED_ACTIONS_CACHE_TAG)

  return result
}
