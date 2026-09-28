import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import type { ActionEvaluation, NewActionAssessment } from '../types/action.ts'

/**
 * Maps every action rule of the model to the `meta.id` it is stored under, so
 * a persisted action (which only keeps that id) can be linked back to the rule
 * it assesses.
 */
export const buildRuleIdToDottedName = (
  engine: Engine
): Map<string, DottedName> => {
  const map = new Map<string, DottedName>()

  for (const [dottedName, ruleNode] of Object.entries(
    engine.getParsedRules()
  )) {
    const ruleId = (ruleNode as { rawNode?: { meta?: { id?: string } } })
      .rawNode?.meta?.id

    if (ruleId) {
      map.set(ruleId, dottedName as DottedName)
    }
  }

  return map
}

export type ActionEvaluationWithStatus =
  | {
      outcome: 'evaluated'
      applicability: ActionEvaluation
    }
  | { outcome: 'unexpected_node_value'; nodeValueType: string }

/**
 * Attaches an evaluation to the simulation it was made for.
 *
 * Spelled out case by case rather than with a spread: spreading an union into
 * an object widens `applicable` to `boolean | undefined`, which is no longer
 * the discriminated union `NewActionAssessment` is.
 */
export const toNewActionAssessment = (
  { simulationId, actionId }: { simulationId: string; actionId: string },
  applicability: ActionEvaluation
): NewActionAssessment => {
  if (applicability.applicable === true) {
    return {
      simulationId,
      actionId,
      applicable: true,
      impact: applicability.impact,
    }
  }

  if (applicability.applicable === false) {
    return { simulationId, actionId, applicable: false, impact: undefined }
  }

  return { simulationId, actionId, applicable: undefined, impact: undefined }
}

export const evaluateAction = ({
  engine,
  dottedName,
}: {
  engine: Engine
  dottedName: DottedName
}): ActionEvaluationWithStatus => {
  const nodeValue = engine.evaluate(dottedName).nodeValue

  if (nodeValue === undefined) {
    return {
      outcome: 'evaluated',
      applicability: { applicable: undefined, impact: undefined },
    }
  }

  if (typeof nodeValue === 'number') {
    return {
      outcome: 'evaluated',
      applicability: { applicable: true, impact: nodeValue || undefined },
    }
  }

  if (nodeValue === null || nodeValue === false) {
    return {
      outcome: 'evaluated',
      applicability: { applicable: false, impact: undefined },
    }
  }

  return { outcome: 'unexpected_node_value', nodeValueType: typeof nodeValue }
}
