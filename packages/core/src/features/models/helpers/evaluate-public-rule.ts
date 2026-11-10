import type Engine from 'publicodes'
import { failure, success } from '../../../lib/result.ts'
import {
  RuleEvaluationThrewError,
  UnexpectedNodeValueError,
} from '../errors.ts'
import type { EngineEvaluation } from '../types/engine-evaluation.ts'
import type { Metric } from '../types/rule.ts'

/** The value the model's `métrique` rule takes for each metric. */
const MODEL_METRIC = {
  carbon: 'carbone',
  water: 'eau',
} as const satisfies Record<Metric, string>

/**
 * Evaluates a rule of the model, for a metric when one is given: the metric is
 * then set in the evaluation's context, the way the footprint is computed.
 *
 * A finite number, 0 included, is applicable; `null` and `false` are not
 * applicable; `undefined`, which a rule without a formula evaluates to, is not
 * defined. Any other value cannot be stored, `true`, a string, NaN or
 * ±Infinity, and fails with an `UnexpectedNodeValueError`; an evaluation that
 * throws, a rule missing from the model for instance, fails with a
 * `RuleEvaluationThrewError`. What the applicability means is left to the
 * caller.
 */
export const evaluatePublicRule = ({
  engine,
  dottedName,
  metric,
}: {
  engine: Engine
  dottedName: string
  metric?: Metric
}): EngineEvaluation => {
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

  if (typeof nodeValue === 'number' && Number.isFinite(nodeValue)) {
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
      // A number is named by its value, NaN or ±Infinity: its type says nothing.
      nodeValue:
        typeof nodeValue === 'number' ? String(nodeValue) : typeof nodeValue,
    })
  )
}
