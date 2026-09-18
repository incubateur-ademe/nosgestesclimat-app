import { success, type Result } from '../../../lib/result.ts'
import { prisma } from '../../../prisma/client.ts'
import { isPrismaErrorUniqueConstraintFailed } from '../../../prisma/utils.ts'
import { mapActionChoiceToPrisma } from './action-choice.mapper.ts'

export const createActionChoice = async ({
  actionId,
  userId,
}: {
  actionId: string
  userId: string
}): Promise<Result<void>> => {
  try {
    await prisma.actionChoice.create({
      data: mapActionChoiceToPrisma({
        userId,
        actionId,
        type: 'committed',
      }),
    })
    return success()
  } catch (error) {
    // If the action choice already exists fail silently, the user
    // doesn't need to be informed
    if (isPrismaErrorUniqueConstraintFailed(error)) {
      return success()
    }
    throw error
  }
}
