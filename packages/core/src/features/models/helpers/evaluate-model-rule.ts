import type Engine from 'publicodes'
import { failure, success } from '../../../lib/result.ts'
import {
  RuleEvaluationThrewError,
  UnexpectedNodeValueError,
} from '../errors.ts'
import type { NewRuleEvaluationResult } from '../types/rule-evaluation.ts'
import type { Metric } from '../types/rule.ts'

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
  simulationId,
  createdAt,
  metric = null,
}: {
  engine: Engine
  dottedName: string
  simulationId: string
  createdAt: Date
  /** The metric to evaluate the rule for; none is the default one. */
  metric?: Metric | null
}): NewRuleEvaluationResult => {
  let evaluation: {
    nodeValue: unknown
    missingVariables: Record<string, number>
  }

  try {
    evaluation = engine.evaluate({
      valeur: dottedName,
      contexte: { métrique: `'${modelMetric(metric)}'` },
    })
  } catch (cause) {
    return failure(new RuleEvaluationThrewError({ dottedName, cause, metric }))
  }

  const { nodeValue, missingVariables } = evaluation

  const rule = {
    name: dottedName,
    metric,
    simulationId,
    createdAt,
    // Publicodes lists a `par défaut` rule among its own missing variables.
    missingVariables: Object.entries(missingVariables)
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
      nodeValue: typeof nodeValue,
      metric,
    })
  )
}

/**
 * The value the model's `métrique` rule takes for a metric: `null` is the
 * default one, which the model names `carbone`.
 */
const modelMetric = (metric: Metric | null) =>
  metric === 'water' ? 'eau' : 'carbone'
