import type Engine from 'publicodes'
import type { PublicRule } from '../types/rule.ts'

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
