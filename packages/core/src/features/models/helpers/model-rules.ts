import type Engine from 'publicodes'
import type { ModelRule } from '../types/rule.ts'

/**
 * A rule of the model with its French `titre` and `description`, null when
 * the model gives none.
 *
 * Read from the raw node, not from `rule.title`: publicodes derives the
 * title from the name when the model gives no `titre`.
 */
export const getModelRule = (engine: Engine, dottedName: string): ModelRule => {
  const rawNode = engine.getParsedRules()[dottedName]?.rawNode
  return {
    name: dottedName,
    title: rawNode?.titre ?? null,
    description: rawNode?.description ?? null,
  }
}
