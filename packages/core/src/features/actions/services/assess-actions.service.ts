import type Engine from 'publicodes'
import { toError } from '../../../lib/to-error.ts'
import type { Logger } from '../../logger/index.ts'
import { ActionAssessmentPublicodesException } from '../exceptions/action-assessment.exception.ts'
import { createActionAssessments } from '../repositories/action-assessments.repository.ts'
import { findActionRuleIds } from '../repositories/actions.repository.ts'
import type { NewActionAssessment } from '../types/action.ts'

interface AssessActionsDeps {
  logger: Logger
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
    const logger = deps.logger.child({
      scope: 'core.service.assessActions',
      simulationId: simulationId,
    })
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
          logger.warn('No rule found with this id', { actionId: id, ruleId: ruleId })
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
            logger.warn(`Unexpected nodeValue type: ${typeof nodeValue}`, {
              actionId: id,
              ruleId: ruleId,
              dottedName: dottedName,
            })
            return undefined
          }
        } catch (error) {
          // The stack of the failure stays in the line: the action is skipped
          // and the iteration goes on, nothing more is needed.
          logger.warn(toError(error), { actionId: id, ruleId: ruleId, dottedName: dottedName })
          return undefined
        }
      })
      .filter((a) => a !== undefined)

    if (assessments.length > 0) {
      await createActionAssessments(assessments)
    }
  }
}
