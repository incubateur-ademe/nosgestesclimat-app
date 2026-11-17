import type { RawPublicodes } from 'publicodes'
import Engine from 'publicodes'

const ENGINE_OPTIONS = {
  strict: { noOrphanRule: false, situation: false },
  logger: { log: () => {}, warn: () => {}, error: () => {} },
} as const

/**
 * Required by any rule evaluated for a metric: the evaluation sets it in its
 * context. Copied from the model.
 */
export const METRIC_RULE: RawPublicodes<string> = {
  métrique: {
    avec: { carbone: null, eau: null },
    'une possibilité': ['carbone', 'eau'],
    'par défaut': "'carbone'",
  },
}

export const createTestEngine = (rules: RawPublicodes<string>) =>
  new Engine(rules, ENGINE_OPTIONS)
