import { prisma } from '../../../prisma/client.ts'
import { isPrismaErrorNotFound } from '../../../prisma/utils.ts'
import type { ActionChoiceType } from '../types/action.ts'
import { mapActionChoiceToPrisma } from './action-choice.mapper.ts'

interface UpsertActionChoiceProps {
  actionId: string
  type: ActionChoiceType
  userId: string
}
export const upsertActionChoice = async ({
  actionId,
  type,
  userId,
}: UpsertActionChoiceProps): Promise<void> => {
  await prisma.actionChoice.upsert({
    where: {
      userId_actionId: {
        userId,
        actionId,
      },
    },
    create: mapActionChoiceToPrisma({
      userId,
      actionId,
      type,
    }),
    update: mapActionChoiceToPrisma({
      userId,
      actionId,
      type,
    }),
  })
}

interface DeleteActionChoiceProps {
  actionId: string
  userId: string
}
export const deleteActionChoice = async ({
  actionId,
  userId,
}: DeleteActionChoiceProps): Promise<void> => {
  try {
    await prisma.actionChoice.delete({
      where: {
        userId_actionId: {
          userId,
          actionId,
        },
      },
    })
  } catch (error) {
    // The actionChoice doesn't exist, not a problem
    if (isPrismaErrorNotFound(error)) {
      return
    }
    throw error
  }
}
