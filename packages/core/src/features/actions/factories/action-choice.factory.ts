import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { ActionChoice } from '../types/action.ts'

class ActionChoiceFactory extends Factory<ActionChoice> {}

export const actionChoiceFactory = ActionChoiceFactory.define(
  ({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.actionChoice.create({
        data: {
          id: data.id,
          userId: data.userId,
          actionId: data.actionId,
          type: data.type,
          chosenAt: data.chosenAt,
        },
      })

      return data
    })

    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      actionId: faker.string.uuid(),
      type: 'committed' as const,
      chosenAt: new Date(),
    }
  }
)
