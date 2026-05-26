import { prisma } from '../../../prisma/client.ts'
import type { ActionAssessment, ActionAssessmentInput } from '../types/action.ts'
import { mapActionAssessment } from './action-assessment.mapper.ts'

export { type ActionAssessmentInput }

export const findActionAssessmentsBySimulation = async (
  simulationId: string
): Promise<ActionAssessment[]> => {
  const rows = await prisma.actionAssessment.findMany({
    where: { simulationId },
  })
  return rows.map(mapActionAssessment)
}

export const upsertActionAssessments = async (
  assessments: ActionAssessmentInput[]
): Promise<void> => {
  await prisma.$transaction(
    assessments.map((a) =>
      prisma.actionAssessment.upsert({
        where: {
          simulationId_actionId: {
            simulationId: a.simulationId,
            actionId: a.actionId,
          },
        },
        create: a,
        update: {
          impact: a.applicable === true ? a.impact : null,
          applicable: a.applicable,
        },
      })
    )
  )
}
