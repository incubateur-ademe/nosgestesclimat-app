import type Engine from 'publicodes'
import { getModelRule } from '../helpers/model-rules.ts'
import { serializeModel, type ModelString } from '../helpers/model-versions.ts'
import { upsertRules } from '../repositories/rules.repository.ts'
import type { Model } from '../types/model.ts'
import type { Rule } from '../types/rule.ts'

/**
 * The model's public rule rows, cached per model: rows are never deleted, so
 * cached ids stay valid, and writes go through no caller transaction (a rollback
 * would orphan cached ids). fr rules serve every locale.
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
