import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type {
  DetailedRuleEvaluation,
  NewRuleEvaluation,
  RuleEvaluation,
} from '../types/rule-evaluation.ts'
import {
  mapDetailedRuleEvaluation,
  mapNewRuleEvaluationMissingVariablesToPrisma,
  mapNewRuleEvaluationToPrisma,
  mapRuleEvaluation,
} from './rule-evaluation.mapper.ts'

export const findRuleEvaluationsBySimulation = async (
  simulationId: string
): Promise<RuleEvaluation[]> => {
  const rows = await prisma.ruleEvaluation.findMany({
    where: { simulationId },
  })
  return rows.map(mapRuleEvaluation)
}

export const findDetailedRuleEvaluationsBySimulation = async (
  simulationId: string
): Promise<DetailedRuleEvaluation[]> => {
  const rows = await prisma.ruleEvaluation.findMany({
    where: { simulationId },
    include: {
      missingVariables: {
        select: { weight: true, missingVariable: true },
      },
    },
  })
  return rows.map(mapDetailedRuleEvaluation)
}

/**
 * Writes the evaluations and the links to their missing variables; each
 * linked rule must be one of `evaluations`.
 */
export const createRuleEvaluations = async (
  evaluations: NewRuleEvaluation[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.ruleEvaluation.createMany({
    data: evaluations.map(mapNewRuleEvaluationToPrisma),
  })

  const missingVariables = evaluations.flatMap(
    mapNewRuleEvaluationMissingVariablesToPrisma
  )
  if (missingVariables.length > 0) {
    await session.ruleEvaluationMissingVariable.createMany({
      data: missingVariables,
    })
  }
}
