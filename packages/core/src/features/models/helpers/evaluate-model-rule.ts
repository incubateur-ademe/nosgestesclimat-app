import type Engine from 'publicodes'
import { failure, success } from '../../../lib/result.ts'
import {
  RuleEvaluationThrewError,
  UnexpectedNodeValueError,
} from '../errors.ts'
import type { ModelRuleEvaluationResult } from '../types/model-rule-evaluation.ts'
import type { Metric } from '../types/rule.ts'

/** The value the model's `métrique` rule takes for each metric. */
const MODEL_METRIC = {
  carbon: 'carbone',
  water: 'eau',
} as const satisfies Record<Metric, string>

/**
 * Evaluates a rule of the model, for `metric` when given, as the model computes
 * the footprint of that metric.
 *
 * Any number is applicable: which values make sense is up to the caller (see
 * `requireFiniteValue`).
 */
export const evaluateModelRule = ({
  engine,
  dottedName,
  metric,
}: {
  engine: Engine
  dottedName: string
  metric?: Metric
}): ModelRuleEvaluationResult => {
  let nodeValue: unknown

  try {
    ;({ nodeValue } = engine.evaluate(
      metric === undefined
        ? dottedName
        : {
            valeur: dottedName,
            contexte: { métrique: `'${MODEL_METRIC[metric]}'` },
          }
    ))
  } catch (cause) {
    return failure(new RuleEvaluationThrewError({ dottedName, metric, cause }))
  }

  if (typeof nodeValue === 'number') {
    return success({ applicable: true, value: nodeValue })
  }

  if (nodeValue === null || nodeValue === false) {
    return success({ applicable: false })
  }

  if (nodeValue === undefined) {
    return success({ applicable: undefined })
  }

  return failure(
    new UnexpectedNodeValueError({
      dottedName,
      metric,
      nodeValue: typeof nodeValue,
    })
  )
}

/** For an evaluation stored as a finite number or not at all. */
export const requireFiniteValue = (
  evaluation: ModelRuleEvaluationResult,
  { dottedName, metric }: { dottedName: string; metric?: Metric }
): ModelRuleEvaluationResult => {
  if (
    !evaluation.success ||
    evaluation.data.applicable !== true ||
    Number.isFinite(evaluation.data.value)
  ) {
    return evaluation
  }

  return failure(
    new UnexpectedNodeValueError({
      dottedName,
      metric,
      // Named by its value: its type, a number, says nothing.
      nodeValue: String(evaluation.data.value),
    })
  )
}
