import { deleteActionChoice } from '../repositories/action-choice.repository.ts'

export function createCancelActionCommitment() {
  return async function cancelActionCommitment({
    actionChoiceId,
    userId,
  }: {
    actionChoiceId: string
    userId: string
  }) {
    await deleteActionChoice({
      actionChoiceId,
      userId,
    })
  }
}
