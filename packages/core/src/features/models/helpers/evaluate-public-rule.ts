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
 * A number is applicable, whatever it is: 0, NaN and ±Infinity included;
 * `null` and `false` are not applicable; `undefined`, which a rule without a
 * formula evaluates to, is not defined. `true` and a string are no
 * applicability and fail with an `UnexpectedNodeValueError`; an evaluation that
 * throws, a rule missing from the model for instance, fails with a
 * `RuleEvaluationThrewError`. What the applicability means, and which values
 * it may take, is left to the caller: see `requireFiniteValue`.
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

/**
 * Fails an applicable evaluation whose value is not finite, NaN or ±Infinity,
 * with an `UnexpectedNodeValueError`: a public rule's evaluation is stored as
 * a finite number or not at all. An action's is not checked: it keeps the
 * value the engine gave.
 */
export const requireFiniteValue = (
  evaluation: EngineEvaluation,
  { dottedName, metric }: { dottedName: string; metric?: Metric }
): EngineEvaluation => {
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
