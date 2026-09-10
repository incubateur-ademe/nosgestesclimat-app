import { failure } from '../../../lib/result.ts'
import { ActionNotFoundError } from '../errors/action.error.ts'
import { createActionChoice } from '../repositories/action-choice.repository.ts'
import { findActionById } from '../repositories/actions.repository.ts'

export function createCommitToAction() {
  return async function commitToAction({
    actionId,
    userId,
  }: {
    actionId: string
    userId: string
  }) {
    if (!(await findActionById(actionId))) {
      return failure(new ActionNotFoundError())
    }

    await createActionChoice({
      actionId,
      userId,
    })
  }
}
