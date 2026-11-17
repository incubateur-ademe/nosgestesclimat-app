import type { RawPublicodes } from 'publicodes'
import Engine from 'publicodes'

const ENGINE_OPTIONS = {
  strict: { noOrphanRule: false, situation: false },
  logger: { log: () => {}, warn: () => {}, error: () => {} },
} as const

/** The model's `métrique` rule, set in the context of any rule evaluated for a metric. */
export const METRIC_RULE: RawPublicodes<string> = {
  métrique: {
    avec: { carbone: null, eau: null },
    'une possibilité': ['carbone', 'eau'],
    'par défaut': "'carbone'",
  },
}

export const createTestEngine = (rules: RawPublicodes<string>) =>
  new Engine(rules, ENGINE_OPTIONS)
