import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import { failure, success, type Result } from '../../../lib/result.ts'
import {
  UnexpectedNodeValueError,
  type RuleEvaluationError,
} from '../../models/errors.ts'
import { evaluateModelRule } from '../../models/helpers/evaluate-model-rule.ts'
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
 * An action's impact is a number: any other value, `false` included, is a
 * modelling mistake.
 *
 * NaN and ±Infinity are an issue with the model, not with the simulation: the
 * action still applies, its impact unknown.
 */
export const toActionEvaluation = (
  applicability: ModelRuleEvaluation,
  dottedName: string
): Result<ActionEvaluation, UnexpectedNodeValueError> => {
  if (applicability.applicable === true) {
    const { value } = applicability

    if (typeof value !== 'number') {
      return failure(
        new UnexpectedNodeValueError({ dottedName, nodeValue: typeof value })
      )
    }

    return success({
      applicable: true,
      impact: Number.isFinite(value) && value !== 0 ? value : undefined,
    })
  }

  if (applicability.applicable === false) {
    return success({ applicable: false, impact: undefined })
  }

  return success({ applicable: undefined, impact: undefined })
}

/** Evaluates the rule of the action named `dottedName`. */
export const evaluateAction = ({
  engine,
  dottedName,
}: {
  engine: Engine
  dottedName: DottedName
}): Result<ActionEvaluation, RuleEvaluationError> => {
  const evaluation = evaluateModelRule({ engine, dottedName })

  return evaluation.success
    ? toActionEvaluation(evaluation.data, dottedName)
    : evaluation
}
