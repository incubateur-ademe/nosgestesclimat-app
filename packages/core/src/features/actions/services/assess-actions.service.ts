import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import { toError } from '../../../lib/to-error.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import type { Logger } from '../../logger/index.ts'
import { evaluateModelRule } from '../../models/helpers/evaluate-model-rule.ts'
import { ActionAssessmentPublicodesError } from '../errors/action-assessment.error.ts'
import {
  buildRuleIdToDottedName,
  toActionEvaluation,
  toNewActionAssessment,
} from '../helpers/action-assessment.ts'
import {
  createActionAssessments,
  hasActionAssessments,
} from '../repositories/action-assessments.repository.ts'
import { findActionRuleIds } from '../repositories/actions.repository.ts'
import type { NewActionAssessment } from '../types/action.ts'

interface AssessActionsDeps {
  logger: Logger
}

/**
 * Assesses every action against a simulation and persists the assessments.
 *
 * The engine's situation must already be set to the simulation's.
 *
 * Idempotent, so a retried computation keeps the assessments of its first
 * attempt.
 */
export function createAssessActions(deps: AssessActionsDeps) {
  return async function assessActions(
    engine: Engine,
    simulationId: string,
    { session }: { session: Transaction }
  ): Promise<Result<void, ActionAssessmentPublicodesError>> {
    const logger = deps.logger.child({
      scope: 'core.service.assessActions',
      simulationId,
    })

    if (await hasActionAssessments(simulationId, { session })) {
      return success()
    }

    const actions = await findActionRuleIds({ session })

    if (actions.length === 0) {
      return failure(
        new ActionAssessmentPublicodesError({
          message: 'No actions found in database. Cannot assess actions.',
        })
      )
    }

    const ruleIdToDottedName = buildRuleIdToDottedName(engine)

    if (ruleIdToDottedName.size === 0) {
      return failure(
        new ActionAssessmentPublicodesError({
          message:
            'No publicodes rules have meta.id, cannot link actions to dotted names. ' +
            'Ensure the model includes meta.id on action rules.',
        })
      )
    }

    const assessments: NewActionAssessment[] = actions.flatMap(
      ({ id, ruleId }) => {
        const dottedName = ruleIdToDottedName.get(ruleId)
        if (!dottedName) {
          logger.warn('No rule found with this id', { actionId: id, ruleId })
          return []
        }

        const evaluation = evaluateModelRule({ engine, dottedName })

        if (!evaluation.success) {
          const { error } = evaluation
          const meta = { actionId: id, ruleId, dottedName }
          switch (error.code) {
            case 'unexpected_node_value':
              // No stack to report: an anomaly to watch by rate.
              logger.warn(`Unexpected nodeValue type: ${error.nodeValue}`, meta)
              break
            case 'rule_evaluation_threw':
              // A retry skips an assessed simulation: this log is the only
              // trace of the action left unassessed.
              logger.error(toError(error.cause), meta)
              break
            default:
              logger.error(error, meta)
              error satisfies never
          }
          return []
        }

        return [
          toNewActionAssessment(
            { simulationId, actionId: id },
            toActionEvaluation(evaluation.data)
          ),
        ]
      }
    )

    if (assessments.length > 0) {
      await createActionAssessments(assessments, { session })
    }
    return success()
  }
}
