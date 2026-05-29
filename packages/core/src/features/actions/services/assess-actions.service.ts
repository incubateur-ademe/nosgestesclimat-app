import type Engine from 'publicodes'
import { logException } from '../../logger/logger.service.ts'
import { ActionAssessmentPublicodesException } from '../exceptions/action-assessment.exception.ts'
import { createActionAssessments } from '../repositories/action-assessments.repository.ts'
import { findVisibleActions } from '../repositories/actions.repository.ts'
import type { NewActionAssessment } from '../types/action.ts'

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

export const assessActions = async <DottedName extends string>(
  engine: Engine<DottedName>,
  simulationId: string
): Promise<void> => {
  const actions = await findVisibleActions()
  if (actions.length === 0) return

  const ruleIdToDottedName = buildRuleIdToDottedName(engine)
  const assessments: NewActionAssessment[] = actions
    .map(({ id, ruleId }) => {
      const dottedName = ruleIdToDottedName.get(ruleId)
      if (!dottedName) {
        logException(
          new ActionAssessmentPublicodesException({
            message: `No rule found with this id`,
            action: {
              id,
              ruleId,
            },
          })
        )
        return undefined
      }

      try {
        const evaluated = engine.evaluate(dottedName)
        const nodeValue = evaluated.nodeValue
        const assessment = {
          simulationId,
          actionId: id,
        }
        if (nodeValue === undefined) {
          return {
            ...assessment,
            applicable: undefined,
            impact: undefined,
          }
        } else if (typeof nodeValue === 'number') {
          return {
            ...assessment,
            applicable: true as const,
            impact: nodeValue || undefined, // 0 encodes for impact not evaluable
          }
        } else if (nodeValue === null || nodeValue === false) {
          return {
            ...assessment,
            applicable: false as const,
            impact: undefined,
          }
        } else {
          logException(
            new ActionAssessmentPublicodesException({
              message: `Unexpected nodeValue type: ${typeof nodeValue}`,
              action: { id, ruleId },
              dottedName,
            })
          )
          return undefined
        }
      } catch (error) {
        logException(
          new ActionAssessmentPublicodesException({
            message: 'Error calling publicodes `engine.evaluate`',
            cause: error,
            action: { id, ruleId },
            dottedName,
          })
        )
        return undefined
      }
    })
    .filter((a) => a !== undefined)

  if (assessments.length > 0) {
    await createActionAssessments(assessments)
  }
}
