import { prisma } from '../../../prisma/client.ts'
import { isPrismaErrorUniqueConstraintFailed } from '../../../prisma/utils.ts'
import { mapActionChoiceToPrisma } from './action-choice.mapper.ts'

export const createActionChoice = async ({
  actionId,
  userId,
}: {
  actionId: string
  userId: string
}): Promise<void> => {
  try {
    await prisma.actionChoice.create({
      data: mapActionChoiceToPrisma({
        userId,
        actionId,
        type: 'committed',
      }),
    })
  } catch (error) {
    // If the action choice already exists fail silently, the user
    // doesn't need to be informed
    if (isPrismaErrorUniqueConstraintFailed(error)) {
      return
    }
    throw error
  }
}
