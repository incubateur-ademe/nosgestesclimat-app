import type { Metric } from '../types/rule.ts'

/**
 * The key of a rule by metric and name, used to dedupe rules and match their
 * evaluations by pair.
 */
export const ruleKey = (metric: Metric, name: string) => `${metric}:${name}`
