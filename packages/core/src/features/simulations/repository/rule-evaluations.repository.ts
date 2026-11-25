import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import {
  missingVariableRuleIdOf,
  ruleIdByKey,
  ruleIdOf,
} from '../../models/helpers/rule-key.ts'
import type { ModelRuleEvaluation } from '../../models/types/model-rule-evaluation.ts'
import type { Rule } from '../../models/types/rule.ts'
import {
  mapModelRuleEvaluation,
  mapModelRuleEvaluationMissingVariablesToPrisma,
  mapModelRuleEvaluationToPrisma,
} from './rule-evaluation.mapper.ts'

/**
 * Finds a simulation's rule evaluations, each with its rule's name and water
 * mark (its metric) and the missing variables it reported, resolved to their
 * rule names.
 */
export const findRuleEvaluationsBySimulation = async (
  simulationId: string
): Promise<ModelRuleEvaluation[]> => {
  const rows = await prisma.ruleEvaluation.findMany({
    where: { simulationId },
    include: {
      rule: { select: { name: true, appliesToWaterMetric: true } },
      missingVariables: {
        select: {
          weight: true,
          missingVariable: { select: { name: true } },
        },
      },
    },
  })
  return rows.map(mapModelRuleEvaluation)
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
  evaluations: ModelRuleEvaluation[],
  rules: Rule[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  const idByKey = ruleIdByKey(rules)

  await session.ruleEvaluation.createMany({
    data: evaluations.map((evaluation) =>
      mapModelRuleEvaluationToPrisma(
        ruleIdOf(idByKey, evaluation.name, evaluation.metric),
        evaluation
      )
    ),
  })

  const missingVariables = evaluations.flatMap((evaluation) => {
    const ruleId = ruleIdOf(idByKey, evaluation.name, evaluation.metric)
    return evaluation.missingVariables.map((missingVariable) =>
      mapModelRuleEvaluationMissingVariablesToPrisma(
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
