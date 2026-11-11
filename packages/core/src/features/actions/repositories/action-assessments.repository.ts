import type { Transaction } from '../../../lib/transaction.ts'
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

export const hasActionAssessments = async (
  simulationId: string,
  { session = prisma }: { session?: Transaction } = {}
): Promise<boolean> => {
  const row = await session.actionAssessment.findFirst({
    where: { simulationId },
    select: { id: true },
  })
  return row !== null
}

/**
 * Stores the assessments, skipping those of an action the simulation already
 * has one for.
 */
export const createActionAssessments = async (
  assessments: NewActionAssessment[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.actionAssessment.createMany({
    data: assessments.map(mapNewActionAssessmentToPrisma),
    skipDuplicates: true,
  })
}
