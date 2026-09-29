import { createActionChoice } from '../repositories/action-choice.repository.ts'
import type { ActionChoice } from '../types/action.ts'

export async function commitToAction({
  actionId,
  userId,
}: {
  actionId: string
  userId: string
}): Promise<ActionChoice> {
  return await createActionChoice({
    actionId,
    userId,
    type: 'committed',
  })
}
