import { success, type Result } from '../../../lib/result.ts'
import { prisma } from '../../../prisma/client.ts'
import { mapActionChoiceToPrisma } from './action-choice.mapper.ts'

export const createActionChoice = async ({
  actionId,
  userId,
}: {
  actionId: string
  userId: string
}): Promise<Result<void>> => {
  await prisma.actionChoice.upsert({
    where: {
      userId_actionId: {
        actionId,
        userId,
      },
    },
    create: mapActionChoiceToPrisma({
      userId,
      actionId,
      type: 'committed',
    }),
    update: mapActionChoiceToPrisma({
      userId,
      actionId,
      type: 'committed',
    }),
  })
  return success()
}
