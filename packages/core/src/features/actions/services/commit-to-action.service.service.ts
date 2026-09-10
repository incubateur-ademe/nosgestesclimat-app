import { failure } from '../../../lib/result.ts'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { ActionNotFoundError } from '../errors/action.error.ts'
import { createActionChoice } from '../repositories/action-choice.repository.ts'
import { findActionById } from '../repositories/actions.repository.ts'

interface CommitToActionDeps {
  logger: Logger
  captureException: CaptureException
}

export function createCommitToAction(deps: CommitToActionDeps) {
  return async function commitToAction({
    actionId,
    userId,
  }: {
    actionId: string
    userId: string
  }) {
    console.log(deps)
    if (!(await findActionById(actionId))) {
      return failure(new ActionNotFoundError())
    }

    await createActionChoice({
      actionId,
      userId,
    })
  }
}
