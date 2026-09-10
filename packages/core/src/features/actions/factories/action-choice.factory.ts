import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { ActionChoiceType } from '../../../prisma/generated/enums.ts'
import type { ActionChoice } from '../types/action.ts'

class ActionChoiceFactory extends Factory<ActionChoice> {
  withUserId(userId: string) {
    return this.params({ userId })
  }
  withActionId(actionId: string) {
    return this.params({ actionId })
  }
  withType(type: ActionChoiceType) {
    return this.params({ type })
  }
}

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
