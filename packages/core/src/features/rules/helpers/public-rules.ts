import type Engine from 'publicodes'
import type { Metric, PublicRule, RuleApplicability } from '../types/rule.ts'

/** Reads the rules the model marks `public: oui`. */
export const findPublicRules = (engine: Engine): PublicRule[] =>
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
 * Returns `undefined` when the value cannot be stored.
 */
export const evaluatePublicRule = ({
  engine,
  name,
  metric,
}: {
  engine: Engine
  name: string
  metric: Metric
}): RuleApplicability | undefined => {
  const { nodeValue } = engine.evaluate({
    valeur: name,
    contexte: { métrique: `'${metric}'` },
  })

  if (typeof nodeValue === 'number' && Number.isFinite(nodeValue)) {
    return { applicable: true, value: nodeValue }
  }

  return undefined
}
