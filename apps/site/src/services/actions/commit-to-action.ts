import { commitToAction as _commitToAction } from '@nosgestesclimat/core/features/actions/services/commit-to-action.service'
import { validatePayload } from '@nosgestesclimat/core/lib/validate-payload'
import { revalidatePath } from 'next/cache'
import { unauthorized } from 'next/navigation'
import { getUserSession } from '../auth/get-user-session'
import {
  CommitToActionPayloadSchema,
  type CommitToActionPayload,
} from './commit-to-action-payload.schema'

import { ACTIONS_SUGGESTED_PATH } from '@/constants/urls/paths'

export async function commitToAction(payload: CommitToActionPayload) {
  const session = await getUserSession()

  if (!session) unauthorized()

  const parsed = validatePayload(CommitToActionPayloadSchema, payload)
  if (!parsed.success) return parsed

  const { actionId, userId } = parsed.data

  const result = await _commitToAction({
    actionId,
    userId,
  })

  if (!result.success) return result

  revalidatePath(ACTIONS_SUGGESTED_PATH)
}
