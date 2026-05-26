import type { NGCRule } from '@incubateur-ademe/nosgestesclimat'
import Engine from 'publicodes'

const ENGINE_OPTIONS = {
  strict: { noOrphanRule: false, situation: false },
  logger: { log: () => {}, warn: () => {}, error: () => {} },
} as const

export const createTestEngine = (
  rules: Record<string, NGCRule>
): Engine => new Engine(rules, ENGINE_OPTIONS)

export const createTestEngineWithSituation = (
  rules: Record<string, NGCRule>,
  situation: Record<string, unknown>
): Engine => {
  const engine = createTestEngine(rules)
  engine.setSituation(situation as Parameters<typeof engine.setSituation>[0])
  return engine
}
