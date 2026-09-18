import type { Result } from '../../../lib/result.ts'
import { createActionChoice } from '../repositories/action-choice.repository.ts'

export async function commitToAction({
  actionId,
  userId,
}: {
  actionId: string
  userId: string
}): Promise<Result<void>> {
  return await createActionChoice({
    actionId,
    userId,
  })
}
