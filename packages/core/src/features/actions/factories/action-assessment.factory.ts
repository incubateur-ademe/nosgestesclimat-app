import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '../../../prisma/client.ts'
import type { ActionAssessment } from '../types/action.ts'

class ActionAssessmentFactory extends Factory<ActionAssessment> {
  applicable(...args: [] | [{ impact?: number }]) {
    const { impact } = args[0] ?? {}
    return this.params({
      applicable: true,
      impact:
        args.length === 0
          ? faker.number.float({ min: 0, max: 5000, multipleOf: 0.01 })
          : impact,
    })
  }

  inapplicable() {
    return this.params({ applicable: false, impact: undefined })
  }

  unknownApplicability() {
    return this.params({ applicable: undefined, impact: undefined })
  }
}

export const actionAssessmentFactory = ActionAssessmentFactory.define(
  ({ onCreate }) => {
    onCreate(async (data) => {
      await prisma.actionAssessment.create({
        data: {
          id: data.id,
          simulationId: data.simulationId,
          actionId: data.actionId,
          applicable: data.applicable ?? null,
          impact: data.impact ?? null,
          createdAt: data.createdAt,
        },
      })
      return data
    })

    const applicable = faker.datatype.boolean()

    return {
      id: faker.string.uuid(),
      simulationId: faker.string.uuid(),
      actionId: faker.string.uuid(),
      ...(applicable
        ? {
            applicable: true as const,
            impact: faker.number.float({ min: 0, max: 5000, multipleOf: 0.01 }),
          }
        : {
            applicable: false as const,
            impact: undefined,
          }),
      createdAt: faker.date.recent(),
    }
  }
)
