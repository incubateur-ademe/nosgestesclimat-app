import type Engine from 'publicodes'
import type { ModelString } from '../../models/helpers/model-versions.ts'
import { findPublicRules } from '../helpers/public-rules.ts'
import { upsertRules } from '../repositories/rules.repository.ts'
import { PUBLIC_RULE_METRICS, type Rule } from '../types/rule.ts'

/**
 * Resolves the stored `Rule` of each public rule of a model, for each metric.
 *
 * The first call for a model upserts its public rules, which refreshes the
 * title and description of the rules already stored, and caches their ids.
 * Rule rows are never deleted, so a cached entry never goes stale.
 *
 * The upsert is committed on its own, outside any caller's transaction: a
 * rolled back transaction would otherwise leave the cache holding ids of rows
 * that no longer exist. It is idempotent, so a repeated upsert is harmless.
 *
 * The cache lives apart from the engine registry, so evicting an engine keeps
 * its rule ids.
 */
export function createResolvePublicRules() {
  const rulesByModel = new Map<ModelString, Rule[]>()

  return async function resolvePublicRules(
    engine: Engine,
    model: ModelString
  ): Promise<Rule[]> {
    const cached = rulesByModel.get(model)
    if (cached) return cached

    const publicRules = findPublicRules(engine)
    const rules = await upsertRules(
      PUBLIC_RULE_METRICS.flatMap((metric) =>
        publicRules.map((rule) => ({ ...rule, metric }))
      )
    )

    rulesByModel.set(model, rules)
    return rules
  }
}
export type ResolvePublicRules = ReturnType<typeof createResolvePublicRules>
