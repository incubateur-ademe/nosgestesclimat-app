import { upsertActionChoice } from '../repositories/action-choice.repository.ts'

export async function commitToAction({
  actionId,
  userId,
}: {
  actionId: string
  userId: string
}): Promise<void> {
  await upsertActionChoice({
    actionId,
    userId,
    type: 'committed',
  })
}
