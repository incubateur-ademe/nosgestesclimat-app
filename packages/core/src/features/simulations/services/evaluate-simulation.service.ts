import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import type { Logger } from '../../logger/index.ts'
import { evaluateModelRules } from '../../models/helpers/evaluate-model-rules.ts'
import { getModelRule } from '../../models/helpers/model-rules.ts'
import { upsertRules } from '../../models/repositories/rules.repository.ts'
import type { NewRule, Rule } from '../../models/types/rule.ts'
import { PublicRulesEvaluationError } from '../errors/simulations.error.ts'
import { createRuleEvaluations } from '../repository/rule-evaluations.repository.ts'

interface EvaluateSimulationDeps {
  logger: Logger
}

/**
 * Evaluates each given rule row under its own metric and persists the evaluations
 * through `session` — all-or-nothing: failed rules are logged, the returned error
 * only counts them. The engine's situation must already be the simulation's.
 * Missing variables get a rule row and a weighted link, never an evaluation.
 */
export function createEvaluateSimulation(deps: EvaluateSimulationDeps) {
  return async function evaluateSimulation(
    engine: Engine,
    simulationId: string,
    publicRules: Rule[],
    { session }: { session: Transaction }
  ): Promise<Result<void, PublicRulesEvaluationError>> {
    const logger = deps.logger.child({
      scope: 'core.service.evaluateSimulation',
      simulationId,
    })

    const createdAt = new Date()

    const { evaluations, errors } = evaluateModelRules({
      engine,
      rules: publicRules,
      simulationId,
      createdAt,
    })

    if (errors.length > 0) {
      errors.forEach((error) => logger.error(error))
      return failure(new PublicRulesEvaluationError(errors.length))
    }

    // Also store the reported missing variables' rule rows, whatever the
    // reporting metric: a missing variable is not evaluated.
    const seen = new Set(publicRules.map((rule) => rule.name))
    const newRules: NewRule[] = []
    for (const evaluation of evaluations) {
      for (const missingVariable of evaluation.missingVariables) {
        if (!seen.has(missingVariable.name)) {
          seen.add(missingVariable.name)
          newRules.push(...getModelRule(engine, missingVariable.name))
        }
      }
    }

    if (newRules.length > 0) {
      logger.info('Upserting rules', {
        rules: newRules.map(({ name }) => ({ name })),
      })
    }

    const storedNewRules = await upsertRules(newRules, { session })

    if (evaluations.length > 0) {
      await createRuleEvaluations(
        evaluations,
        [...publicRules, ...storedNewRules],
        { session }
      )
    }

    return success()
  }
}
