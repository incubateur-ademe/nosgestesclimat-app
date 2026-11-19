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
 * Evaluates a rule of the model for `metric`, as the model computes the
 * footprint of that metric.
 *
 * A non-finite number (NaN, ±Infinity) is an error, not a value: it is an
 * issue with the model, not with the situation.
 *
 * Publicodes evaluates a date to its text (e.g. `'01/03/2023'`), so a date is
 * read as a string: nothing but the engine's internals tells them apart.
 *
 * A rule is never reported as its own missing variable.
 */
export const evaluateModelRule = ({
  engine,
  dottedName,
  metric,
}: {
  engine: Engine
  dottedName: string
  metric: Metric
}): ModelRuleEvaluationResult => {
  let nodeValue: unknown
  let reported: Record<string, number>

  try {
    ;({ nodeValue, missingVariables: reported } = engine.evaluate({
      valeur: dottedName,
      contexte: { métrique: `'${MODEL_METRIC[metric]}'` },
    }))
  } catch (cause) {
    return failure(new RuleEvaluationThrewError({ dottedName, metric, cause }))
  }

  const rule = {
    name: dottedName,
    metric,
    // Publicodes lists a `par défaut` rule among its own missing variables.
    missingVariables: Object.entries(reported)
      .filter(([name]) => name !== dottedName)
      .map(([name, weight]) => ({ name, weight })),
  }

  if (typeof nodeValue === 'number') {
    if (!Number.isFinite(nodeValue)) {
      return failure(
        new UnexpectedNodeValueError({
          dottedName,
          metric,
          // Named by its value: its type, a number, says nothing.
          nodeValue: String(nodeValue),
        })
      )
    }

    return success({ ...rule, applicable: true, value: nodeValue })
  }

  if (typeof nodeValue === 'boolean' || typeof nodeValue === 'string') {
    return success({ ...rule, applicable: true, value: nodeValue })
  }

  if (nodeValue === null) {
    return success({ ...rule, applicable: false })
  }

  if (nodeValue === undefined) {
    return success({ ...rule, applicable: undefined })
  }

  return failure(
    new UnexpectedNodeValueError({
      dottedName,
      metric,
      nodeValue: typeof nodeValue,
    })
  )
}
