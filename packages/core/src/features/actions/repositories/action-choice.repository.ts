import { prisma } from '../../../prisma/client.ts'
import type { ActionChoiceType } from '../../../prisma/generated/enums.ts'
import { mapActionChoiceToPrisma } from './action-choice.mapper.ts'

interface Props {
  actionId: string
  type: ActionChoiceType
  userId: string
}

export const upsertActionChoice = async ({
  actionId,
  type,
  userId,
}: Props): Promise<void> => {
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
      type,
    }),
    update: mapActionChoiceToPrisma({
      userId,
      actionId,
      type,
    }),
  })
}
