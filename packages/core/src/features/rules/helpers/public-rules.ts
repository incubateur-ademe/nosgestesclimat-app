import type Engine from 'publicodes'
import type {
  EngineEvaluation,
  Metric,
  PublicRule,
  RuleApplicability,
} from '../types/rule.ts'

/** Reads the rules the model marks `public: oui`. */
export const getPublicRules = (engine: Engine): PublicRule[] =>
  Object.entries(engine.getParsedRules())
    .filter(([, rule]) => rule.rawNode.public === 'oui')
    .map(([name, { rawNode }]) => ({
      name,
      // Not `rule.title`, which publicodes derives from the name when the
      // model gives no `titre`.
      title: rawNode.titre ?? null,
      description: rawNode.description ?? null,
    }))

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
    contexte: { métrique: `'${metric}'` },
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
