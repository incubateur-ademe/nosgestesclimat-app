import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type {
  NewRuleEvaluation,
  RuleEvaluation,
} from '../types/rule-evaluation.ts'
import {
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

export const createRuleEvaluations = async (
  evaluations: NewRuleEvaluation[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.ruleEvaluation.createMany({
    data: evaluations.map(mapNewRuleEvaluationToPrisma),
  })
}
