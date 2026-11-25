import type Engine from 'publicodes'
import type { NewRule } from '../types/rule.ts'

/**
 * The row(s) to store for a model rule: the default one always, plus the water
 * one when `empreinte eau: oui`.
 */
export const getModelRule = (engine: Engine, ruleName: string): NewRule[] => {
  // Not `rule.title`: publicodes derives it from the name when the model gives no `titre`.
  const rawNode = engine.getParsedRules()[ruleName]?.rawNode
  const rule: NewRule = {
    name: ruleName,
    public: rawNode?.public === 'oui',
    title: rawNode?.titre ?? null,
    description: rawNode?.description ?? null,
    appliesToWaterMetric: false,
  }
  return rawNode?.['empreinte eau'] === 'oui'
    ? [rule, { ...rule, appliesToWaterMetric: true }]
    : [rule]
}
