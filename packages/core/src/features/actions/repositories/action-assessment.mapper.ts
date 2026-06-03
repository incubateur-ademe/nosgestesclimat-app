import type { Prisma } from '../../../prisma/generated/client.ts'
import type { ActionAssessmentModel } from '../../../prisma/generated/models/ActionAssessment.ts'
import type { ActionAssessment, NewActionAssessment } from '../types/action.ts'

export const mapActionAssessment = (
  db: ActionAssessmentModel
): ActionAssessment => {
  const base = {
    id: db.id,
    simulationId: db.simulationId,
    actionId: db.actionId,
    createdAt: db.createdAt,
  }
  if (db.applicable === true) {
    return { ...base, applicable: true, impact: db.impact ?? undefined }
  }
  return { ...base, applicable: db.applicable ?? undefined, impact: undefined }
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
