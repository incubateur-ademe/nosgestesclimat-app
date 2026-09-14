import { createActionChoice } from '../repositories/action-choice.repository.ts'

export function createCommitToAction() {
  return async function commitToAction({
    actionId,
    userId,
  }: {
    actionId: string
    userId: string
  }) {
    await createActionChoice({
      actionId,
      userId,
    })
  }
}
