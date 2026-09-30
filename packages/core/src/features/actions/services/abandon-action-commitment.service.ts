import { deleteActionChoice } from '../repositories/action-choice.repository.ts'

interface Props {
  actionId: string
  userId: string
}

export function abandonActionCommitment({ actionId, userId }: Props) {
  return deleteActionChoice({
    actionId,
    userId,
  })
}
