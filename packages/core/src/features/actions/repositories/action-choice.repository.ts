import { prisma } from '../../../prisma/client.ts'
import { mapActionChoiceToPrisma } from './action-choice.mapper.ts'

export const createActionChoice = async ({
  actionId,
  userId,
}: {
  actionId: string
  userId: string
}): Promise<void> => {
  await prisma.actionChoice.create({
    data: mapActionChoiceToPrisma({
      userId,
      actionId,
      type: 'committed',
    }),
  })
}
