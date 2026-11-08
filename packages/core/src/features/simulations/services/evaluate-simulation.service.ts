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

interface EvaluateSimulationDeps {
  logger: Logger
}

/**
 * Produces and persists everything derived from a simulation's situation:
 * today, its action assessments.
 *
 * The engine's situation must already be set to the simulation's. Every write
 * goes through `session`, so the caller commits them together with the job's
 * status, or rolls them all back.
 */
export function createEvaluateSimulation(deps: EvaluateSimulationDeps) {
  return async function evaluateSimulation(
    engine: Engine,
    simulation: { id: string; model: ModelString },
    { session }: { session: Transaction }
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
  }
}
export type EvaluateSimulation = ReturnType<typeof createEvaluateSimulation>
