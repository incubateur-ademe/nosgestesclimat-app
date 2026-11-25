import type Engine from 'publicodes'
import type { ModelRule } from '../types/rule.ts'

/**
 * A rule of the model as the row(s) to store for it, with its French `titre`
 * and `description`, null when the model gives none: the default metric's row
 * always, the water metric's too when the model marks it `empreinte eau: oui`.
 */
export const getModelRule = (
  engine: Engine,
  dottedName: string
): ModelRule[] => {
  // Not `rule.title`: publicodes derives it from the name when the model gives no `titre`.
  const rawNode = engine.getParsedRules()[dottedName]?.rawNode
  const rule: ModelRule = {
    name: dottedName,
    title: rawNode?.titre ?? null,
    description: rawNode?.description ?? null,
    appliesToWaterMetric: false,
  }
  return rawNode?.['empreinte eau'] === 'oui'
    ? [rule, { ...rule, appliesToWaterMetric: true }]
    : [rule]
}
