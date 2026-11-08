import type Engine from 'publicodes'
import { toError } from '../../../lib/to-error.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import { ActionAssessmentPublicodesError } from '../../actions/errors/action-assessment.error.ts'
import {
  buildRuleIdToDottedName,
  evaluateAction,
  toNewActionAssessment,
} from '../../actions/helpers/action-assessment.ts'
import { createActionAssessments } from '../../actions/repositories/action-assessments.repository.ts'
import { findActionRuleIds } from '../../actions/repositories/actions.repository.ts'
import type { NewActionAssessment } from '../../actions/types/action.ts'
import type { Logger } from '../../logger/index.ts'
import type { ModelString } from '../../models/helpers/model-versions.ts'
import { evaluatePublicRule } from '../../rules/helpers/public-rules.ts'
import { createRuleEvaluations } from '../../rules/repositories/rule-evaluations.repository.ts'
import type { NewRuleEvaluation, Rule } from '../../rules/types/rule.ts'

interface EvaluateSimulationDeps {
  logger: Logger
}

/**
 * Produces and persists everything derived from a simulation's situation: its
 * action assessments and the evaluations of its model's public rules.
 *
 * The engine's situation must already be set to the simulation's.
 * `publicRules` are the model's stored public rules, resolved beforehand by
 * `resolvePublicRules`. Every write goes through `session`, so the caller
 * commits them together with the job's status, or rolls them all back.
 */
export function createEvaluateSimulation(deps: EvaluateSimulationDeps) {
  return async function evaluateSimulation(
    engine: Engine,
    simulation: { id: string; model: ModelString },
    { session, publicRules }: { session: Transaction; publicRules: Rule[] }
  ): Promise<void> {
    const logger = deps.logger.child({
      scope: 'core.service.evaluateSimulation',
      simulationId: simulation.id,
      model: simulation.model,
    })
    const simulationId = simulation.id
    const actions = await findActionRuleIds({ session })

    if (actions.length === 0) {
      throw new ActionAssessmentPublicodesError({
        message: 'No actions found in database. Cannot assess actions.',
      })
    }

    const ruleIdToDottedName = buildRuleIdToDottedName(engine)

    if (ruleIdToDottedName.size === 0) {
      throw new ActionAssessmentPublicodesError({
        message:
          'No publicodes rules have meta.id, cannot link actions to dotted names. ' +
          'Ensure the model includes meta.id on action rules.',
      })
    }

    const assessments: NewActionAssessment[] = actions
      .map(({ id, ruleId }) => {
        const dottedName = ruleIdToDottedName.get(ruleId)
        if (!dottedName) {
          logger.warn('No rule found with this id', {
            actionId: id,
            ruleId: ruleId,
          })
          return undefined
        }

        try {
          const evaluation = evaluateAction({ engine, dottedName })

          if (evaluation.outcome === 'unexpected_node_value') {
            logger.warn(
              `Unexpected nodeValue type: ${evaluation.nodeValueType}`,
              {
                actionId: id,
                ruleId: ruleId,
                dottedName: dottedName,
              }
            )
            return undefined
          }

          return toNewActionAssessment(
            { simulationId, actionId: id },
            evaluation.applicability
          )
        } catch (error) {
          // The action is skipped, never retried: the failure is captured, so
          // a rule the engine chokes on does not vanish with its assessment.
          logger.error(toError(error), {
            actionId: id,
            ruleId: ruleId,
            dottedName: dottedName,
          })
          return undefined
        }
      })
      .filter((a) => a !== undefined)

    if (assessments.length > 0) {
      await createActionAssessments(assessments, { session })
    }

    const ruleEvaluations = publicRules.flatMap(
      ({ id, name, metric }): NewRuleEvaluation[] => {
        const applicability = evaluatePublicRule({ engine, name, metric })
        return applicability
          ? [{ simulationId, ruleId: id, ...applicability }]
          : []
      }
    )

    if (ruleEvaluations.length > 0) {
      await createRuleEvaluations(ruleEvaluations, { session })
    }
  }
}
export type EvaluateSimulation = ReturnType<typeof createEvaluateSimulation>
