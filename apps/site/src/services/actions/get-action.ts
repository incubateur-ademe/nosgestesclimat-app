'use server'

import { getAction as getActionService } from '@nosgestesclimat/core/features/actions/services/get-action.service'
import { toActionDto } from './actions.dto'

export async function getAction(slug: string) {
  const action = await getActionService(slug)
  return action ? toActionDto(action) : null
}
