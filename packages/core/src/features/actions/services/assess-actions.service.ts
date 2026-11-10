import type Engine from 'publicodes'
import { toError } from '../../../lib/to-error.ts'
import type { Transaction } from '../../../lib/transaction.ts'
import type { Logger } from '../../logger/index.ts'
import { UnexpectedNodeValueError } from '../../models/errors.ts'
import { evaluatePublicRule } from '../../models/helpers/evaluate-public-rule.ts'
import { ActionAssessmentPublicodesError } from '../errors/action-assessment.error.ts'
import {
  buildRuleIdToDottedName,
  toActionEvaluation,
  toNewActionAssessment,
} from '../helpers/action-assessment.ts'
import { createActionAssessments } from '../repositories/action-assessments.repository.ts'
import { findActionRuleIds } from '../repositories/actions.repository.ts'
import type { NewActionAssessment } from '../types/action.ts'

interface AssessActionsDeps {
  logger: Logger
}

/**
 * Assesses every action against a simulation and persists the assessments.
 *
 * The engine's situation must already be set to the simulation's. Every
 * action is evaluated before anything is written, and every write goes
 * through `session`, so the caller commits them together with its own writes,
 * or rolls them all back.
 */
export function createAssessActions(deps: AssessActionsDeps) {
  return async function assessActions(
    engine: Engine,
    simulationId: string,
    { session }: { session: Transaction }
  ): Promise<void> {
    const logger = deps.logger.child({
      scope: 'core.service.assessActions',
      simulationId,
    })

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

    const assessments: NewActionAssessment[] = actions.flatMap(
      ({ id, ruleId }) => {
        const dottedName = ruleIdToDottedName.get(ruleId)
        if (!dottedName) {
          logger.warn('No rule found with this id', { actionId: id, ruleId })
          return []
        }

        const evaluation = evaluatePublicRule({ engine, dottedName })

        if (!evaluation.success) {
          const meta = { actionId: id, ruleId, dottedName }
          if (evaluation.error instanceof UnexpectedNodeValueError) {
            // Detected, not thrown: no stack to report, so the line names the
            // shape and the failure stays an anomaly to watch by rate. Only
            // `true` and a string get here: `nodeValue` is their type.
            logger.warn(
              `Unexpected nodeValue type: ${evaluation.error.nodeValue}`,
              meta
            )
          } else {
            // The action is skipped, never retried: the failure is captured,
            // so a rule the engine chokes on does not vanish with its
            // assessment. What the engine threw is reported, not its wrapper.
            logger.error(toError(evaluation.error.cause), meta)
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
  }
}
