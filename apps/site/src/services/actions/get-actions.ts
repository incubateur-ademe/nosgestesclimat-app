'use server'

import { getActions as getActionsService } from '@nosgestesclimat/core/features/actions/services/get-actions.service'
import { toActionDto } from './actions.dto'

export async function getActions() {
  const actions = await getActionsService()
  return actions.map(toActionDto)
}
