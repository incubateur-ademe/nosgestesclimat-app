import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import type { ModelRuleEvaluation } from '../../models/types/model-rule-evaluation.ts'
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

/**
 * Reads the applicability of an action's rule as the action's evaluation: its
 * value is the action's impact when it is a finite number other than 0, an
 * impact of 0 being no impact, or an issue with the model. NaN and ±Infinity
 * are an issue with the model: the action stays applicable, without impact.
 */
export const toActionEvaluation = (
  applicability: ModelRuleEvaluation
): ActionEvaluation => {
  if (applicability.applicable === true) {
    const { value } = applicability
    return {
      applicable: true,
      impact: Number.isFinite(value) && value !== 0 ? value : undefined,
    }
  }

  if (applicability.applicable === false) {
    return { applicable: false, impact: undefined }
  }

  return { applicable: undefined, impact: undefined }
}
