import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import {
  missingVariableRuleIdOf,
  ruleIdByKey,
  ruleIdOrThrow,
} from '../../models/helpers/rule-key.ts'
import type {
  NewRuleEvaluation,
  RuleEvaluation,
} from '../../models/types/rule-evaluation.ts'
import type { Rule } from '../../models/types/rule.ts'
import {
  mapNewRuleEvaluationMissingVariablesToPrisma,
  mapNewRuleEvaluationToPrisma,
  mapRuleEvaluation,
} from './rule-evaluation.mapper.ts'

/** Missing variables are not read: they are links, and reading them would join every evaluation. */
export const findRuleEvaluationsBySimulation = async (
  simulationId: string
): Promise<RuleEvaluation[]> => {
  const rows = await prisma.ruleEvaluation.findMany({
    where: { simulationId },
    include: {
      rule: { select: { name: true, appliesToWaterMetric: true } },
    },
  })
  return rows.map(mapRuleEvaluation)
}

/**
 * Each evaluation references its metric's rule row; each link the missing
 * variable's row of the reporting metric when stored, else its default row.
 * `rules` is passed already stored: resolving by name here would add a db
 * roundtrip to every simulation computation.
 */
export const createRuleEvaluations = async (
  evaluations: NewRuleEvaluation[],
  rules: Rule[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  const idByKey = ruleIdByKey(rules)

  await session.ruleEvaluation.createMany({
    data: evaluations.map((evaluation) =>
      mapNewRuleEvaluationToPrisma(
        ruleIdOrThrow(idByKey, evaluation.name, evaluation.metric),
        evaluation
      )
    ),
  })

  const missingVariables = evaluations.flatMap((evaluation) => {
    const ruleId = ruleIdOrThrow(idByKey, evaluation.name, evaluation.metric)
    return evaluation.missingVariables.map((missingVariable) =>
      mapNewRuleEvaluationMissingVariablesToPrisma(
        ruleId,
        missingVariableRuleIdOf(
          idByKey,
          missingVariable.name,
          evaluation.metric
        ),
        evaluation,
        missingVariable
      )
    )
  })
  if (missingVariables.length > 0) {
    await session.ruleEvaluationMissingVariable.createMany({
      data: missingVariables,
    })
  }
}
