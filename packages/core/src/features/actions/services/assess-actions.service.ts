import type Engine from 'publicodes'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { ActionAssessmentPublicodesException } from '../exceptions/action-assessment.exception.ts'
import {
  buildRuleIdToDottedName,
  evaluateAction,
  toNewActionAssessment,
} from '../helpers/action-assessment.ts'
import { createActionAssessments } from '../repositories/action-assessments.repository.ts'
import { findActionRuleIds } from '../repositories/actions.repository.ts'
import type { NewActionAssessment } from '../types/action.ts'

interface AssessActionsDeps {
  logger: Logger
  captureException: CaptureException
}

export function createAssessActions(deps: AssessActionsDeps) {
  return async function assessActions(
    engine: Engine,
    simulationId: string
  ): Promise<void> {
    const { logger, captureException } = deps
    const actions = await findActionRuleIds()

    if (actions.length === 0) {
      throw new ActionAssessmentPublicodesException({
        message: 'No actions found in database. Cannot assess actions.',
      })
    }

    const ruleIdToDottedName = buildRuleIdToDottedName(engine)

    if (ruleIdToDottedName.size === 0) {
      throw new ActionAssessmentPublicodesException({
        message:
          'No publicodes rules have meta.id, cannot link actions to dotted names. ' +
          'Ensure the model includes meta.id on action rules.',
      })
    }

    const assessments: NewActionAssessment[] = actions
      .map(({ id, ruleId }) => {
        const dottedName = ruleIdToDottedName.get(ruleId)
        if (!dottedName) {
          const exception = new ActionAssessmentPublicodesException({
            message: 'No rule found with this id',
            action: { id, ruleId },
          })
          logger.warn(
            `[assess-actions] ${exception.message}`,
            exception.payload
          )
          captureException(exception)
          return undefined
        }

        try {
          const evaluation = evaluateAction({ engine, dottedName })

          if (evaluation.outcome === 'unexpected_node_value') {
            const exception = new ActionAssessmentPublicodesException({
              message: `Unexpected nodeValue type: ${evaluation.nodeValueType}`,
              action: { id, ruleId },
              dottedName,
            })
            logger.error(
              `[assess-actions] ${exception.message}`,
              exception.payload
            )
            captureException(exception)
            return undefined
          }

          return toNewActionAssessment(
            { simulationId, actionId: id },
            evaluation.applicability
          )
        } catch (error) {
          const exception = new ActionAssessmentPublicodesException({
            message: 'Error calling publicodes `engine.evaluate`',
            cause: error,
            action: { id, ruleId },
            dottedName,
          })
          logger.error(`[assess-actions] ${exception.message}`, {
            ...exception.payload,
            cause: error,
          })
          captureException(exception)
          return undefined
        }
      })
      .filter((a) => a !== undefined)

    if (assessments.length > 0) {
      await createActionAssessments(assessments)
    }
  }
}
