import type { RawPublicodes } from 'publicodes'
import Engine from 'publicodes'

const ENGINE_OPTIONS = {
  strict: { noOrphanRule: false, situation: false },
  logger: { log: () => {}, warn: () => {}, error: () => {} },
} as const

export const createTestEngine = (rules: RawPublicodes<string>) =>
  new Engine(rules, ENGINE_OPTIONS)
