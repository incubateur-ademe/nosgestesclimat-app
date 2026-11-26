import type Engine from 'publicodes'
import { failure, success } from '../../../lib/result.ts'
import {
  RuleEvaluationThrewError,
  UnexpectedNodeValueError,
} from '../errors.ts'
import type { NewRuleEvaluationResult } from '../types/rule-evaluation.ts'
import type { Metric } from '../types/rule.ts'

/** Evaluates `ruleName` for `metric` in the engine's current situation. */
export const evaluateModelRule = ({
  engine,
  ruleName,
  simulationId,
  createdAt,
  metric = null,
}: {
  engine: Engine
  ruleName: string
  simulationId: string
  createdAt: Date
  /** The metric to evaluate the rule for; none is the default one. */
  metric?: Metric | null
}): NewRuleEvaluationResult => {
  let evaluation: {
    nodeValue: unknown
    type?: 'number' | 'boolean' | 'string' | 'date' | 'reference'
    missingVariables: Record<string, number>
  }

  try {
    evaluation = engine.evaluate({
      valeur: ruleName,
      contexte: { métrique: `'${modelMetric(metric)}'` },
    })
  } catch (cause) {
    return failure(new RuleEvaluationThrewError({ ruleName, cause, metric }))
  }

  const { nodeValue, missingVariables, type } = evaluation

  const rule = {
    name: ruleName,
    metric,
    simulationId,
    createdAt,
    // Publicodes lists a `par défaut` rule among its own missing variables.
    missingVariables: Object.entries(missingVariables)
      .filter(([name]) => name !== ruleName)
      .map(([name, weight]) => ({ name, weight })),
  }

  // A date is not a storable value: its nodeValue is only its text, named by its type.
  if (type === 'date') {
    return failure(
      new UnexpectedNodeValueError({ ruleName, metric, nodeValue: type })
    )
  }

  if (typeof nodeValue === 'number') {
    if (!Number.isFinite(nodeValue)) {
      // NaN/±Infinity is a modelling error, not a value.
      return failure(
        new UnexpectedNodeValueError({
          ruleName,
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
      ruleName,
      nodeValue: typeof nodeValue,
      metric,
    })
  )
}

/** The model's `métrique` value: 'eau' for the water metric, 'carbone' (the default) otherwise. */
const modelMetric = (metric: Metric | null) =>
  metric === 'water' ? 'eau' : 'carbone'
