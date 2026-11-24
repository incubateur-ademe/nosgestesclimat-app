import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import {
  ruleIdByRuleKey,
  ruleIdOf,
  ruleKey,
} from '../../models/helpers/rule-key.ts'
import type { ModelRuleEvaluation } from '../../models/types/model-rule-evaluation.ts'
import type { Rule } from '../../models/types/rule.ts'
import {
  mapModelRuleEvaluation,
  mapModelRuleEvaluationMissingVariablesToPrisma,
  mapModelRuleEvaluationToPrisma,
} from './rule-evaluation.mapper.ts'

/**
 * Finds a simulation's rule evaluations, each with its rule's name and metric
 * and the missing variables it reported, resolved to their rule names.
 */
export const findRuleEvaluationsBySimulation = async (
  simulationId: string
): Promise<ModelRuleEvaluation[]> => {
  const rows = await prisma.ruleEvaluation.findMany({
    where: { simulationId },
    include: {
      rule: { select: { name: true, metric: true } },
      missingVariables: {
        select: {
          weight: true,
          missingVariable: { select: { rule: { select: { name: true } } } },
        },
      },
    },
  })
  return rows.map(mapModelRuleEvaluation)
}

/**
 * Writes the evaluations and the links to their missing variables; each
 * linked rule must be one of `evaluations`, and each rule must be stored
 * among `rules`.
 *
 * `rules` comes as a param, already stored, instead of being resolved here
 * by name and metric: that lookup would cost an extra db roundtrip on the
 * hotpath of every simulation computation.
 */
export const createRuleEvaluations = async (
  evaluations: ModelRuleEvaluation[],
  rules: Rule[],
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  const ruleIdByKey = ruleIdByRuleKey(rules)
  const evaluated = new Set(
    evaluations.map(({ name, metric }) => ruleKey(metric, name))
  )

  await session.ruleEvaluation.createMany({
    data: evaluations.map((evaluation) =>
      mapModelRuleEvaluationToPrisma(
        ruleIdOf(ruleIdByKey, evaluation.metric, evaluation.name),
        evaluation
      )
    ),
  })

  const missingVariables = evaluations.flatMap((evaluation) => {
    const ruleId = ruleIdOf(ruleIdByKey, evaluation.metric, evaluation.name)
    return evaluation.missingVariables.map((missingVariable) => {
      const key = ruleKey(evaluation.metric, missingVariable.name)
      if (!evaluated.has(key)) {
        throw new Error(
          `Invariant: no evaluation found for missing variable "${key}"`
        )
      }
      return mapModelRuleEvaluationMissingVariablesToPrisma(
        ruleId,
        ruleIdOf(ruleIdByKey, evaluation.metric, missingVariable.name),
        evaluation,
        missingVariable
      )
    })
  })
  if (missingVariables.length > 0) {
    await session.ruleEvaluationMissingVariable.createMany({
      data: missingVariables,
    })
  }
}
