import type Engine from 'publicodes'
import { findVisibleActions } from '../repositories/actions.repository.ts'
import { upsertActionAssessments } from '../repositories/action-assessments.repository.ts'
import type { ActionAssessmentInput } from '../types/action.ts'

/**
 * Extracts a map from rule UUID (meta.id) to rule dotted name from the
 * parsed publicodes rules. Each rule carries a `rawNode.meta.id` field
 * that acts as the stable identifier referenced by `Action.ruleId`.
 */
const buildRuleIdToDottedName = (
  engine: Engine
): Map<string, string> => {
  const parsedRules = engine.getParsedRules()
  const map = new Map<string, string>()
  for (const [dottedName, ruleNode] of Object.entries(parsedRules)) {
    const meta = (ruleNode as { rawNode?: { meta?: { id?: string } } })
      .rawNode?.meta
    if (meta?.id) {
      map.set(meta.id, dottedName)
    }
  }
  return map
}

/**
 * Evaluates all visible actions against the given engine (which must
 * already have its situation set) and persists the resulting assessments.
 */
export const computeActionAssessments = async (
  engine: Engine,
  simulationId: string
): Promise<void> => {
  const actions = await findVisibleActions()

  if (actions.length === 0) return

  const ruleIdToDottedName = buildRuleIdToDottedName(engine)

  const assessments: ActionAssessmentInput[] = []

  for (const action of actions) {
    const dottedName = ruleIdToDottedName.get(action.ruleId)
    if (!dottedName) {
      // The action references a rule that does not exist in the engine —
      // the model may be outdated or the rule has been renamed.
      // Silently skip; a warning should be logged in production.
      continue
    }

    try {
      const evaluated = engine.evaluate(dottedName)
      const nodeValue = evaluated.nodeValue

      if (typeof nodeValue === 'number') {
        assessments.push({
          simulationId,
          actionId: action.id,
          applicable: true,
          impact: nodeValue,
        })
      } else {
        assessments.push({
          simulationId,
          actionId: action.id,
          applicable: false,
          impact: undefined,
        })
      }
    } catch {
      // A single broken rule should not prevent computing other actions.
      // The action is left unassessed (no row written for it).
    }
  }

  if (assessments.length > 0) {
    await upsertActionAssessments(assessments)
  }
}
