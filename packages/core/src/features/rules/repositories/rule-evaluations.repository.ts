import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { NewRuleEvaluation } from '../types/rule.ts'
import { mapNewRuleEvaluationToPrisma } from './rule.mapper.ts'

export const createRuleEvaluations = async (
  evaluations: NewRuleEvaluation[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.ruleEvaluation.createMany({
    data: evaluations.map(mapNewRuleEvaluationToPrisma),
  })
}
