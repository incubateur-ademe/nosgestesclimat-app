import type { Prisma } from '../../../prisma/generated/client.ts'
import type { ActionAssessmentModel } from '../../../prisma/generated/models/ActionAssessment.ts'
import type { ActionAssessment, NewActionAssessment } from '../types/action.ts'
export const mapActionAssessment = (
  db: ActionAssessmentModel
): ActionAssessment => {
  if (db.applicable === true) {
    return {
      id: db.id,
      simulationId: db.simulationId,
      actionId: db.actionId,
      impact: db.impact || undefined,
      applicable: true,
    }
  }
  return {
    id: db.id,
    simulationId: db.simulationId,
    actionId: db.actionId,
    impact: undefined,
    applicable: db.applicable ?? undefined,
  }
}

export const mapNewActionAssessmentToPrisma = (
  assessment: NewActionAssessment
): Prisma.ActionAssessmentCreateManyInput => {
  return {
    simulationId: assessment.simulationId,
    actionId: assessment.actionId,
    impact: assessment.impact ?? null,
    applicable: assessment.applicable ?? null,
  }
}
