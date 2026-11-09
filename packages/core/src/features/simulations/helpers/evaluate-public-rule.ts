import type Engine from 'publicodes'
import type { EngineEvaluation } from '../../models/types/engine-evaluation.ts'
import type { Metric } from '../../models/types/rule.ts'
import type { RuleApplicability } from '../types/rule-evaluation.ts'

/** The value the model's `métrique` rule takes for each metric. */
const MODEL_METRIC = {
  carbon: 'carbone',
  water: 'eau',
} as const satisfies Record<Metric, string>

/**
 * Evaluates a public rule for a metric, the way the footprint is computed:
 * the metric is set in the evaluation's context.
 *
 * A finite number, 0 included, is applicable; `null` and `false` are not
 * applicable; `undefined`, which a rule without a formula evaluates to, is not
 * defined. Any other value cannot be stored: `true`, a string, NaN or ±Infinity.
 */
export const evaluatePublicRule = ({
  engine,
  name,
  metric,
}: {
  engine: Engine
  name: string
  metric: Metric
}): EngineEvaluation<RuleApplicability> => {
  const { nodeValue } = engine.evaluate({
    valeur: name,
    contexte: { métrique: `'${MODEL_METRIC[metric]}'` },
  })

  if (typeof nodeValue === 'number' && Number.isFinite(nodeValue)) {
    return {
      outcome: 'evaluated',
      applicability: { applicable: true, value: nodeValue },
    }
  }

  if (nodeValue === null || nodeValue === false) {
    return { outcome: 'evaluated', applicability: { applicable: false } }
  }

  if (nodeValue === undefined) {
    return { outcome: 'evaluated', applicability: { applicable: null } }
  }

  return {
    outcome: 'unexpected_node_value',
    // A number is named by its value, NaN or ±Infinity: its type says nothing.
    nodeValue:
      typeof nodeValue === 'number' ? String(nodeValue) : typeof nodeValue,
  }
}
