import type { ActionAssessmentModel } from '../../../prisma/generated/models/ActionAssessment.ts'
import type { ActionAssessment } from '../types/action.ts'

export const mapActionAssessment = (
  db: ActionAssessmentModel
): ActionAssessment => {
  if (db.applicable === true) {
    if (db.impact === null) {
      throw new Error() // @tofix internal error
    }
    return {
      id: db.id,
      simulationId: db.simulationId,
      actionId: db.actionId,
      impact: db.impact,
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
