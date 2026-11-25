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

/**
 * Finds a simulation's rule evaluations, each with its rule's name and water
 * mark (its metric). The missing variables are not read: they are stored as
 * links, and reading them would need a join on every evaluation.
 */
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
 * Writes the evaluations and the links to their missing variables. Each
 * evaluation references the rule row of its metric, and each link the missing
 * variable's row of the reporting evaluation's metric when there is one, else
 * its default row. Missing variables are not evaluated: each link points to
 * the missing variable's rule, which must be stored among `rules`, like each
 * evaluated rule.
 *
 * `rules` comes as a param, already stored, instead of being resolved here by
 * name: that lookup would cost an extra db roundtrip on the hotpath of every
 * simulation computation.
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
