import type Engine from 'publicodes'
import type { CaptureException, Logger } from '../../logger/index.ts'
import { ActionAssessmentPublicodesException } from '../exceptions/action-assessment.exception.ts'
import { createActionAssessments } from '../repositories/action-assessments.repository.ts'
import { findActionRuleIds } from '../repositories/actions.repository.ts'
import type { NewActionAssessment } from '../types/action.ts'

interface AssessActionsDeps {
  logger: Logger
  captureException: CaptureException
}

const buildRuleIdToDottedName = (engine: Engine): Map<string, string> => {
  const parsedRules = engine.getParsedRules()
  const map = new Map<string, string>()
  for (const [dottedName, ruleNode] of Object.entries(parsedRules)) {
    const meta = (ruleNode as { rawNode?: { meta?: { id?: string } } }).rawNode
      ?.meta
    if (meta?.id) {
      map.set(meta.id, dottedName)
    }
  }
  return map
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
          const evaluated = engine.evaluate(dottedName)
          const nodeValue = evaluated.nodeValue
          const assessment = { simulationId, actionId: id }

          if (nodeValue === undefined) {
            return { ...assessment, applicable: undefined, impact: undefined }
          } else if (typeof nodeValue === 'number') {
            return {
              ...assessment,
              applicable: true as const,
              impact: nodeValue || undefined, // 0 encodes for impact not evaluable, hence the `||`
            }
          } else if (nodeValue === null || nodeValue === false) {
            return {
              ...assessment,
              applicable: false as const,
              impact: undefined,
            }
          } else {
            const exception = new ActionAssessmentPublicodesException({
              message: `Unexpected nodeValue type: ${typeof nodeValue}`,
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
