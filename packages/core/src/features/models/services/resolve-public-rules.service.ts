import type Engine from 'publicodes'
import { getModelRule } from '../helpers/model-rules.ts'
import { serializeModel, type ModelString } from '../helpers/model-versions.ts'
import { upsertRules } from '../repositories/rules.repository.ts'
import type { Model } from '../types/model.ts'
import type { Rule } from '../types/rule.ts'

/**
 * Resolves the stored `Rule` rows of each public rule of a model: the default
 * metric's row always, plus the water row when the model marks the rule
 * `empreinte eau: oui` (`appliesToWaterMetric`) — each row is evaluated with
 * its own metric's context at evaluation time.
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

    const publicRules = Object.entries(engine.getParsedRules())
      .filter(([, rule]) => rule.rawNode.public === 'oui')
      .flatMap(([name]) => getModelRule(engine, name))
    const rules = await upsertRules(publicRules)

    rulesByModel.set(key, rules)
    return rules
  }
}
