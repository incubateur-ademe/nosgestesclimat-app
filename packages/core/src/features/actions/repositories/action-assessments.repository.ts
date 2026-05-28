import { prisma } from '../../../prisma/client.ts'
import type { ActionAssessment, NewActionAssessment } from '../types/action.ts'
import {
  mapActionAssessment,
  mapNewActionAssessmentToPrisma,
} from './action-assessment.mapper.ts'

export const findActionAssessmentsBySimulation = async (
  simulationId: string
): Promise<ActionAssessment[]> => {
  const rows = await prisma.actionAssessment.findMany({
    where: { simulationId },
  })
  return rows.map(mapActionAssessment)
}

export const createActionAssessments = async (
  assessments: NewActionAssessment[]
): Promise<void> => {
  await prisma.actionAssessment.createMany({
    data: assessments.map(mapNewActionAssessmentToPrisma),
  })
}
