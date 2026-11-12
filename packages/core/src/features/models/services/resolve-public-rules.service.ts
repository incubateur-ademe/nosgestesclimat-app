import type Engine from 'publicodes'
import {
  getFootprintRules,
  ROOT_DOTTED_NAME,
} from '../helpers/get-footprint-rules.ts'
import { serializeModel, type ModelString } from '../helpers/model-versions.ts'
import { getPublicRules } from '../helpers/public-rules.ts'
import { upsertRules } from '../repositories/rules.repository.ts'
import type { Model } from '../types/model.ts'
import {
  FOOTPRINT_RULE_METRICS,
  type Metric,
  type Rule,
} from '../types/rule.ts'

/**
 * Resolves the stored `Rule` of each public rule of a model.
 *
 * The footprint, its categories and their subcategories are stored for every
 * metric: the model guarantees them to be public and computable for each.
 * Every other public rule is stored once, without a metric, as the model may
 * compute it only outside a metric's context.
 *
 * Cached per model: rule rows are never deleted, so a cached id never goes
 * stale. The rules are written outside any caller's transaction, whose
 * rollback would leave the cache holding ids of rows that no longer exist.
 *
 * The cache lives apart from the engine registry, so evicting an engine keeps
 * its rule ids. Like engines, it ignores the model's locale: the rules of every
 * locale are the fr rules, only translated.
 */
export function createResolvePublicRules() {
  const rulesByModel = new Map<ModelString, Rule[]>()

  return async function resolvePublicRules(
    engine: Engine,
    model: Model
  ): Promise<Rule[]> {
    const key = serializeModel({ ...model, locale: 'fr' })
    const cached = rulesByModel.get(key)
    if (cached) return cached

    const { categories, subcategories } = getFootprintRules(engine)
    const footprintRuleNames = new Set<string>([
      ROOT_DOTTED_NAME,
      ...categories,
      ...subcategories,
    ])
    const publicRules = getPublicRules(engine)
    const rules = await upsertRules(
      publicRules.flatMap((rule) => {
        const metrics: readonly (Metric | null)[] = footprintRuleNames.has(
          rule.name
        )
          ? FOOTPRINT_RULE_METRICS
          : [null]
        return metrics.map((metric) => ({ ...rule, metric }))
      })
    )

    rulesByModel.set(key, rules)
    return rules
  }
}
